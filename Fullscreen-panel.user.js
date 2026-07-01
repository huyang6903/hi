// ==UserScript==
// @name         TV Video Fullscreen Button
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Persistent floating button for video fullscreen (TV remote-friendly)
// @author       Your Name
// @match        *://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // 配置（针对电视遥控器优化）
    const CONFIG = {
        // 悬浮按钮样式（大尺寸、高对比度，适合遥控器操作）
        buttonStyle: `
            position: fixed;
            bottom: 40px;
            right: 20px;
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: #FF5722;
            color: white;
            border: 4px solid rgba(255,255,255,0.8);
            font-size: 24px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.4);
            cursor: pointer;
            z-index: 99999;
            opacity: 0.8;
            transition: all 0.2s ease;
            outline: none;
        `,
        // 按钮聚焦样式（遥控器选中时高亮）
        focusStyle: `
            transform: scale(1.1);
            opacity: 1;
            box-shadow: 0 0 0 4px #4CAF50, 0 0 20px rgba(76, 175, 80, 0.8);
        `,
        // 视频选择器（覆盖常见视频元素）
        videoSelectors: [
            'video',
            'iframe[src*="youtube.com"], iframe[src*="vimeo.com"], iframe[src*="dailymotion.com"]',
            'div[class*="video-player"] video',
            'div[role="region"][aria-label*="video"] video'
        ],
        // 按钮显示/隐藏规则
        autoHide: true,          // 无操作时自动隐藏
        hideDelay: 3000,         // 无操作后隐藏延迟（毫秒）
        showOnVideo: true,       // 检测到视频时显示
        minVideoDuration: 10     // 最小视频时长（秒，避免广告）
    };

    let fullscreenButton;
    let hideTimeout;
    let lastActivityTime = Date.now();

    // 创建悬浮按钮（支持遥控器焦点）
    function createFloatingButton() {
        fullscreenButton = document.createElement('button');
        fullscreenButton.innerHTML = '⛶'; // 全屏图标（电视遥控器易识别）
        fullscreenButton.style.cssText = CONFIG.buttonStyle;
        fullscreenButton.tabIndex = 0; // 允许遥控器聚焦

        // 点击事件：触发全屏
        fullscreenButton.addEventListener('click', () => {
            enterFullscreen(getActiveVideo());
            resetHideTimeout();
        });

        // 遥控器焦点样式
        fullscreenButton.addEventListener('focus', () => {
            fullscreenButton.style.cssText += CONFIG.focusStyle;
            resetHideTimeout();
        });
        fullscreenButton.addEventListener('blur', () => {
            fullscreenButton.style.cssText = CONFIG.buttonStyle;
            resetHideTimeout();
        });

        // 监听页面活动（移动、点击等），保持按钮显示
        ['mousemove', 'click', 'keydown', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                lastActivityTime = Date.now();
                resetHideTimeout();
                if (CONFIG.autoHide && !isButtonVisible()) {
                    showButton();
                }
            });
        });

        document.body.appendChild(fullscreenButton);
        setupAutoHide();
    }

    // 显示按钮
    function showButton() {
        if (fullscreenButton) {
            fullscreenButton.style.display = 'flex';
            fullscreenButton.style.opacity = '0.8';
        }
    }

    // 隐藏按钮（仅保留微小占位，方便遥控器重新聚焦）
    function hideButton() {
        if (fullscreenButton && CONFIG.autoHide) {
            fullscreenButton.style.opacity = '0.2';
            fullscreenButton.style.transform = 'scale(0.8)';
        }
    }

    // 检查按钮是否可见
    function isButtonVisible() {
        return fullscreenButton && fullscreenButton.style.opacity !== '0.2';
    }

    // 重置自动隐藏定时器
    function resetHideTimeout() {
        if (hideTimeout) clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
            if (Date.now() - lastActivityTime > CONFIG.hideDelay) {
                hideButton();
            }
        }, CONFIG.hideDelay);
    }

    // 设置自动隐藏逻辑
    function setupAutoHide() {
        if (CONFIG.autoHide) {
            resetHideTimeout();
        } else {
            showButton();
        }
    }

    // 获取当前活跃视频
    function getActiveVideo() {
        const videos = [];
        CONFIG.videoSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                // 过滤可见且时长达标视频
                if (el.offsetParent !== null && 
                    (el.duration === undefined || el.duration > CONFIG.minVideoDuration)) {
                    videos.push(el);
                }
            });
        });

        // 优先返回播放中的视频，否则返回最大尺寸视频
        return videos.find(v => v.tagName === 'VIDEO' && !v.paused) || 
               videos.sort((a, b) => {
                   const aArea = (a.offsetWidth || 0) * (a.offsetHeight || 0);
                   const bArea = (b.offsetWidth || 0) * (b.offsetHeight || 0);
                   return bArea - aArea; // 按面积降序排序
               })[0] || null;
    }

    // 进入全屏（处理电视浏览器兼容性）
    function enterFullscreen(element) {
        if (!element) {
            showToast('No video found');
            return;
        }

        // 处理iframe视频（如YouTube）
        const target = element.tagName === 'IFRAME' ? element : element.closest('div[class*="player"], div[class*="video"]') || element;

        try {
            if (target.requestFullscreen) {
                target.requestFullscreen();
            } else if (target.webkitRequestFullscreen) { // 安卓WebView
                target.webkitRequestFullscreen();
            } else if (target.msRequestFullscreen) {
                target.msRequestFullscreen();
            } else {
                showToast('Fullscreen not supported');
            }
        } catch (e) {
            console.error('Fullscreen error:', e);
            showToast('Failed to fullscreen');
        }
    }

    // 电视友好的提示消息（大字体）
    function showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 24px;
            z-index: 999999;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }

    // 监听视频加载（动态显示按钮）
    function watchVideoPresence() {
        const checkForVideos = () => {
            const hasValidVideo = getActiveVideo() !== null;
            if (hasValidVideo && CONFIG.showOnVideo) {
                showButton();
            } else if (CONFIG.showOnVideo) {
                hideButton();
            }
        };

        // 初始检查
        checkForVideos();
        // 定时检查（处理动态加载视频）
        setInterval(checkForVideos, 2000);
        // DOM变化监听
        const observer = new MutationObserver(checkForVideos);
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // 初始化
    function init() {
        createFloatingButton();
        watchVideoPresence();
        console.log('TV Video Fullscreen Button loaded. Use remote to focus and click.');
    }

    // 启动脚本
    init();

})();
