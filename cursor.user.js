// ==UserScript==
// @name         Watermelon Triangle Cursor
// @namespace    https://example.com/
// @version      1.0.0
// @description  Replace page cursor with a triangle watermelon cursor
// @match        http://*/*
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  let cursor;
  let inited = false;

  function injectStyle() {
    if (document.getElementById('wm-cursor-style')) return;

    const style = document.createElement('style');
    style.id = 'wm-cursor-style';
    style.textContent = `
      * { cursor: none !important; }

      #wm-cursor {
        position: fixed;
        left: 0;
        top: 0;
        width: 30px;
        height: 30px;
        pointer-events: none;
        z-index: 2147483647;
        transform: translate(-2px, -2px) scale(1);
        transform-origin: 7px 7px;
        transition: transform .08s ease, opacity .12s ease;
        opacity: 1;
      }
      #wm-cursor.pressed {
        transform: translate(-2px, -2px) scale(0.84);
      }

      /* 外层深绿皮 */
      #wm-cursor .rind-outer {
        position: absolute;
        left: 0;
        top: 0;
        width: 0;
        height: 0;
        border-right: 13px solid transparent;
        border-top: 28px solid #2e7d32;
        transform: rotate(-45deg);
        transform-origin: 0 0;
        filter: drop-shadow(0 2px 2px rgba(0,0,0,.28));
      }

      /* 中层浅绿皮 */
      #wm-cursor .rind-inner {
        position: absolute;
        left: 1px;
        top: 2px;
        width: 0;
        height: 0;
        border-right: 11px solid transparent;
        border-top: 24px solid #66bb6a;
        transform: rotate(-45deg);
        transform-origin: 0 0;
      }

      /* 白边 */
      #wm-cursor .white {
        position: absolute;
        left: 2px;
        top: 4px;
        width: 0;
        height: 0;
        border-right: 9px solid transparent;
        border-top: 20px solid #fffaf0;
        transform: rotate(-45deg);
        transform-origin: 0 0;
      }

      /* 红瓤 */
      #wm-cursor .flesh {
        position: absolute;
        left: 3px;
        top: 6px;
        width: 0;
        height: 0;
        border-right: 7px solid transparent;
        border-top: 16px solid #ff4d6d;
        transform: rotate(-45deg);
        transform-origin: 0 0;
      }

      /* 籽 */
      #wm-cursor .seed {
        position: absolute;
        width: 3px;
        height: 5px;
        background: #1a1a1a;
        border-radius: 50%;
        transform: rotate(-18deg);
      }
      #wm-cursor .s1 { left: 7px; top: 8px; }
      #wm-cursor .s2 { left: 10px; top: 11px; }
      #wm-cursor .s3 { left: 6px; top: 13px; }

      /* 点击波纹 */
      .wm-ripple {
        position: fixed;
        width: 14px;
        height: 14px;
        margin-left: -7px;
        margin-top: -7px;
        border: 2px solid rgba(255,77,109,.75);
        border-radius: 50%;
        pointer-events: none;
        z-index: 2147483646;
        animation: wm-ripple .35s ease-out forwards;
      }
      @keyframes wm-ripple {
        from { transform: scale(.4); opacity: .95; }
        to   { transform: scale(2.2); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  function createCursor() {
    if (document.getElementById('wm-cursor')) {
      cursor = document.getElementById('wm-cursor');
      return;
    }

    cursor = document.createElement('div');
    cursor.id = 'wm-cursor';
    cursor.innerHTML = `
      <div class="rind-outer"></div>
      <div class="rind-inner"></div>
      <div class="white"></div>
      <div class="flesh"></div>
      <div class="seed s1"></div>
      <div class="seed s2"></div>
      <div class="seed s3"></div>
    `;
    document.body.appendChild(cursor);
  }

  function ripple(x, y) {
    const el = document.createElement('div');
    el.className = 'wm-ripple';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 400);
  }

  function bind() {
    document.addEventListener('mousemove', (e) => {
      if (!cursor) return;
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      cursor.style.opacity = '1';
    }, { passive: true });

    document.addEventListener('mousedown', (e) => {
      if (!cursor) return;
      cursor.classList.add('pressed');
      ripple(e.clientX, e.clientY);
    });

    document.addEventListener('mouseup', () => {
      if (!cursor) return;
      cursor.classList.remove('pressed');
    });

    document.addEventListener('mouseleave', () => {
      if (cursor) cursor.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      if (cursor) cursor.style.opacity = '1';
    });

    window.addEventListener('blur', () => {
      if (cursor) cursor.classList.remove('pressed');
    });
  }

  function init() {
    if (inited) return;
    if (!document.head || !document.body) return;
    injectStyle();
    createCursor();
    bind();
    inited = true;
    console.log('[Userscript] Watermelon Triangle Cursor active');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
