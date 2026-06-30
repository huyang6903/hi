// ==UserScript==
// @name         Google UI Style Test
// @namespace    https://example.com/
// @version      1.0.0
// @description  Visibly restyle Google UI for testing
// @match        https://www.google.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function injectStyle() {
    if (document.getElementById('google-ui-style-test-css')) return;

    const style = document.createElement('style');
    style.id = 'google-ui-style-test-css';
    style.textContent = `
      html {
        box-sizing: border-box !important;
        border: 6px solid #ff4d4f !important;
      }

      body {
        background: linear-gradient(135deg, #e0f7fa 0%, #ede7f6 100%) !important;
        font-family: "Arial", "PingFang SC", "Microsoft YaHei", sans-serif !important;
      }

      /* 顶部测试横幅 */
      #google-ui-style-test-banner {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        z-index: 999999;
        background: linear-gradient(90deg, #ff4d4f, #ff7a45);
        color: #fff;
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        padding: 14px 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        letter-spacing: 0.5px;
      }

      /* Google 主区域更像卡片 */
      form,
      .A8SBwf,
      .RNNXgb,
      .minidiv .sfbg,
      .o3j99 {
        border-radius: 20px !important;
      }

      /* 搜索框容器 */
      .RNNXgb,
      .minidiv .RNNXgb,
      .SDkEP {
        background: rgba(255,255,255,0.92) !important;
        border: 3px solid #7c4dff !important;
        box-shadow: 0 8px 24px rgba(124, 77, 255, 0.18) !important;
        transition: all 0.2s ease !important;
      }

      .RNNXgb:hover,
      .RNNXgb:focus-within,
      .minidiv .RNNXgb:hover,
      .minidiv .RNNXgb:focus-within {
        border-color: #2962ff !important;
        box-shadow: 0 10px 28px rgba(41, 98, 255, 0.28) !important;
      }

      /* 输入框字体 */
      textarea[name="q"],
      input[name="q"] {
        color: #111827 !important;
        font-size: 18px !important;
      }

      /* 按钮改样式 */
      input[name="btnK"],
      input[name="btnI"],
      .gNO89b,
      .RNmpXc {
        background: linear-gradient(90deg, #2962ff, #7c4dff) !important;
        color: #fff !important;
        border: none !important;
        border-radius: 999px !important;
        box-shadow: 0 4px 12px rgba(41, 98, 255, 0.25) !important;
        font-weight: bold !important;
      }

      input[name="btnK"]:hover,
      input[name="btnI"]:hover,
      .gNO89b:hover,
      .RNmpXc:hover {
        filter: brightness(1.06) !important;
      }

      /* Google logo 区域增加一点强调感 */
      #lga,
      .k1zIA {
        transform: scale(1.03);
      }

      /* 底部区域淡化 */
      footer,
      .FWSsI {
        opacity: 0.88 !important;
      }
    `;
    document.head.appendChild(style);
  }

  function injectBanner() {
    if (!document.body) return;
    if (document.getElementById('google-ui-style-test-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'google-ui-style-test-banner';
    banner.textContent = 'Google UI Style Test Script Active';
    document.body.appendChild(banner);

    document.body.style.paddingTop = '56px';
  }

  function run() {
    if (!document.head || !document.body) return;
    injectStyle();
    injectBanner();
    console.log('[UserScript Test] Google UI Style Test is running');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  setTimeout(run, 1000);
  setTimeout(run, 2500);
})();
