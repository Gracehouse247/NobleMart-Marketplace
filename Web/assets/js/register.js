document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('vendorRegisterForm');
    const steps = document.querySelectorAll('.step-container');
    const stepDots = document.querySelectorAll('.step-dot');
    const progressBar = document.getElementById('progressBar');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const stepTitle = document.getElementById('stepTitle');
    const stepSubtitle = document.getElementById('stepSubtitle');

    let currentStep = 1;
    let emailVerified = false;

    const stepTitles = {
        1: { title: "Let's get started!", subtitle: "Tell us about yourself to begin your journey." },
        2: { title: "Your Business Details", subtitle: "Help customers find and trust your store." },
        3: { title: "Brand Identity", subtitle: "Upload your logo to stand out." },
        4: { title: "Verification (KYC)", subtitle: "Secure your account with identity verification." },
        5: { title: "Almost There!", subtitle: "Create a secure password to protect your account." }
    };

    // OTP Handling
    document.getElementById('sendOtpBtn').addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        if (!email) return alert('Please enter your email');

        const btn = document.getElementById('sendOtpBtn');
        btn.disabled = true;
        btn.textContent = 'Sending...';

        try {
            const response = await fetch('https://api.noblemart.com.ng/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                document.getElementById('otpGroup').style.display = 'block';
                document.getElementById('otpMessage').textContent = '✓ Code sent! Check your email.';
                document.getElementById('otpMessage').style.color = '#10b981';
            } else {
                alert(data.message || 'Failed to send OTP');
            }
        } catch (error) {
            alert('Connection error. Please try again.');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Resend';
        }
    });

    document.getElementById('verifyOtpBtn').addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const otp = document.getElementById('otpCode').value;

        if (!otp || otp.length !== 6) return alert('Please enter the 6-digit code');

        const btn = document.getElementById('verifyOtpBtn');
        btn.disabled = true;
        btn.textContent = 'Verifying...';

        try {
            const response = await fetch('https://api.noblemart.com.ng/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });

            const data = await response.json();

            if (response.ok) {
                emailVerified = true;
                document.getElementById('otpMessage').textContent = '✓ Email verified successfully!';
                document.getElementById('otpMessage').style.color = '#10b981';
                document.getElementById('email').disabled = true;
                btn.textContent = 'Verified ✓';
                btn.style.background = '#10b981';
            } else {
                document.getElementById('otpMessage').textContent = '✗ ' + (data.message || 'Invalid code');
                document.getElementById('otpMessage').style.color = '#ef4444';
                btn.disabled = false;
                btn.textContent = 'Verify';
            }
        } catch (error) {
            alert('Connection error. Please try again.');
            btn.disabled = false;
            btn.textContent = 'Verify';
        }
    });

    // Step Navigation
    function updateStep() {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index + 1 === currentStep);
        });

        stepDots.forEach((dot, index) => {
            dot.classList.toggle('active', index + 1 <= currentStep);
        });

        const progress = (currentStep / steps.length) * 100;
        progressBar.style.width = `${progress}%`;

        stepTitle.textContent = stepTitles[currentStep].title;
        stepSubtitle.textContent = stepTitles[currentStep].subtitle;

        prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
        nextBtn.textContent = currentStep === steps.length ? 'Submit Application' : 'Continue';
    }

    nextBtn.addEventListener('click', async () => {
        if (currentStep === 1 && !emailVerified) {
            return alert('Please verify your email before continuing');
        }

        if (currentStep < steps.length) {
            currentStep++;
            updateStep();
        } else {
            // Submit form
            await submitForm();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateStep();
        }
    });

    async function submitForm() {
        const formData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            shopName: document.getElementById('shopName').value,
            shopDescription: document.getElementById('shopDescription').value,
            address: document.getElementById('address').value,
            password: document.getElementById('password').value
        };

        nextBtn.disabled = true;
        nextBtn.textContent = 'Submitting...';

        try {
            const response = await fetch('https://api.noblemart.com.ng/auth/register-vendor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Success! Your application has been submitted. We will review it within 24 hours.');
                window.location.href = 'login.html';
            } else {
                alert(data.message || 'Registration failed');
                nextBtn.disabled = false;
                nextBtn.textContent = 'Submit Application';
            }
        } catch (error) {
            alert('Connection error. Please try again.');
            nextBtn.disabled = false;
            nextBtn.textContent = 'Submit Application';
        }
    }

    // Logo Upload Preview
    const logoInput = document.getElementById('shopLogo');
    const previewContainer = document.getElementById('previewContainer');
    const previewImg = document.getElementById('previewImg');
    const fileName = document.getElementById('fileName');

    if (logoInput) {
        logoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImg.src = e.target.result;
                    fileName.textContent = file.name;
                    previewContainer.classList.add('active');
                };
                reader.readAsDataURL(file);
            }
        });

        document.getElementById('removeLogo')?.addEventListener('click', () => {
            logoInput.value = '';
            previewContainer.classList.remove('active');
        });
    }

    updateStep();
});
