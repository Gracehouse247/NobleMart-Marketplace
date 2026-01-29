const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { sendOTPEmail, sendWelcomeEmail } = require('../utils/mailService');

// Send OTP
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Delete old OTPs for this email
        await db.query('DELETE FROM email_otps WHERE email = ?', [email]);

        // Insert new OTP
        await db.query(
            'INSERT INTO email_otps (email, otp_code, expires_at) VALUES (?, ?, ?)',
            [email, otpCode, expiresAt]
        );

        // Send email
        await sendOTPEmail(email, otpCode);

        res.json({ message: 'OTP sent successfully to your email' });
    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ message: 'Failed to send OTP', error: error.message });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const [rows] = await db.query(
            'SELECT * FROM email_otps WHERE email = ? AND otp_code = ? AND expires_at > NOW()',
            [email, otp]
        );

        if (rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Delete used OTP
        await db.query('DELETE FROM email_otps WHERE email = ?', [email]);

        res.json({ message: 'Email verified successfully', verified: true });
    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ message: 'Verification failed', error: error.message });
    }
};

// Register Vendor
exports.registerVendor = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, shopName, shopDescription, address, password } = req.body;

        // Check if user exists
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const [userResult] = await db.query(
            'INSERT INTO users (full_name, email, phone_number, password_hash, role) VALUES (?, ?, ?, ?, ?)',
            [fullName, email, phoneNumber, passwordHash, 'vendor']
        );

        const userId = userResult.insertId;

        // Create vendor profile
        await db.query(
            'INSERT INTO vendors (user_id, shop_name, shop_description, address, status) VALUES (?, ?, ?, ?, ?)',
            [userId, shopName, shopDescription, address, 'pending']
        );

        // Create wallet
        await db.query('INSERT INTO wallets (user_id, balance) VALUES (?, 0.00)', [userId]);

        // Send welcome email
        await sendWelcomeEmail(email, fullName);

        res.status(201).json({ message: 'Vendor registration successful! Your application is under review.' });
    } catch (error) {
        console.error('Register Vendor Error:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};
