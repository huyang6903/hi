// ==UserScript==
// @name         Video Floating Button (Auto-Follow)
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Floating button that auto-follows video position (TV remote friendly)
// @author       Your Name
// @match        *://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // ==== 配置项 ====
    const CONFIG = {
        buttonSize: 80, // 按钮尺寸（像素）
        followOffset: 15, // 按钮与视频边缘的距离（像素）
        autoHideDelay: 3000, // 无操作自动隐藏延迟（毫秒）
        manualSelectHoldTime: 1500, // 长按触发手动选择的时间（毫秒）
        minVideoSize: 300 // 最小视频宽度（像素，过滤小广告）
    };

    let floatingButton, targetVideo = null;
    let hideTimeout, manualSelectTimer, isFollowing = false;

    // ==== 核心：视频跟踪与按钮定位 ====
    function trackVideoPosition() {
        // 1. 找到最佳视频（最大可见视频）
        const bestVideo = findBestVideo();
        if (!bestVideo) {
            hideButton();
            targetVideo = null;
            isFollowing = false;
            return;
        }

        targetVideo = bestVideo;
        isFollowing = true;
        showButton();

        // 2. 获取视频位置并定位按钮
        const videoRect = targetVideo.getBoundingClientRect();
        const buttonStyle = {
            // 按钮定位在视频右下角外侧
            top: `${videoRect.bottom + window.scrollY + CONFIG.followOffset}px`,
            left: `${videoRect.right + window.scrollX - CONFIG.buttonSize - CONFIG.followOffset}px`,
            position: 'absolute', // 使用绝对定位跟随视频
            zIndex: 99999
        };

        // 应用定位样式
        Object.assign(floatingButton.style, buttonStyle);
    }

    // 查找最佳视频（最大可见视频）
    function findBestVideo() {
        const videos = [];

        // 1. 收集所有可能的视频元素
        document.querySelectorAll('video, iframe, div[class*="video"], div[class*="player"]').forEach(element => {
            const rect = element.getBoundingClientRect();
            // 过滤条件：可见 + 宽度达标 + 有一定面积
            if (rect.width >= CONFIG.minVideoSize && 
                rect.height > 100 && 
                rect.top < window.innerHeight && 
                rect.bottom > 0 && 
                element.offsetParent !== null) {
                videos.push({
                    element,
                    area: rect.width * rect.height,
                    rect
                });
            }
        });

        // 2. 返回面积最大的视频
        return videos.sort((a, b) => b.area - a.area)[0]?.element || null;
    }

    // ==== 悬浮按钮 ====
    function createFloatingButton() {
        floatingButton = document.createElement('button');
        floatingButton.innerHTML = '⛶';
        floatingButton.tabIndex = 0; // 支持遥控器聚焦
        floatingButton.style.cssText = `
            width: ${CONFIG.buttonSize}px;
            height: ${CONFIG.buttonSize}px;
            border-radius: 50%;
            background: #FF5722;
            color: white;
            border: 4px solid white;
            font-size: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            cursor: pointer;
            outline: none;
            transition: all 0.2s ease;
            opacity: 0.9;
        `;

        // 点击事件：全屏当前视频
        floatingButton.addEventListener('click', () => {
            if (targetVideo) {
                enterFullscreen(targetVideo);
                resetAutoHide();
            } else {
                enterManualSelectMode();
            }
        });

        // 长按触发手动选择
        floatingButton.addEventListener('mousedown', () => {
            manualSelectTimer = setTimeout(enterManualSelectMode, CONFIG.manualSelectHoldTime);
        });
        floatingButton.addEventListener('mouseup', () => clearTimeout(manualSelectTimer));
        floatingButton.addEventListener('mouseleave', () => clearTimeout(manualSelectTimer));

        // 遥控器焦点样式
        floatingButton.addEventListener('focus', () => {
            floatingButton.style.transform = 'scale(1.2)';
            floatingButton.style.boxShadow = '0 0 0 5px #4CAF50';
            resetAutoHide();
        });
        floatingButton.addEventListener('blur', () => {
            floatingButton.style.transform = 'scale(1)';
            floatingButton.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
            resetAutoHide();
        });

        document.body.appendChild(floatingButton);
        hideButton(); // 初始隐藏
    }

    // ==== 自动隐藏/显示 ====
    function showButton() {
        floatingButton.style.display = 'flex';
        floatingButton.style.opacity = '0.9';
        resetAutoHide();
    }

    function hideButton() {
        if (!floatingButton.matches(':focus')) { // 焦点在按钮上时不隐藏
            floatingButton.style.opacity = '0.3';
        }
    }

    function resetAutoHide() {
        if (hideTimeout) clearTimeout(hideTimeout);
        hideTimeout = setTimeout(hideButton, CONFIG.autoHideDelay);
    }

    // ==== 手动选择模式 ====
    function enterManualSelectMode() {
        const videos = findAllVideos();
        if (videos.length === 0) {
            showToast('No videos found');
            return;
        }

        // 创建选择菜单
        const menu = document.createElement('div');
        menu.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.9); padding: 20px; border-radius: 10px;
            z-index: 999999; width: 80%; max-width: 600px;
        `;
        menu.innerHTML = '<h3 style="color:white; font-size:28px; text-align:center;">Select Video</h3>';

        videos.forEach((video, index) => {
            const item = document.createElement('button');
            item.style.cssText = `
                width: 100%; padding: 15px; margin: 8px 0; text-align:left;
                background: ${index === 0 ? '#4CAF50' : '#333'}; color: white;
                border: 2px solid white; border-radius: 5px; font-size: 24px;
            `;
            item.textContent = `Video ${index + 1} (${Math.round(video.area/1000)}k px²)`;
            item.tabIndex = index;
            item.addEventListener('click', () => {
                targetVideo = video.element;
                enterFullscreen(targetVideo);
                menu.remove();
                trackVideoPosition(); // 重新定位按钮
            });
            item.addEventListener('focus', () => {
                videos.forEach((v, i) => {
                    menu.children[i+1].style.background = i === index ? '#4CAF50' : '#333';
                });
            });
            menu.appendChild(item);
        });

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.cssText = `
            width: 100%; padding: 15px; margin-top: 15px;
            background: #f44336; color: white; border: none;
            border-radius: 5px; font-size: 24px;
        `;
        cancelBtn.addEventListener('click', () => menu.remove());
        menu.appendChild(cancelBtn);

        document.body.appendChild(menu);
        menu.querySelector('button').focus();
    }

    function findAllVideos() {
        return Array.from(document.querySelectorAll('video, iframe, div[class*="video"], div[class*="player"]'))
            .filter(el => {
                const rect = el.getBoundingClientRect();
                return rect.width >= 200 && rect.height > 100 && el.offsetParent !== null;
            })
            .map(el => ({
                element: el,
                area: el.getBoundingClientRect().width * el.getBoundingClientRect().height
            }))
            .sort((a, b) => b.area - a.area);
    }

    // ==== 全屏功能 ====
    function enterFullscreen(element) {
        try {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            } else {
                // 尝试全屏父容器
                const parent = element.closest('div[class*="player"], div[class*="video"]');
                if (parent) enterFullscreen(parent);
                else showToast('Fullscreen not supported');
            }
        } catch (e) {
            showToast('Fullscreen failed');
            console.error(e);
        }
    }

    // ==== 辅助函数 ====
    function showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8); color: white; padding: 20px 40px;
            border-radius: 10px; font-size: 32px; z-index: 999999;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }

    // ==== 初始化 ====
    function init() {
        createFloatingButton();
        
        // 持续跟踪视频位置（每300ms更新一次）
        setInterval(trackVideoPosition, 300);
        
        // 监听滚动和窗口大小变化
        window.addEventListener('scroll', trackVideoPosition);
        window.addEventListener('resize', trackVideoPosition);
        
        // 初始化自动隐藏
        resetAutoHide();
        
        console.log('Auto-follow video button loaded');
    }

    init();

})();
