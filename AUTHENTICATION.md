# Kundu Cafe - Enterprise Authentication & Security Implementation

## Overview
This document outlines the enhanced security features and role-based access control implementation for the Kundu Cafe digital canteen platform.

## Features Implemented

### 1. **College-Based Registration**
✅ **Student Registration with College Credentials**
- Students register using college email (e.g., student@college.edu)
- College ID verification (e.g., CSE2023001)
- Email confirmation workflow
- Role-based assignment (Student vs Admin)

**Endpoint:** `POST /auth/signup`

**Required Fields:**
```json
{
  "username": "John Doe",
  "email": "john@email.com",
  "collegeEmail": "john2023@college.edu",
  "collegeId": "CSE2023001",
  "password": "securePassword123",
  "passwordConfirm": "securePassword123"
}
```

### 2. **JWT-Based Authentication**
✅ **Secure Token-Based Authentication**
- JSON Web Tokens (JWT) for stateless authentication
- Tokens stored in secure HTTP-only cookies
- No session storage required
- Works across multiple devices seamlessly
- 7-day token expiration by default

**How It Works:**
1. User logs in with email/college email and password
2. System validates credentials
3. JWT token is generated and stored in HTTP-only cookie
4. Token automatically sent with each request
5. Middleware verifies token validity on protected routes

**Token Structure:**
```javascript
{
  id: "user_id",
  username: "user_name",
  email: "user@email.com",
  role: "student" | "admin"
}
```

### 3. **Role-Based Access Control (RBAC)**
✅ **Automatic Role Identification**

**Student Role:**
- Browse products
- Add items to cart
- Place orders
- View order history
- Manage profile
- Access: `/products`, `/cart`, `/orders`

**Admin Role:**
- All student features +
- Dashboard with statistics
- Manage products (CRUD)
- Manage orders and statuses
- User management
- Access: `/admin`, `/admin/items`, `/admin/orders`

**Endpoint:** Automatic redirect based on role after login

### 4. **Password Recovery & Reset**
✅ **Secure Email-Based Password Recovery**

**Features:**
- User-initiated password reset
- Secure reset token (32-bit random + SHA256 hash)
- Email-based verification
- 15-minute token expiration for security
- Password confirmation validation

**Recovery Flow:**
1. User visits `/auth/forgot-password`
2. Enters email address
3. System generates secure reset token
4. Email sent with reset link
5. User clicks link and sets new password
6. Password updated and token invalidated

**Endpoints:**
- `GET /auth/forgot-password` - Forgot password form
- `POST /auth/forgot-password` - Initiate recovery
- `GET /auth/reset-password/:token` - Reset form
- `POST /auth/reset-password/:token` - Update password

### 5. **Security Features**

#### Password Security
- Bcrypt password hashing (10 rounds)
- No plain-text password storage
- Password confirmation validation
- Strong password recommendations

#### Token Security
- HTTP-only cookies (prevents XSS attacks)
- Secure flag in production
- JWT signature verification
- Token expiration handling

#### Email Security
- Gmail SMTP integration
- Environment-based credentials
- Welcome emails for new users
- Marketing-free communication

#### Data Protection
- Unique college ID enforcement
- Email uniqueness validation
- Proper error handling
- Session isolation

## Configuration

### Environment Variables (.env)
```env
# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
JWT_EXPIRE=7d

# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@kunducafe.com

# Password Reset
PASSWORD_RESET_EXPIRE=15m
```

### Gmail App Password Setup
1. Enable 2-factor authentication on Gmail
2. Generate app-specific password
3. Use in `EMAIL_PASSWORD` instead of actual Gmail password

## API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/auth/login` | Login page | No |
| POST | `/auth/login` | Process login | No |
| GET | `/auth/signup` | Registration page | No |
| POST | `/auth/signup` | Create account | No |
| GET | `/auth/logout` | Logout user | Yes |
| GET | `/auth/forgot-password` | Forgot password page | No |
| POST | `/auth/forgot-password` | Send reset email | No |
| GET | `/auth/reset-password/:token` | Reset password page | No |
| POST | `/auth/reset-password/:token` | Update password | No |

### Protected Routes (Require Authentication)

**Student Routes:**
- `/products` - Browse items
- `/cart` - Shopping cart
- `/orders` - Order history
- `/orders/:id` - Order details

**Admin Routes:**
- `/admin` - Dashboard
- `/admin/items` - Manage products
- `/admin/orders` - Manage orders

## Middleware

### verifyToken
- Checks for valid JWT in cookies
- Extracts user information
- Attaches user to request object

### authMiddleware
- Requires valid JWT token
- Redirects to login if absent
- Sets res.locals.user for views

### adminMiddleware
- Requires valid JWT token
- Verifies admin role
- Returns 403 error if unauthorized

### studentMiddleware
- Requires valid JWT token
- Verifies student role
- Redirects to login if absent

## User Model Updates

```javascript
{
  id: Number,
  username: String,
  email: String,
  collegeEmail: String,      // NEW
  collegeId: String,          // NEW
  password: String (hashed),
  role: String ("student" | "admin"),
  isEmailVerified: Boolean,   // NEW
  resetPasswordToken: String, // NEW
  resetPasswordExpire: Date,  // NEW
  createdAt: Date
}
```

## Views Created

1. `signup.ejs` - Registration with college details
2. `login.ejs` - Login form with forgot password link
3. `forgot-password.ejs` - Password recovery initiation
4. `reset-password.ejs` - New password entry
5. `reset-password-success.ejs` - Confirmation page

## Dependencies Added

```json
{
  "jsonwebtoken": "^9.1.2",
  "nodemailer": "^6.9.7",
  "cookie-parser": "^1.4.6",
  "crypto": "^1.0.1"
}
```

## Installation & Setup

```bash
# Install dependencies
npm install

# Configure .env file
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Start production server
npm start
```

## Testing the Features

### 1. Test Student Registration
```bash
POST http://localhost:3000/auth/signup
Body: {
  "username": "Test Student",
  "email": "student@example.com",
  "collegeEmail": "student@college.edu",
  "collegeId": "CSE2023001",
  "password": "TestPass123",
  "passwordConfirm": "TestPass123"
}
```

### 2. Test Login
```bash
POST http://localhost:3000/auth/login
Body: {
  "email": "student@college.edu",
  "password": "TestPass123"
}
```

### 3. Test Password Reset
```bash
# Request reset
POST http://localhost:3000/auth/forgot-password
Body: { "email": "student@college.edu" }

# Check email for reset link (format: /auth/reset-password/TOKEN)

# Reset password
POST http://localhost:3000/auth/reset-password/TOKEN
Body: {
  "password": "NewPassword123",
  "passwordConfirm": "NewPassword123"
}
```

## Security Best Practices

1. ✅ Always use HTTPS in production
2. ✅ Keep JWT_SECRET strong and unique
3. ✅ Regularly update dependencies
4. ✅ Use rate limiting on login attempts
5. ✅ Implement CSRF protection
6. ✅ Log security events
7. ✅ Audit user activities
8. ✅ Backup user data regularly

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Social login (Google, Microsoft)
- [ ] Email verification on signup
- [ ] Account lockout after failed attempts
- [ ] Password strength meter
- [ ] Session management dashboard
- [ ] Device tracking
- [ ] Audit logs

## Support & Documentation

For issues or questions:
- Check configuration in `.env`
- Review email service settings
- Verify JWT secret is set correctly
- Check browser console for errors
- Review server logs for details

---

**Version:** 1.0.0  
**Last Updated:** April 1, 2026  
**Maintainer:** Kundu Cafe Team
