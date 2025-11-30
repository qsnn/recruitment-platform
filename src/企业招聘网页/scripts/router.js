// 路由系统
const Router = {
    currentRoute: '',
    routes: {},

    // 初始化路由
    init() {
        // 加载头部
        this.loadHeader();

        // 监听哈希变化
        window.addEventListener('hashchange', () => {
            this.handleRouteChange();
        });

        // 初始路由处理
        this.handleRouteChange();
    },

    // 加载头部组件
    async loadHeader() {
        try {
            const response = await fetch('components/header.html');
            const html = await response.text();
            document.getElementById('header-container').innerHTML = html;
        } catch (error) {
            console.error('加载头部失败:', error);
            document.getElementById('header-container').innerHTML = `
                <header class="site-header">
                    <div class="header-container">
                        <div class="logo">
                            <h1>企业招聘平台</h1>
                        </div>
                        <div class="user-actions">
                            <a href="#auth/login" class="btn btn-login">登录</a>
                            <a href="#auth/register" class="btn btn-primary">注册</a>
                        </div>
                    </div>
                </header>
            `;
        }
    },

    // javascript
// scripts/router.js 中 handleRouteChange 的结尾部分
    async handleRouteChange() {
        const hash = window.location.hash.slice(1) || 'home';
        this.currentRoute = hash;

        const mainContent = document.getElementById('main-content');

        try {
            let pageHtml = '';

            switch (true) {
                case hash === 'home':
                    pageHtml = this.getHomePage();
                    break;
                case hash.startsWith('auth/'):
                    pageHtml = await this.loadAuthPage(hash);
                    break;
                case hash.startsWith('candidate/'):
                    pageHtml = await this.loadCandidatePage(hash);
                    break;
                case hash.startsWith('employer/'):
                    pageHtml = await this.loadEmployerPage(hash);
                    break;
                case hash.startsWith('admin/'):
                    pageHtml = this.getAdminPage(hash);
                    break;
                default:
                    pageHtml = this.getNotFoundPage();
            }

            mainContent.innerHTML = pageHtml;

            // \[新增\] 登录页加载完后，初始化表单事件
            if (hash === 'auth/login' && typeof LoginPage !== 'undefined') {
                LoginPage.init();
            }
            // 注册页
            if (hash === 'auth/register' && typeof RegisterPage !== 'undefined') {
                RegisterPage.init();
            }
            // 更新导航激活状态
            this.updateActiveNav();

        } catch (error) {
            console.error('路由处理错误:', error);
            mainContent.innerHTML = this.getErrorPage();
        }
    },


    // 加载认证页面
    async loadAuthPage(route) {
        const pageMap = {
            'auth/login': 'login.html',
            'auth/register': 'register.html',
            'auth/reset-password': 'reset-password.html'
        };

        const pageFile = pageMap[route] || 'login.html';
        const response = await fetch(`pages/auth/${pageFile}`);
        return await response.text();
    },

    // 加载求职者页面
    async loadCandidatePage(route) {
        const pageMap = {
            'candidate/job-search': 'job-search.html',
            'candidate/job-detail': 'job-detail.html',
            'candidate/my-applications': 'my-applications.html'
        };

        // 处理带参数的路径
        let pageKey = route;
        if (route.startsWith('candidate/job-detail/')) {
            pageKey = 'candidate/job-detail';
        }

        const pageFile = pageMap[pageKey] || 'job-search.html';
        const response = await fetch(`pages/candidate/${pageFile}`);
        let html = await response.text();

        // 如果是职位详情页，注入职位ID
        if (pageKey === 'candidate/job-detail') {
            const jobId = route.split('/').pop();
            html = html.replace(/\{\{jobId\}\}/g, jobId);
        }

        return html;
    },

    // 加载企业页面
    async loadEmployerPage(route) {
        const pageMap = {
            'employer/post-job': 'post-job.html',
            'employer/manage-jobs': 'manage-jobs.html',
            'employer/applicant-management': 'applicant-management.html'
        };

        const pageFile = pageMap[route] || 'post-job.html';
        const response = await fetch(`pages/employer/${pageFile}`);
        return await response.text();
    },

    // 获取首页
    getHomePage() {
        return `
            <div class="welcome-message">
                <h2>欢迎来到企业招聘平台</h2>
                <p>请选择上方的导航菜单开始使用</p>
                <div style="margin-top: 30px;">
                    <a href="#candidate/job-search" class="btn btn-primary" style="margin-right: 15px;">
                        我是求职者
                    </a>
                    <a href="#employer/post-job" class="btn btn-outline">
                        我是企业
                    </a>
                </div>
            </div>
        `;
    },

    // 获取管理员页面
    getAdminPage(route) {
        return `
            <div class="container">
                <div class="page-header">
                    <h1>管理员面板</h1>
                    <p>系统管理功能</p>
                </div>
                <div class="auth-card">
                    <h3>功能开发中</h3>
                    <p>管理员功能正在开发中，敬请期待...</p>
                    <div style="margin-top: 20px;">
                        <a href="#home" class="btn btn-primary">返回首页</a>
                    </div>
                </div>
            </div>
        `;
    },

    // 获取404页面
    getNotFoundPage() {
        return `
            <div class="container">
                <div class="auth-card">
                    <h2>页面未找到</h2>
                    <p>抱歉，您访问的页面不存在。</p>
                    <div style="margin-top: 20px;">
                        <a href="#home" class="btn btn-primary">返回首页</a>
                    </div>
                </div>
            </div>
        `;
    },

    // 获取错误页面
    getErrorPage() {
        return `
            <div class="container">
                <div class="error-message">
                    <h2>页面加载失败</h2>
                    <p>请检查网络连接或刷新页面重试。</p>
                    <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 15px;">
                        刷新页面
                    </button>
                </div>
            </div>
        `;
    },

    // 更新导航激活状态
    updateActiveNav() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');

            const href = link.getAttribute('href');
            if (href && this.currentRoute.startsWith(href.slice(1))) {
                link.classList.add('active');
            }
        });
    },

    // 导航到指定路由
    navigateTo(route) {
        window.location.hash = route;
    },

    // 获取当前路由参数
    getRouteParams() {
        const segments = this.currentRoute.split('/');
        return segments.slice(1);
    }
};

// 初始化路由
document.addEventListener('DOMContentLoaded', () => {
    Router.init();
});