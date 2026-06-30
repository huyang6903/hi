// ==UserScript==
// @name         Google Debug Panel
// @namespace    https://example.com/
// @version      1.0.0
// @description  Show debug info panel on Google
// @match        https://www.google.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function run() {
    if (!document.body) return;
    if (document.getElementById('userscript-debug-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'userscript-debug-panel';
    panel.innerHTML = `
      <div style="font-size:16px;font-weight:bold;margin-bottom:8px;">Userscript Debug</div>
      <div><b>Name:</b> Google Debug Panel</div>
      <div><b>Host:</b> ${location.hostname}</div>
      <div><b>URL:</b> ${location.href}</div>
      <div><b>Title:</b> ${document.title}</div>
      <div><b>Time:</b> ${new Date().toLocaleTimeString()}</div>
    `;

    panel.style.position = 'fixed';
    panel.style.left = '16px';
    panel.style.bottom = '16px';
    panel.style.zIndex = '999999';
    panel.style.width = '340px';
    panel.style.background = '#111827';
    panel.style.color = '#fff';
    panel.style.padding = '14px';
    panel.style.borderRadius = '10px';
    panel.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
    panel.style.fontSize = '13px';
    panel.style.lineHeight = '1.6';
    panel.style.fontFamily = 'Arial, sans-serif';

    document.body.appendChild(panel);

    console.log('[UserScript Test] Google Debug Panel running');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
