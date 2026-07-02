// ==UserScript==
// @name         YouTube TV Player Only
// @namespace    https://github.com/
// @version      1.0.0
// @description  YouTube 纯播放器模式：视频页只保留播放器，最大限度隐藏周围元素
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
                overflow: hidden !important;
            }

            ytd-masthead,
            #masthead-container,
            #guide,
            #mini-guide,
            #secondary,
            #secondary-inner,
            #below,
            #comments,
            ytd-comments,
            ytd-merch-shelf-renderer,
            ytd-product-carousel,
            ytd-live-chat-frame,
            #chat,
            .ytp-ce-element,
            .ytp-endscreen-content,
            .html5-endscreen,
            a[href^="/shorts/"],
            ytd-reel-shelf-renderer,
            ytd-rich-shelf-renderer[is-shorts] {
                display: none !important;
            }

            #columns,
            #primary,
            #primary-inner,
            ytd-watch-flexy {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #000 !important;
            }

            #player,
            #player-container,
            #player-container-outer,
            #full-bleed-container,
            ytd-player,
            .html5-video-player {
                width: 100vw !important;
                max-width: 100vw !important;
                margin: 0 auto !important;
                background: #000 !important;
            }

            video {
                width: 100% !important;
                max-height: 100vh !important;
                background: #000 !important;
            }
        `);
    }

    function clean() {
        if (!isWatchPage()) return;

        const player = document.querySelector('#player, #full-bleed-container, ytd-player, .html5-video-player, video');
        if (player) {
            try {
                player.scrollIntoView({ behavior: 'auto', block: 'start' });
            } catch {}
        }

        const video = document.querySelector('video');
        if (video) {
            try {
                video.setAttribute('tabindex', '0');
                video.focus({ preventScroll: true });
            } catch {}
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
        setInterval(run, 1200);
    }

    init();
})();
