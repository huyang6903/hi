// ==UserScript==
// @name         Watermelon Hover Inspector
// @namespace    https://example.com/
// @version      1.1.0
// @description  Watermelon highlight box with tag/id/class/size and click-to-lock
// @match        http://*/*
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  let overlay = null;
  let label = null;
  let currentEl = null;
  let lockedEl = null;
  let locked = false;

  function createUI() {
    if (document.getElementById('wm-inspector-overlay')) return;

    const style = document.createElement('style');
    style.id = 'wm-inspector-style';
    style.textContent = `
      #wm-inspector-overlay {
        position: fixed;
        left: 0;
        top: 0;
        width: 0;
        height: 0;
        pointer-events: none;
        z-index: 2147483646;
        box-sizing: border-box;
        border: 2px solid #2e7d32;
        border-radius: 8px;
        background: rgba(255, 77, 109, 0.10);
        box-shadow:
          0 0 0 2px #fffaf0 inset,
          0 0 0 4px #66bb6a inset,
          0 0 0 6px rgba(255, 77, 109, 0.18) inset,
          0 4px 14px rgba(0,0,0,0.16);
        transition:
          left 0.04s ease,
          top 0.04s ease,
          width 0.04s ease,
          height 0.04s ease,
          opacity 0.12s ease;
        opacity: 0;
      }

      #wm-inspector-overlay.locked {
        border-color: #1b5e20;
        box-shadow:
          0 0 0 2px #fffaf0 inset,
          0 0 0 4px #66bb6a inset,
          0 0 0 6px rgba(255, 77, 109, 0.24) inset,
          0 0 0 2px rgba(27, 94, 32, 0.25),
          0 6px 16px rgba(0,0,0,0.20);
      }

      #wm-inspector-label {
        position: fixed;
        top: 12px;
        right: 12px;
        z-index: 2147483647;
        max-width: 420px;
        padding: 10px 12px;
        border-radius: 10px;
        background: rgba(20, 20, 20, 0.9);
        color: #fff;
        font: 12px/1.45 Arial, sans-serif;
        pointer-events: none;
        box-shadow: 0 6px 16px rgba(0,0,0,0.22);
        opacity: 0;
        transition: opacity 0.12s ease;
      }

      #wm-inspector-label .wm-title {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
        font-weight: 700;
      }

      #wm-inspector-label .wm-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex: 0 0 auto;
        background: linear-gradient(
          135deg,
          #2e7d32 0%,
          #66bb6a 28%,
          #fffaf0 48%,
          #ff4d6d 100%
        );
      }

      #wm-inspector-label .wm-line {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      #wm-inspector-label .wm-muted {
        color: rgba(255,255,255,0.72);
      }

      #wm-inspector-label .wm-lock {
        color: #ffd54f;
        font-weight: 700;
        margin-left: 4px;
      }
    `;
    document.head.appendChild(style);

    overlay = document.createElement('div');
    overlay.id = 'wm-inspector-overlay';

    label = document.createElement('div');
    label.id = 'wm-inspector-label';

    document.body.appendChild(overlay);
    document.body.appendChild(label);
  }

  function shouldIgnore(el) {
    if (!el) return true;
    if (el === overlay || el === label) return true;
    if (el.id === 'wm-inspector-overlay' || el.id === 'wm-inspector-label') return true;
    return false;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function getClassText(el) {
    if (typeof el.className !== 'string') return '';
    const arr = el.className.trim().split(/\s+/).filter(Boolean).slice(0, 5);
    return arr.length ? '.' + arr.join('.') : '';
  }

  function getElementInfo(el) {
    const tag = el.tagName ? el.tagName.toLowerCase() : 'unknown';
    const id = el.id ? `#${el.id}` : '';
    const classes = getClassText(el);
    const rect = el.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);

    return {
      tag,
      id,
      classes,
      width,
      height
    };
  }

  function renderLabel(el) {
    const info = getElementInfo(el);
    label.innerHTML = `
      <div class="wm-title">
        <span class="wm-dot"></span>
        <span>Watermelon Inspector${locked ? '<span class="wm-lock">[LOCKED]</span>' : ''}</span>
      </div>
      <div class="wm-line">&lt;${escapeHtml(info.tag)}&gt;</div>
      <div class="wm-line">${escapeHtml(info.id || '(no id)')}</div>
      <div class="wm-line">${escapeHtml(info.classes || '(no class)')}</div>
      <div class="wm-line wm-muted">${info.width} × ${info.height}</div>
    `;
    label.style.opacity = '1';
  }

  function updateOverlay(el) {
    if (!el || shouldIgnore(el)) return;

    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;

    overlay.style.left = rect.left + 'px';
    overlay.style.top = rect.top + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
    overlay.style.opacity = '1';

    renderLabel(el);
    currentEl = el;

    if (locked) {
      overlay.classList.add('locked');
    } else {
      overlay.classList.remove('locked');
    }
  }

  function clearOverlay() {
    overlay.style.opacity = '0';
    label.style.opacity = '0';
  }

  function toggleLock(el) {
    if (!el || shouldIgnore(el)) return;

    if (locked && lockedEl === el) {
      locked = false;
      lockedEl = null;
      overlay.classList.remove('locked');
      return;
    }

    locked = true;
    lockedEl = el;
    updateOverlay(el);
  }

  function init() {
    if (!document.body || !document.head) return;
    createUI();

    document.addEventListener('mousemove', (e) => {
      if (locked) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || shouldIgnore(el)) return;
      if (el === currentEl) return;
      updateOverlay(el);
    }, { passive: true });

    document.addEventListener('click', (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || shouldIgnore(el)) return;

      toggleLock(el);

      // 防止锁定时跳到别的元素
      if (locked && lockedEl) {
        updateOverlay(lockedEl);
      }
    }, true);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        locked = false;
        lockedEl = null;
        overlay.classList.remove('locked');
      }
    });

    window.addEventListener('scroll', () => {
      const target = locked ? lockedEl : currentEl;
      if (target) updateOverlay(target);
    }, { passive: true });

    window.addEventListener('resize', () => {
      const target = locked ? lockedEl : currentEl;
      if (target) updateOverlay(target);
    });

    document.addEventListener('mouseleave', () => {
      if (!locked) clearOverlay();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
