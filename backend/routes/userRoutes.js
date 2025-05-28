const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, googleAuth, forgotPassword, resetPassword } = require('../controllers/userController');
const { protect } = require('../middleware/checkAuth');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// 🔐 Auth Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-auth', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// 🛡 Protected Routes
router.get('/logout', protect, logoutUser);
router.get('/admin', protect, authorizeRoles('admin'), (req, res) => {
    console.log('👤 Authenticated User:', req.user);
    res.json({ message: 'Welcome Admin', user: req.user });
  });
  

router.get('/user', protect, authorizeRoles('user'), (req, res) => {
  res.json({ message: 'Welcome User', user: req.user });
});

module.exports = router;
