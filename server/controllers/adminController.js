const bcrypt = require('bcryptjs');
const jwt   = require('jsonwebtoken');

/**
 * POST /api/admin/login
 * Body: { email, password }
 * Compares against ADMIN_EMAIL / ADMIN_PASSWORD from .env.
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const adminEmail    = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return res.status(500).json({ message: 'Admin credentials not configured.' });
    }

    // Validate email (case-insensitive)
    if (email.toLowerCase() !== adminEmail.toLowerCase()) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Validate password — supports both plain text and bcrypt hash
    let isMatch = false;
    const looksLikeHash = adminPassword.startsWith('$2a$') || adminPassword.startsWith('$2b$') || adminPassword.startsWith('$2y$');

    if (looksLikeHash) {
      isMatch = await bcrypt.compare(password, adminPassword);
    } else {
      isMatch = password === adminPassword;
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { email: adminEmail, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: { email: adminEmail }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};
