// ==UserScript==
// @name         YouTube Pro TV Edition
// @namespace    https://github.com/
// @version      1.0.0
// @description  YouTube 安卓电视浏览器增强：最佳清晰度、记忆倍速/音量/进度、TV遥控器快捷键、隐藏Shorts/评论/部分推荐、播放器聚焦
// @author       You
// @match        *://www.youtube.com/*
// @match        *://m.youtube.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const CONFIG = {
        debug: false,

        autoBestQuality: true,
        preferredQualities: ['hd2160', 'hd1440', 'hd1080', 'hd720', 'large', 'medium'],

        defaultPlaybackRate: 1.25,
        rememberPlaybackRate: true,

        rememberVolume: true,
        defaultVolume: 1.0,

        rememberProgress: true,
        resumeOnlyIfMoreThan: 15, // 超过 15 秒才记录
        resumePrompt: false,      // TV 端默认直接续播，不弹提示
        resumeNearEndIgnore: 30,  // 距离结束 30 秒内不恢复

        autoTheaterLike: true,
        autoFullscreen: false,    // 电视端如需自动全屏改 true

        hideShorts: true,
        hideComments: true,
        hideSidebar: false,
        hideMerch: true,
        hideEndscreen: true,
        hideMiniPlayers: true,
        hideChat: true,

        focusPlayerOnLoad: true,
        keepPlayerFocused: true,

        seekSeconds: 10,
        longSeekSeconds: 30,

        // TV 遥控器快捷键
        hotkeys: {
            playPause: ['Enter', 'MediaPlayPause', ' '],
            seekForward: ['ArrowRight'],
            seekBackward: ['ArrowLeft'],
            volumeUp: ['ArrowUp'],
            volumeDown: ['ArrowDown'],
            speedUp: ['=','+'],
            speedDown: ['-','_'],
            toggleFullscreen: ['f','F'],
            nextVideo: ['n','N'],
            prevVideo: ['p','P'],
            focusPlayer: ['0']
        }
    };

    const STORAGE = {
        rate: 'yt_pro_tv_rate',
        volume: 'yt_pro_tv_volume',
        muted: 'yt_pro_tv_muted',
        progressPrefix: 'yt_pro_tv_progress_'
    };

    let lastUrl = location.href;
    let observerStarted = false;
    let progressTimer = null;
    let lastVideoId = null;

    function log(...args) {
        if (CONFIG.debug) console.log('[YT-Pro-TV]', ...args);
    }

    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn, { once: true });
        } else {
            fn();
        }
    }

    function isMobileSite() {
        return location.hostname === 'm.youtube.com';
    }

    function isWatchPage() {
        return location.pathname === '/watch';
    }

    function getVideoId() {
        try {
            return new URL(location.href).searchParams.get('v');
        } catch {
            return null;
        }
    }

    function getVideo() {
        return document.querySelector('video');
    }

    function getPlayer() {
        return document.getElementById('movie_player');
    }

    function click(el) {
        if (!el) return false;
        try {
            el.click();
            return true;
        } catch {
            return false;
        }
    }

    function addStyle(css) {
        const style = document.createElement('style');
        style.textContent = css;
        (document.documentElement || document.head || document.body).appendChild(style);
    }

    function injectCSS() {
        let css = `
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

            /* 评论区 */
            ytd-comments,
            #comments,
            ytm-item-section-renderer[section-identifier="comments-entry-point"] {
                display: none !important;
            }

            /* 商品/周边/推广区 */
            ytd-merch-shelf-renderer,
            ytd-product-carousel,
            ytd-offer-module-renderer {
                display: none !important;
            }

            /* 结束卡片 */
            .ytp-ce-element,
            .ytp-endscreen-content,
            .html5-endscreen {
                display: none !important;
            }

            /* 聊天 */
            ytd-live-chat-frame,
            #chat {
                display: none !important;
            }

            /* 迷你播放器 */
            ytd-miniplayer,
            .ytd-miniplayer {
                display: none !important;
            }
        `;

        if (CONFIG.hideSidebar && !isMobileSite()) {
            css += `
                #secondary, ytd-watch-next-secondary-results-renderer {
                    display: none !important;
                }
                #primary {
                    width: 100% !important;
                    max-width: 100% !important;
                }
            `;
        }

        if (CONFIG.autoTheaterLike && !isMobileSite()) {
            css += `
                ytd-watch-flexy:not([fullscreen]) #primary.ytd-watch-flexy {
                    width: 100% !important;
                }
                ytd-watch-flexy:not([fullscreen]) #columns.ytd-watch-flexy {
                    display: block !important;
                }
                ytd-watch-flexy:not([fullscreen]) #secondary.ytd-watch-flexy {
                    margin-top: 16px !important;
                }
            `;
        }

        addStyle(css);
    }

    function getSavedRate() {
        const n = parseFloat(localStorage.getItem(STORAGE.rate));
        if (!isNaN(n) && n > 0.1 && n <= 16) return n;
        return CONFIG.defaultPlaybackRate;
    }

    function saveRate(rate) {
        if (!CONFIG.rememberPlaybackRate) return;
        if (!rate || isNaN(rate)) return;
        localStorage.setItem(STORAGE.rate, String(rate));
    }

    function getSavedVolume() {
        const n = parseFloat(localStorage.getItem(STORAGE.volume));
        if (!isNaN(n) && n >= 0 && n <= 1) return n;
        return CONFIG.defaultVolume;
    }

    function saveVolume(video) {
        if (!CONFIG.rememberVolume || !video) return;
        localStorage.setItem(STORAGE.volume, String(video.volume));
        localStorage.setItem(STORAGE.muted, video.muted ? '1' : '0');
    }

    function applyRate(video) {
        if (!video) return;
        const rate = getSavedRate();
        if (video.playbackRate !== rate) {
            video.playbackRate = rate;
            log('rate applied:', rate);
        }
        if (!video.dataset.ytProRateBound) {
            video.dataset.ytProRateBound = '1';
            video.addEventListener('ratechange', () => saveRate(video.playbackRate), { passive: true });
        }
    }

    function applyVolume(video) {
        if (!video || !CONFIG.rememberVolume) return;
        const volume = getSavedVolume();
        const muted = localStorage.getItem(STORAGE.muted) === '1';
        video.volume = volume;
        video.muted = muted;
        log('volume applied:', volume, 'muted:', muted);

        if (!video.dataset.ytProVolumeBound) {
            video.dataset.ytProVolumeBound = '1';
            video.addEventListener('volumechange', () => saveVolume(video), { passive: true });
        }
    }

    function getProgressKey(videoId) {
        return STORAGE.progressPrefix + videoId;
    }

    function saveProgress(video) {
        if (!CONFIG.rememberProgress || !video) return;
        const videoId = getVideoId();
        if (!videoId) return;

        const current = Math.floor(video.currentTime || 0);
        const duration = Math.floor(video.duration || 0);
        if (!duration || current < CONFIG.resumeOnlyIfMoreThan) return;

        const payload = JSON.stringify({
            t: current,
            d: duration,
            ts: Date.now()
        });
        localStorage.setItem(getProgressKey(videoId), payload);
    }

    function restoreProgress(video) {
        if (!CONFIG.rememberProgress || !video) return;
        const videoId = getVideoId();
        if (!videoId) return;

        const raw = localStorage.getItem(getProgressKey(videoId));
        if (!raw) return;

        try {
            const data = JSON.parse(raw);
            if (!data || !data.t || !data.d) return;

            const nearEnd = data.d - data.t <= CONFIG.resumeNearEndIgnore;
            if (nearEnd) return;

            const apply = () => {
                if (!video.duration || isNaN(video.duration)) return;
                if (data.t < video.duration - CONFIG.resumeNearEndIgnore) {
                    video.currentTime = data.t;
                    log('progress restored:', data.t);
                }
            };

            if (CONFIG.resumePrompt) {
                const ok = confirm(`继续从 ${formatTime(data.t)} 播放？`);
                if (ok) apply();
            } else {
                setTimeout(apply, 1200);
            }
        } catch (e) {
            log('restoreProgress error', e);
        }
    }

    function clearProgressNearEnd(video) {
        const videoId = getVideoId();
        if (!videoId || !video || !video.duration) return;
        if (video.duration - video.currentTime <= CONFIG.resumeNearEndIgnore) {
            localStorage.removeItem(getProgressKey(videoId));
        }
    }

    function formatTime(sec) {
        sec = Math.max(0, Math.floor(sec || 0));
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        return h > 0
            ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
            : `${m}:${String(s).padStart(2,'0')}`;
    }

    function setBestQuality() {
        if (!CONFIG.autoBestQuality) return;
        const player = getPlayer();
        if (!player) return;

        try {
            if (typeof player.getAvailableQualityLevels !== 'function') return;
            const levels = player.getAvailableQualityLevels();
            if (!Array.isArray(levels) || !levels.length) return;

            const target = CONFIG.preferredQualities.find(q => levels.includes(q));
            if (!target) return;

            if (typeof player.setPlaybackQualityRange === 'function') {
                player.setPlaybackQualityRange(target, target);
            }
            if (typeof player.setPlaybackQuality === 'function') {
                player.setPlaybackQuality(target);
            }

            log('quality set:', target);
        } catch (e) {
            log('setBestQuality error', e);
        }
    }

    function setTheaterLike() {
        if (!CONFIG.autoTheaterLike) return;
        if (!isWatchPage()) return;
        if (isMobileSite()) return;

        const flexy = document.querySelector('ytd-watch-flexy');
        const theater = document.querySelector('ytd-watch-flexy[theater]');
        if (theater) return;

        const btn = document.querySelector('.ytp-size-button');
        if (btn) {
            click(btn);
            log('theater mode clicked');
        } else if (flexy) {
            flexy.setAttribute('theater', '');
        }
    }

    function requestFullscreenSafe() {
        if (!CONFIG.autoFullscreen) return;
        const player = getPlayer() || document.documentElement;
        if (!document.fullscreenElement && player?.requestFullscreen) {
            player.requestFullscreen().catch(() => {});
        }
    }

    function focusPlayer() {
        const video = getVideo();
        const player = getPlayer();

        if (video) {
            try {
                video.setAttribute('tabindex', '0');
                video.focus({ preventScroll: true });
                log('video focused');
                return true;
            } catch {}
        }

        if (player) {
            try {
                player.setAttribute('tabindex', '0');
                player.focus({ preventScroll: true });
                log('player focused');
                return true;
            } catch {}
        }

        return false;
    }

    function keepFocused() {
        if (!CONFIG.keepPlayerFocused || !isWatchPage()) return;
        const active = document.activeElement;
        const video = getVideo();
        const player = getPlayer();

        if (video && active !== video && active !== player && !player?.contains(active)) {
            focusPlayer();
        }
    }

    function togglePlayPause() {
        const video = getVideo();
        if (!video) return;
        if (video.paused) video.play().catch(() => {});
        else video.pause();
    }

    function seekBy(sec) {
        const video = getVideo();
        if (!video || isNaN(video.currentTime)) return;
        video.currentTime = Math.max(0, Math.min((video.duration || Infinity), video.currentTime + sec));
    }

    function changeVolume(delta) {
        const video = getVideo();
        if (!video) return;
        video.muted = false;
        const v = Math.max(0, Math.min(1, (video.volume || 0) + delta));
        video.volume = v;
    }

    function changeSpeed(delta) {
        const video = getVideo();
        if (!video) return;
        const next = Math.max(0.25, Math.min(4, Math.round((video.playbackRate + delta) * 100) / 100));
        video.playbackRate = next;
        saveRate(next);
    }

    function nextVideo() {
        const btn =
            document.querySelector('.ytp-next-button') ||
            document.querySelector('a[aria-label*="Next"]') ||
            document.querySelector('a[aria-label*="下一个"]');
        if (btn) click(btn);
    }

    function prevVideo() {
        history.back();
    }

    function bindHotkeys() {
        if (document.documentElement.dataset.ytProHotkeysBound) return;
        document.documentElement.dataset.ytProHotkeysBound = '1';

        document.addEventListener('keydown', function (e) {
            if (!isWatchPage()) return;

            const tag = (document.activeElement?.tagName || '').toLowerCase();
            const editing = ['input', 'textarea'].includes(tag) || document.activeElement?.isContentEditable;
            if (editing) return;

            const key = e.key;

            const inMap = (arr) => arr.includes(key);

            if (inMap(CONFIG.hotkeys.playPause)) {
                e.preventDefault();
                togglePlayPause();
                return;
            }
            if (inMap(CONFIG.hotkeys.seekForward)) {
                e.preventDefault();
                seekBy(CONFIG.seekSeconds);
                return;
            }
            if (inMap(CONFIG.hotkeys.seekBackward)) {
                e.preventDefault();
                seekBy(-CONFIG.seekSeconds);
                return;
            }
            if (inMap(CONFIG.hotkeys.volumeUp)) {
                e.preventDefault();
                changeVolume(0.05);
                return;
            }
            if (inMap(CONFIG.hotkeys.volumeDown)) {
                e.preventDefault();
                changeVolume(-0.05);
                return;
            }
            if (inMap(CONFIG.hotkeys.speedUp)) {
                e.preventDefault();
                changeSpeed(0.25);
                return;
            }
            if (inMap(CONFIG.hotkeys.speedDown)) {
                e.preventDefault();
                changeSpeed(-0.25);
                return;
            }
            if (inMap(CONFIG.hotkeys.toggleFullscreen)) {
                e.preventDefault();
                if (!document.fullscreenElement) {
                    requestFullscreenSafe();
                } else {
                    document.exitFullscreen?.().catch(() => {});
                }
                return;
            }
            if (inMap(CONFIG.hotkeys.nextVideo)) {
                e.preventDefault();
                nextVideo();
                return;
            }
            if (inMap(CONFIG.hotkeys.prevVideo)) {
                e.preventDefault();
                prevVideo();
                return;
            }
            if (inMap(CONFIG.hotkeys.focusPlayer)) {
                e.preventDefault();
                focusPlayer();
            }
        }, true);
    }

    function bindVideo(video) {
        if (!video || video.dataset.ytProBound) return;
        video.dataset.ytProBound = '1';

        applyRate(video);
        applyVolume(video);

        video.addEventListener('loadedmetadata', () => {
            applyRate(video);
            applyVolume(video);
            setBestQuality();
            restoreProgress(video);
        }, { passive: true });

        video.addEventListener('ended', () => {
            clearProgressNearEnd(video);
        }, { passive: true });

        video.addEventListener('timeupdate', () => {
            clearProgressNearEnd(video);
        }, { passive: true });

        log('video bound');
    }

    function startProgressSaver() {
        if (progressTimer) clearInterval(progressTimer);
        progressTimer = setInterval(() => {
            const video = getVideo();
            if (video && !video.paused) saveProgress(video);
        }, 3000);
    }

    function handleWatchPage() {
        const video = getVideo();
        if (video) bindVideo(video);

        setTimeout(setTheaterLike, 600);
        setTimeout(setBestQuality, 1200);
        setTimeout(setBestQuality, 2500);
        setTimeout(requestFullscreenSafe, 1800);

        if (CONFIG.focusPlayerOnLoad) {
            setTimeout(focusPlayer, 800);
            setTimeout(focusPlayer, 1800);
        }
    }

    function cleanPage() {
        if (CONFIG.hideShorts) {
            document.querySelectorAll('a[href^="/shorts/"]').forEach(el => {
                const item = el.closest('ytd-rich-item-renderer, ytd-grid-video-renderer, ytd-video-renderer, ytd-compact-video-renderer');
                if (item) item.style.setProperty('display', 'none', 'important');
            });
        }

        if (CONFIG.hideComments) {
            document.querySelectorAll('ytd-comments, #comments').forEach(el => {
                el.style.setProperty('display', 'none', 'important');
            });
        }

        if (CONFIG.hideMerch) {
            document.querySelectorAll('ytd-merch-shelf-renderer, ytd-product-carousel, ytd-offer-module-renderer').forEach(el => {
                el.style.setProperty('display', 'none', 'important');
            });
        }

        if (CONFIG.hideChat) {
            document.querySelectorAll('ytd-live-chat-frame, #chat').forEach(el => {
                el.style.setProperty('display', 'none', 'important');
            });
        }

        if (CONFIG.hideMiniPlayers) {
            document.querySelectorAll('ytd-miniplayer, .ytd-miniplayer').forEach(el => {
                el.style.setProperty('display', 'none', 'important');
            });
        }

        if (CONFIG.hideEndscreen) {
            document.querySelectorAll('.ytp-ce-element, .ytp-endscreen-content, .html5-endscreen').forEach(el => {
                el.style.setProperty('display', 'none', 'important');
            });
        }
    }

    function onPageChanged() {
        log('page changed:', location.href);
        cleanPage();

        if (isWatchPage()) {
            const currentId = getVideoId();
            if (currentId !== lastVideoId) {
                lastVideoId = currentId;
            }
            handleWatchPage();
        }
    }

    function watchUrlChange() {
        setInterval(() => {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                onPageChanged();
            }
        }, 500);
    }

    function observeDom() {
        if (observerStarted) return;
        observerStarted = true;

        const mo = new MutationObserver(() => {
            cleanPage();

            if (isWatchPage()) {
                const video = getVideo();
                if (video) bindVideo(video);
                if (CONFIG.keepPlayerFocused) keepFocused();
            }
        });

        mo.observe(document.documentElement || document, {
            childList: true,
            subtree: true
        });
    }

    function init() {
        injectCSS();
        bindHotkeys();

        ready(() => {
            cleanPage();
            onPageChanged();
            watchUrlChange();
            observeDom();
            startProgressSaver();

            setInterval(() => {
                cleanPage();
                if (isWatchPage()) {
                    setBestQuality();
                    if (CONFIG.keepPlayerFocused) keepFocused();
                }
            }, 2500);
        });
    }

    init();
})();
