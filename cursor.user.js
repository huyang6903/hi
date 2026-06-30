// ==UserScript==
// @name         Watermelon Cursor Basic Stable
// @namespace    https://example.com/
// @version      1.0.0
// @description  Stable triangle watermelon cursor for all pages
// @match        http://*/*
// @match        https://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  let cursorEl = null;
  let started = false;

  function createCursorSvg() {
    return `
      <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
        <g transform="rotate(-45 8 8)">
          <path d="M2 2 L2 24 L18 8 Z" fill="#2e7d32"></path>
          <path d="M3.5 4 L3.5 22 L16 8 Z" fill="#66bb6a"></path>
          <path d="M5 6 L5 20 L14 8 Z" fill="#fffaf0"></path>
          <path d="M6 7.5 L6 18.5 L12.5 8 Z" fill="#ff4d6d"></path>

          <ellipse cx="8.8" cy="9.6" rx="1.1" ry="1.8" fill="#1a1a1a"></ellipse>
          <ellipse cx="9.5" cy="13.2" rx="1.1" ry="1.8" fill="#1a1a1a"></ellipse>
          <ellipse cx="7.7" cy="15.8" rx="1.1" ry="1.8" fill="#1a1a1a"></ellipse>
        </g>
      </svg>
    `;
  }

  function injectStyle() {
    if (document.getElementById('wm-basic-style')) return;

    const style = document.createElement('style');
    style.id = 'wm-basic-style';
    style.textContent = `
      * {
        cursor: none !important;
      }

      #wm-basic-cursor {
        position: fixed;
        left: 0;
        top: 0;
        width: 28px;
        height: 28px;
        pointer-events: none !important;
        z-index: 2147483647 !important;
        opacity: 1;
        will-change: transform;
        contain: layout style paint;
      }

      #wm-basic-cursor svg {
        display: block;
        width: 28px;
        height: 28px;
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25));
      }
    `;
    document.head.appendChild(style);
  }

  function ensureCursor() {
    if (cursorEl && document.body.contains(cursorEl)) return cursorEl;

    cursorEl = document.getElementById('wm-basic-cursor');
    if (cursorEl && document.body.contains(cursorEl)) return cursorEl;

    cursorEl = document.createElement('div');
    cursorEl.id = 'wm-basic-cursor';
    cursorEl.innerHTML = createCursorSvg();
    document.body.appendChild(cursorEl);

    return cursorEl;
  }

  function moveCursor(x, y) {
    const el = ensureCursor();

    // 让西瓜尖端更接近真实点击点
    const offsetX = -2;
    const offsetY = -2;

    el.style.transform = `translate3d(${x + offsetX}px, ${y + offsetY}px, 0)`;
  }

  function bindEvents() {
    window.addEventListener('mousemove', (e) => {
      moveCursor(e.clientX, e.clientY);
      if (cursorEl) cursorEl.style.opacity = '1';
    }, { passive: true });

    window.addEventListener('mouseenter', () => {
      if (cursorEl) cursorEl.style.opacity = '1';
    });

    window.addEventListener('mouseleave', () => {
      if (cursorEl) cursorEl.style.opacity = '0';
    });

    window.addEventListener('blur', () => {
      if (cursorEl) cursorEl.style.opacity = '0';
    });

    window.addEventListener('focus', () => {
      if (cursorEl) cursorEl.style.opacity = '1';
    });
  }

  function init() {
    if (started) return;
    if (!document.head || !document.body) return;

    injectStyle();
    ensureCursor();
    bindEvents();

    started = true;
    console.log('[Userscript] Watermelon Cursor Basic Stable active');
  }

  function start() {
    init();
    setTimeout(init, 500);
    setTimeout(init, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
