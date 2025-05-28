// const jwt = require('jsonwebtoken');
// const User = require('../models/userModel');
const dotenv = require('dotenv');
dotenv.config();


const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log("User does not have permission for this resource. Role:", req.user.role);  // Debugging log
      return res.status(403).json({ message: 'You do not have permission to access this resource' });
    }
    next();
  };
};
  
  module.exports = { authorizeRoles };
  