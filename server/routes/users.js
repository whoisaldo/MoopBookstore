const express = require('express');
const { query, validationResult } = require('express-validator');
const User = require('../models/User');
const Review = require('../models/Review');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if profile is public or if it's the user's own profile
    if (!user.isPublic && (!req.user || req.user._id.toString() !== user._id.toString())) {
      return res.status(403).json({ message: 'This profile is private' });
    }

    // Get reading statistics
    const stats = await Review.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: '$readStatus',
          count: { $sum: 1 },
          totalPages: { $sum: '$book.pageCount' }
        }
      }
    ]);

    const readingStats = {
      read: 0,
      currentlyReading: 0,
      wantToRead: 0,
      totalBooks: 0
    };

    stats.forEach(stat => {
      switch (stat._id) {
        case 'read':
          readingStats.read = stat.count;
          break;
        case 'currently-reading':
          readingStats.currentlyReading = stat.count;
          break;
        case 'want-to-read':
          readingStats.wantToRead = stat.count;
          break;
      }
      readingStats.totalBooks += stat.count;
    });

    // Get recent reviews
    const recentReviews = await Review.find({
      user: user._id,
      isPublic: true
    })
      .populate('book', 'title author coverImage')
      .sort({ updatedAt: -1 })
      .limit(5);

    res.json({
      user: user.getPublicProfile(),
      stats: readingStats,
      recentReviews
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users
router.get('/', [
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Search query must be between 1 and 50 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { q, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find({
      $and: [
        { isPublic: true },
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { displayName: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    })
      .select('username displayName avatar bio joinDate')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments({
      $and: [
        { isPublic: true },
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { displayName: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    });

    res.json({
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow/unfollow user
router.post('/:userId/follow', auth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(currentUserId);
    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({
      following: !isFollowing,
      followersCount: targetUser.followers.length,
      followingCount: targetUser.following.length
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's followers
router.get('/:userId/followers', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const skip = (page - 1) * limit;
    
    const followers = await User.find({
      _id: { $in: user.followers },
      isPublic: true
    })
      .select('username displayName avatar bio')
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      followers,
      total: user.followers.length,
      page: parseInt(page),
      totalPages: Math.ceil(user.followers.length / limit)
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's following
router.get('/:userId/following', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const skip = (page - 1) * limit;
    
    const following = await User.find({
      _id: { $in: user.following },
      isPublic: true
    })
      .select('username displayName avatar bio')
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      following,
      total: user.following.length,
      page: parseInt(page),
      totalPages: Math.ceil(user.following.length / limit)
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
