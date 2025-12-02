/**
 * 招聘系统 - 认证模块
 * 模拟用户认证功能
 */

// 模拟用户数据库
const mockUsers = {
    // 系统生成的测试账号
    'employer001': {
        password: 'employer123',
        role: 'employer',
        email: 'employer@test.com',
        name: '企业管理员001',
        company: '测试科技有限公司'
    },
    'employer002': {
        password: 'employer123',
        role: 'employer',
        email: 'employer2@test.com',
        name: '企业管理员002',
        company: '创新软件公司'
    },
    'recruiter001': {
        password: 'recruiter123',
        role: 'recruiter',
        email: 'recruiter@test.com',
        name: '张招聘专员',
        department: '人力资源部'
    },
    'admin001': {
        password: 'admin123',
        role: 'admin',
        email: 'admin@test.com',
        name: '系统管理员'
    },

    // 模拟已注册的求职者
    'jobseeker001': {
        password: 'jobseeker123',
        role: 'job-seeker',
        email: 'jobseeker@test.com',
        name: '张三',
        resume: '前端开发工程师，3年经验'
    },
    'jobseeker002': {
        password: 'jobseeker123',
        role: 'job-seeker',
        email: 'jobseeker2@test.com',
        name: '李四',
        resume: 'Java后端工程师，5年经验'
    }
};

// 本地存储工具
const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('本地存储失败:', e);
        }
    },

    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('读取本地存储失败:', e);
            return null;
        }
    },

    remove: (key) => {
        localStorage.removeItem(key);
    },

    clear: () => {
        localStorage.clear();
    }
};

// 获取当前登录用户
function getCurrentUser() {
    return storage.get('currentUser');
}

// 检查是否已登录
function isLoggedIn() {
    return !!getCurrentUser();
}

// 登录函数
function login(username, password, role) {
    // 输入验证
    if (!username || !password || !role) {
        return {
            success: false,
            message: '请填写所有必填字段'
        };
    }

    // 查找用户
    const user = mockUsers[username];

    // 验证用户
    if (!user) {
        return {
            success: false,
            message: '用户不存在'
        };
    }

    if (user.password !== password) {
        return {
            success: false,
            message: '密码错误'
        };
    }

    if (user.role !== role) {
        return {
            success: false,
            message: '身份选择错误'
        };
    }

    // 登录成功，保存用户信息
    const userInfo = {
        username: username,
        role: user.role,
        email: user.email,
        name: user.name,
        loginTime: new Date().toISOString()
    };

    // 保存到本地存储
    storage.set('currentUser', userInfo);

    // 根据角色跳转到对应页面
    const redirectMap = {
        'job-seeker': 'job-seeker-dashboard.html',
        'employer': 'employer-dashboard.html',
        'interviewer': 'recruiter-dashboard.html',  // 原来的面试官跳转到招聘专员页面
        'recruiter': 'recruiter-dashboard.html',    // 新增招聘专员角色
        'admin': 'admin-dashboard.html'
    };

    return {
        success: true,
        message: '登录成功',
        redirectUrl: redirectMap[role] || 'index.html'
    };
}

// 注册函数（仅限求职者）
function register(username, email, password, confirmPassword) {
    // 输入验证
    if (!username || !email || !password || !confirmPassword) {
        return {
            success: false,
            message: '请填写所有必填字段'
        };
    }

    // 用户名验证
    if (username.length < 4) {
        return {
            success: false,
            message: '用户名至少4个字符'
        };
    }

    // 邮箱验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            success: false,
            message: '邮箱格式不正确'
        };
    }

    // 密码验证
    if (password.length < 6) {
        return {
            success: false,
            message: '密码至少6位字符'
        };
    }

    if (password !== confirmPassword) {
        return {
            success: false,
            message: '两次输入的密码不一致'
        };
    }

    // 检查用户名是否已存在
    if (mockUsers[username]) {
        return {
            success: false,
            message: '用户名已存在'
        };
    }

    // 创建新用户（仅限求职者）
    mockUsers[username] = {
        password: password,
        role: 'job-seeker',
        email: email,
        name: username,
        resume: '暂无简历'
    };

    // 自动登录
    const loginResult = login(username, password, 'job-seeker');

    if (loginResult.success) {
        return {
            success: true,
            message: '注册成功，已自动登录',
            redirectUrl: 'job-seeker-dashboard.html'
        };
    } else {
        return {
            success: false,
            message: '注册成功，但自动登录失败，请手动登录'
        };
    }
}

