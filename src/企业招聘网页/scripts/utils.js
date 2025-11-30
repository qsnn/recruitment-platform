// 工具函数库
const Utils = {
    // 格式化日期
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    // 防抖函数
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 深拷贝
    deepClone: (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },

    // 生成随机ID
    generateId: () => {
        return Math.random().toString(36).substr(2, 9);
    },

    // 验证邮箱格式
    validateEmail: (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    // 验证手机号
    validatePhone: (phone) => {
        const regex = /^1[3-9]\d{9}$/;
        return regex.test(phone);
    },

    // 本地存储操作
    storage: {
        set: (key, value) => {
            localStorage.setItem(key, JSON.stringify(value));
        },
        get: (key) => {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        },
        remove: (key) => {
            localStorage.removeItem(key);
        }
    }
};