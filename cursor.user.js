// ==UserScript==
// @name         Click Peach Blossom Effect
// @namespace    https://example.com/
// @version      1.0.0
// @description  Show peach blossom petals blooming on mouse click
// @match        http://*/*
// @match        https://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  function injectStyle() {
    if (document.getElementById('peach-blossom-style')) return;

    const style = document.createElement('style');
    style.id = 'peach-blossom-style';
    style.textContent = `
      .peach-blossom-wrap {
        position: fixed;
        left: 0;
        top: 0;
        width: 0;
        height: 0;
        pointer-events: none;
        z-index: 2147483647;
      }

      .peach-petal {
        position: absolute;
        width: 14px;
        height: 18px;
        background: radial-gradient(circle at 50% 35%, #ffd6e7 0%, #ffb7d2 45%, #ff8fbc 75%, #f56aa5 100%);
        border-radius: 70% 70% 70% 70% / 85% 85% 55% 55%;
        opacity: 0.95;
        transform-origin: 50% 85%;
        box-shadow: 0 1px 3px rgba(245, 106, 165, 0.25);
        animation: peach-petal-bloom 720ms ease-out forwards;
      }

      .peach-center {
        position: absolute;
        width: 6px;
        height: 6px;
        left: -3px;
        top: -3px;
        border-radius: 50%;
        background: radial-gradient(circle, #fff1a8 0%, #ffd36b 65%, #f7b733 100%);
        box-shadow: 0 0 6px rgba(255, 211, 107, 0.5);
        animation: peach-center-fade 720ms ease-out forwards;
      }

      @keyframes peach-petal-bloom {
        0% {
          opacity: 0;
          transform: translate(0, 0) scale(0.2) rotate(var(--rot));
        }
        18% {
          opacity: 1;
        }
        55% {
          opacity: 0.95;
        }
        100% {
          opacity: 0;
          transform:
            translate(var(--tx), var(--ty))
            scale(1.15)
            rotate(calc(var(--rot) + var(--spin)));
        }
      }

      @keyframes peach-center-fade {
        0% {
          opacity: 0;
          transform: scale(0.3);
        }
        20% {
          opacity: 1;
          transform: scale(1);
        }
        100% {
          opacity: 0;
          transform: scale(0.9);
        }
      }
    `;
    document.head.appendChild(style);
  }

  function createPetal(container, angleDeg, distance, delay = 0) {
    const petal = document.createElement('div');
    petal.className = 'peach-petal';

    const rad = angleDeg * Math.PI / 180;
    const tx = Math.cos(rad) * distance;
    const ty = Math.sin(rad) * distance;

    const baseRot = angleDeg - 90;
    const spin = (Math.random() * 60 - 30).toFixed(2) + 'deg';

    petal.style.setProperty('--tx', `${tx.toFixed(2)}px`);
    petal.style.setProperty('--ty', `${ty.toFixed(2)}px`);
    petal.style.setProperty('--rot', `${baseRot.toFixed(2)}deg`);
    petal.style.setProperty('--spin', spin);
    petal.style.animationDelay = `${delay}ms`;

    container.appendChild(petal);
  }

  function bloom(x, y) {
    const wrap = document.createElement('div');
    wrap.className = 'peach-blossom-wrap';
    wrap.style.left = `${x}px`;
    wrap.style.top = `${y}px`;

    const center = document.createElement('div');
    center.className = 'peach-center';
    wrap.appendChild(center);

    // 5 片花瓣，形成桃花
    const petals = 5;
    for (let i = 0; i < petals; i++) {
      const angle = -90 + i * (360 / petals);
      const distance = 14 + Math.random() * 10;
      createPetal(wrap, angle, distance, 0);
    }

    document.body.appendChild(wrap);

    setTimeout(() => {
      wrap.remove();
    }, 800);
  }

  function init() {
    if (!document.body || !document.head) return;
    injectStyle();

    document.addEventListener('mousedown', (e) => {
      bloom(e.clientX, e.clientY);
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
