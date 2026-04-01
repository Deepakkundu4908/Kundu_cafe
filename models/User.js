/**
 * User Model
 */
class User {
  constructor(id, username, email, collegeEmail, collegeId, password, role = 'student') {
    this.id = id;
    this.username = username;
    this.email = email;
    this.collegeEmail = collegeEmail;
    this.collegeId = collegeId;
    this.password = password;
    this.role = role; // 'student' or 'admin'
    this.walletBalance = 0;
    this.isEmailVerified = false;
    this.resetPasswordToken = null;
    this.resetPasswordExpire = null;
    this.createdAt = new Date();
  }
}

module.exports = User;
