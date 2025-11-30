// API服务
const ApiService = {
    // 基础请求方法
    async request(url, options = {}) {
        const token = AuthService.getToken();
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };

        const config = { ...defaultOptions, ...options };

        try {
            // 模拟API调用 - 在实际项目中替换为真实的fetch调用
            console.log('API调用:', url, config);

            // 模拟网络延迟
            await new Promise(resolve => setTimeout(resolve, 500));

            // 这里返回模拟数据，实际项目中应该使用：
            // const response = await fetch(url, config);
            // if (!response.ok) throw new Error('API请求失败');
            // return await response.json();

            return this.getMockData(url, config);

        } catch (error) {
            console.error('API请求错误:', error);
            throw error;
        }
    },

    // 获取模拟数据
    getMockData(url, config) {
        // 认证相关
        if (url.includes('/auth/login')) {
            return {
                user: {
                    id: 1,
                    email: config.body.email,
                    name: config.body.email.split('@')[0],
                    role: 'candidate'
                },
                token: 'mock-jwt-token'
            };
        }

        // 职位相关
        if (url.includes('/jobs') && config.method === 'GET') {
            return {
                jobs: [
                    {
                        id: 1,
                        title: '前端开发工程师',
                        company: '某科技公司',
                        location: '北京',
                        salary: '¥20K-¥35K',
                        description: '负责公司前端项目开发，使用React/Vue等技术栈。',
                        requirements: '3年以上前端开发经验，精通React/Vue',
                        tags: ['React', 'Vue', 'JavaScript'],
                        postTime: '2024-01-15'
                    }
                ],
                total: 1
            };
        }

        // 默认返回空数据
        return { success: true };
    }
};

// 职位服务
const JobService = {
    // 搜索职位
    async searchJobs(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return await ApiService.request(`/api/jobs?${queryParams}`);
    },

    // 获取职位详情
    async getJobDetail(jobId) {
        return await ApiService.request(`/api/jobs/${jobId}`);
    },

    // 申请职位
    async applyJob(jobId) {
        if (!AuthService.isAuthenticated()) {
            throw new Error('请先登录');
        }

        return await ApiService.request(`/api/jobs/${jobId}/apply`, {
            method: 'POST'
        });
    },

    // 获取我的申请
    async getMyApplications() {
        return await ApiService.request('/api/applications/my');
    },

    // 发布职位（企业）
    async postJob(jobData) {
        return await ApiService.request('/api/employer/jobs', {
            method: 'POST',
            body: JSON.stringify(jobData)
        });
    },

    // 获取企业发布的职位
    async getEmployerJobs() {
        return await ApiService.request('/api/employer/jobs');
    },

    // 获取职位申请人
    async getJobApplicants(jobId) {
        return await ApiService.request(`/api/employer/jobs/${jobId}/applicants`);
    }
};

// 用户服务
const UserService = {
    // 获取用户信息
    async getUserProfile() {
        return await ApiService.request('/api/user/profile');
    },

    // 更新用户信息
    async updateUserProfile(profileData) {
        return await ApiService.request('/api/user/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    },

    // 上传简历
    async uploadResume(file) {
        const formData = new FormData();
        formData.append('resume', file);

        return await ApiService.request('/api/user/resume', {
            method: 'POST',
            headers: {}, // FormData会自动设置Content-Type
            body: formData
        });
    }
};