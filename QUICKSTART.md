# Quick Start Guide - Kundu Cafe Authentication Setup

## Prerequisites
- Node.js v14+ installed
- npm installed
- Gmail account (for email service)

## Step 1: Install Dependencies

```bash
cd /workspaces/Kundu_cafe
npm install
```

This will install all required packages including:
- `jsonwebtoken` - JWT token management
- `nodemailer` - Email service
- `cookie-parser` - Cookie handling
- `bcryptjs` - Password encryption

## Step 2: Configure Environment Variables

Create/Edit `.env` file in project root:

```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=your_session_secret_key_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=kundu_cafe

# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@kunducafe.com

# Password Reset
PASSWORD_RESET_EXPIRE=15m
```

## Step 3: Setup Gmail for Email Service

### Option A: Using Gmail App Password (Recommended)

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **Security** in left sidebar
3. Enable **2-Step Verification** if not already enabled
4. Go back to Security → **App passwords**
5. Select: Mail → Windows Computer (or Android Device)
6. Google generates a 16-character app password
7. Copy this password to `.env` as `EMAIL_PASSWORD`

### Option B: Using Gmail Less Secure Apps

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Scroll down to **Less secure app access**
3. Turn ON "Allow less secure apps"
4. Use your regular Gmail password in `.env`

⚠️ **Note:** Google recommends App Passwords for security

## Step 4: Generate Strong JWT Secret

```bash
# Run this in terminal to generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output to `JWT_SECRET` in `.env`

## Step 5: Start the Application

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will start on `http://localhost:3000`

## Step 6: Test the Features

### 1. Register a Student
- Visit `http://localhost:3000/auth/signup`
- Fill in:
  - Full Name: John Doe
  - Email: john@example.com
  - College Email: john2023@college.edu
  - College ID: CSE2023001
  - Password: TestPass123
  - Confirm Password: TestPass123
- Click "Sign Up"
- Check configured email for welcome message

### 2. Login
- Visit `http://localhost:3000/auth/login`
- Email: john2023@college.edu (or john@example.com)
- Password: TestPass123
- Click Login

### 3. Test Password Recovery
- Click "Forgot your password?" on login page
- Enter college email
- Check email for reset link
- Click link and set new password
- Login with new password

### 4. Browse Products
- After login, click "Products" in navbar
- Browse available items
- Add items to cart

### 5. Place Order
- Click Cart icon
- Review items
- Click "Proceed to Checkout"
- Order created successfully

## Troubleshooting

### Email Not Sending
```
❌ Problem: Emails not received
✅ Solution: 
   - Verify EMAIL_USER is correct
   - Check EMAIL_PASSWORD is app-specific password
   - Enable 2-factor authentication on Gmail
   - Check EMAIL_FROM is valid
   - Check logs for nodemailer errors
```

### JWT Token Issues
```
❌ Problem: "Invalid token" error
✅ Solution:
   - Clear browser cookies
   - Restart server
   - Verify JWT_SECRET in .env
   - Check token expiration time
```

### Registration Fails
```
❌ Problem: Can't create account
✅ Solution:
   - Verify college email format
   - Check college ID is unique
   - Ensure password matches confirmation
   - Check server logs for errors
```

### Can't Login
```
❌ Problem: "Invalid email or password"
✅ Solution:
   - Use college email (not regular email)
   - Check password is correct
   - Verify user is registered
   - Clear browser cache
```

## File Structure

```
kundu_cafe/
├── config/
│   ├── database.js
│   └── email.js                 # Email configuration
├── controllers/
│   └── authController.js        # Authentication logic (JWT)
├── middleware/
│   └── authMiddleware.js        # JWT verification
├── routes/
│   └── authRoutes.js           # Auth endpoints
├── views/
│   ├── login.ejs               # Login form
│   ├── signup.ejs              # Registration form
│   ├── forgot-password.ejs     # Password recovery
│   ├── reset-password.ejs      # Password reset
│   └── reset-password-success.ejs
├── .env                        # Configuration (CREATE THIS)
├── server.js                   # Main server file
├── AUTHENTICATION.md           # Full documentation
└── IMPLEMENTATION_SUMMARY.md   # Implementation details
```

## Security Features Enabled

✅ JWT-based stateless authentication  
✅ HTTP-only secure cookies  
✅ Bcrypt password hashing (10 rounds)  
✅ College email verification  
✅ College ID uniqueness  
✅ 7-day token expiration  
✅ 15-minute password reset expiration  
✅ SHA256 token hashing  
✅ Email-based password recovery  
✅ Role-based access control  

## Common Commands

```bash
# Start development server
npm run dev

# Start production server
npm start

# Install dependencies
npm install

# Update dependencies
npm update

# Check for vulnerabilities
npm audit
```

## API Testing with cURL

```bash
# Register
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username":"John Doe",
    "email":"john@example.com",
    "collegeEmail":"john@college.edu",
    "collegeId":"CSE2023001",
    "password":"TestPass123",
    "passwordConfirm":"TestPass123"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"john@college.edu",
    "password":"TestPass123"
  }'

# Forgot Password
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"john@college.edu"}'
```

## Next Steps

1. ✅ Deploy to production server
2. ✅ Use strong JWT_SECRET in production
3. ✅ Enable HTTPS in production
4. ✅ Setup database migration (if upgrading from JSON)
5. ✅ Implement rate limiting on login
6. ✅ Add 2FA (two-factor authentication)
7. ✅ Setup email templates
8. ✅ Configure logging system
9. ✅ Setup monitoring & alerts
10. ✅ Regular security audits

## Support

For issues:
1. Check `.env` configuration
2. Review browser console errors
3. Check server logs
4. Read AUTHENTICATION.md
5. Read IMPLEMENTATION_SUMMARY.md

---

**Version:** 1.0.0  
**Last Updated:** April 1, 2026  
**Status:** ✅ Ready for Deployment
