// ==UserScript==
// @name         Simple Human Verification Auto-Clicker
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Auto-click simple "Verify you are human" checkboxes (for educational use only)
// @author       Your Name
// @match        *://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // 仅针对简单复选框验证的核心选择器（避免复杂验证）
    const TARGET_SELECTORS = [
        // 包含"human"关键词的标签附近的复选框
        'input[type="checkbox"]:not([disabled]) + label:contains("human"), input[type="checkbox"]:not([disabled])[id*="human"], input[type="checkbox"]:not([disabled])[name*="human"]',
        // 常见验证按钮/方框
        'div[class*="verify-human"], div[class*="robot-check"]:not([style*="none"]), button[class*="verify-btn"]:not([disabled])',
        // 直接可见的验证复选框（无iframe包裹的简单场景）
        'input[type="checkbox"]:not([disabled]):visible'
    ];

    // 配置参数
    const CHECK_DELAY = 800; // 检查间隔（毫秒）
    const MAX_RETRIES = 10;  // 最大重试次数
    let retryCount = 0;

    // 检查元素是否可见
    function isElementVisible(element) {
        return element.offsetParent !== null && 
               element.style.opacity !== '0' && 
               element.style.display !== 'none';
    }

    // 尝试点击验证方框
    function attemptVerification() {
        if (retryCount >= MAX_RETRIES) {
            console.log('[Auto-Verify] Max retries reached, stopping');
            return;
        }

        retryCount++;
        let found = false;

        // 遍历所有目标选择器
        TARGET_SELECTORS.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (isElementVisible(element) && !found) {
                    try {
                        // 优先点击label（如果复选框被label包裹）
                        const label = element.tagName === 'INPUT' ? element.nextElementSibling : element;
                        (label || element).click();
                        console.log('[Auto-Verify] Clicked verification element:', element);
                        found = true;
                    } catch (e) {
                        console.log('[Auto-Verify] Click failed:', e.message);
                    }
                }
            });
        });

        // 未找到则继续重试
        if (!found) {
            setTimeout(attemptVerification, CHECK_DELAY);
        }
    }

    // 页面加载完成后启动
    window.addEventListener('load', () => {
        console.log('[Auto-Verify] Script started (simple checkbox mode)');
        attemptVerification();
    });

    // 监听动态内容加载（如AJAX生成的验证框）
    const observer = new MutationObserver(() => {
        if (retryCount < MAX_RETRIES) attemptVerification();
    });
    observer.observe(document.body, { childList: true, subtree: true });

})();
