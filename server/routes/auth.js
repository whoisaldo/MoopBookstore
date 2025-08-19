const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('displayName')
    .isLength({ min: 1, max: 50 })
    .withMessage('Display name must be between 1 and 50 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, displayName } = req.body;

    // Mock registration when database is not available
    if (!req.app.locals.isDBConnected || !req.app.locals.isDBConnected()) {
      // Generate a mock user ID and token for development
      const mockUserId = 'mock_' + Date.now();
      const mockUser = {
        _id: mockUserId,
        username,
        email,
        displayName,
        bio: '',
        avatar: '',
        favoriteGenres: [],
        readingGoal: 12,
        isPublic: true,
        followers: [],
        following: [],
        joinDate: new Date().toISOString()
      };

      const payload = {
        userId: mockUserId,
        username: username
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '7d'
      });

      return res.status(201).json({
        token,
        user: mockUser
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      displayName
    });

    await user.save();

    // Generate JWT
    const payload = {
      userId: user._id,
      username: user.username
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: '7d'
    });

    res.status(201).json({
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', [
  body('login')
    .notEmpty()
    .withMessage('Email or username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { login, password } = req.body;

    // Mock login when database is not available
    if (!req.app.locals.isDBConnected || !req.app.locals.isDBConnected()) {
      // Simple mock login - accept any credentials for demo
      const mockUserId = 'mock_' + Date.now();
      const mockUser = {
        _id: mockUserId,
        username: login,
        email: login.includes('@') ? login : `${login}@example.com`,
        displayName: login.charAt(0).toUpperCase() + login.slice(1),
        bio: 'Demo user',
        avatar: '',
        favoriteGenres: ['Fiction'],
        readingGoal: 12,
        isPublic: true,
        followers: [],
        following: [],
        joinDate: new Date().toISOString()
      };

      const payload = {
        userId: mockUserId,
        username: login
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '7d'
      });

      return res.json({
        token,
        user: mockUser
      });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: login.toLowerCase() },
        { username: login }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const payload = {
      userId: user._id,
      username: user.username
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json(req.user.getPublicProfile());
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', auth, [
  body('displayName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Display name must be between 1 and 50 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('readingGoal')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Reading goal must be between 1 and 1000'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('favoriteGenres')
    .optional()
    .isArray()
    .withMessage('Favorite genres must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const allowedUpdates = ['displayName', 'bio', 'readingGoal', 'isPublic', 'favoriteGenres'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json(user.getPublicProfile());
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
