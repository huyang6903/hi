// ==UserScript==
// @name         TV Video Fullscreen Button (Enhanced)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Fixed video detection + configurable button position for TV remotes
// @author       Your Name
// @match        *://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // ==== 可自定义配置项 ====
    const CONFIG = {
        // 悬浮按钮位置（根据电视遥控器习惯调整）
        buttonPosition: {
            top: 'auto',      // 'auto' 或具体像素值（如 '50px'）
            bottom: '150px',  // 建议设为较大值（如 '150px'）方便底部导航
            left: 'auto',
            right: '20px'
        },
        // 按钮尺寸（增大更易聚焦）
        buttonSize: 180, // 按钮宽度/高度（像素）
        // 视频检测增强
        videoDetection: {
            includeIframe: true,       // 检测iframe中的视频（如YouTube嵌入）
            includeHiddenVideos: false, // 是否检测隐藏的视频（默认关闭）
            minVideoWidth: 300,        // 最小视频宽度（过滤小广告）
            retryInterval: 1000        // 视频检测重试间隔（毫秒）
        },
        // 其他样式配置
        buttonStyle: `
            background: #FF5722;
            color: white;
            border: 4px solid rgba(255,255,255,0.8);
            font-size: 28px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.4);
            opacity: 0.9;
        `,
        focusStyle: `
            transform: scale(1.2);
            opacity: 1;
            box-shadow: 0 0 0 5px #4CAF50, 0 0 25px rgba(76, 175, 80, 0.8);
        `,
        autoHide: true,
        hideDelay: 3000
    };
    // ========================

    let fullscreenButton;
    let hideTimeout;
    let lastActivityTime = Date.now();
    let videoCheckInterval;

    // 创建悬浮按钮（位置可配置）
    function createFloatingButton() {
        fullscreenButton = document.createElement('button');
        fullscreenButton.innerHTML = '⛶';
        fullscreenButton.tabIndex = 0; // 确保遥控器可聚焦

        // 应用位置和尺寸配置
        const positionStyle = Object.entries(CONFIG.buttonPosition)
            .map(([key, value]) => `${key}: ${value};`)
            .join(' ');

        fullscreenButton.style.cssText = `
            position: fixed;
            ${positionStyle}
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
            transition: all 0.2s ease;
        `;

        // 点击事件
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
            fullscreenButton.style.cssText = `
                position: fixed;
                ${positionStyle}
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
                transition: all 0.2s ease;
            `;
            resetHideTimeout();
        });

        document.body.appendChild(fullscreenButton);
        setupAutoHide();
    }

    // ==== 修复视频检测逻辑 ====
    function getActiveVideo() {
        const videos = [];

        // 1. 检测原生 video 标签
        document.querySelectorAll('video').forEach(video => {
            if (isValidVideo(video)) {
                videos.push({
                    element: video,
                    priority: 2, // 原生视频优先级高
                    area: (video.offsetWidth || 0) * (video.offsetHeight || 0)
                });
            }
        });

        // 2. 检测 iframe 中的视频（如 YouTube）
        if (CONFIG.videoDetection.includeIframe) {
            document.querySelectorAll('iframe').forEach(iframe => {
                // 常见视频平台的 iframe
                const videoIframePatterns = [
                    'youtube.com/embed/',
                    'vimeo.com/video/',
                    'dailymotion.com/embed/',
                    'netflix.com/watch',
                    'primevideo.com/detail'
                ];
                const isVideoIframe = videoIframePatterns.some(pattern => 
                    iframe.src.includes(pattern)
                );

                if (isVideoIframe && isValidIframe(iframe)) {
                    videos.push({
                        element: iframe,
                        priority: 1, // iframe 视频优先级次之
                        area: (iframe.offsetWidth || 0) * (iframe.offsetHeight || 0)
                    });
                }
            });
        }

        // 3. 按优先级和尺寸排序，返回最佳视频
        if (videos.length > 0) {
            return videos.sort((a, b) => {
                if (b.priority !== a.priority) return b.priority - a.priority;
                return b.area - a.area; // 同优先级按面积排序
            })[0].element;
        }

        return null;
    }

    // 验证视频是否有效
    function isValidVideo(video) {
        // 可见性检查
        if (!CONFIG.videoDetection.includeHiddenVideos && 
            (video.offsetParent === null || video.style.display === 'none')) {
            return false;
        }
        // 尺寸检查
        if (video.offsetWidth < CONFIG.videoDetection.minVideoWidth) {
            return false;
        }
        // 排除静音广告（可选）
        // if (video.muted && video.duration < 30) return false;
        return true;
    }

    // 验证 iframe 是否有效
    function isValidIframe(iframe) {
        return iframe.offsetParent !== null && 
               iframe.offsetWidth >= CONFIG.videoDetection.minVideoWidth &&
               !iframe.src.includes('ads.') && // 排除广告 iframe
               !iframe.src.includes('doubleclick.net');
    }

    // 持续检测视频（修复延迟加载问题）
    function startVideoDetection() {
        videoCheckInterval = setInterval(() => {
            const hasVideo = getActiveVideo() !== null;
            if (hasVideo) {
                showButton();
            } else if (CONFIG.autoHide) {
                hideButton();
            }
        }, CONFIG.videoDetection.retryInterval);
    }

    // ==== 其他辅助函数 ====
    function showButton() {
        if (fullscreenButton) {
            fullscreenButton.style.display = 'flex';
            fullscreenButton.style.opacity = CONFIG.buttonStyle.includes('opacity') 
                ? CONFIG.buttonStyle.match(/opacity: ([^;]+)/)[1] 
                : '0.9';
        }
    }

    function hideButton() {
        if (fullscreenButton && CONFIG.autoHide) {
            fullscreenButton.style.opacity = '0.3';
            fullscreenButton.style.transform = 'scale(0.9)';
        }
    }

    function resetHideTimeout() {
        if (hideTimeout) clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
            if (Date.now() - lastActivityTime > CONFIG.hideDelay) {
                hideButton();
            }
        }, CONFIG.hideDelay);
    }

    function setupAutoHide() {
        if (CONFIG.autoHide) {
            resetHideTimeout();
            ['mousemove', 'click', 'keydown', 'touchstart'].forEach(event => {
                document.addEventListener(event, () => {
                    lastActivityTime = Date.now();
                    showButton();
                    resetHideTimeout();
                });
            });
        } else {
            showButton();
        }
    }

    function enterFullscreen(element) {
        if (!element) {
            showToast('No video found');
            return;
        }

        try {
            const target = element.tagName === 'IFRAME' ? element : element;
            if (target.requestFullscreen) {
                target.requestFullscreen();
            } else if (target.webkitRequestFullscreen) {
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
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 32px;
            z-index: 999999;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }

    // 初始化
    function init() {
        createFloatingButton();
        startVideoDetection();
        console.log('Enhanced TV Video Button loaded. Position:', CONFIG.buttonPosition);
    }

    init();

})();
