// ==UserScript==
// @name         YouTube TV Immersive
// @namespace    https://github.com/
// @version      1.0.0
// @description  YouTube 沉浸版：隐藏侧栏、评论、Shorts、商品区，让播放器区域更突出
// @author       You
// @match        *://www.youtube.com/*
// @match        *://m.youtube.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function isWatchPage() {
        return location.pathname === '/watch';
    }

    function addStyle(css) {
        const style = document.createElement('style');
        style.textContent = css;
        (document.documentElement || document.head || document.body).appendChild(style);
    }

    function injectCSS() {
        addStyle(`
            html, body, ytd-app {
                background: #000 !important;
                overflow-x: hidden !important;
            }

            a[href^="/shorts/"],
            ytd-reel-shelf-renderer,
            ytd-rich-shelf-renderer[is-shorts],
            ytm-reel-shelf-renderer,
            ytd-comments,
            #comments,
            ytd-merch-shelf-renderer,
            ytd-product-carousel,
            ytd-offer-module-renderer,
            ytd-live-chat-frame,
            #chat,
            .ytp-ce-element,
            .ytp-endscreen-content,
            .html5-endscreen,
            #secondary,
            #secondary-inner,
            ytd-watch-next-secondary-results-renderer,
            #related {
                display: none !important;
            }

            #columns {
                display: block !important;
            }

            #primary,
            #primary-inner,
            ytd-watch-flexy {
                width: 100% !important;
                max-width: 100% !important;
            }

            #player,
            #player-container,
            ytd-player,
            .html5-video-player,
            video {
                width: 100% !important;
                max-width: 100% !important;
                background: #000 !important;
            }
        `);
    }

    function clean() {
        document.querySelectorAll('a[href^="/shorts/"]').forEach(el => {
            const item = el.closest('ytd-rich-item-renderer, ytd-grid-video-renderer, ytd-video-renderer, ytd-compact-video-renderer');
            if (item) item.style.setProperty('display', 'none', 'important');
        });

        if (isWatchPage()) {
            const secondary = document.querySelector('#secondary');
            const below = document.querySelector('#below');
            if (secondary) secondary.style.setProperty('display', 'none', 'important');
            if (below) below.style.setProperty('display', 'none', 'important');
        }
    }

    function init() {
        injectCSS();
        const run = () => clean();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', run, { once: true });
        } else {
            run();
        }

        const mo = new MutationObserver(run);
        mo.observe(document.documentElement || document, { childList: true, subtree: true });
        setInterval(run, 1500);
    }

    init();
})();
