// ==UserScript==
// @name         HDFilmCehennemi Cleaner Pro
// @namespace    https://github.com/
// @version      1.0.0
// @description  hdfilmcehennemi.nl 专用加强版广告清理、弹窗拦截、遮罩移除、点击劫持防护、播放器净化
// @author       You
// @match        *://hdfilmcehennemi.nl/*
// @match        *://*.hdfilmcehennemi.nl/*
// @match        *://hdfilmcehennemi2.nl/*
// @match        *://*.hdfilmcehennemi2.nl/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const DEBUG = false;

    const BAD_URL_KEYWORDS = [
        'doubleclick',
        'googlesyndication',
        'googleadservices',
        'adservice',
        'adnxs',
        'taboola',
        'outbrain',
        'popads',
        'popcash',
        'propellerads',
        'adsterra',
        'monetag',
        'onclick',
        'exoclick',
        'hilltopads',
        'trafcf',
        'traffic',
        'fuseplatform',
        'criteo',
        'mgid',
        'revcontent',
        'push',
        'onesignal',
        'notification',
        'analytics'
    ];

    const BAD_TEXT_KEYWORDS = [
        'reklam',
        'advert',
        'sponsor',
        'popup',
        'overlay',
        'download',
        'watch ads',
        'disable adblock',
        'turn off adblock',
        'please disable',
        'notification',
        'allow notifications'
    ];

    const BAD_CLASS_ID_KEYWORDS = [
        'ad', 'ads', 'adsbox', 'advert', 'banner', 'popup',
        'overlay', 'sponsor', 'promo', 'notify', 'push',
        'onesignal', 'social-bar', 'floating', 'sticky-ad'
    ];

    const SAFE_KEYWORDS = [
        'video', 'player', 'stream', 'jwplayer', 'plyr',
        'subtitle', 'season', 'episode', 'source', 'play'
    ];

    function log(...args) {
        if (DEBUG) console.log('[HDF-Pro]', ...args);
    }

    function lower(v) {
        return (v || '').toString().toLowerCase();
    }

    function includesAny(str, arr) {
        const s = lower(str);
        return arr.some(k => s.includes(k));
    }

    function isBadUrl(url) {
        return includesAny(url, BAD_URL_KEYWORDS);
    }

    function hasSafeKeyword(str) {
        return includesAny(str, SAFE_KEYWORDS);
    }

    function isVisible(el) {
        if (!el || el.nodeType !== 1) return false;
        try {
            const st = getComputedStyle(el);
            const r = el.getBoundingClientRect();
            return st.display !== 'none' &&
                   st.visibility !== 'hidden' &&
                   parseFloat(st.opacity || '1') !== 0 &&
                   r.width > 0 &&
                   r.height > 0;
        } catch {
            return false;
        }
    }

    function rect(el) {
        try {
            return el.getBoundingClientRect();
        } catch {
            return { width: 0, height: 0, top: 0, left: 0 };
        }
    }

    function isOverlayLike(el) {
        if (!el || el.nodeType !== 1) return false;
        try {
            const st = getComputedStyle(el);
            const r = rect(el);
            const vw = window.innerWidth || document.documentElement.clientWidth;
            const vh = window.innerHeight || document.documentElement.clientHeight;
            const posOk = ['fixed', 'absolute', 'sticky'].includes(st.position);
            const z = parseInt(st.zIndex || '0', 10);
            const large = r.width > vw * 0.35 && r.height > vh * 0.15;
            const almostFull = r.width > vw * 0.75 && r.height > vh * 0.45;
            return posOk && (z > 999 || large || almostFull);
        } catch {
            return false;
        }
    }

    function isPlayerElement(el) {
        if (!el || el.nodeType !== 1) return false;
        const tag = lower(el.tagName);
        const info = [
            el.id,
            el.className,
            el.getAttribute?.('src'),
            el.getAttribute?.('title'),
            el.getAttribute?.('aria-label')
        ].join(' ');
        if (tag === 'video') return true;
        if (tag === 'iframe' && includesAny(info, ['player', 'video', 'embed'])) return true;
        return hasSafeKeyword(info);
    }

    function hardHide(el, reason = '') {
        if (!el || el.nodeType !== 1) return;
        log('hide', reason, el);
        el.setAttribute('data-hdf-hidden', '1');
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
    }

    function hardRemove(el, reason = '') {
        if (!el || !el.parentNode) return;
        log('remove', reason, el);
        el.remove();
    }

    function unblockScroll() {
        try {
            document.documentElement.style.setProperty('overflow', 'auto', 'important');
            document.documentElement.style.setProperty('overflow-y', 'auto', 'important');
            document.body?.style.setProperty('overflow', 'auto', 'important');
            document.body?.style.setProperty('overflow-y', 'auto', 'important');
            document.body?.classList.remove('modal-open', 'no-scroll', 'overflow-hidden');
        } catch {}
    }

    function injectCSS() {
        const css = `
            html, body {
                overflow-x: auto !important;
                overflow-y: auto !important;
                overscroll-behavior: auto !important;
            }

            iframe[src*="doubleclick"],
            iframe[src*="googlesyndication"],
            iframe[src*="adservice"],
            iframe[src*="adnxs"],
            iframe[src*="taboola"],
            iframe[src*="outbrain"],
            iframe[src*="popads"],
            iframe[src*="propellerads"],
            iframe[src*="adsterra"],
            iframe[src*="exoclick"],
            iframe[src*="onclick"],
            iframe[src*="monetag"],
            .ads, .ad, .adsbox, .advert, .banner, .popup, .overlay,
            .sponsor, .promo, .onesignal-popover-container,
            .grecaptcha-badge,
            [id*="popup"], [class*="popup"],
            [id*="overlay"], [class*="overlay"],
            [id*="banner"], [class*="banner"],
            [id*="ads"], [class*="ads"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
            }
        `;
        const style = document.createElement('style');
        style.textContent = css;
        (document.documentElement || document.head || document.body).appendChild(style);
    }

    function patchWindowOpen() {
        const rawOpen = window.open;
        window.open = function (...args) {
            const url = args[0] ? String(args[0]) : '';
            log('window.open blocked =>', url);
            return null;
        };

        const rawAssign = window.location.assign.bind(window.location);
        const rawReplace = window.location.replace.bind(window.location);

        window.location.assign = function (url) {
            if (isBadUrl(url)) {
                log('location.assign blocked =>', url);
                return;
            }
            return rawAssign(url);
        };

        window.location.replace = function (url) {
            if (isBadUrl(url)) {
                log('location.replace blocked =>', url);
                return;
            }
            return rawReplace(url);
        };
    }

    function patchTimers() {
        const rawSetTimeout = window.setTimeout;
        const rawSetInterval = window.setInterval;

        function suspicious(handler) {
            try {
                const code = typeof handler === 'function' ? handler.toString() : String(handler);
                const s = lower(code);
                return (
                    s.includes('window.open') ||
                    s.includes('top.location') ||
                    s.includes('location.href') ||
                    s.includes('location=') ||
                    s.includes('popup') ||
                    s.includes('popunder') ||
                    s.includes('onclick')
                );
            } catch {
                return false;
            }
        }

        window.setTimeout = function (handler, timeout, ...rest) {
            if (suspicious(handler)) {
                log('blocked setTimeout');
                return 0;
            }
            return rawSetTimeout(handler, timeout, ...rest);
        };

        window.setInterval = function (handler, timeout, ...rest) {
            if (suspicious(handler)) {
                log('blocked setInterval');
                return 0;
            }
            return rawSetInterval(handler, timeout, ...rest);
        };
    }

    function neutralizeInlineHandlers() {
        const all = document.querySelectorAll('[onclick],[onmousedown],[onmouseup],[ontouchstart],[ontouchend]');
        all.forEach(el => {
            if (isPlayerElement(el)) return;
            const info = [
                el.getAttribute('onclick'),
                el.getAttribute('onmousedown'),
                el.getAttribute('onmouseup'),
                el.getAttribute('ontouchstart'),
                el.getAttribute('ontouchend'),
                el.id,
                el.className
            ].join(' ').toLowerCase();

            if (includesAny(info, ['window.open', 'popup', 'popunder', 'location', 'redirect', 'ad'])) {
                el.removeAttribute('onclick');
                el.removeAttribute('onmousedown');
                el.removeAttribute('onmouseup');
                el.removeAttribute('ontouchstart');
                el.removeAttribute('ontouchend');
                log('inline handlers removed', el);
            }
        });
    }

    function cleanIframesAndScripts(root = document) {
        root.querySelectorAll?.('iframe, script[src], a[href]').forEach(el => {
            const tag = lower(el.tagName);
            const src = el.getAttribute('src') || '';
            const href = el.getAttribute('href') || '';

            if (tag === 'script' && isBadUrl(src)) {
                hardRemove(el, 'bad script');
                return;
            }

            if (tag === 'iframe') {
                if (isPlayerElement(el)) return;
                if (isBadUrl(src) || isOverlayLike(el)) {
                    hardRemove(el, 'bad iframe');
                    return;
                }
            }

            if (tag === 'a') {
                if (isBadUrl(href)) {
                    el.setAttribute('href', 'javascript:void(0)');
                    el.removeAttribute('target');
                    log('bad link neutralized', el);
                }
            }
        });
    }

    function cleanFakeButtons(root = document) {
        root.querySelectorAll?.('a, button, div, span').forEach(el => {
            if (!el || !el.isConnected) return;
            if (isPlayerElement(el)) return;

            const info = [
                el.textContent?.slice(0, 200),
                el.id,
                el.className,
                el.getAttribute?.('title'),
                el.getAttribute?.('aria-label'),
                el.getAttribute?.('href')
            ].join(' ').toLowerCase();

            if (hasSafeKeyword(info)) return;

            if (includesAny(info, BAD_TEXT_KEYWORDS) || includesAny(info, BAD_CLASS_ID_KEYWORDS)) {
                const r = rect(el);
                if (
                    isOverlayLike(el) ||
                    r.width > 160 ||
                    r.height > 60 ||
                    (isVisible(el) && ['a', 'button'].includes(lower(el.tagName)))
                ) {
                    hardHide(el, 'fake/promo/button');
                }
            }
        });
    }

    function cleanOverlayNodes(root = document) {
        root.querySelectorAll?.('div, section, aside').forEach(el => {
            if (!el || !el.isConnected) return;
            if (isPlayerElement(el)) return;

            const info = [
                el.id,
                el.className,
                el.textContent?.slice(0, 300)
            ].join(' ').toLowerCase();

            if (hasSafeKeyword(info)) return;

            if (isOverlayLike(el)) {
                if (includesAny(info, BAD_CLASS_ID_KEYWORDS) || includesAny(info, BAD_TEXT_KEYWORDS)) {
                    hardHide(el, 'overlay bad keyword');
                    return;
                }

                const r = rect(el);
                const vw = window.innerWidth || document.documentElement.clientWidth;
                const vh = window.innerHeight || document.documentElement.clientHeight;

                if (r.width > vw * 0.8 && r.height > vh * 0.4) {
                    const containsPlayer = !!el.querySelector('video, iframe[src*="embed"], iframe[src*="player"], .jwplayer, .plyr');
                    if (!containsPlayer) {
                        hardHide(el, 'large overlay no player');
                    }
                }
            }
        });
    }

    function removeAntiAdblock() {
        document.querySelectorAll('div, section, p, span').forEach(el => {
            const text = lower(el.textContent).trim();
            if (!text) return;
            if (includesAny(text, ['adblock', 'disable adblock', 'turn off adblock', 'please disable'])) {
                const r = rect(el);
                if (r.width > 120 && r.height > 30) {
                    hardHide(el, 'anti-adblock');
                    if (el.parentElement) hardHide(el.parentElement, 'anti-adblock parent');
                }
            }
        });
    }

    function cleanCloseBaits() {
        document.querySelectorAll('a,button,div,span').forEach(el => {
            const txt = lower(el.textContent).trim();
            const info = [txt, el.id, el.className].join(' ');
            if (!info) return;
            if (txt === 'x' || txt === 'close' || txt === 'skip ad' || txt === 'continue') {
                if (!isPlayerElement(el) && isOverlayLike(el.parentElement || el)) {
                    hardHide(el.parentElement || el, 'close bait wrapper');
                }
            }
        });
    }

    function protectPlayer() {
        const players = document.querySelectorAll('video, iframe, .jwplayer, .plyr, [id*="player"], [class*="player"]');
        players.forEach(el => {
            el.style.setProperty('pointer-events', 'auto', 'important');
            el.style.setProperty('visibility', 'visible', 'important');
            el.style.setProperty('opacity', '1', 'important');
            const p = el.parentElement;
            if (p) {
                p.style.setProperty('pointer-events', 'auto', 'important');
                p.style.setProperty('visibility', 'visible', 'important');
            }
        });
    }

    function clickGuard() {
        document.addEventListener('click', function (e) {
            const path = e.composedPath ? e.composedPath() : [];
            const list = [];
            if (e.target) list.push(e.target);
            if (Array.isArray(path)) list.push(...path);

            for (const el of list) {
                if (!el || !el.tagName) continue;

                const tag = lower(el.tagName);
                const href = el.getAttribute?.('href') || '';
                const onclick = el.getAttribute?.('onclick') || '';
                const info = [
                    href,
                    onclick,
                    el.id,
                    el.className,
                    el.textContent?.slice(0, 80)
                ].join(' ').toLowerCase();

                if (isPlayerElement(el)) return;

                if (isBadUrl(href) || includesAny(info, BAD_CLASS_ID_KEYWORDS) || includesAny(info, BAD_TEXT_KEYWORDS)) {
                    log('click blocked', el);
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                }

                if (isOverlayLike(el) && !el.querySelector?.('video, iframe[src*="embed"], iframe[src*="player"]')) {
                    log('overlay click blocked', el);
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                }

                if ((tag === 'a' || tag === 'button' || tag === 'div') && includesAny(info, ['window.open', 'popup', 'redirect'])) {
                    log('redirect click blocked', el);
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                }
            }
        }, true);
    }

    function cleanAll(root = document) {
        unblockScroll();
        cleanIframesAndScripts(root);
        cleanFakeButtons(root);
        cleanOverlayNodes(root);
        cleanCloseBaits();
        removeAntiAdblock();
        neutralizeInlineHandlers();
        protectPlayer();
    }

    function observe() {
        const mo = new MutationObserver(muts => {
            for (const m of muts) {
                m.addedNodes.forEach(node => {
                    if (!node || node.nodeType !== 1) return;
                    const el = node;

                    if (!isPlayerElement(el) && isOverlayLike(el)) {
                        const info = [el.id, el.className, el.textContent?.slice(0, 200)].join(' ').toLowerCase();
                        if (includesAny(info, BAD_CLASS_ID_KEYWORDS) || includesAny(info, BAD_TEXT_KEYWORDS)) {
                            hardHide(el, 'mutation overlay');
                            return;
                        }
                    }

                    cleanAll(el);
                });
            }
        });

        mo.observe(document.documentElement || document, {
            childList: true,
            subtree: true
        });
    }

    function antiAntiAd() {
        try {
            Object.defineProperty(window, 'adblock', {
                get() { return false; },
                set() {},
                configurable: true
            });
        } catch {}

        try {
            window.BlockAdBlock = undefined;
            window.blockAdBlock = undefined;
            window.adblockDetect = undefined;
            window.canRunAds = true;
        } catch {}

        try {
            window.alert = function () {};
            window.confirm = function () { return true; };
        } catch {}
    }

    function init() {
        injectCSS();
        patchWindowOpen();
        patchTimers();
        antiAntiAd();
        clickGuard();

        const run = () => cleanAll(document);

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', run, { once: true });
        } else {
            run();
        }

        window.addEventListener('load', run);
        setInterval(run, 1200);
        observe();
    }

    init();
})();
