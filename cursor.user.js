// ==UserScript==
// @name         Watermelon Hover Highlight
// @namespace    https://example.com/
// @version      1.0.0
// @description  Highlight hovered element with a watermelon-style border
// @match        http://*/*
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  let overlay = null;
  let label = null;
  let currentEl = null;

  function createUI() {
    if (document.getElementById('wm-hover-overlay')) return;

    const style = document.createElement('style');
    style.id = 'wm-hover-style';
    style.textContent = `
      #wm-hover-overlay {
        position: fixed;
        left: 0;
        top: 0;
        width: 0;
        height: 0;
        pointer-events: none;
        z-index: 2147483646;
        box-sizing: border-box;
        border: 2px solid #2e7d32;
        background: rgba(255, 77, 109, 0.10);
        box-shadow:
          0 0 0 2px #fffaf0 inset,
          0 0 0 4px #66bb6a inset,
          0 0 10px rgba(0,0,0,0.12);
        border-radius: 6px;
        transition:
          left 0.05s ease,
          top 0.05s ease,
          width 0.05s ease,
          height 0.05s ease;
      }

      #wm-hover-label {
        position: fixed;
        top: 12px;
        right: 12px;
        z-index: 2147483647;
        max-width: 360px;
        padding: 8px 12px;
        border-radius: 10px;
        background: rgba(20, 20, 20, 0.88);
        color: #fff;
        font-size: 12px;
        font-family: Arial, sans-serif;
        line-height: 1.5;
        pointer-events: none;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      #wm-hover-label .wm-dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        margin-right: 6px;
        border-radius: 50%;
        background: linear-gradient(135deg, #2e7d32 0%, #66bb6a 35%, #fffaf0 50%, #ff4d6d 100%);
        vertical-align: middle;
      }
    `;
    document.head.appendChild(style);

    overlay = document.createElement('div');
    overlay.id = 'wm-hover-overlay';

    label = document.createElement('div');
    label.id = 'wm-hover-label';
    label.innerHTML = `<span class="wm-dot"></span>Watermelon Hover Ready`;

    document.body.appendChild(overlay);
    document.body.appendChild(label);
  }

  function formatElementInfo(el) {
    const tag = el.tagName ? el.tagName.toLowerCase() : 'unknown';
    const id = el.id ? `#${el.id}` : '';
    let classText = '';

    if (typeof el.className === 'string' && el.className.trim()) {
      classText = '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.');
    }

    return `<span class="wm-dot"></span>&lt;${tag}${id}${classText}&gt;`;
  }

  function shouldIgnore(el) {
    if (!el) return true;
    if (el === overlay || el === label) return true;
    if (el.id === 'wm-hover-overlay' || el.id === 'wm-hover-label') return true;
    return false;
  }

  function updateOverlay(el) {
    if (!el || shouldIgnore(el)) return;

    const rect = el.getBoundingClientRect();

    // 忽略不可见或尺寸太小元素
    if (rect.width < 4 || rect.height < 4) return;

    overlay.style.left = rect.left + 'px';
    overlay.style.top = rect.top + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';

    label.innerHTML = formatElementInfo(el);
    currentEl = el;
  }

  function init() {
    if (!document.body || !document.head) return;
    createUI();

    document.addEventListener('mousemove', (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || shouldIgnore(el)) return;
      if (el === currentEl) return;
      updateOverlay(el);
    }, { passive: true });

    window.addEventListener('scroll', () => {
      if (currentEl) updateOverlay(currentEl);
    }, { passive: true });

    window.addEventListener('resize', () => {
      if (currentEl) updateOverlay(currentEl);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
