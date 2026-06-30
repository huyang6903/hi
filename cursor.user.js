// ==UserScript==
// @name         Click Peach Blossom Effect Natural
// @namespace    https://example.com/
// @version      1.3.0
// @description  Natural peach blossom click effect with realistic petals and gravity fall
// @match        http://*/*
// @match        https://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  function injectStyle() {
    if (document.getElementById('pb-natural-style')) return;

    const style = document.createElement('style');
    style.id = 'pb-natural-style';
    style.textContent = `
      .pb-n-wrap {
        position: fixed;
        left: 0;
        top: 0;
        width: 0;
        height: 0;
        pointer-events: none;
        z-index: 2147483647;
      }

      .pb-n-flower {
        position: absolute;
        left: 0;
        top: 0;
        width: 0;
        height: 0;
        animation: pb-n-flower-in 180ms ease-out forwards;
      }

      .pb-n-petal {
        position: absolute;
        left: 0;
        top: 0;
        opacity: 0;
        transform-origin: 50% 88%;
        border-radius: 74% 74% 66% 66% / 90% 90% 50% 50%;
        background:
          radial-gradient(circle at 50% 18%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.10) 18%, transparent 28%),
          linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.02) 24%, transparent 100%),
          linear-gradient(180deg, #f8d4df 0%, #f4b8ca 36%, #ee9cb5 70%, #e487a4 100%);
        box-shadow:
          inset 0 1px 1px rgba(255,255,255,0.38),
          inset 0 -1px 1px rgba(180, 90, 120, 0.08),
          0 1px 2px rgba(120, 60, 80, 0.14);
        animation:
          pb-n-petal-form 200ms ease-out forwards,
          pb-n-petal-fall var(--fallDur) cubic-bezier(.18,.56,.34,.98) forwards;
        animation-delay: 0ms, 190ms;
      }

      .pb-n-petal::before {
        content: "";
        position: absolute;
        left: 50%;
        top: 16%;
        width: 1.6px;
        height: 62%;
        margin-left: -0.8px;
        border-radius: 2px;
        background: linear-gradient(to bottom,
          rgba(255,255,255,0.34) 0%,
          rgba(241, 170, 194, 0.34) 45%,
          rgba(205, 120, 150, 0.10) 100%);
        opacity: 0.72;
      }

      .pb-n-center {
        position: absolute;
        left: -3px;
        top: -3px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        opacity: 0;
        background: radial-gradient(circle, #f3d98b 0%, #e0bf62 62%, #caa347 100%);
        box-shadow: 0 0 1px rgba(160,120,50,0.18);
        animation:
          pb-n-center-in 160ms ease-out forwards,
          pb-n-center-out 600ms ease-in forwards;
        animation-delay: 40ms, 220ms;
      }

      .pb-n-stamen {
        position: absolute;
        left: 0;
        top: 0;
        width: 1.5px;
        height: 9px;
        margin-left: -0.75px;
        margin-top: -8px;
        border-radius: 2px;
        transform-origin: 50% 100%;
        opacity: 0;
        background: linear-gradient(to top, rgba(215, 180, 80, 0.14), #d9ba66);
        animation:
          pb-n-stamen-in 180ms ease-out forwards,
          pb-n-stamen-out 560ms ease-in forwards;
        animation-delay: 60ms, 210ms;
      }

      @keyframes pb-n-flower-in {
        from { transform: scale(0.45); }
        to   { transform: scale(1); }
      }

      @keyframes pb-n-petal-form {
        0% {
          opacity: 0;
          transform:
            rotate(var(--angle))
            translateY(var(--formR))
            scale(0.2);
        }
        100% {
          opacity: 1;
          transform:
            rotate(var(--angle))
            translateY(var(--formR))
            scale(1);
        }
      }

      @keyframes pb-n-petal-fall {
        0% {
          opacity: 1;
          transform:
            rotate(var(--angle))
            translateY(var(--formR))
            translate(0px, 0px)
            rotate(0deg)
            scale(1);
        }
        18% {
          opacity: 1;
        }
        100% {
          opacity: 0;
          transform:
            rotate(var(--angle))
            translateY(var(--formR))
            translate(var(--dx), var(--dy))
            rotate(var(--spin))
            scale(var(--scale));
        }
      }

      @keyframes pb-n-center-in {
        from { opacity: 0; transform: scale(0.35); }
        to   { opacity: 1; transform: scale(1); }
      }

      @keyframes pb-n-center-out {
        from { opacity: 1; transform: scale(1); }
        to   { opacity: 0; transform: scale(0.92); }
      }

      @keyframes pb-n-stamen-in {
        from {
          opacity: 0;
          transform: rotate(var(--sAngle)) scaleY(0.2);
        }
        to {
          opacity: 1;
          transform: rotate(var(--sAngle)) scaleY(1);
        }
      }

      @keyframes pb-n-stamen-out {
        from {
          opacity: 1;
          transform: rotate(var(--sAngle)) scaleY(1);
        }
        to {
          opacity: 0;
          transform: rotate(var(--sAngle)) scaleY(0.82);
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
    petal.className = 'pb-n-petal';

    const angle = i * (360 / count) + rand(-5, 5);
    const formR = `${-10 + rand(-1.2, 1.2)}px`;

    const lateral = rand(-18, 18);
    const down = rand(30, 58);
    const dx = lateral;
    const dy = down;

    const spin = `${rand(-80, 80).toFixed(1)}deg`;
    const scale = rand(0.94, 1.08).toFixed(2);
    const fallDur = `${rand(780, 1180).toFixed(0)}ms`;

    const w = rand(14.5, 18.5);
    const h = rand(18.5, 24.5);

    petal.style.width = `${w.toFixed(1)}px`;
    petal.style.height = `${h.toFixed(1)}px`;
    petal.style.marginLeft = `${(-w / 2).toFixed(1)}px`;
    petal.style.marginTop = `${(-h * 0.84).toFixed(1)}px`;

    petal.style.setProperty('--angle', `${angle.toFixed(1)}deg`);
    petal.style.setProperty('--formR', formR);
    petal.style.setProperty('--dx', `${dx.toFixed(1)}px`);
    petal.style.setProperty('--dy', `${dy.toFixed(1)}px`);
    petal.style.setProperty('--spin', spin);
    petal.style.setProperty('--scale', scale);
    petal.style.setProperty('--fallDur', fallDur);

    flower.appendChild(petal);
  }

  function createStamens(flower) {
    const count = 6;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div');
      s.className = 'pb-n-stamen';
      s.style.setProperty('--sAngle', `${(-25 + i * 10 + rand(-3, 3)).toFixed(1)}deg`);
      s.style.height = `${rand(7, 10).toFixed(1)}px`;
      s.style.marginTop = `${-rand(7, 9.5).toFixed(1)}px`;
      flower.appendChild(s);
    }
  }

  function bloom(x, y) {
    const wrap = document.createElement('div');
    wrap.className = 'pb-n-wrap';
    wrap.style.left = `${x}px`;
    wrap.style.top = `${y}px`;

    const flower = document.createElement('div');
    flower.className = 'pb-n-flower';

    const petalCount = 5;
    for (let i = 0; i < petalCount; i++) {
      createPetal(flower, i, petalCount);
    }

    createStamens(flower);

    const center = document.createElement('div');
    center.className = 'pb-n-center';
    flower.appendChild(center);

    wrap.appendChild(flower);
    document.body.appendChild(wrap);

    setTimeout(() => {
      wrap.remove();
    }, 1500);
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