// 登出函数
function logout() {
    storage.remove('currentUser');
    return {
        success: true,
        message: '已退出登录',
        redirectUrl: 'index.html'
    };
}

// 检查密码强度
function checkPasswordStrength(password) {
    if (!password) return 'empty';

    let strength = 0;

    // 长度
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    // 包含小写字母
    if (/[a-z]/.test(password)) strength++;

    // 包含大写字母
    if (/[A-Z]/.test(password)) strength++;

    // 包含数字
    if (/\d/.test(password)) strength++;

    // 包含特殊字符
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
}

// 页面加载时的初始化
document.addEventListener('DOMContentLoaded', function() {
    // 登录表单处理
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;

            const result = login(username, password, role);

            if (result.success) {
                // 登录成功，跳转到对应页面
                window.location.href = result.redirectUrl;
            } else {
                // 显示错误信息
                alert(result.message);
            }
        });
    }

    // 注册表单处理
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        // 密码强度实时检查
        const passwordInput = document.getElementById('password');
        const strengthBar = document.querySelector('.strength-bar');

        if (passwordInput && strengthBar) {
            passwordInput.addEventListener('input', function() {
                const strength = checkPasswordStrength(this.value);
                strengthBar.className = 'strength-bar ' + strength;
            });
        }

        // 确认密码验证
        const confirmInput = document.getElementById('confirm-password');
        const errorMessage = document.getElementById('password-error');

        if (confirmInput && errorMessage) {
            confirmInput.addEventListener('input', function() {
                const password = passwordInput.value;
                const confirm = this.value;

                if (confirm && password !== confirm) {
                    errorMessage.textContent = '两次输入的密码不一致';
                } else {
                    errorMessage.textContent = '';
                }
            });
        }

        // 注册表单提交
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            const result = register(username, email, password, confirmPassword);

            if (result.success) {
                // 注册成功，跳转
                window.location.href = result.redirectUrl;
            } else {
                // 显示错误信息
                alert(result.message);
            }
        });
    }

    // 自动填充URL中的角色参数
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    if (roleParam && document.getElementById('role')) {
        document.getElementById('role').value = roleParam;
    }

    // 仪表板页面：检查登录状态
    if (window.location.pathname.includes('dashboard')) {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            // 未登录，跳转到登录页
            window.location.href = 'login.html';
            return;
        }

        // 更新导航栏中的用户信息
        updateUserInfo(currentUser);

        // 绑定退出登录按钮
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
                window.location.href = 'index.html';
            });
        }
    }
});

// 更新页面中的用户信息
function updateUserInfo(user) {
    // 更新导航栏
    const userSpan = document.querySelector('.nav-user span');
    if (userSpan) {
        userSpan.textContent = `欢迎，${user.name || user.username}`;
    }

    // 根据角色显示不同的标题
    const roleTitles = {
        'job-seeker': '求职者',
        'employer': '企业管理员',
        'interviewer': '面试官',
        'admin': '平台管理员'
    };

    const titleElement = document.querySelector('.nav-logo h1');
    if (titleElement && user.role) {
        const roleTitle = roleTitles[user.role] || '用户';
        titleElement.textContent = `招聘系统 - ${roleTitle}`;
    }
}

// 导出函数供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        login,
        register,
        logout,
        getCurrentUser,
        isLoggedIn,
        checkPasswordStrength
    };
}