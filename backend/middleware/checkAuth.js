const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return next();
  }

  let token;

  // Check if the authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the authorization header
      token = req.headers.authorization.split(' ')[1];
      
      if (!token) {
        console.log("No token provided after 'Bearer'");
        return res.status(401).json({ 
          success: false,
          message: 'No authentication token provided' 
        });
      }

      console.log("Incoming token:", token ? `${token.substring(0, 10)}...` : 'No token');

      // Verify the token using JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", { 
        id: decoded.id, 
        iat: decoded.iat, 
        exp: decoded.exp 
      });

      // Find the user by the decoded ID
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        console.log("User not found in the database");
        return res.status(401).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      console.log("User found:", { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      });

      // Check if token version matches the one in the database
      if (user.tokenVersion !== decoded.tokenVersion) {
        console.log("Token version mismatch. Expected:", user.tokenVersion, "Got:", decoded.tokenVersion);
        return res.status(401).json({ 
          success: false,
          message: 'Session expired. Please log in again.' 
        });
      }

      // Check if the user's status is active
      // Temporarily bypassing this check to allow inactive users
      if (false && user.status !== 'active') {
        console.log("User account is not active:", user.status);
        return res.status(403).json({ 
          success: false,
          message: 'Your account is not active. Please contact support.' 
        });
      }
      
      console.log("Status check bypassed for testing - allowing user with status:", user.status);

      // If everything is valid, attach the user to the request object
      req.user = user;
      next();
    } catch (err) {
      console.error("JWT verification error:", {
        name: err.name,
        message: err.message,
        expiredAt: err.expiredAt
      });
      
      let errorMessage = 'Not authorized';
      let statusCode = 401;
      
      if (err.name === 'TokenExpiredError') {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (err.name === 'JsonWebTokenError') {
        errorMessage = 'Invalid token';
      } else if (err.name === 'NotBeforeError') {
        errorMessage = 'Token not active';
      } else {
        statusCode = 500;
        errorMessage = 'Authentication error';
      }
      
      return res.status(statusCode).json({ 
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  } else {
    console.log("No Bearer token found in the request header");
    return res.status(401).json({ 
      success: false,
      message: 'No authentication token provided' 
    });
  }
};

module.exports = {protect};
