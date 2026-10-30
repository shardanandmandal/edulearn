const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('../database');
const { JWT_SECRET, requireAuth } = require('../middleware/auth');

// Rate limiter for auth endpoints: 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
  }
});

// Register
router.post('/register', authLimiter, (req, res) => {
  try {
    const { name, email, password, phone, bio } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = db.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'student',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      phone: phone || '',
      bio: bio || 'Enthusiastic Learner'
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userSafe } = newUser;
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: userSafe
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// Login
router.post('/login', authLimiter, (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userSafe } = user;
    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: userSafe
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// Current user profile
router.get('/me', requireAuth, (req, res) => {
  const user = db.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }
  const enrollments = db.getEnrollmentsByUserId(user.id);
  const { password: _, ...userSafe } = user;
  res.json({
    success: true,
    user: userSafe,
    enrollments
  });
});

// Update profile
router.put('/profile', requireAuth, (req, res) => {
  try {
    const { name, bio, phone, avatar, currentPassword, newPassword } = req.body;
    const user = db.getUserById(req.user.id);

    const updates = {};
    if (name) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio;
    if (phone !== undefined) updates.phone = phone;
    if (avatar) updates.avatar = avatar;

    if (newPassword) {
      if (newPassword.length < 8) {
        return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
      }
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to set new password.' });
      }
      const match = bcrypt.compareSync(currentPassword, user.password);
      if (!match) {
        return res.status(400).json({ success: false, message: 'Current password does not match.' });
      }
      updates.password = bcrypt.hashSync(newPassword, 10);
    }

    const updatedUser = db.updateUser(user.id, updates);
    const { password: _, ...userSafe } = updatedUser;

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: userSafe
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ success: false, message: 'Error updating profile.' });
  }
});

module.exports = router;
