// ==UserScript==
// @name         Google Results Numbering
// @namespace    https://example.com/
// @version      1.0.0
// @description  Add numbering to Google search results
// @match        https://www.google.com/search*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function run() {
    const results = document.querySelectorAll('div.g, .MjjYud');
    let index = 1;

    results.forEach((item) => {
      if (item.getAttribute('data-userscript-numbered') === '1') return;

      const title = item.querySelector('h3');
      if (!title) return;

      const badge = document.createElement('span');
      badge.textContent = '#' + index + ' ';
      badge.style.color = '#d93025';
      badge.style.fontWeight = 'bold';
      badge.style.marginRight = '6px';

      title.prepend(badge);
      item.setAttribute('data-userscript-numbered', '1');
      index++;
    });

    console.log('[UserScript Test] Google Results Numbering running');
  }

  function start() {
    run();
    setTimeout(run, 1000);
    setTimeout(run, 2500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
