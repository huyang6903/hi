// ==UserScript==
// @name         Watermelon Triangle Cursor Fixed
// @namespace    https://example.com/
// @version      1.1.0
// @description  Stable triangle watermelon cursor that follows the real mouse
// @match        http://*/*
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  let root = null;
  let shape = null;
  let initialized = false;
  let mouseX = 0;
  let mouseY = 0;

  function injectStyle() {
    if (document.getElementById('wm-cursor-fixed-style')) return;

    const style = document.createElement('style');
    style.id = 'wm-cursor-fixed-style';
    style.textContent = `
      * {
        cursor: none !important;
      }

      #wm-cursor-fixed {
        position: fixed;
        left: 0;
        top: 0;
        width: 32px;
        height: 32px;
        pointer-events: none;
        z-index: 2147483647;
        opacity: 1;
        will-change: transform;
      }

      #wm-cursor-fixed .wm-shape {
        position: absolute;
        left: 0;
        top: 0;
        width: 32px;
        height: 32px;
        transform-origin: 6px 6px;
        transition: transform 0.08s ease, opacity 0.12s ease;
      }

      #wm-cursor-fixed.pressed .wm-shape {
        transform: scale(0.82);
      }

      /* 外层深绿 */
      #wm-cursor-fixed .rind-outer {
        position: absolute;
        left: 2px;
        top: 2px;
        width: 0;
        height: 0;
        border-right: 14px solid transparent;
        border-top: 28px solid #2e7d32;
        transform: rotate(-45deg);
        transform-origin: 0 0;
        filter: drop-shadow(0 2px 2px rgba(0,0,0,0.25));
      }

      /* 浅绿层 */
      #wm-cursor-fixed .rind-inner {
        position: absolute;
        left: 3px;
        top: 4px;
        width: 0;
        height: 0;
        border-right: 12px solid transparent;
        border-top: 24px solid #66bb6a;
        transform: rotate(-45deg);
        transform-origin: 0 0;
      }

      /* 白边 */
      #wm-cursor-fixed .white {
        position: absolute;
        left: 4px;
        top: 6px;
        width: 0;
        height: 0;
        border-right: 10px solid transparent;
        border-top: 20px solid #fffaf0;
        transform: rotate(-45deg);
        transform-origin: 0 0;
      }

      /* 红瓤 */
      #wm-cursor-fixed .flesh {
        position: absolute;
        left: 5px;
        top: 8px;
        width: 0;
        height: 0;
        border-right: 8px solid transparent;
        border-top: 16px solid #ff4d6d;
        transform: rotate(-45deg);
        transform-origin: 0 0;
      }

      /* 籽 */
      #wm-cursor-fixed .seed {
        position: absolute;
        width: 3px;
        height: 5px;
        background: #1a1a1a;
        border-radius: 50%;
        transform: rotate(-20deg);
      }

      #wm-cursor-fixed .s1 { left: 10px; top: 10px; }
      #wm-cursor-fixed .s2 { left: 12px; top: 14px; }
      #wm-cursor-fixed .s3 { left: 8px; top: 15px; }

      .wm-click-ripple {
        position: fixed;
        width: 16px;
        height: 16px;
        margin-left: -8px;
        margin-top: -8px;
        border: 2px solid rgba(255, 77, 109, 0.75);
        border-radius: 50%;
        pointer-events: none;
        z-index: 2147483646;
        animation: wm-ripple-fixed 0.35s ease-out forwards;
      }

      @keyframes wm-ripple-fixed {
        0% {
          transform: scale(0.4);
          opacity: 0.95;
        }
        100% {
          transform: scale(2.2);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function createCursor() {
    if (document.getElementById('wm-cursor-fixed')) {
      root = document.getElementById('wm-cursor-fixed');
      shape = root.querySelector('.wm-shape');
      return;
    }

    root = document.createElement('div');
    root.id = 'wm-cursor-fixed';
    root.innerHTML = `
      <div class="wm-shape">
        <div class="rind-outer"></div>
        <div class="rind-inner"></div>
        <div class="white"></div>
        <div class="flesh"></div>
        <div class="seed s1"></div>
        <div class="seed s2"></div>
        <div class="seed s3"></div>
      </div>
    `;
    document.body.appendChild(root);
  }

  function updateCursorPosition() {
    if (!root) return;

    // 让图标尖端更接近真实点击点
    const offsetX = -3;
    const offsetY = -3;
    root.style.transform = `translate3d(${mouseX + offsetX}px, ${mouseY + offsetY}px, 0)`;
  }

  function createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'wm-click-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    document.body.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 400);
  }

  function bindEvents() {
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      updateCursorPosition();
      if (root) root.style.opacity = '1';
    }, { passive: true });

    window.addEventListener('mousedown', (e) => {
      if (root) root.classList.add('pressed');
      createRipple(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => {
      if (root) root.classList.remove('pressed');
    });

    window.addEventListener('blur', () => {
      if (root) root.classList.remove('pressed');
    });

    document.addEventListener('mouseleave', () => {
      if (root) root.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      if (root) root.style.opacity = '1';
    });
  }

  function init() {
    if (initialized) return;
    if (!document.head || !document.body) return;

    injectStyle();
    createCursor();
    bindEvents();
    updateCursorPosition();

    initialized = true;
    console.log('[Userscript] Watermelon Triangle Cursor Fixed active');
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
