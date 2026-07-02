// ==UserScript==
// @name         YouTube TV Immersive Mode
// @namespace    https://github.com/
// @version      1.0.0
// @description  YouTube 安卓电视沉浸模式：强制隐藏侧边推荐/评论/Shorts/商品区，放大播放器区域，自动滚动到视频，适合TV浏览器
// @author       You
// @match        *://www.youtube.com/*
// @match        *://m.youtube.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const CONFIG = {
        debug: true,

        hideSidebar: true,
        hideComments: true,
        hideShorts: true,
        hideMerch: true,
        hideChat: true,
        hideEndscreen: true,
        hideHeader: false,
        hideMiniGuide: true,
        autoScrollToPlayer: true,
        forcePlayerMaximize: true,
        pseudoFullscreen: true,
        keepCleaning: true
    };

    function log(...args) {
        if (CONFIG.debug) console.log('[YT-TV-Immersive]', ...args);
    }

    function isWatchPage() {
        return location.pathname === '/watch';
    }

    function addStyle(css) {
        const style = document.createElement('style');
        style.textContent = css;
        (document.documentElement || document.head || document.body).appendChild(style);
    }

    function injectCSS() {
        let css = `
            /* 基础页面拉伸 */
            html, body, ytd-app {
                background: #000 !important;
                overflow-x: hidden !important;
            }

            /* 隐藏 Shorts */
            ytd-guide-entry-renderer a[title="Shorts"],
            ytd-mini-guide-entry-renderer a[title="Shorts"],
            ytm-pivot-bar-item-renderer[tab-identifier="FEshorts"],
            a[href^="/shorts/"],
            ytd-reel-shelf-renderer,
            ytd-rich-shelf-renderer[is-shorts],
            ytm-reel-shelf-renderer {
                display: none !important;
            }

            /* 隐藏评论 */
            ytd-comments,
            #comments,
            ytm-item-section-renderer[section-identifier="comments-entry-point"] {
                display: none !important;
            }

            /* 隐藏商品/推广 */
            ytd-merch-shelf-renderer,
            ytd-product-carousel,
            ytd-offer-module-renderer {
                display: none !important;
            }

            /* 隐藏聊天 */
            ytd-live-chat-frame,
            #chat {
                display: none !important;
            }

            /* 隐藏片尾结束卡 */
            .ytp-ce-element,
            .ytp-endscreen-content,
            .html5-endscreen {
                display: none !important;
            }

            /* 隐藏 mini guide / 左侧缩略导航 */
            #guide,
            #mini-guide {
                display: none !important;
            }

            /* 隐藏广告/推广位 */
            ytd-display-ad-renderer,
            ytd-ad-slot-renderer,
            ytd-in-feed-ad-layout-renderer,
            ytd-promoted-sparkles-web-renderer,
            ytd-promoted-video-renderer,
            ytd-compact-promoted-video-renderer,
            ytd-action-companion-ad-renderer,
            ytd-player-legacy-desktop-watch-ads-renderer,
            .ytp-ad-module,
            .video-ads,
            .ytp-ad-overlay-container {
                display: none !important;
            }
        `;

        if (CONFIG.hideSidebar) {
            css += `
                /* 隐藏右侧推荐 */
                #secondary,
                #secondary-inner,
                ytd-watch-next-secondary-results-renderer,
                ytd-item-section-renderer,
                #related {
                    display: none !important;
                    width: 0 !important;
                    max-width: 0 !important;
                    min-width: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }

                /* 主区域扩展 */
                #primary,
                #primary-inner,
                #columns,
                ytd-watch-flexy {
                    width: 100% !important;
                    max-width: 100% !important;
                }

                #columns {
                    display: block !important;
                }
            `;
        }

        if (CONFIG.hideHeader) {
            css += `
                ytd-masthead,
                #masthead-container,
                tp-yt-app-header-layout {
                    display: none !important;
                }
            `;
        }

        if (CONFIG.forcePlayerMaximize) {
            css += `
                /* 放大播放器区域 */
                #player,
                #player-container,
                #player-container-outer,
                #full-bleed-container,
                #ytd-player,
                .html5-video-player,
                .ytp-chrome-bottom,
                video {
                    max-width: 100% !important;
                }

                ytd-watch-flexy[flexy] #primary.ytd-watch-flexy {
                    width: 100% !important;
                    max-width: 100% !important;
                    min-width: 100% !important;
                    flex: 1 1 100% !important;
                }

                #player-theater-container,
                #full-bleed-container,
                #player-container-outer,
                #player,
                ytd-player,
                .html5-video-player {
                    width: 100vw !important;
                    max-width: 100vw !important;
                }

                video {
                    width: 100% !important;
                    height: auto !important;
                    background: #000 !important;
                }
            `;
        }

        if (CONFIG.pseudoFullscreen) {
            css += `
                /* 伪全屏沉浸：只保留视频相关区域 */
                ytd-watch-metadata,
                #below,
                #meta,
                #title,
                #description,
                #info,
                #info-contents,
                #owner,
                #top-row,
                #bottom-row,
                #actions,
                #menu,
                #playlist,
                #expand,
                #description-inline-expander,
                ytd-watch-next-secondary-results-renderer,
                ytd-rich-grid-renderer {
                    display: none !important;
                }

                body {
                    background: #000 !important;
                }
            `;
        }

        addStyle(css);
    }

    function getPlayerTarget() {
        return document.querySelector('#player, #full-bleed-container, ytd-player, .html5-video-player, video');
    }

    function getVideo() {
        return document.querySelector('video');
    }

    function focusPlayer() {
        const v = getVideo();
        const p = getPlayerTarget();

        if (v) {
            try {
                v.setAttribute('tabindex', '0');
                v.focus({ preventScroll: true });
                return true;
            } catch {}
        }

        if (p) {
            try {
                p.setAttribute('tabindex', '0');
                p.focus({ preventScroll: true });
                return true;
            } catch {}
        }

        return false;
    }

    function scrollToPlayer() {
        if (!CONFIG.autoScrollToPlayer) return;
        const p = getPlayerTarget();
        if (!p) return;
        try {
            p.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
            log('scrollToPlayer');
        } catch {}
    }

    function forceLayout() {
        if (!isWatchPage()) return;

        const app = document.querySelector('ytd-app');
        const watch = document.querySelector('ytd-watch-flexy');
        const columns = document.querySelector('#columns');
        const primary = document.querySelector('#primary');
        const secondary = document.querySelector('#secondary');
        const below = document.querySelector('#below');

        if (app) {
            app.style.setProperty('background', '#000', 'important');
        }

        if (watch) {
            watch.style.setProperty('width', '100%', 'important');
            watch.style.setProperty('max-width', '100%', 'important');
            watch.style.setProperty('background', '#000', 'important');
        }

        if (columns) {
            columns.style.setProperty('display', 'block', 'important');
            columns.style.setProperty('width', '100%', 'important');
            columns.style.setProperty('max-width', '100%', 'important');
        }

        if (primary) {
            primary.style.setProperty('width', '100%', 'important');
            primary.style.setProperty('max-width', '100%', 'important');
            primary.style.setProperty('margin', '0', 'important');
            primary.style.setProperty('padding', '0', 'important');
        }

        if (secondary && CONFIG.hideSidebar) {
            secondary.style.setProperty('display', 'none', 'important');
        }

        if (below && CONFIG.pseudoFullscreen) {
            below.style.setProperty('display', 'none', 'important');
        }

        const player = getPlayerTarget();
        if (player && CONFIG.forcePlayerMaximize) {
            player.style.setProperty('width', '100vw', 'important');
            player.style.setProperty('max-width', '100vw', 'important');
            player.style.setProperty('margin', '0 auto', 'important');
            player.style.setProperty('background', '#000', 'important');
        }

        const video = getVideo();
        if (video) {
            video.style.setProperty('width', '100%', 'important');
            video.style.setProperty('height', 'auto', 'important');
            video.style.setProperty('max-height', '100vh', 'important');
            video.style.setProperty('background', '#000', 'important');
        }
    }

    function cleanShortsCards() {
        if (!CONFIG.hideShorts) return;

        document.querySelectorAll('a[href^="/shorts/"]').forEach(el => {
            const item = el.closest(
                'ytd-rich-item-renderer, ytd-grid-video-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-rich-shelf-renderer'
            );
            if (item) item.style.setProperty('display', 'none', 'important');
        });
    }

    function cleanExtraBlocks() {
        const selectors = [];

        if (CONFIG.hideComments) {
            selectors.push('ytd-comments', '#comments');
        }
        if (CONFIG.hideMerch) {
            selectors.push('ytd-merch-shelf-renderer', 'ytd-product-carousel', 'ytd-offer-module-renderer');
        }
        if (CONFIG.hideChat) {
            selectors.push('ytd-live-chat-frame', '#chat');
        }
        if (CONFIG.hideEndscreen) {
            selectors.push('.ytp-ce-element', '.ytp-endscreen-content', '.html5-endscreen');
        }
        if (CONFIG.hideMiniGuide) {
            selectors.push('#guide', '#mini-guide');
        }

        if (selectors.length) {
            document.querySelectorAll(selectors.join(',')).forEach(el => {
                el.style.setProperty('display', 'none', 'important');
            });
        }
    }

    function tryFullscreenByGesture() {
        // 浏览器限制：通常必须用户手势触发
        // 所以这里只做“按 Enter 时尽量触发”
        document.addEventListener('keydown', function (e) {
            if (!isWatchPage()) return;
            if (e.key !== 'Enter') return;

            const player = document.querySelector('#movie_player, .html5-video-player, video');
            if (!player) return;

            if (!document.fullscreenElement && player.requestFullscreen) {
                player.requestFullscreen().catch(() => {});
            }
        }, true);
    }

    function bindKeys() {
        document.addEventListener('keydown', function (e) {
            if (!isWatchPage()) return;

            const video = getVideo();
            if (!video) return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    video.currentTime = Math.max(0, video.currentTime - 10);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    video.currentTime = Math.min(video.duration || Infinity, video.currentTime + 10);
                    break;
                case ' ':
                case 'MediaPlayPause':
                    e.preventDefault();
                    if (video.paused) video.play().catch(() => {});
                    else video.pause();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    video.volume = Math.min(1, (video.volume || 0) + 0.05);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    video.volume = Math.max(0, (video.volume || 0) - 0.05);
                    break;
                case '0':
                    e.preventDefault();
                    focusPlayer();
                    scrollToPlayer();
                    break;
            }
        }, true);
    }

    function cleanAll() {
        cleanShortsCards();
        cleanExtraBlocks();
        forceLayout();
    }

    function onPageReady() {
        if (!isWatchPage()) return;

        setTimeout(() => {
            cleanAll();
            scrollToPlayer();
            focusPlayer();
        }, 500);

        setTimeout(() => {
            cleanAll();
            scrollToPlayer();
            focusPlayer();
        }, 1500);

        setTimeout(() => {
            cleanAll();
        }, 3000);
    }

    function watchUrlChange() {
        let lastUrl = location.href;
        setInterval(() => {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                log('URL changed:', lastUrl);
                onPageReady();
            }
        }, 500);
    }

    function observeDom() {
        const mo = new MutationObserver(() => {
            cleanAll();
        });

        mo.observe(document.documentElement || document, {
            childList: true,
            subtree: true
        });
    }

    function init() {
        injectCSS();
        bindKeys();
        tryFullscreenByGesture();

        const start = () => {
            onPageReady();
            watchUrlChange();
            observeDom();

            if (CONFIG.keepCleaning) {
                setInterval(cleanAll, 2000);
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', start, { once: true });
        } else {
            start();
        }
    }

    init();
})();
