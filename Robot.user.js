// ==UserScript==
// @name         Human Verification Helper (Highlight & Focus)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Highlights and focuses "Verify you are human" checkboxes (no auto-click)
// @author       Your Name
// @match        *://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // 配置：验证框关键词和样式
    const CONFIG = {
        // 验证框相关关键词（中英文）
        keywords: ['verify you are human', 'human verification', '我不是机器人', '验证人类'],
        // 高亮样式（黄色边框+脉动动画，醒目但不影响页面）
        highlightStyle: `
            box-shadow: 0 0 0 2px #ffeb3b, 0 0 10px rgba(255, 235, 59, 0.5) !important;
            animation: pulse 2s infinite !important;
            z-index: 9999 !important;
        `,
        // 检查间隔（毫秒）
        checkInterval: 1000,
        // 动画样式
        pulseAnimation: `
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(255, 235, 59, 0.7); }
                70% { box-shadow: 0 0 0 8px rgba(255, 235, 59, 0); }
                100% { box-shadow: 0 0 0 0 rgba(255, 235, 59, 0); }
            }
        `
    };

    // 添加脉动动画样式到页面
    function addAnimationStyle() {
        const style = document.createElement('style');
        style.textContent = CONFIG.pulseAnimation;
        document.head.appendChild(style);
    }

    // 检查元素是否包含验证关键词
    function hasVerificationKeyword(element) {
        const text = (element.textContent || element.innerText || '').toLowerCase();
        return CONFIG.keywords.some(keyword => text.includes(keyword.toLowerCase()));
    }

    // 查找并处理验证框
    function findVerificationElements() {
        // 可能的验证框容器/复选框元素
        const candidateSelectors = [
            'input[type="checkbox"]',
            'div[role="checkbox"]',
            'button[class*="verify"], div[class*="verify"]',
            'label:has(input[type="checkbox"])',
            'div:contains("verify")'
        ];

        let foundElement = null;

        // 遍历所有候选元素
        candidateSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                // 过滤可见元素且包含关键词
                if (element.offsetParent !== null && 
                    (hasVerificationKeyword(element) || 
                     hasVerificationKeyword(element.parentElement) ||
                     hasVerificationKeyword(element.closest('div')))) {
                    foundElement = element;
                }
            });
        });

        if (foundElement) {
            highlightElement(foundElement);
            focusElement(foundElement);
        }
    }

    // 高亮元素
    function highlightElement(element) {
        // 保存原始样式，避免覆盖
        const originalStyle = element.getAttribute('style') || '';
        element.setAttribute('style', originalStyle + CONFIG.highlightStyle);
        
        // 验证通过后恢复样式（监听变化）
        const observer = new MutationObserver(() => {
            if (element.checked || element.getAttribute('aria-checked') === 'true') {
                element.setAttribute('style', originalStyle);
                observer.disconnect();
            }
        });
        observer.observe(element, { attributes: true, attributeFilter: ['checked', 'aria-checked', 'style'] });
    }

    // 聚焦元素（滚动到视图并设置焦点）
    function focusElement(element) {
        // 如果是复选框直接聚焦，否则聚焦其父容器
        const focusTarget = element.tagName === 'INPUT' ? element : element.querySelector('input, button') || element;
        if (focusTarget) {
            focusTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
            focusTarget.focus({ preventScroll: false });
            console.log('Verification element focused - please click manually');
        }
    }

    // 初始化
    function init() {
        addAnimationStyle();
        // 初始检查
        findVerificationElements();
        // 定时检查（处理动态加载的验证框）
        setInterval(findVerificationElements, CONFIG.checkInterval);
        // 监听页面变化
        const observer = new MutationObserver(findVerificationElements);
        observer.observe(document.body, { childList: true, subtree: true });
        console.log('Human Verification Helper initialized (no auto-click)');
    }

    // 启动脚本
    init();

})();
