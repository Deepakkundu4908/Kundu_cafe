# Admin Dashboard Setup & Credentials

## 🔐 Admin Access Information

### Demo Credentials
- **Email:** `admin@kunducafe.com`
- **Password:** `Admin@123`

### Access Points

#### 1. **Admin Login Page**
   - URL: `http://localhost:3002/auth/admin/login`
   - Direct admin login interface with demo credentials displayed
   - Features:
     - Pre-filled email address
     - Show/Hide password option
     - Copy to clipboard functionality
     - Security warnings for demo credentials

#### 2. **Admin Credentials Page**
   - URL: `http://localhost:3002/auth/admin/credentials`
   - Information display for admin credentials
   - Copy button for easy credential management

#### 3. **Main Login Page**
   - URL: `http://localhost:3002/auth/login`
   - Now includes "Admin Portal" link at the bottom
   - Directs to admin login for admins

#### 4. **Admin Panel (After Login)**
   - URL: `http://localhost:3002/admin`
   - Access restricted to users with `role: 'admin'`
   - Features:
     - Dashboard with statistics
     - Total products, orders, and users count
     - Recent orders table
     - Links to manage items and orders

---

## 📋 Features Implemented

### Admin Dashboard
✅ Display admin panel with statistics
✅ Show total products count
✅ Show total orders count
✅ Show total users count
✅ Display recent orders in a table

### Admin Login
✅ Dedicated admin login page
✅ Demo credentials displayed with show/hide toggle
✅ Copy to clipboard functionality
✅ Security warning about changing password
✅ Styled admin portal interface

### Admin Credentials Display
✅ Dedicated page to view admin credentials
✅ Copy buttons for each credential
✅ Toggle to show/hide password
✅ Info and warning alerts
✅ Navigation to admin login and home

### Navigation Updates
✅ Added "Admin" link in header for non-logged-in users
✅ Added "Admin Portal" link in main login page
✅ Admin link shows in header only for logged-in admin users

---

## 🔑 Admin User Details (Stored in `/data/users.json`)

```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@kunducafe.com",
  "password": "$2a$10$eX8kORRW7HGJYOvrosEaZOtGyGgvEKm0XEBp6bvbpIu.s/FCwwHWy",
  "role": "admin",
  "isEmailVerified": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 🛡️ Security Notes

⚠️ **Important:** These credentials are for **DEMO/DEVELOPMENT PURPOSES ONLY**

### Security Recommendations:
1. **Change the password immediately after first login** in production
2. Add two-factor authentication (2FA)
3. Store passwords in environment variables, not in code
4. Use HTTPS in production
5. Implement rate limiting on login attempts
6. Add audit logging for admin actions
7. Implement session timeout
8. Use stronger passwords in production

---

## 📱 Quick Links

| Page | URL | Description |
|------|-----|-------------|
| Admin Login | `/auth/admin/login` | Admin-only login page with credentials |
| Admin Credentials | `/auth/admin/credentials` | Display admin credentials |
| Admin Dashboard | `/admin` | Main admin panel (requires login) |
| Admin Items | `/admin/items` | Manage menu items |
| Admin Orders | `/admin/orders` | View and manage orders |
| Main Login | `/auth/login` | Regular user login |
| Home | `/` | Homepage with Admin link |

---

## 🚀 How to Login as Admin

1. Navigate to `http://localhost:3002/auth/admin/login`
2. The credentials are pre-populated or displayed on the page:
   - Email: `admin@kunducafe.com`
   - Password: `Admin@123`
3. Click "Login as Admin"
4. You'll be redirected to the admin dashboard at `/admin`

---

## ✨ Routes Added

### New Routes Created:
- `GET /auth/admin/login` - Admin login page
- `GET /auth/admin/credentials` - Admin credentials display page

Both routes are handled by simple render calls that display the respective EJS templates.

---

## 🎨 Styling Features

### Admin Login Page:
- Beautiful gradient background (purple/blue)
- Credentials info box with demo credentials
- Show/Hide password functionality
- Copy to clipboard buttons
- Responsive design
- Security warning boxes

### Admin Credentials Page:
- Clean card-based layout
- Copy buttons for each field
- Show/Hide password toggle
- Info and warning alerts
- Responsive buttons for navigation

---

## 📝 Notes

- The admin account is already created in the system
- Password is hashed using bcrypt (10 rounds)
- All admin routes are protected by JWT authentication
- Admin middleware checks for `role === 'admin'`
- Cookie-based authentication system
- Token expires in 7 days by default

---

## 🐛 Testing the Setup

1. Start the server: `npm start`
2. Open browser to `http://localhost:3002`
3. Click "Admin" in the header
4. You'll be taken to `/auth/admin/login`
5. Use the displayed credentials to login
6. After login, you'll have full admin access

---

**Last Updated:** April 2026
**Status:** ✅ Complete and Ready for Use
