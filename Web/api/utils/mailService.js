const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

exports.sendOTPEmail = async (email, otpCode) => {
    const mailOptions = {
        from: `"NobleMart" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your NobleMart Verification Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1e40af;">Email Verification</h2>
                <p>Your verification code is:</p>
                <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e40af;">
                    ${otpCode}
                </div>
                <p style="color: #6b7280; font-size: 14px;">This code expires in 15 minutes.</p>
                <p style="color: #6b7280; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
            </div>
        `
    };

    return await transporter.sendMail(mailOptions);
};

exports.sendWelcomeEmail = async (email, fullName) => {
    const mailOptions = {
        from: `"NobleMart" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Welcome to NobleMart!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1e40af;">Welcome to NobleMart, ${fullName}!</h2>
                <p>Thank you for joining Nigeria's premium marketplace.</p>
                <p>Your vendor application is now under review. We'll notify you once it's approved.</p>
                <a href="${process.env.FRONTEND_URL}" style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">Visit NobleMart</a>
            </div>
        `
    };

    return await transporter.sendMail(mailOptions);
};
