const nodemailer = require('nodemailer');

/**
 * Email Service Configuration
 */

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const resetURL = `${process.env.APP_URL || 'http://localhost:3000'}/auth/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@kunducafe.com',
      to: email,
      subject: 'Password Reset Request - Kundu Cafe',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hi ${userName},</p>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <a href="${resetURL}" style="background-color: #6F4E37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
        <p>Or copy this link: ${resetURL}</p>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Kundu Cafe Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (email, userName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@kunducafe.com',
      to: email,
      subject: 'Welcome to Kundu Cafe!',
      html: `
        <h2>Welcome to Kundu Cafe, ${userName}!</h2>
        <p>Your account has been created successfully.</p>
        <p>You can now enjoy our digital canteen services:</p>
        <ul>
          <li>Browse our menu</li>
          <li>Place orders</li>
          <li>Track your orders</li>
          <li>Manage your wallet</li>
        </ul>
        <p>Login here: <a href="http://localhost:3000/auth/login">Kundu Cafe Login</a></p>
        <p>Best regards,<br>Kundu Cafe Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail
};
