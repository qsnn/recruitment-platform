const RegisterPage = {
    init() {
        const form = document.getElementById('register-form');
        if (!form) {
            console.warn('注册表单未找到');
            return;
        }

        const emailInput = document.getElementById('reg-email');
        const phoneInput = document.getElementById('reg-phone');
        const usernameInput = document.getElementById('reg-username');
        const realnameInput = document.getElementById('reg-realname');
        const pwdInput = document.getElementById('reg-password');
        const confirmInput = document.getElementById('confirm-password');
        const strengthBar = document.getElementById('password-strength-bar');

        const emailError = document.getElementById('reg-email-error');
        const phoneError = document.getElementById('reg-phone-error');
        const usernameError = document.getElementById('reg-username-error');
        const realnameError = document.getElementById('reg-realname-error');
        const pwdError = document.getElementById('reg-password-error');
        const confirmError = document.getElementById('confirm-error');

        function checkPasswordStrength(pwd) {
            let s = 0;
            if (pwd.length >= 8) s++;
            if (/[a-z]/.test(pwd)) s++;
            if (/[A-Z]/.test(pwd)) s++;
            if (/[0-9]/.test(pwd)) s++;
            if (/[^a-zA-Z0-9]/.test(pwd)) s++;
            return s;
        }

        pwdInput.addEventListener('input', () => {
            const s = checkPasswordStrength(pwdInput.value);
            strengthBar.className = 'strength-bar';
            if (s <= 2) strengthBar.classList.add('strength-weak');
            else if (s <= 4) strengthBar.classList.add('strength-medium');
            else strengthBar.classList.add('strength-strong');
        });

        confirmInput.addEventListener('blur', () => {
            if (confirmInput.value !== pwdInput.value) {
                confirmError.textContent = '两次输入的密码不一致';
                confirmError.classList.add('show');
            } else {
                confirmError.textContent = '';
                confirmError.classList.remove('show');
            }
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 清空错误
            [emailError, phoneError, usernameError, realnameError, pwdError, confirmError].forEach(el => {
                el.textContent = '';
                el.classList.remove('show');
            });

            const email = emailInput.value.trim();
            const phone = phoneInput.value.trim();
            const username = usernameInput.value.trim();
            const realname = realnameInput.value.trim();
            const pwd = pwdInput.value;
            const confirmPwd = confirmInput.value;

            let ok = true;

            if (!Utils.validateEmail(email)) {
                emailError.textContent = '请输入有效的邮箱地址';
                emailError.classList.add('show');
                ok = false;
            }

            if (!Utils.validatePhone(phone)) {
                phoneError.textContent = '请输入有效的手机号';
                phoneError.classList.add('show');
                ok = false;
            }

            if (username.length < 3) {
                usernameError.textContent = '用户名至少3个字符';
                usernameError.classList.add('show');
                ok = false;
            }

            if (realname.length === 0) {
                realnameError.textContent = '请输入真实姓名';
                realnameError.classList.add('show');
                ok = false;
            }

            if (checkPasswordStrength(pwd) < 3) {
                pwdError.textContent = '密码强度不足，请包含字母和数字';
                pwdError.classList.add('show');
                ok = false;
            }

            if (pwd !== confirmPwd) {
                confirmError.textContent = '两次输入的密码不一致';
                confirmError.classList.add('show');
                ok = false;
            }

            if (!ok) return;

            // 按后端接口要求构造请求体
            const body = {
                username: username,
                password: pwd,
                phone: phone,
                email: email,
                realName:realname,
                userType: 4,
                companyId: null
            };

            try {
                const result = await AuthService.register(body);
                if (result.code === 200) {
                    alert(result.message || '注册成功，请登录');
                    Router.navigateTo('#auth/login');
                } else {
                    alert(result.message || '注册失败');
                }
            } catch (err) {
                alert(err.message || '注册失败，请稍后重试');
            }
        });
    }
};
