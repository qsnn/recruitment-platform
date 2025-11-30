// javascript
// scripts/login-page.js
const LoginPage = {
    init() {
        const loginForm = document.getElementById('login-form');
        if (!loginForm) {
            console.warn('登录表单未找到，可能页面还没渲染好');
            return;
        }

        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');
        const usernameError = document.getElementById('login-username-error');
        const passwordError = document.getElementById('login-password-error');
        const globalError = document.getElementById('login-global-error');

        function validateUsername(username) {
            return username && username.trim().length >= 3;
        }

        function validatePassword(password) {
            return password.length >= 6;
        }

        usernameInput.addEventListener('blur', function() {
            if (!validateUsername(this.value)) {
                usernameError.textContent = '请输入至少 3 位的用户名';
                usernameError.classList.add('show');
                this.classList.add('error');
            } else {
                usernameError.textContent = '';
                usernameError.classList.remove('show');
                this.classList.remove('error');
            }
        });

        passwordInput.addEventListener('blur', function() {
            if (!validatePassword(this.value)) {
                passwordError.textContent = '密码长度至少6位';
                passwordError.classList.add('show');
                this.classList.add('error');
            } else {
                passwordError.textContent = '';
                passwordError.classList.remove('show');
                this.classList.remove('show');
                this.classList.remove('error');
            }
        });

        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const username = usernameInput.value;
            const password = passwordInput.value;

            // 清空旧错误
            usernameError.textContent = '';
            usernameError.classList.remove('show');
            passwordError.textContent = '';
            passwordError.classList.remove('show');
            globalError.textContent = '';
            globalError.classList.remove('show');
            usernameInput.classList.remove('error');
            passwordInput.classList.remove('error');

            if (!validateUsername(username)) {
                usernameError.textContent = '请输入至少 3 位的用户名';
                usernameError.classList.add('show');
                usernameInput.classList.add('error');
                return;
            }

            if (!validatePassword(password)) {
                passwordError.textContent = '密码长度至少6位';
                passwordError.classList.add('show');
                passwordInput.classList.add('error');
                return;
            }

            try {
                const result = await AuthService.login({
                    username: username,
                    password: password
                });

                globalError.textContent = '';
                Router.navigateTo('#candidate/job-search');
            } catch (error) {
                const msg = error && error.message ? error.message : '登录失败，请检查用户名和密码';

                passwordError.textContent = msg;
                passwordError.classList.add('show');
                passwordInput.classList.add('error');

                globalError.textContent = msg;
                globalError.classList.add('show');

                console.error('登录失败:', msg);
            }
        });
    }
};