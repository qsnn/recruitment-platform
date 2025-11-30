// 认证服务
const AuthService = {
    // 获取当前用户
    getCurrentUser() {
        return Utils.storage.get('currentUser');
    },

    // 设置当前用户
    setCurrentUser(user) {
        Utils.storage.set('currentUser', user);
        // 更新头部状态
        if (typeof updateUserStatus === 'function') {
            updateUserStatus();
        }
    },

    // 登录
    async login(credentials) {
        try {
            // 模拟API调用
            console.log('调用登录API:', credentials);
            
            // 这里应该是真实的API调用
            // const response = await fetch('/api/auth/login', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify(credentials)
            // });
            
            // if (!response.ok) {
            //     throw new Error('登录失败');
            // }
            
            // const data = await response.json();
            
            // 模拟成功响应
            const mockUser = {
                id: 1,
                email: credentials.email,
                name: credentials.email.split('@')[0],
                role: 'candidate',
                token: 'mock-jwt-token-' + Date.now()
            };
            
            // 模拟网络延迟
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.setCurrentUser(mockUser);
            return mockUser;
            
        } catch (error) {
            console.error('登录错误:', error);
            throw new Error('登录失败，请检查网络连接');
        }
    },

    // 注册
    async register(userData) {
        try {
            console.log('调用注册API:', userData);
            
            // 模拟API调用
            // const response = await fetch('/api/auth/register', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify(userData)
            // });
            
            // if (!response.ok) {
            //     throw new Error('注册失败');
            // }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return { success: true, message: '注册成功' };
            
        } catch (error) {
            console.error('注册错误:', error);
            throw new Error('注册失败，请稍后重试');
        }
    },

    // 发送验证码
    async sendVerificationCode(email) {
        try {
            console.log('发送验证码到:', email);
            
            // 模拟API调用
            // const response = await fetch('/api/auth/send-code', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({ email })
            // });
            
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

    // 检查认证状态
    isAuthenticated() {
        return !!this.getCurrentUser();
    },

    // 获取认证token
    getToken() {
        const user = this.getCurrentUser();
        return user ? user.token : null;
    }
};