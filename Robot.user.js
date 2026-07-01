// ==UserScript==
// @name         Human Verification Helper (Delayed Load Support)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Highlights "Verify you are human" checkboxes with delayed load support (no auto-click)
// @author       Your Name
// @match        *://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // 配置：增强延迟加载支持
    const CONFIG = {
        keywords: ['verify you are human', 'human verification', '我不是机器人', '验证人类', 'are you human'],
        highlightStyle: `
            box-shadow: 0 0 0 2px #4CAF50, 0 0 15px rgba(76, 175, 80, 0.6) !important;
            animation: pulse 2s infinite !important;
            z-index: 9999 !important;
        `,
        pulseAnimation: `
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
                100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
            }
        `,
        // 检测配置（解决延迟加载问题）
        initialCheckDelay: 1000,       // 初始检查延迟（给页面加载留出时间）
        regularCheckInterval: 2000,    // 常规检测间隔（毫秒）
        extendedCheckDuration: 60000,  // 延长检测时长（1分钟，可根据需求调整）
        maxCheckCycles: 30,            // 最大检测次数（= extendedCheckDuration / regularCheckInterval）
        giveUpMessage: 'Verification helper: No verification box found after 1 minute. You can manually check.'
    };

    let checkCycle = 0;
    let checkInterval;
    let observer;

    // 添加动画样式
    function addAnimationStyle() {
        const style = document.createElement('style');
        style.textContent = CONFIG.pulseAnimation;
        document.head.appendChild(style);
    }

    // 关键词匹配
    function hasVerificationKeyword(element) {
        const text = (element.textContent || element.innerText || '').toLowerCase();
        return CONFIG.keywords.some(keyword => text.includes(keyword.toLowerCase()));
    }

    // 查找验证框
    function findVerificationElements() {
        const candidateSelectors = [
            'input[type="checkbox"]:not([disabled])',
            'div[role="checkbox"]:not([aria-disabled="true"])',
            'button[class*="verify"], div[class*="verify"], span[class*="verify"]',
            'label:has(input[type="checkbox"])',
            'div[class*="captcha"], div[class*="robot"]'
        ];

        let foundElement = null;

        candidateSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                // 检查元素可见性和关键词（包括父元素）
                if (element.offsetParent !== null && 
                    (hasVerificationKeyword(element) || 
                     hasVerificationKeyword(element.parentElement) ||
                     hasVerificationKeyword(element.closest('div, section, form')))) {
                    foundElement = element;
                }
            });
        });

        if (foundElement) {
            highlightAndFocus(foundElement);
            stopChecking(); // 找到后停止检测
        } else if (checkCycle >= CONFIG.maxCheckCycles) {
            console.log(CONFIG.giveUpMessage);
            stopChecking(); // 达到最大次数后停止
        } else {
            checkCycle++;
            console.log(`Verification helper: Checking for box (attempt ${checkCycle}/${CONFIG.maxCheckCycles})`);
        }
    }

    // 高亮并聚焦
    function highlightAndFocus(element) {
        const originalStyle = element.getAttribute('style') || '';
        element.setAttribute('style', originalStyle + CONFIG.highlightStyle);
        
        // 验证通过后恢复样式
        const attrObserver = new MutationObserver(() => {
            if (element.checked || element.getAttribute('aria-checked') === 'true') {
                element.setAttribute('style', originalStyle);
                attrObserver.disconnect();
            }
        });
        attrObserver.observe(element, { attributes: true, attributeFilter: ['checked', 'aria-checked', 'style'] });

        // 滚动并聚焦
        const focusTarget = element.tagName === 'INPUT' ? element : element.querySelector('input, button') || element;
        if (focusTarget) {
            focusTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
            focusTarget.focus({ preventScroll: false });
            console.log('Verification box found! Please click manually.');
        }
    }

    // 停止检测（清理定时器和观察者）
    function stopChecking() {
        if (checkInterval) clearInterval(checkInterval);
        if (observer) observer.disconnect();
    }

    // 初始化检测流程
    function init() {
        addAnimationStyle();
        
        // 初始延迟后开始检测（给页面加载留出时间）
        setTimeout(() => {
            findVerificationElements(); // 首次检测
            
            // 启动定期检测
            checkInterval = setInterval(findVerificationElements, CONFIG.regularCheckInterval);
            
            // 监听DOM变化（捕捉动态加载的弹框）
            observer = new MutationObserver(findVerificationElements);
            observer.observe(document.body, { 
                childList: true, 
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'style', 'aria-checked']
            });
            
        }, CONFIG.initialCheckDelay);

        console.log('Verification helper started (will check for 1 minute)');
    }

    // 启动脚本
    init();

})();
