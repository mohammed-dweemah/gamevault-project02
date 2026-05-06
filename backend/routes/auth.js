const express = require('express');
const router = express.Router();
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirm } = req.body;

    if (!name || !email || !password || !confirm) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (password !== confirm) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // New users are always 'user' role — never admin via registration
    const user = await User.create({ name, email, password, role: 'user' });

    req.session.userId   = user._id.toString();
    req.session.userName = user.name;
    req.session.userRole = user.role;

    res.status(201).json({
      message: 'Account created successfully.',
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email already in use.' });
    }
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    req.session.userId   = user._id.toString();
    req.session.userName = user.name;
    req.session.userRole = user.role;

    res.status(200).json({
      message: 'Logged in successfully.',
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Could not log out.' });
    res.clearCookie('gamevault.sid');
    res.status(200).json({ message: 'Logged out successfully.' });
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      req.session.destroy(() => {});
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
