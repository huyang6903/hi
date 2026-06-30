// ==UserScript==
// @name         Click Peach Blossom Effect Dreamy
// @namespace    https://example.com/
// @version      1.2.0
// @description  Dreamy peach blossom bloom on click with more petals, soft glow and falling arcs
// @match        http://*/*
// @match        https://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  function injectStyle() {
    if (document.getElementById('pb-dreamy-style')) return;

    const style = document.createElement('style');
    style.id = 'pb-dreamy-style';
    style.textContent = `
      .pb-d-wrap {
        position: fixed;
        left: 0;
        top: 0;
        width: 0;
        height: 0;
        pointer-events: none;
        z-index: 2147483647;
      }

      .pb-d-flower {
        position: absolute;
        left: 0;
        top: 0;
        width: 0;
        height: 0;
        animation: pb-d-flower-in 220ms ease-out forwards;
      }

      .pb-d-petal {
        position: absolute;
        left: 0;
        top: 0;
        width: 17px;
        height: 21px;
        margin-left: -8.5px;
        margin-top: -17px;
        border-radius: 72% 72% 68% 68% / 88% 88% 52% 52%;
        transform-origin: 50% 85%;
        opacity: 0;
        background:
          radial-gradient(circle at 46% 28%, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.18) 18%, transparent 30%),
          radial-gradient(circle at 50% 34%, #ffeaf3 0%, #ffcfe0 38%, #ffb0cd 66%, #f67aaf 100%);
        box-shadow:
          0 0 10px rgba(255, 182, 208, 0.30),
          0 0 18px rgba(246, 122, 175, 0.12),
          inset 0 1px 2px rgba(255,255,255,0.55);
        animation:
          pb-d-petal-form 260ms ease-out forwards,
          pb-d-petal-arc 1250ms cubic-bezier(.16,.62,.29,.98) forwards;
        animation-delay: 0ms, 240ms;
      }

      .pb-d-petal::after {
        content: "";
        position: absolute;
        left: 50%;
        top: 18%;
        width: 2px;
        height: 8px;
        margin-left: -1px;
        border-radius: 2px;
        background: linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(245, 130, 180, 0.16));
        opacity: 0.6;
      }

      .pb-d-center {
        position: absolute;
        left: -4px;
        top: -4px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        opacity: 0;
        background: radial-gradient(circle, #fff6c8 0%, #ffe18a 52%, #f4b93b 100%);
        box-shadow:
          0 0 8px rgba(255, 225, 138, 0.5),
          0 0 16px rgba(255, 196, 90, 0.22);
        animation:
          pb-d-center-in 200ms ease-out forwards,
          pb-d-center-out 1050ms ease-in forwards;
        animation-delay: 50ms, 320ms;
      }

      .pb-d-stamen {
        position: absolute;
        left: 0;
        top: 0;
        width: 2px;
        height: 11px;
        margin-left: -1px;
        margin-top: -10px;
        border-radius: 2px;
        transform-origin: 50% 100%;
        opacity: 0;
        background: linear-gradient(to top, rgba(255,215,120,0.18), #ffd97b);
        box-shadow: 0 0 5px rgba(255, 217, 123, 0.18);
        animation:
          pb-d-stamen-in 220ms ease-out forwards,
          pb-d-stamen-out 980ms ease-in forwards;
        animation-delay: 70ms, 300ms;
      }

      .pb-d-spark {
        position: absolute;
        left: 0;
        top: 0;
        width: 4px;
        height: 4px;
        margin-left: -2px;
        margin-top: -2px;
        border-radius: 50%;
        opacity: 0;
        background: radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,214,234,0.85) 45%, rgba(255,214,234,0.05) 100%);
        box-shadow:
          0 0 6px rgba(255,255,255,0.65),
          0 0 12px rgba(255,198,221,0.35);
        animation: pb-d-spark 900ms ease-out forwards;
        animation-delay: var(--delay);
      }

      @keyframes pb-d-flower-in {
        from { transform: scale(0.35) rotate(-6deg); opacity: 0.85; }
        to   { transform: scale(1) rotate(0deg); opacity: 1; }
      }

      @keyframes pb-d-petal-form {
        0% {
          opacity: 0;
          transform:
            rotate(var(--angle))
            translateY(var(--form-r))
            scale(0.15);
        }
        70% {
          opacity: 1;
        }
        100% {
          opacity: 1;
          transform:
            rotate(var(--angle))
            translateY(var(--form-r))
            scale(1);
        }
      }

      @keyframes pb-d-petal-arc {
        0% {
          opacity: 1;
          transform:
            rotate(var(--angle))
            translateY(var(--form-r))
            translate(0, 0)
            rotate(0deg)
            scale(1);
          filter: brightness(1);
        }
        14% {
          opacity: 1;
        }
        45% {
          opacity: 0.95;
        }
        100% {
          opacity: 0;
          transform:
            rotate(var(--angle))
            translateY(var(--form-r))
            translate(var(--dx), var(--dy))
            rotate(var(--spin))
            scale(var(--scale));
          filter: brightness(1.04);
        }
      }

      @keyframes pb-d-center-in {
        from { opacity: 0; transform: scale(0.2); }
        to   { opacity: 1; transform: scale(1); }
      }

      @keyframes pb-d-center-out {
        from { opacity: 1; transform: scale(1); }
        to   { opacity: 0; transform: scale(0.92); }
      }

      @keyframes pb-d-stamen-in {
        from {
          opacity: 0;
          transform: rotate(var(--s-angle)) scaleY(0.18);
        }
        to {
          opacity: 1;
          transform: rotate(var(--s-angle)) scaleY(1);
        }
      }

      @keyframes pb-d-stamen-out {
        from {
          opacity: 1;
          transform: rotate(var(--s-angle)) scaleY(1);
        }
        to {
          opacity: 0;
          transform: rotate(var(--s-angle)) scaleY(0.85);
        }
      }

      @keyframes pb-d-spark {
        0% {
          opacity: 0;
          transform: translate(0, 0) scale(0.3);
        }
        20% {
          opacity: 0.95;
          transform: translate(var(--sx), var(--sy)) scale(1);
        }
        100% {
          opacity: 0;
          transform: translate(var(--ex), var(--ey)) scale(0.6);
        }
      }
    `;
    document.head.appendChild(style);
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createPetal(flower, i, count) {
    const petal = document.createElement('div');
    petal.className = 'pb-d-petal';

    const angle = i * (360 / count) + rand(-7, 7);
    const formR = `${-11 + rand(-2, 2)}px`;

    const distance = rand(26, 52);
    const arcSide = rand(-16, 16);
    const driftAngle = angle + rand(-18, 18);

    const dx = Math.cos(driftAngle * Math.PI / 180) * distance + arcSide;
    const dy = Math.sin(driftAngle * Math.PI / 180) * distance + rand(16, 34);

    const spin = `${rand(-95, 95).toFixed(1)}deg`;
    const scale = rand(0.95, 1.18).toFixed(2);

    petal.style.setProperty('--angle', `${angle.toFixed(1)}deg`);
    petal.style.setProperty('--form-r', formR);
    petal.style.setProperty('--dx', `${dx.toFixed(1)}px`);
    petal.style.setProperty('--dy', `${dy.toFixed(1)}px`);
    petal.style.setProperty('--spin', spin);
    petal.style.setProperty('--scale', scale);

    petal.style.width = `${rand(15, 18).toFixed(1)}px`;
    petal.style.height = `${rand(19, 24).toFixed(1)}px`;
    petal.style.marginLeft = `${-(parseFloat(petal.style.width) / 2).toFixed(1)}px`;
    petal.style.marginTop = `${(-parseFloat(petal.style.height) * 0.82).toFixed(1)}px`;

    flower.appendChild(petal);
  }

  function createStamens(flower) {
    const count = 7;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div');
      s.className = 'pb-d-stamen';
      const angle = -32 + i * 10 + rand(-4, 4);
      s.style.setProperty('--s-angle', `${angle.toFixed(1)}deg`);
      s.style.height = `${rand(8, 13).toFixed(1)}px`;
      s.style.marginTop = `${-rand(8, 12).toFixed(1)}px`;
      flower.appendChild(s);
    }
  }

  function createSparks(flower) {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const sp = document.createElement('div');
      sp.className = 'pb-d-spark';

      const sx = rand(-4, 4);
      const sy = rand(-4, 4);
      const ex = rand(-26, 26);
      const ey = rand(-24, 18);

      sp.style.setProperty('--sx', `${sx.toFixed(1)}px`);
      sp.style.setProperty('--sy', `${sy.toFixed(1)}px`);
      sp.style.setProperty('--ex', `${ex.toFixed(1)}px`);
      sp.style.setProperty('--ey', `${ey.toFixed(1)}px`);
      sp.style.setProperty('--delay', `${rand(40, 180).toFixed(0)}ms`);

      flower.appendChild(sp);
    }
  }

  function bloom(x, y) {
    const wrap = document.createElement('div');
    wrap.className = 'pb-d-wrap';
    wrap.style.left = `${x}px`;
    wrap.style.top = `${y}px`;

    const flower = document.createElement('div');
    flower.className = 'pb-d-flower';

    const petalCount = 7;
    for (let i = 0; i < petalCount; i++) {
      createPetal(flower, i, petalCount);
    }

    createStamens(flower);
    createSparks(flower);

    const center = document.createElement('div');
    center.className = 'pb-d-center';
    flower.appendChild(center);

    wrap.appendChild(flower);
    document.body.appendChild(wrap);

    setTimeout(() => {
      wrap.remove();
    }, 1700);
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
