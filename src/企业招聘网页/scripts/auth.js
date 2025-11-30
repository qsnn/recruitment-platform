// 认证服务
const AuthService = {
    // 获取当前用户
    getCurrentUser() {
        return Utils.storage.get('currentUser');
    },

    // 设置当前用户
    setCurrentUser(user) {
        Utils.storage.set('currentUser', user);
        if (typeof updateUserStatus === 'function') {
            updateUserStatus();
        }
    },

    // 登录
    async login(credentials) {
        try {
            console.log('调用登录API:', credentials);

            const response = await fetch('http://localhost:8080/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    username: credentials.username,
                    password: credentials.password
                })
            });

            // HTTP 层错误
            if (!response.ok) {
                let errMsg = '登录失败';
                try {
                    const errData = await response.json();
                    if (errData && errData.message) errMsg = errData.message;
                } catch (e) {
                    const text = await response.text();
                    if (text) errMsg = text;
                }
                throw new Error(errMsg);
            }

            const result = await response.json();
            // result 形如: { code, message, data }

            if (result.code !== 200) {
                throw new Error(result.message || '登录失败');
            }

            const userData = result.data || {};

            // 统一当前用户结构，可在 header 等地方使用
            const currentUser = {
                userId: userData.userId,
                username: userData.username,
                phone: userData.phone,
                email: userData.email,
                status: userData.status,
                userType: userData.userType,
                companyId: userData.companyId
            };

            this.setCurrentUser(currentUser);
            return currentUser;

        } catch (error) {
            console.error('登录错误:', error);
            // 抛出让页面显示具体 message
            throw new Error(error.message || '登录失败，请检查网络连接');
        }
    },

    // 注册
    async register(userData) {
        try {
            console.log('调用注册API:', userData);

            const response = await fetch('http://localhost:8080/api/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                let errMsg = '注册失败';
                try {
                    const errData = await response.json();
                    if (errData && errData.message) errMsg = errData.message;
                } catch (e) {
                    const text = await response.text();
                    if (text) errMsg = text;
                }
                throw new Error(errMsg);
            }

            const result = await response.json();
            // 形如: { code, message, data: 用户ID }

            if (result.code !== 200) {
                throw new Error(result.message || '注册失败');
            }

            return result; // 页面根据 code/message 决定提示文案

        } catch (error) {
            console.error('注册错误:', error);
            throw new Error(error.message || '注册失败，请稍后重试');
        }
    },

    // 发送验证码（如后端有对应接口，可改成真实地址）
    async sendVerificationCode(email) {
        try {
            console.log('发送验证码到:', email);

            // 这里暂时仍为模拟，如果后端有接口，可改为:
            // const response = await fetch('http://localhost:8080/api/user/send-code', { ... });

            await new Promise(resolve => setTimeout(resolve, 500));
            alert('验证码已发送到您的邮箱');

        } catch (error) {
            console.error('发送验证码错误:', error);
            alert('发送验证码失败，请稍后重试');
        }
    },

    // 退出登录
    logout() {
        Utils.storage.remove('currentUser');
        if (typeof updateUserStatus === 'function') {
            updateUserStatus();
        }
        Router.navigateTo('#home');
        alert('已退出登录');
    },

    isAuthenticated() {
        return !!this.getCurrentUser();
    },

    getToken() {
        const user = this.getCurrentUser();
        return user ? user.token : null;
    }
};
