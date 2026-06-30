// ==UserScript==
// @name         Mouse Click Ripple
// @namespace    https://example.com/
// @version      1.0.0
// @description  Add ripple effect on mouse click
// @match        http://*/*
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function injectStyle() {
    const style = document.createElement('style');
    style.textContent = `
      .mouse-ripple-effect {
        position: fixed;
        width: 16px;
        height: 16px;
        margin-left: -8px;
        margin-top: -8px;
        border: 3px solid #ff4d6d;
        border-radius: 50%;
        pointer-events: none;
        z-index: 2147483647;
        animation: rippleExpand 0.45s ease-out forwards;
      }

      @keyframes rippleExpand {
        0% {
          transform: scale(0.3);
          opacity: 0.95;
        }
        100% {
          transform: scale(3);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function init() {
    injectStyle();

    document.addEventListener('click', (e) => {
      const ripple = document.createElement('div');
      ripple.className = 'mouse-ripple-effect';
      ripple.style.left = e.clientX + 'px';
      ripple.style.top = e.clientY + 'px';
      document.body.appendChild(ripple);

      setTimeout(() => ripple.remove(), 500);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
