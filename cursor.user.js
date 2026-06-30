// ==UserScript==
// @name         Mouse Follow Dot Test
// @namespace    https://example.com/
// @version      1.0.0
// @match        http://*/*
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function init() {
    if (!document.body) return;
    if (document.getElementById('mouse-follow-dot-test')) return;

    const dot = document.createElement('div');
    dot.id = 'mouse-follow-dot-test';
    dot.style.position = 'fixed';
    dot.style.left = '0';
    dot.style.top = '0';
    dot.style.width = '12px';
    dot.style.height = '12px';
    dot.style.borderRadius = '50%';
    dot.style.background = 'red';
    dot.style.zIndex = '2147483647';
    dot.style.pointerEvents = 'none';
    dot.style.transform = 'translate3d(0,0,0)';
    document.body.appendChild(dot);

    let x = 0;
    let y = 0;

    const update = (e) => {
      x = e.clientX;
      y = e.clientY;
    };

    window.addEventListener('mousemove', update, { passive: true });
    document.addEventListener('mousemove', update, { passive: true });

    function render() {
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      requestAnimationFrame(render);
    }

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
