const express = require('express');
const router = express.Router();
const { login, register, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Rute Publik
router.post('/login', login);
router.post('/register', register); 

// Rute Terproteksi
// login untuk bisa logout
router.get('/me', protect, getMe);
router.post('/logout', protect, logout); 

module.exports = router;