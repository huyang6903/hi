// ==UserScript==
// @name         Auto Click Robot Verification Checkbox
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  A script to automatically click robot verification checkboxes (for educational purposes only)
// @author       Your Name
// @match        *://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // 配置：验证码复选框的常见选择器
    const CHECKBOX_SELECTORS = [
        // reCAPTCHA v2 经典复选框
        'div.g-recaptcha div.recaptcha-checkbox-checkmark',
        'div.g-recaptcha iframe',
        'iframe[src*="recaptcha/api2/anchor"]',
        // hCaptcha 复选框
        'div.h-captcha iframe',
        'iframe[src*="hcaptcha.com/anchor"]',
        // 其他常见验证码选择器（可根据实际情况扩展）
        'input[type="checkbox"][name*="robot"][id*="robot"]',
        'div.robot-check-checkbox',
        'button.verification-checkbox'
    ];

    // 配置：检查和点击的时间间隔（毫秒）
    const CHECK_INTERVAL = 500;
    // 最大尝试次数（避免无限循环）
    const MAX_ATTEMPTS = 20;

    let attemptCount = 0;

    // 尝试点击验证码复选框
    function tryClickVerification() {
        if (attemptCount >= MAX_ATTEMPTS) {
            console.log('Auto verification stopped: Max attempts reached');
            return;
        }

        attemptCount++;
        let clicked = false;

        // 遍历所有选择器尝试找到并点击
        CHECKBOX_SELECTORS.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element.offsetParent !== null) { // 确保元素可见
                    try {
                        // 尝试直接点击
                        element.click();
                        console.log(`Clicked verification element: ${selector}`);
                        clicked = true;
                    } catch (e) {
                        // 如果直接点击失败，尝试模拟鼠标事件
                        const event = new MouseEvent('click', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        });
                        element.dispatchEvent(event);
                        console.log(`Simulated click on verification element: ${selector}`);
                        clicked = true;
                    }
                }
            });
        });

        if (!clicked) {
            // 如果未找到可点击元素，继续定时检查
            setTimeout(tryClickVerification, CHECK_INTERVAL);
        } else {
            console.log('Verification checkbox clicked successfully');
        }
    }

    // 页面加载完成后开始检查
    window.addEventListener('load', () => {
        console.log('Auto verification script started');
        tryClickVerification();
    });

    // 监听页面动态变化（如AJAX加载的验证码）
    const observer = new MutationObserver(() => {
        if (attemptCount < MAX_ATTEMPTS) {
            tryClickVerification();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
