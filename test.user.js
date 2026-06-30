// ==UserScript==
// @name         Google Extreme Visual Test
// @namespace    https://example.com/
// @version      1.0.0
// @description  Extreme visible test script for google.com
// @match        https://www.google.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function applyTestEffects() {
    if (!document.body || !document.documentElement) return;
    if (document.getElementById('userscript-extreme-test-banner')) return;

    document.title = '[TEST MODE] ' + document.title;
    document.body.style.background = '#fff3cd';
    document.documentElement.style.boxSizing = 'border-box';
    document.documentElement.style.border = '8px solid red';

    const topBar = document.createElement('div');
    topBar.id = 'userscript-extreme-test-banner';
    topBar.textContent = 'UserScript TEST MODE is ACTIVE on Google';
    topBar.style.position = 'fixed';
    topBar.style.top = '0';
    topBar.style.left = '0';
    topBar.style.width = '100%';
    topBar.style.zIndex = '999999';
    topBar.style.padding = '16px 20px';
    topBar.style.background = '#d93025';
    topBar.style.color = '#ffffff';
    topBar.style.fontSize = '20px';
    topBar.style.fontWeight = 'bold';
    topBar.style.textAlign = 'center';
    topBar.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
    topBar.style.fontFamily = 'Arial, sans-serif';
    document.body.appendChild(topBar);

    const floatingBox = document.createElement('div');
    floatingBox.innerHTML = `
      <div style="font-size:18px;font-weight:bold;margin-bottom:6px;">Userscript Active</div>
      <div style="font-size:14px;">Google page has been modified for testing.</div>
    `;
    floatingBox.style.position = 'fixed';
    floatingBox.style.right = '20px';
    floatingBox.style.bottom = '20px';
    floatingBox.style.zIndex = '999999';
    floatingBox.style.background = '#111827';
    floatingBox.style.color = '#ffffff';
    floatingBox.style.padding = '16px 20px';
    floatingBox.style.borderRadius = '12px';
    floatingBox.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
    floatingBox.style.border = '3px solid #22c55e';
    floatingBox.style.fontFamily = 'Arial, sans-serif';
    document.body.appendChild(floatingBox);

    const searchBox = document.querySelector('textarea[name="q"], input[name="q"]');
    if (searchBox) {
      searchBox.style.border = '4px solid purple';
      searchBox.style.borderRadius = '12px';
      searchBox.style.boxShadow = '0 0 12px rgba(128, 0, 128, 0.4)';
    }

    console.log('[UserScripts Test] Google Extreme Visual Test is running');
  }

  function start() {
    applyTestEffects();
    setTimeout(applyTestEffects, 1000);
    setTimeout(applyTestEffects, 2500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
