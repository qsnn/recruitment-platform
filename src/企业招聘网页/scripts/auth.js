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
            console.log('调用登录API:', credentials);

            // 模拟API调用 - 使用用户名密码登录
            const mockUser = {
                id: 1,
                username: credentials.username,
                name: credentials.username, // 使用用户名作为显示名称
                role: 'candidate',
                token: 'mock-jwt-token-' + Date.now()
            };

            // 模拟网络延迟
            await new Promise(resolve => setTimeout(resolve, 1000));

            this.setCurrentUser(mockUser);
            return mockUser;

        } catch (error) {
            console.error('登录错误:', error);
            throw new Error('登录失败，请检查用户名和密码');
        }
    },

    // 注册
    async register(userData) {
        try {
            console.log('调用注册API:', userData);

            // 模拟API调用 - 用户名密码注册
            // 在实际项目中，这里应该调用注册接口
            await new Promise(resolve => setTimeout(resolve, 1000));

            return { success: true, message: '注册成功' };

        } catch (error) {
            console.error('注册错误:', error);
            throw new Error('注册失败，用户名可能已被使用');
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