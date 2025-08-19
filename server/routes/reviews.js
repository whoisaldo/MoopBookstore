const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Review = require('../models/Review');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

const router = express.Router();

// Create or update review
router.post('/', auth, [
  body('bookId')
    .notEmpty()
    .withMessage('Book ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('readStatus')
    .isIn(['want-to-read', 'currently-reading', 'read'])
    .withMessage('Invalid read status'),
  body('reviewText')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Review text must be less than 2000 characters'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookId, rating, reviewText, readStatus, isPublic = true, tags = [], startDate, finishDate } = req.body;

    // Mock review creation when database is not available
    if (!req.app.locals.isDBConnected || !req.app.locals.isDBConnected()) {
      console.log('📝 Creating mock review for user:', req.user._id, 'book:', bookId);
      
      // Try to get the actual book data from stored mock books
      let bookData = { _id: bookId, title: 'Unknown Book', author: 'Unknown Author', coverImage: '' };
      
      if (req.app.locals.mockBooks && req.app.locals.mockBooks.has(bookId)) {
        const storedBook = req.app.locals.mockBooks.get(bookId);
        bookData = {
          _id: storedBook._id,
          title: storedBook.title,
          author: storedBook.author,
          coverImage: storedBook.coverImage || ''
        };
        console.log('📖 Found book data:', bookData.title);
      }
      
      // Create a mock review
      const mockReview = {
        _id: 'mock_review_' + Date.now(),
        user: {
          _id: req.user._id || 'mock_user',
          username: req.user.username || 'demo_user',
          displayName: req.user.displayName || 'Demo User',
          avatar: req.user.avatar || ''
        },
        book: bookData,
        rating,
        reviewText: reviewText || '',
        readStatus,
        isPublic,
        tags,
        likes: [],
        startDate: startDate ? new Date(startDate) : null,
        finishDate: finishDate ? new Date(finishDate) : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Store the mock review in memory for later retrieval
      if (!req.app.locals.mockReviews) {
        req.app.locals.mockReviews = new Map();
      }
      req.app.locals.mockReviews.set(mockReview._id, mockReview);
      
      // Also try to persist to a simple file cache for server restarts
      try {
        const fs = require('fs');
        const path = require('path');
        const cacheDir = path.join(__dirname, '../cache');
        const cacheFile = path.join(cacheDir, 'mock-reviews.json');

        // Create cache directory if it doesn't exist
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir);
        }

        // Read existing cache
        let cache = {};
        if (fs.existsSync(cacheFile)) {
          cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        }

        // Add new review to cache
        cache[mockReview._id] = mockReview;

        // Write updated cache
        fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
        console.log('💾 Stored mock review to file cache:', mockReview._id, 'by user:', mockReview.user.username);
      } catch (error) {
        console.log('Could not persist review to file cache:', error.message);
      }
      
      console.log('✅ Mock review created and stored:', mockReview._id);
      console.log('📊 Total mock reviews:', req.app.locals.mockReviews.size);
      
      return res.json(mockReview);
    }

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user already has a review for this book
    let review = await Review.findOne({
      user: req.user._id,
      book: bookId
    });

    if (review) {
      // Update existing review
      review.rating = rating;
      review.reviewText = reviewText || '';
      review.readStatus = readStatus;
      review.isPublic = isPublic;
      review.tags = tags;
      if (startDate) review.startDate = new Date(startDate);
      if (finishDate) review.finishDate = new Date(finishDate);
      
      await review.save();
    } else {
      // Create new review
      review = new Review({
        user: req.user._id,
        book: bookId,
        rating,
        reviewText: reviewText || '',
        readStatus,
        isPublic,
        tags,
        startDate: startDate ? new Date(startDate) : undefined,
        finishDate: finishDate ? new Date(finishDate) : undefined
      });
      
      await review.save();
    }

    // Populate user data
    await review.populate('user', 'username displayName avatar');
    await review.populate('book', 'title author coverImage');

    res.json(review);
  } catch (error) {
    console.error('Create/update review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's reviews
router.get('/user/:userId', [
  query('status')
    .optional()
    .isIn(['want-to-read', 'currently-reading', 'read'])
    .withMessage('Invalid status filter'),
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
    const { status, page = 1, limit = 20, sort = '-updatedAt' } = req.query;

    // Handle mock data when database is not available
    if (!req.app.locals.isDBConnected || !req.app.locals.isDBConnected()) {
      console.log('🔍 Getting mock reviews for user:', userId, 'with status:', status);
      
      // Get stored mock reviews from memory
      const mockReviews = [];
      
      // First ensure we have loaded from file cache if memory is empty
      if (!req.app.locals.mockReviews || req.app.locals.mockReviews.size === 0) {
        try {
          const fs = require('fs');
          const path = require('path');
          const cacheFile = path.join(__dirname, '../cache/mock-reviews.json');

          if (fs.existsSync(cacheFile)) {
            const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
            req.app.locals.mockReviews = new Map();
            
            Object.values(cache).forEach(review => {
              req.app.locals.mockReviews.set(review._id, review);
            });
            
            console.log('📁 Loaded', Object.keys(cache).length, 'reviews from file cache');
          }
        } catch (error) {
          console.log('Could not read reviews from file cache:', error.message);
        }
      }
      
      if (req.app.locals.mockReviews) {
        const allMockReviews = Array.from(req.app.locals.mockReviews.values());
        console.log('📚 All mock reviews in memory:', allMockReviews.length);
        
        // Filter by user ID and status if provided
        let filteredReviews = allMockReviews.filter(review => review.user._id === userId);
        console.log('👤 Filtered by user ID:', filteredReviews.length);
        
        if (status) {
          filteredReviews = filteredReviews.filter(review => review.readStatus === status);
          console.log('📊 Filtered by status:', filteredReviews.length);
        }
        
        mockReviews.push(...filteredReviews);
      }

      console.log('✅ Returning mock reviews:', mockReviews.length);
      return res.json({
        reviews: mockReviews,
        total: mockReviews.length,
        page: parseInt(page),
        totalPages: Math.ceil(mockReviews.length / limit)
      });
    }

    const query = { user: userId };
    if (status) {
      query.readStatus = status;
    }

    // Only show public reviews unless it's the user's own profile
    if (!req.user || req.user._id.toString() !== userId) {
      query.isPublic = true;
    }

    const skip = (page - 1) * limit;
    
    const reviews = await Review.find(query)
      .populate('book', 'title author coverImage averageRating')
      .populate('user', 'username displayName avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get book reviews
router.get('/book/:bookId', [
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

    const { bookId } = req.params;
    const { page = 1, limit = 20, sort = '-createdAt' } = req.query;

    // Handle mock data when database is not available
    if (!req.app.locals.isDBConnected || !req.app.locals.isDBConnected()) {
      // Return mock reviews for development
      const mockReviews = [
        {
          _id: 'mock_review_1',
          user: {
            _id: 'mock_user_1',
            username: 'demo_reader',
            displayName: 'Demo Reader',
            avatar: ''
          },
          book: bookId,
          rating: 5,
          reviewText: 'This is a great book! Really enjoyed reading it.',
          readStatus: 'read',
          isPublic: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: 'mock_review_2',
          user: {
            _id: 'mock_user_2',
            username: 'book_lover',
            displayName: 'Book Lover',
            avatar: ''
          },
          book: bookId,
          rating: 4,
          reviewText: 'Good book with interesting characters.',
          readStatus: 'read',
          isPublic: true,
          createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        }
      ];

      return res.json({
        reviews: mockReviews,
        total: mockReviews.length,
        page: parseInt(page),
        totalPages: 1
      });
    }

    const skip = (page - 1) * limit;
    
    const reviews = await Review.find({
      book: bookId,
      isPublic: true,
      reviewText: { $ne: '' } // Only reviews with text
    })
      .populate('user', 'username displayName avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({
      book: bookId,
      isPublic: true,
      reviewText: { $ne: '' }
    });

    res.json({
      reviews,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get book reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent reviews from followed users
router.get('/feed/following', auth, [
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

    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      user: { $in: req.user.following },
      isPublic: true
    })
      .populate('user', 'username displayName avatar')
      .populate('book', 'title author coverImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json(reviews);
  } catch (error) {
    console.error('Get following reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/unlike a review
router.post('/:reviewId/like', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const userId = req.user._id;
    const isLiked = review.likes.includes(userId);

    if (isLiked) {
      review.likes.pull(userId);
    } else {
      review.likes.push(userId);
    }

    await review.save();

    res.json({
      liked: !isLiked,
      likesCount: review.likes.length
    });
  } catch (error) {
    console.error('Like review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete review
router.delete('/:reviewId', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.reviewId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
