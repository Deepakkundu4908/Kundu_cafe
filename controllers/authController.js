const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const storage = require('../storage');
const User = require('../models/User');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../config/email');

/**
 * Authentication Controller with JWT
 */

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your_jwt_secret_key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// User Registration with College Email and ID
exports.signup = (req, res) => {
  try {
    const { username, email, collegeEmail, collegeId, password, passwordConfirm } = req.body;

    // Validation
    if (!username || !email || !collegeEmail || !collegeId || !password || !passwordConfirm) {
      return res.status(400).render('signup', {
        message: 'Please provide all required fields',
        user: null
      });
    }

    // Check if passwords match
    if (password !== passwordConfirm) {
      return res.status(400).render('signup', {
        message: 'Passwords do not match',
        user: null
      });
    }

    // Check if email is a valid college email from iitd.ac.in
    const collegeEmailRegex = /^[a-zA-Z0-9._%+-]+@iitd\.ac\.in$/;
    if (!collegeEmailRegex.test(collegeEmail)) {
      return res.status(400).render('signup', {
        message: 'Please provide a valid college email address from the iitd.ac.in domain.',
        user: null
      });
    }

    // Validate college ID format
    const collegeIdRegex = /^[A-Z]{3}\d{4}\d{3}$/;
    if (!collegeIdRegex.test(collegeId)) {
      return res.status(400).render('signup', {
        message: 'Please provide a valid College ID in the format (e.g., CSE2023001).',
        user: null
      });
    }

    const users = storage.getUsers();

    // Check if user already exists
    if (users.find(u => u.email === email || u.collegeEmail === collegeEmail)) {
      return res.status(400).render('signup', {
        message: 'Email is already registered',
        user: null
      });
    }

    // Check if college ID already exists
    if (users.find(u => u.collegeId === collegeId)) {
      return res.status(400).render('signup', {
        message: 'College ID is already registered',
        user: null
      });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const newUser = new User(
      Date.now(),
      username,
      email,
      collegeEmail,
      collegeId,
      hashedPassword,
      'student'
    );

    users.push(newUser);
    storage.saveUsers(users);

    // Send welcome email
    sendWelcomeEmail(collegeEmail, username);

    // Generate token
    const token = generateToken(newUser);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(201).redirect('/');
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).render('signup', {
      message: 'An error occurred during signup',
      user: null
    });
  }
};

// User Login with JWT
exports.login = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).render('login', {
        message: 'Please provide email and password',
        user: null
      });
    }

    const users = storage.getUsers();
    const user = users.find(u => u.email === email || u.collegeEmail === email);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).render('login', {
        message: 'Invalid email or password',
        user: null
      });
    }

    // Generate JWT Token
    const token = generateToken(user);

    // Set secure cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Redirect based on role
    if (user.role === 'admin') {
      return res.redirect('/admin');
    } else {
      return res.redirect('/');
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).render('login', {
      message: 'An error occurred during login',
      user: null
    });
  }
};

// User Logout
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
};

// Render login page
exports.getLogin = (req, res) => {
  res.render('login', { user: null, message: null });
};

// Render signup page
exports.getSignup = (req, res) => {
  res.render('signup', { user: null, message: null });
};

// Forgot Password - Send Reset Email
exports.forgotPassword = (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).render('forgot-password', {
        message: 'Please provide an email address',
        user: null
      });
    }

    const users = storage.getUsers();
    const user = users.find(u => u.email === email || u.collegeEmail === email);

    if (!user) {
      return res.status(404).render('forgot-password', {
        message: 'No user found with this email address',
        user: null
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user with reset token
    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        return {
          ...u,
          resetPasswordToken: resetTokenHash,
          resetPasswordExpire: resetExpire
        };
      }
      return u;
    });

    storage.saveUsers(updatedUsers);

    // Send reset email
    const emailSent = sendPasswordResetEmail(
      user.email,
      resetToken,
      user.username
    );

    if (emailSent) {
      return res.status(200).render('forgot-password', {
        message: 'Password reset link sent to your email. Check your inbox.',
        user: null
      });
    } else {
      return res.status(500).render('forgot-password', {
        message: 'Error sending reset email. Please try again later.',
        user: null
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).render('forgot-password', {
      message: 'An error occurred. Please try again.',
      user: null
    });
  }
};

// Render forgot password page
exports.getForgotPassword = (req, res) => {
  res.render('forgot-password', { user: null, message: null });
};

// Reset Password
exports.resetPassword = (req, res) => {
  try {
    const { token } = req.params;
    const { password, passwordConfirm } = req.body;

    if (!password || !passwordConfirm) {
      return res.status(400).render('reset-password', {
        message: 'Please provide password and confirmation',
        token,
        user: null
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).render('reset-password', {
        message: 'Passwords do not match',
        token,
        user: null
      });
    }

    // Hash reset token to find user
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const users = storage.getUsers();

    const user = users.find(
      u => u.resetPasswordToken === resetTokenHash && 
           new Date(u.resetPasswordExpire) > new Date()
    );

    if (!user) {
      return res.status(400).render('reset-password', {
        message: 'Password reset token is invalid or has expired',
        token,
        user: null
      });
    }

    // Update password
    const hashedPassword = bcrypt.hashSync(password, 10);

    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        return {
          ...u,
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpire: null
        };
      }
      return u;
    });

    storage.saveUsers(updatedUsers);

    return res.status(200).render('reset-password-success', { user: null });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).render('reset-password', {
      message: 'An error occurred. Please try again.',
      token: req.params.token,
      user: null
    });
  }
};

// Render reset password page
exports.getResetPassword = (req, res) => {
  const { token } = req.params;
  res.render('reset-password', { token, user: null, message: null });
};
