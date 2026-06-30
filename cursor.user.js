// ==UserScript==
// @name         Watermelon Cursor RAF Stable
// @namespace    https://example.com/
// @version      1.0.0
// @description  Very stable watermelon triangle cursor using requestAnimationFrame
// @match        http://*/*
// @match        https://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  let cursor = null;
  let started = false;

  let mouseX = 0;
  let mouseY = 0;
  let visible = false;

  function svgMarkup() {
    return `
      <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
        <g transform="rotate(-45 8 8)">
          <path d="M2 2 L2 24 L18 8 Z" fill="#2e7d32"/>
          <path d="M3.5 4 L3.5 22 L16 8 Z" fill="#66bb6a"/>
          <path d="M5 6 L5 20 L14 8 Z" fill="#fffaf0"/>
          <path d="M6 7.5 L6 18.5 L12.5 8 Z" fill="#ff4d6d"/>

          <ellipse cx="8.8" cy="9.6" rx="1.1" ry="1.8" fill="#1a1a1a"/>
          <ellipse cx="9.5" cy="13.2" rx="1.1" ry="1.8" fill="#1a1a1a"/>
          <ellipse cx="7.7" cy="15.8" rx="1.1" ry="1.8" fill="#1a1a1a"/>
        </g>
      </svg>
    `;
  }

  function injectStyle() {
    if (document.getElementById('wm-raf-style')) return;

    const style = document.createElement('style');
    style.id = 'wm-raf-style';
    style.textContent = `
      html, body, * {
        cursor: none !important;
      }

      #wm-raf-cursor {
        position: fixed;
        left: 0;
        top: 0;
        width: 28px;
        height: 28px;
        pointer-events: none !important;
        z-index: 2147483647 !important;
        opacity: 0;
        will-change: transform, opacity;
      }

      #wm-raf-cursor svg {
        display: block;
        width: 28px;
        height: 28px;
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.22));
      }
    `;
    document.head.appendChild(style);
  }

  function ensureCursor() {
    if (cursor && document.body.contains(cursor)) return cursor;

    cursor = document.getElementById('wm-raf-cursor');
    if (cursor && document.body.contains(cursor)) return cursor;

    cursor = document.createElement('div');
    cursor.id = 'wm-raf-cursor';
    cursor.innerHTML = svgMarkup();
    document.body.appendChild(cursor);

    return cursor;
  }

  function render() {
    if (cursor) {
      const offsetX = -2;
      const offsetY = -2;
      cursor.style.transform = `translate3d(${mouseX + offsetX}px, ${mouseY + offsetY}px, 0)`;
      cursor.style.opacity = visible ? '1' : '0';
    }
    requestAnimationFrame(render);
  }

  function bindEvents() {
    const update = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      visible = true;
    };

    window.addEventListener('mousemove', update, { passive: true });
    document.addEventListener('mousemove', update, { passive: true });
    document.documentElement.addEventListener('mousemove', update, { passive: true });

    window.addEventListener('mouseenter', () => {
      visible = true;
    });

    window.addEventListener('mouseleave', () => {
      visible = false;
    });

    document.addEventListener('mouseleave', () => {
      visible = false;
    });

    window.addEventListener('blur', () => {
      visible = false;
    });

    window.addEventListener('focus', () => {
      visible = true;
    });
  }

  function init() {
    if (started) return;
    if (!document.head || !document.body) return;

    injectStyle();
    ensureCursor();
    bindEvents();
    render();

    started = true;
    console.log('[Userscript] Watermelon Cursor RAF Stable active');
  }

  function start() {
    init();
    setTimeout(init, 300);
    setTimeout(init, 1000);
    setTimeout(init, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
