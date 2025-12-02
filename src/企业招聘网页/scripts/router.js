// 路由系统
const Router = {
    currentRoute: '',

    // 角色对应的可访问路由前缀
    ROLE_PERMISSIONS: {
        candidate: ['candidate/', 'auth/', 'home'],
        employer: ['employer/', 'auth/', 'home'],
        admin: ['admin/', 'employer/', 'candidate/', 'auth/', 'home'],
        interviewer: ['interviewer/', 'auth/', 'home'],
        guest: ['candidate/job-search', 'candidate/job-detail', 'auth/', 'home']
    },

    // 角色默认页面
    ROLE_DEFAULT_PAGES: {
        candidate: '#candidate/job-search',
        employer: '#employer/talent-dashboard',
        admin: '#admin/dashboard',
        interviewer: '#interviewer/schedule'
    },

    // 初始化路由
    init() {
        this.loadHeader();
        window.addEventListener('hashchange', () => this.handleRouteChange());
        this.handleRouteChange();
    },

    // 加载头部
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

    // 处理路由变化
    async handleRouteChange() {
        const hash = window.location.hash.slice(1) || 'home';
        this.currentRoute = hash;

        console.log('路由变化:', hash, '当前用户:', this.getCurrentUser()?.role);

        // 权限检查
        if (!this.checkPermission(hash)) {
            const user = this.getCurrentUser();
            const defaultPage = user ? this.ROLE_DEFAULT_PAGES[user.role] : '#home';
            console.log('无权限，跳转到默认页面:', defaultPage);
            this.navigateTo(defaultPage);
            return;
        }

        const mainContent = document.getElementById('main-content');

        try {
            let pageHtml = '';

            // 根据路由加载不同页面
            if (hash === 'home') {
                pageHtml = this.getHomePage();
            } else if (hash.startsWith('auth/')) {
                pageHtml = await this.loadAuthPage(hash);
            } else if (hash.startsWith('candidate/')) {
                pageHtml = await this.loadCandidatePage(hash);
            } else if (hash.startsWith('employer/')) {
                pageHtml = await this.loadEmployerPage(hash);
            } else if (hash.startsWith('admin/')) {
                pageHtml = await this.loadAdminPage(hash);
            } else if (hash.startsWith('interviewer/')) {
                pageHtml = await this.loadInterviewerPage(hash);
            } else {
                pageHtml = this.getNotFoundPage();
            }

            mainContent.innerHTML = pageHtml;
            this.updateActiveNav();

        } catch (error) {
            console.error('路由处理错误:', error);
            mainContent.innerHTML = this.getErrorPage();
        }
    },

    // 检查权限
    checkPermission(route) {
        // 如果是首页，允许所有角色访问
        if (route === 'home') return true;

        const user = this.getCurrentUser();
        const role = user ? user.role : 'guest';

        console.log(`权限检查: 角色=${role}, 路由=${route}`);

        // 获取该角色允许访问的路由前缀
        const allowedPrefixes = this.ROLE_PERMISSIONS[role] || this.ROLE_PERMISSIONS.guest;

        // 检查是否匹配任一允许的前缀
        const hasPermission = allowedPrefixes.some(prefix => {
            // 处理前缀格式（移除斜杠用于精确匹配）
            const cleanPrefix = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;

            // 检查路由是否以前缀开头
            return route.startsWith(prefix) ||
                   route === cleanPrefix ||
                   (prefix.includes('/') && route.startsWith(prefix));
        });

        if (!hasPermission) {
            console.warn(`角色 ${role} 没有权限访问 ${route}`);
            return false;
        }

        return true;
    },

    // 获取当前用户
    getCurrentUser() {
        try {
            const userData = localStorage.getItem('currentUser');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('获取用户失败:', error);
            return null;
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
            'candidate/my-applications': 'my-applications.html',
            'candidate/profile': 'profile.html'
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
            'employer/applicant-management': 'applicant-management.html',
            'employer/company-management': 'company-management.html',
            'employer/talent-management': 'talent-management.html',
            'employer/talent-dashboard': 'talent-dashboard.html'
        };

        const pageFile = pageMap[route] || 'post-job.html';
        const response = await fetch(`pages/employer/${pageFile}`);
        return await response.text();
    },

    // 加载管理员页面
    async loadAdminPage(route) {
        const pageMap = {
            'admin/dashboard': 'dashboard.html',
            'admin/user-management': 'user-management.html',
            'admin/system-settings': 'system-settings.html',
            'admin/companies': 'companies.html',
            'admin/audit': 'audit.html'
        };

        const pageFile = pageMap[route] || 'dashboard.html';
        try {
            const response = await fetch(`pages/admin/${pageFile}`);
            return await response.text();
        } catch (error) {
            console.error(`加载管理员页面失败: ${pageFile}`, error);
            return this.getAdminPage(route);
        }
    },

    // 加载面试官页面
    async loadInterviewerPage(route) {
        const pageMap = {
            'interviewer/schedule': 'schedule.html',
            'interviewer/evaluation': 'evaluation.html',
            'interviewer/stats': 'stats.html'
        };

        const pageFile = pageMap[route] || 'schedule.html';
        try {
            const response = await fetch(`pages/interviewer/${pageFile}`);
            return await response.text();
        } catch (error) {
            console.error(`加载面试官页面失败: ${pageFile}`, error);
            return this.getInterviewerPage(route);
        }
    },

    // 获取首页（根据不同角色显示不同内容）
    getHomePage() {
        const user = this.getCurrentUser();

        if (user) {
            // 已登录用户的首页
            const rolePages = {
                candidate: {
                    title: '求职者工作台',
                    description: '找到理想的工作机会',
                    actions: [
                        { text: '🔍 搜索职位', href: '#candidate/job-search' },
                        { text: '📄 我的申请', href: '#candidate/my-applications' },
                        { text: '👤 完善简历', href: '#candidate/profile' }
                    ]
                },
                employer: {
                    title: '企业工作台',
                    description: '管理您的招聘业务',
                    actions: [
                        { text: '📝 发布新职位', href: '#employer/post-job' },
                        { text: '🏢 公司管理', href: '#employer/company-management' },
                        { text: '👨‍💼 人才库', href: '#employer/talent-management' },
                        { text: '💼 管理职位', href: '#employer/manage-jobs' }
                    ]
                },
                admin: {
                    title: '管理后台',
                    description: '系统管理和监控',
                    actions: [
                        { text: '📊 数据看板', href: '#admin/dashboard' },
                        { text: '👤 用户管理', href: '#admin/user-management' },
                        { text: '🏢 公司管理', href: '#admin/companies' },
                        { text: '⚙️ 系统设置', href: '#admin/system-settings' }
                    ]
                },
                interviewer: {
                    title: '面试官工作台',
                    description: '安排和评估面试',
                    actions: [
                        { text: '📅 面试安排', href: '#interviewer/schedule' },
                        { text: '📋 候选人评估', href: '#interviewer/evaluation' },
                        { text: '📊 面试统计', href: '#interviewer/stats' }
                    ]
                }
            };

            const pageInfo = rolePages[user.role] || rolePages.candidate;
            const roleNames = {
                candidate: '求职者',
                employer: '企业用户',
                admin: '系统管理员',
                interviewer: '面试官'
            };

            return `
                <div class="welcome-message">
                    <h2>欢迎回来，${user.name}！</h2>
                    <p><span class="role-badge">${roleNames[user.role]}</span> ${pageInfo.description}</p>
                    <div class="role-actions" style="margin-top: 30px;">
                        ${pageInfo.actions.map(action => `
                            <a href="${action.href}" class="action-card">
                                <div class="action-icon">${action.text.split(' ')[0]}</div>
                                <div class="action-text">${action.text.substring(action.text.indexOf(' ') + 1)}</div>
                            </a>
                        `).join('')}
                    </div>

                    <div style="margin-top: 40px;">
                        <h3>快捷操作</h3>
                        <div class="quick-actions" style="display: flex; gap: 10px; margin-top: 15px; justify-content: center;">
                            <button class="btn btn-primary" onclick="Router.navigateTo('${this.ROLE_DEFAULT_PAGES[user.role]}')">
                                进入工作台
                            </button>
                            <button class="btn btn-outline" onclick="logout()">
                                退出登录
                            </button>
                        </div>
                    </div>
                </div>

                <style>
                .role-badge {
                    display: inline-block;
                    background: #1890ff;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    margin-right: 8px;
                }

                .role-actions {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 20px;
                    max-width: 800px;
                    margin: 30px auto;
                }

                .action-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 25px 15px;
                    background: white;
                    border-radius: 12px;
                    text-decoration: none;
                    color: #333;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.08);
                    transition: all 0.3s;
                    border: 1px solid #f0f0f0;
                }

                .action-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.12);
                    border-color: #1890ff;
                }

                .action-icon {
                    font-size: 32px;
                    margin-bottom: 15px;
                    height: 60px;
                    width: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f6ffed;
                    border-radius: 50%;
                }

                .action-text {
                    font-size: 15px;
                    text-align: center;
                    font-weight: 500;
                }

                .quick-actions {
                    max-width: 400px;
                    margin: 0 auto;
                }
                </style>

                <script>
                function logout() {
                    localStorage.removeItem('currentUser');
                    Router.navigateTo('#home');
                    setTimeout(() => location.reload(), 100);
                }
                <\/script>
            `;
        } else {
            // 未登录用户的首页
            return `
                <div class="welcome-message">
                    <h2>欢迎来到企业招聘平台</h2>
                    <p>为企业和求职者提供专业的招聘服务</p>

                    <div style="margin-top: 40px;">
                        <h3>选择您的身份</h3>
                        <div class="role-selection">
                            <div class="role-card" onclick="Router.navigateTo('#auth/register')">
                                <div class="role-icon">👤</div>
                                <h4>求职者</h4>
                                <p>寻找理想工作，免费注册账号</p>
                                <button class="btn btn-primary" style="margin-top: 15px;">免费注册</button>
                            </div>

                            <div class="role-card" onclick="Router.navigateTo('#auth/login')">
                                <div class="role-icon">🏢</div>
                                <h4>企业用户</h4>
                                <p>招聘优秀人才，管理公司信息</p>
                                <button class="btn btn-outline" style="margin-top: 15px;">企业登录</button>
                            </div>

                            <div class="role-card">
                                <div class="role-icon">👔</div>
                                <h4>其他角色</h4>
                                <p>管理员、面试官等请联系系统管理员获取账号</p>
                                <button class="btn btn-outline" style="margin-top: 15px;" onclick="Router.navigateTo('#auth/login')">其他登录</button>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 50px; padding: 20px; background: #f8f9fa; border-radius: 10px; max-width: 800px; margin-left: auto; margin-right: auto;">
                        <h3>📢 平台特色</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px;">
                            <div style="text-align: center;">
                                <div style="font-size: 24px; margin-bottom: 10px;">🚀</div>
                                <div style="font-weight: 500;">高效匹配</div>
                                <div style="font-size: 13px; color: #666;">智能算法推荐合适职位</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 24px; margin-bottom: 10px;">🔒</div>
                                <div style="font-weight: 500;">安全可靠</div>
                                <div style="font-size: 13px; color: #666;">企业认证，信息真实</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 24px; margin-bottom: 10px;">⚡</div>
                                <div style="font-weight: 500;">快速响应</div>
                                <div style="font-size: 13px; color: #666;">实时通知，及时反馈</div>
                            </div>
                        </div>
                    </div>
                </div>

                <style>
                .role-selection {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 25px;
                    max-width: 900px;
                    margin: 30px auto;
                }

                .role-card {
                    padding: 30px 25px;
                    background: white;
                    border-radius: 12px;
                    text-align: center;
                    box-shadow: 0 3px 15px rgba(0,0,0,0.08);
                    cursor: pointer;
                    transition: all 0.3s;
                    border: 2px solid transparent;
                }

                .role-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                    border-color: #1890ff;
                }

                .role-icon {
                    font-size: 48px;
                    margin-bottom: 20px;
                    opacity: 0.9;
                }

                .role-card h4 {
                    margin: 10px 0;
                    color: #1890ff;
                    font-size: 18px;
                }

                .role-card p {
                    color: #666;
                    margin-bottom: 20px;
                    line-height: 1.5;
                    font-size: 14px;
                }
                </style>
            `;
        }
    },

    // 获取管理员页面（备用）
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
                        <button class="btn btn-primary" onclick="Router.navigateTo('#home')">
                            返回首页
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // 获取面试官页面（备用）
    getInterviewerPage(route) {
        return `
            <div class="container">
                <div class="page-header">
                    <h1>面试官工作台</h1>
                    <p>面试管理功能</p>
                </div>
                <div class="auth-card">
                    <h3>功能开发中</h3>
                    <p>面试官功能正在开发中，敬请期待...</p>
                    <div style="margin-top: 20px;">
                        <button class="btn btn-primary" onclick="Router.navigateTo('#home')">
                            返回首页
                        </button>
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
                        <button class="btn btn-primary" onclick="Router.navigateTo('#home')">
                            返回首页
                        </button>
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
                    <div style="margin-top: 15px;">
                        <button class="btn btn-primary" onclick="location.reload()" style="margin-right: 10px;">
                            刷新页面
                        </button>
                        <button class="btn btn-outline" onclick="Router.navigateTo('#home')">
                            返回首页
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // 更新导航激活状态
    updateActiveNav() {
        setTimeout(() => {
            const currentRoute = this.currentRoute;
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href && currentRoute.startsWith(href.slice(1))) {
                    link.classList.add('active');
                }
            });
        }, 100);
    },

    // 导航到指定路由
    navigateTo(route) {
        console.log('导航到:', route);
        window.location.hash = route;
    },

    // 获取当前路由参数
    getRouteParams() {
        const segments = this.currentRoute.split('/');
        return segments.slice(1);
    },

    // 退出登录
    logout() {
        localStorage.removeItem('currentUser');
        this.navigateTo('#home');
        setTimeout(() => location.reload(), 100);
    }
};

// 暴露给全局
window.Router = Router;

// 初始化路由
document.addEventListener('DOMContentLoaded', () => {
    Router.init();
});