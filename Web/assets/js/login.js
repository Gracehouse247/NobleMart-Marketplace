document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('vendorLoginForm');
    const loginBtn = document.getElementById('loginBtn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const originalText = loginBtn.textContent;

        loginBtn.disabled = true;
        loginBtn.textContent = 'Signing in...';

        try {
            const response = await fetch('https://api.noblemart.com.ng/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.user.role !== 'vendor') {
                    alert('Access denied. This portal is for vendors only.');
                    loginBtn.disabled = false;
                    loginBtn.textContent = originalText;
                    return;
                }

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                window.location.href = 'index.html';
            } else {
                alert(data.message || 'Login failed.');
            }
        } catch (error) {
            console.error('Login Error:', error);
            alert('Unable to connect to server.');
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = originalText;
        }
    });
});
