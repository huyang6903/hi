// ==UserScript==
// @name         Google Clear Search Button
// @namespace    https://example.com/
// @version      1.0.0
// @description  Add clear search button on Google
// @match        https://www.google.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function run() {
    if (!document.body) return;
    if (document.getElementById('userscript-clear-search-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'userscript-clear-search-btn';
    btn.textContent = 'Clear Search';
    btn.style.position = 'fixed';
    btn.style.right = '16px';
    btn.style.bottom = '16px';
    btn.style.zIndex = '999999';
    btn.style.padding = '10px 14px';
    btn.style.background = '#d93025';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '8px';
    btn.style.fontWeight = 'bold';
    btn.style.cursor = 'pointer';
    btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';

    btn.addEventListener('click', () => {
      const input = document.querySelector('textarea[name="q"], input[name="q"]');
      if (!input) return;

      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    document.body.appendChild(btn);

    console.log('[UserScript Test] Google Clear Search Button running');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
