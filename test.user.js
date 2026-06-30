// ==UserScript==
// @name         Simple Google Test
// @namespace    https://example.com/
// @version      1.0.0
// @description  Simple test script for browser UserScripts
// @match        https://www.google.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function run() {
    if (!document.body) return;
    if (document.getElementById('simple-userscript-test')) return;

    const banner = document.createElement('div');
    banner.id = 'simple-userscript-test';
    banner.textContent = 'UserScript Test OK';
    banner.style.position = 'fixed';
    banner.style.top = '12px';
    banner.style.right = '12px';
    banner.style.zIndex = '999999';
    banner.style.padding = '10px 14px';
    banner.style.background = '#1a73e8';
    banner.style.color = '#fff';
    banner.style.fontSize = '14px';
    banner.style.fontFamily = 'Arial, sans-serif';
    banner.style.borderRadius = '8px';
    banner.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
    document.body.appendChild(banner);

    document.body.style.outline = '4px solid red';

    console.log('[UserScript Test] running on google.com');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
