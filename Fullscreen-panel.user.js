// ==UserScript==
// @name         Video Button: Follow Play Click Position
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Floating button appears near play button click position
// @author       Your Name
// @match        *://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // ==== 配置项 ====
    const CONFIG = {
        buttonSize: 70, // 按钮尺寸（像素）
        clickOffset: 15, // 按钮与点击位置的偏移量（像素）
        showDuration: 8000, // 按钮显示时长（毫秒）
        buttonStyle: `
            background: #FF5722;
            color: white;
            border: 3px solid white;
            font-size: 28px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.4);
            opacity: 0.95;
            transition: all 0.3s ease;
        `,
        focusStyle: `
            transform: scale(1.2);
            opacity: 1;
            box-shadow: 0 0 0 4px #4CAF50, 0 0 20px rgba(76, 175, 80, 0.8);
        `
    };

    let floatingButton, lastClickPosition = null;
    let hideTimeout;

    // ==== 核心：监听视频播放按钮点击 ====
    function watchPlayButtonClicks() {
        // 常见视频播放按钮选择器
        const playButtonSelectors = [
            'button[class*="play"], button[aria-label*="play"]',
            'div[class*="play"], div[role="button"][class*="play"]',
            'span[class*="play"], img[alt*="play"], svg[class*="play"]',
            'video' // 直接点击视频播放
        ];

        // 委托事件监听（支持动态生成的按钮）
        document.addEventListener('click', (e) => {
            // 判断点击目标是否为播放按钮
            const isPlayButton = playButtonSelectors.some(selector => 
                e.target.matches(selector) || e.target.closest(selector)
            );

            // 判断是否点击了视频元素（直接播放）
            const isVideoClick = e.target.tagName === 'VIDEO' && e.target.paused;

            if (isPlayButton || isVideoClick) {
                // 记录点击位置并显示按钮
                lastClickPosition = { x: e.clientX, y: e.clientY };
                positionButtonNearClick();
                showButton();
            }
        }, true); // 捕获阶段监听，确保不错过点击
    }

    // 根据点击位置定位按钮
    function positionButtonNearClick() {
        if (!lastClickPosition || !floatingButton) return;

        // 按钮定位在点击位置的右下角（偏移 CONFIG.clickOffset）
        const buttonX = lastClickPosition.x + CONFIG.clickOffset;
        const buttonY = lastClickPosition.y + CONFIG.clickOffset;

        // 确保按钮不超出视口
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const adjustedX = Math.min(buttonX, viewportWidth - CONFIG.buttonSize - 10);
        const adjustedY = Math.min(buttonY, viewportHeight - CONFIG.buttonSize - 10);

        floatingButton.style.cssText = `
            position: fixed;
            left: ${adjustedX}px;
            top: ${adjustedY}px;
            width: ${CONFIG.buttonSize}px;
            height: ${CONFIG.buttonSize}px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 99999;
            outline: none;
            ${CONFIG.buttonStyle}
        `;
    }

    // ==== 悬浮按钮 ====
    function createFloatingButton() {
        floatingButton = document.createElement('button');
        floatingButton.innerHTML = '⛶';
        floatingButton.tabIndex = 0; // 支持遥控器聚焦
        floatingButton.style.display = 'none'; // 初始隐藏

        // 点击按钮全屏视频
        floatingButton.addEventListener('click', () => {
            const video = findActiveVideo();
            if (video) {
                enterFullscreen(video);
                hideButton();
            } else {
                showToast('No video found');
            }
        });

        // 遥控器焦点样式
        floatingButton.addEventListener('focus', () => {
            floatingButton.style.cssText += CONFIG.focusStyle;
            resetHideTimeout(); // 焦点在按钮上时延长显示时间
        });
        floatingButton.addEventListener('blur', () => {
            positionButtonNearClick(); // 恢复原始样式
        });

        document.body.appendChild(floatingButton);
    }

    // ==== 显示/隐藏逻辑 ====
    function showButton() {
        if (floatingButton) {
            floatingButton.style.display = 'flex';
            resetHideTimeout(); // 重置自动隐藏定时器
        }
    }

    function hideButton() {
        if (floatingButton) {
            floatingButton.style.display = 'none';
        }
    }

    function resetHideTimeout() {
        if (hideTimeout) clearTimeout(hideTimeout);
        hideTimeout = setTimeout(hideButton, CONFIG.showDuration);
    }

    // ==== 视频检测 ====
    function findActiveVideo() {
        // 优先找正在播放的视频
        const playingVideo = document.querySelector('video:not([paused])');
        if (playingVideo) return playingVideo;

        // 找最近点击位置附近的视频
        if (lastClickPosition) {
            const videos = Array.from(document.querySelectorAll('video'));
            return videos.find(video => {
                const rect = video.getBoundingClientRect();
                // 判断视频是否包含点击位置
                return rect.left <= lastClickPosition.x && rect.right >= lastClickPosition.x &&
                       rect.top <= lastClickPosition.y && rect.bottom >= lastClickPosition.y;
            });
        }

        // 找最大的可见视频
        return Array.from(document.querySelectorAll('video'))
            .filter(v => v.offsetParent !== null)
            .sort((a, b) => (b.offsetWidth * b.offsetHeight) - (a.offsetWidth * a.offsetHeight))[0] || null;
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
                showToast('Fullscreen not supported');
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
            position: fixed;
            top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8); color: white;
            padding: 15px 30px; border-radius: 8px;
            font-size: 24px; z-index: 999999;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }

    // ==== 初始化 ====
    function init() {
        createFloatingButton();
        watchPlayButtonClicks();
        console.log('Play position follow button loaded');
    }

    init();

})();
