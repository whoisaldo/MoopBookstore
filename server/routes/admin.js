const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Get all users (with pagination and search)
router.get('/users', adminAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().withMessage('Search must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Mock data when database is not available
    if (!req.app.locals.isDBConnected || !req.app.locals.isDBConnected()) {
      const mockUsers = [
        {
          _id: 'mock_user_1',
          username: 'demo_user',
          email: 'demo@example.com',
          displayName: 'Demo User',
          bio: 'Demo user account',
          isAdmin: false,
          joinDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'mock_admin_1',
          username: 'aliyounes',
          email: 'admin@moopsbookstore.com',
          displayName: 'Ali Younes',
          bio: 'System Administrator',
          isAdmin: true,
          joinDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      return res.json({
        users: mockUsers,
        totalUsers: mockUsers.length,
        totalPages: 1,
        currentPage: 1
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { displayName: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(searchQuery)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users: users.map(user => user.getAdminProfile()),
      totalUsers,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific user details
router.get('/users/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Mock data when database is not available
    if (!req.app.locals.isDBConnected || !req.app.locals.isDBConnected()) {
      const mockUser = {
        _id: userId,
        username: userId === 'mock_admin_1' ? 'aliyounes' : 'demo_user',
        email: userId === 'mock_admin_1' ? 'admin@moopsbookstore.com' : 'demo@example.com',
        displayName: userId === 'mock_admin_1' ? 'Ali Younes' : 'Demo User',
        bio: userId === 'mock_admin_1' ? 'System Administrator' : 'Demo user account',
        isAdmin: userId === 'mock_admin_1',
        favoriteGenres: ['Fiction'],
        readingGoal: 12,
        isPublic: true,
        followers: [],
        following: [],
        joinDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return res.json(mockUser);
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.getAdminProfile());
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset user password
router.post('/users/:userId/reset-password', adminAuth, [
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { newPassword } = req.body;

    // Mock response when database is not available
    if (!req.app.locals.isDBConnected || !req.app.locals.isDBConnected()) {
      return res.json({ 
        message: 'Password reset successful (mock mode)',
        userId: userId
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ 
      message: 'Password reset successful',
      userId: user._id
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user information (admin version)
router.put('/users/:userId', adminAuth, [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('displayName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Display name must be between 1 and 50 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('isAdmin')
    .optional()
    .isBoolean()
    .withMessage('isAdmin must be a boolean'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;

    // Mock response when database is not available
    if (!req.app.locals.isDBConnected || !req.app.locals.isDBConnected()) {
      return res.json({ 
        message: 'User updated successfully (mock mode)',
        userId: userId,
        updates: req.body
      });
    }

    const allowedUpdates = ['username', 'email', 'displayName', 'bio', 'isAdmin', 'isPublic', 'favoriteGenres', 'readingGoal'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.getAdminProfile());
  } catch (error) {
    console.error('Update user error:', error);
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user account
router.delete('/users/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Mock response when database is not available
    if (!req.app.locals.isDBConnected || !req.app.locals.isDBConnected()) {
      return res.json({ 
        message: 'User deleted successfully (mock mode)',
        userId: userId
      });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'User deleted successfully',
      userId: userId
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admin statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    // Mock data when database is not available
    if (!req.app.locals.isDBConnected || !req.app.locals.isDBConnected()) {
      return res.json({
        totalUsers: 2,
        totalAdmins: 1,
        newUsersThisMonth: 1,
        activeUsers: 2
      });
    }

    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ isAdmin: true });
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo }
    });

    res.json({
      totalUsers,
      totalAdmins,
      newUsersThisMonth,
      activeUsers: totalUsers // For now, assume all users are active
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
