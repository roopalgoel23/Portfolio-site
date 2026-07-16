const express     = require('express');
const rateLimit   = require('express-rate-limit');
const router      = express.Router();

const adminController = require('../controllers/adminController');

// Brute-force protection: max 5 login attempts per 15 min per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' }
});

// Public (login itself is open, but rate-limited)
router.post('/admin/login', loginLimiter, adminController.login);

module.exports = router;
