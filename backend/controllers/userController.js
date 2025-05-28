const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
dotenv.config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Configure nodemailer transporter
// For Gmail, you might need to enable "Less secure app access" or use App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com', // fallback for development
    pass: process.env.EMAIL_PASSWORD || 'your-email-password' // fallback for development
  }
});

const generateToken = (id, tokenVersion) => {
  return jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Function to send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  // Create reset URL - make sure this matches your frontend reset password route
  const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: email,
    subject: 'Password Reset - Inventory Management System',
    html: `
      <h1>Password Reset</h1>
      <p>You requested a password reset for your Inventory Management System account.</p>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
      <p>Thank you,<br>Inventory Management Team</p>
    `
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent: ', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email: ', error);
    return false;
  }
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body; // 🔒 no role from client

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'user', // ✅ set role server-side
  });

  const token = generateToken(user._id, user.tokenVersion);

  res.status(201).json({
    token,
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
    }
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid email' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

  const token = generateToken(user._id, user.tokenVersion);

  res.json({
    token,
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
    }
  });
};

const logoutUser = async (req, res) => {
  const user = await User.findById(req.user._id);
  
  // Increment token version to invalidate current tokens
  user.tokenVersion += 1;
  user.status = 'inactive';
  await user.save();
  
  res.json({ message: 'Logged out successfully' });
};

const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    
    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { name, email, picture } = payload;
    
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create a new user if they don't exist
      // Generate a random secure password since they won't use it
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'user',
        profilePicture: picture,
        authProvider: 'google'
      });
    }
    
    // Generate JWT token
    const token = generateToken(user._id, user.tokenVersion);
    
    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

// Generate a random token
const createResetToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

// Forgot Password - Send reset token
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('Processing forgot password request for email:', email);
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate reset token and set expiration (1 hour)
    const resetToken = createResetToken();
    const resetExpires = Date.now() + 3600000; // 1 hour
    
    // Save token and expiry to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();
    
    // Send the password reset email
    const emailSent = await sendPasswordResetEmail(email, resetToken);
    
    if (emailSent) {
      res.json({ 
        message: 'Password reset email sent successfully. Please check your inbox.',
        success: true 
      });
    } else {
      // Even if email fails, we don't want to expose this to client for security
      // But we log it server-side
      console.error('Failed to send password reset email to:', email);
      res.json({ 
        message: 'Password reset instructions sent to your email.',
        success: true
        // For development/debugging
        // resetToken: resetToken,
        // resetLink: `http://localhost:5173/reset-password/${resetToken}`
      });
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error', success: false });
  }
};

// Reset Password - Use token to set new password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Find user with valid token and not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user's password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    // Increment token version to invalidate old tokens
    user.tokenVersion += 1;
    
    await user.save();
    
    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  googleAuth,
  forgotPassword,
  resetPassword
};
