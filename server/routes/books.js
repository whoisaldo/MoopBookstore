const express = require('express');
const axios = require('axios');
const { body, validationResult, query } = require('express-validator');
const Book = require('../models/Book');
const Review = require('../models/Review');
const auth = require('../middleware/auth');

const router = express.Router();

// Search books (Google Books API integration)
router.get('/search', [
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { q, startIndex = 0, maxResults = 20 } = req.query;

    // First search our local database (if available)
    let localBooks = [];
    if (req.app.locals.isDBConnected && req.app.locals.isDBConnected()) {
      try {
        localBooks = await Book.find({
          $text: { $search: q }
        }).limit(10);
      } catch (error) {
        console.log('Local database search failed, continuing with Google Books only');
        localBooks = [];
      }
    }

    // Then search Google Books API
    const googleResponse = await axios.get('https://www.googleapis.com/books/v1/volumes', {
      params: {
        q,
        startIndex,
        maxResults,
        fields: 'items(id,volumeInfo(title,authors,description,publishedDate,pageCount,categories,imageLinks,language,publisher,industryIdentifiers))'
      }
    });

    const googleBooks = googleResponse.data.items || [];
    
    // Format Google Books data
    const formattedGoogleBooks = googleBooks.map(item => ({
      googleBooksId: item.id,
      title: item.volumeInfo.title || 'Unknown Title',
      author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown Author',
      description: item.volumeInfo.description || '',
      publishedDate: item.volumeInfo.publishedDate ? new Date(item.volumeInfo.publishedDate) : null,
      pageCount: item.volumeInfo.pageCount || 0,
      genres: item.volumeInfo.categories || [],
      coverImage: item.volumeInfo.imageLinks?.thumbnail || '',
      language: item.volumeInfo.language || 'en',
      publisher: item.volumeInfo.publisher || '',
      isbn: item.volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier || 
             item.volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier || ''
    }));

    res.json({
      localBooks,
      googleBooks: formattedGoogleBooks,
      totalLocal: localBooks.length,
      totalGoogle: googleResponse.data.totalItems || 0
    });
  } catch (error) {
    console.error('Search books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get book details
router.get('/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    
    // Handle mock book IDs when database is not available
    if (!req.app.locals.isDBConnected || !req.app.locals.isDBConnected()) {
      if (bookId.startsWith('mock_book_')) {
        // Check if we have this mock book stored in memory or file cache
        let mockBook = null;
        
        // First check memory
        if (req.app.locals.mockBooks && req.app.locals.mockBooks.has(bookId)) {
          mockBook = req.app.locals.mockBooks.get(bookId);
          console.log('Found stored mock book in memory:', mockBook.title);
        } else {
          // Try to load from file cache
          try {
            const fs = require('fs');
            const path = require('path');
            const cacheFile = path.join(__dirname, '../cache/mock-books.json');
            
            if (fs.existsSync(cacheFile)) {
              const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
              if (cache[bookId]) {
                mockBook = cache[bookId];
                console.log('Found stored mock book in file cache:', mockBook.title);
                
                // Also restore to memory for faster access
                if (!req.app.locals.mockBooks) {
                  req.app.locals.mockBooks = new Map();
                }
                req.app.locals.mockBooks.set(bookId, mockBook);
              }
            }
          } catch (error) {
            console.log('Could not read from file cache:', error.message);
          }
        }
        
        // If still no book found, use fallback
        if (!mockBook) {
          console.log('Mock book not found in storage or cache, using fallback for ID:', bookId);
          console.log('Available mock books:', req.app.locals.mockBooks ? Array.from(req.app.locals.mockBooks.keys()) : 'none');
          
          // Fallback mock book for development - use better defaults
          mockBook = {
            _id: bookId,
            title: 'Book Details Loading...',
            author: 'Please wait',
            isbn: '9780000000000',
            description: 'Book details are being loaded. If you see this message, the book data may not have been stored properly.',
            coverImage: 'https://via.placeholder.com/400x600/007bff/ffffff?text=Loading...',
            publishedDate: '2023-01-01',
            pageCount: 300,
            categories: ['Fiction'],
            language: 'en',
            averageRating: 0,
            ratingsCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
        
        const mockReviews = [
          {
            _id: 'mock_review_1',
            user: {
              _id: 'mock_user_1',
              username: 'demo_reader',
              displayName: 'Demo Reader',
              avatar: ''
            },
            rating: 5,
            reviewText: 'This is a great mock book! Really enjoyed reading it.',
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
            rating: 4,
            reviewText: 'Good book with interesting characters.',
            createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
          }
        ];
        
        return res.json({
          book: mockBook,
          reviews: mockReviews
        });
      } else {
        return res.status(404).json({ message: 'Book not found' });
      }
    }
    
    const book = await Book.findById(bookId);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Get recent reviews
    const reviews = await Review.find({ book: book._id })
      .populate('user', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      book,
      reviews
    });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add book to database (from Google Books)
router.post('/', auth, [
  body('googleBooksId')
    .optional()
    .notEmpty()
    .withMessage('Google Books ID cannot be empty'),
  body('title')
    .notEmpty()
    .withMessage('Title is required'),
  body('author')
    .notEmpty()
    .withMessage('Author is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Mock book addition when database is not available
    if (!req.app.locals.isDBConnected || !req.app.locals.isDBConnected()) {
      // Generate a mock book ID and return the book data
      const mockBook = {
        _id: 'mock_book_' + Date.now(),
        ...req.body,
        averageRating: 0,
        ratingsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Store the mock book in memory for later retrieval
      if (!req.app.locals.mockBooks) {
        req.app.locals.mockBooks = new Map();
      }
      req.app.locals.mockBooks.set(mockBook._id, mockBook);
      
      // Also try to persist to a simple file cache for server restarts
      try {
        const fs = require('fs');
        const path = require('path');
        const cacheDir = path.join(__dirname, '../cache');
        const cacheFile = path.join(cacheDir, 'mock-books.json');
        
        // Create cache directory if it doesn't exist
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir);
        }
        
        // Read existing cache
        let cache = {};
        if (fs.existsSync(cacheFile)) {
          cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        }
        
        // Add new book to cache
        cache[mockBook._id] = mockBook;
        
        // Write updated cache
        fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
        console.log('Stored mock book to file cache:', mockBook._id, 'Title:', mockBook.title);
      } catch (error) {
        console.log('Could not persist to file cache:', error.message);
      }
      
      console.log('Stored mock book:', mockBook._id, 'Title:', mockBook.title);
      console.log('Total mock books stored:', req.app.locals.mockBooks.size);
      
      return res.status(201).json(mockBook);
    }

    let book;
    
    // Check if book already exists (by Google Books ID or ISBN)
    if (req.body.googleBooksId) {
      book = await Book.findOne({ googleBooksId: req.body.googleBooksId });
    }
    
    if (!book && req.body.isbn) {
      book = await Book.findOne({ isbn: req.body.isbn });
    }

    if (book) {
      return res.json(book);
    }

    // Create new book
    book = new Book(req.body);
    await book.save();

    res.status(201).json(book);
  } catch (error) {
    console.error('Add book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trending books (alias for trending/popular)
router.get('/trending', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Mock data when database is not available
    if (!req.app.locals.isDBConnected || !req.app.locals.isDBConnected()) {
      const mockBooks = [
        {
          _id: '1',
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          description: 'A classic American novel set in the Jazz Age.',
          coverImage: 'https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg',
          averageRating: 4.2,
          ratingsCount: 1250,
          genres: ['Fiction', 'Classic', 'Literature']
        },
        {
          _id: '2',
          title: 'To Kill a Mockingbird',
          author: 'Harper Lee',
          description: 'A gripping tale of racial injustice and childhood innocence.',
          coverImage: 'https://covers.openlibrary.org/b/isbn/9780061120084-M.jpg',
          averageRating: 4.5,
          ratingsCount: 2100,
          genres: ['Fiction', 'Classic', 'Drama']
        },
        {
          _id: '3',
          title: '1984',
          author: 'George Orwell',
          description: 'A dystopian social science fiction novel.',
          coverImage: 'https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg',
          averageRating: 4.4,
          ratingsCount: 1800,
          genres: ['Fiction', 'Dystopian', 'Science Fiction']
        }
      ];
      return res.json(mockBooks.slice(0, parseInt(limit)));
    }

    const books = await Book.find({})
      .sort({ ratingsCount: -1, averageRating: -1 })
      .limit(parseInt(limit));

    res.json(books);
  } catch (error) {
    console.error('Get trending books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trending/popular books
router.get('/trending/popular', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Mock data when database is not available
    if (!req.app.locals.isDBConnected || !req.app.locals.isDBConnected()) {
      const mockBooks = [
        {
          _id: '1',
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          description: 'A classic American novel set in the Jazz Age.',
          coverImage: 'https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg',
          averageRating: 4.2,
          ratingsCount: 1250,
          genres: ['Fiction', 'Classic', 'Literature']
        },
        {
          _id: '2',
          title: 'To Kill a Mockingbird',
          author: 'Harper Lee',
          description: 'A gripping tale of racial injustice and childhood innocence.',
          coverImage: 'https://covers.openlibrary.org/b/isbn/9780061120084-M.jpg',
          averageRating: 4.5,
          ratingsCount: 2100,
          genres: ['Fiction', 'Classic', 'Drama']
        },
        {
          _id: '3',
          title: '1984',
          author: 'George Orwell',
          description: 'A dystopian social science fiction novel.',
          coverImage: 'https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg',
          averageRating: 4.4,
          ratingsCount: 1800,
          genres: ['Fiction', 'Dystopian', 'Science Fiction']
        }
      ];
      return res.json(mockBooks.slice(0, parseInt(limit)));
    }

    const books = await Book.find({})
      .sort({ ratingsCount: -1, averageRating: -1 })
      .limit(parseInt(limit));

    res.json(books);
  } catch (error) {
    console.error('Get trending books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent books (alias for recent/added)
router.get('/recent', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Mock data when database is not available
    if (!req.app.locals.isDBConnected || !req.app.locals.isDBConnected()) {
      const mockBooks = [
        {
          _id: '4',
          title: 'The Midnight Library',
          author: 'Matt Haig',
          description: 'A novel about infinite possibilities and infinite regret.',
          coverImage: 'https://covers.openlibrary.org/b/isbn/9780525559474-M.jpg',
          averageRating: 4.1,
          ratingsCount: 890,
          genres: ['Fiction', 'Fantasy', 'Philosophy']
        },
        {
          _id: '5',
          title: 'Klara and the Sun',
          author: 'Kazuo Ishiguro',
          description: 'A thrilling book from Nobel Prize-winner Kazuo Ishiguro.',
          coverImage: 'https://covers.openlibrary.org/b/isbn/9780571364909-M.jpg',
          averageRating: 3.9,
          ratingsCount: 650,
          genres: ['Fiction', 'Science Fiction', 'Literary Fiction']
        },
        {
          _id: '6',
          title: 'The Seven Husbands of Evelyn Hugo',
          author: 'Taylor Jenkins Reid',
          description: 'A reclusive Hollywood icon finally tells her story.',
          coverImage: 'https://covers.openlibrary.org/b/isbn/9781501161933-M.jpg',
          averageRating: 4.6,
          ratingsCount: 1420,
          genres: ['Fiction', 'Romance', 'Historical Fiction']
        }
      ];
      return res.json(mockBooks.slice(0, parseInt(limit)));
    }
    
    const books = await Book.find({})
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(books);
  } catch (error) {
    console.error('Get recent books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recently added books
router.get('/recent/added', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Mock data when database is not available
    if (!req.app.locals.isDBConnected || !req.app.locals.isDBConnected()) {
      const mockBooks = [
        {
          _id: '4',
          title: 'The Midnight Library',
          author: 'Matt Haig',
          description: 'A novel about infinite possibilities and infinite regret.',
          coverImage: 'https://covers.openlibrary.org/b/isbn/9780525559474-M.jpg',
          averageRating: 4.1,
          ratingsCount: 890,
          genres: ['Fiction', 'Fantasy', 'Philosophy']
        },
        {
          _id: '5',
          title: 'Klara and the Sun',
          author: 'Kazuo Ishiguro',
          description: 'A thrilling book from Nobel Prize-winner Kazuo Ishiguro.',
          coverImage: 'https://covers.openlibrary.org/b/isbn/9780571364909-M.jpg',
          averageRating: 3.9,
          ratingsCount: 650,
          genres: ['Fiction', 'Science Fiction', 'Literary Fiction']
        },
        {
          _id: '6',
          title: 'The Seven Husbands of Evelyn Hugo',
          author: 'Taylor Jenkins Reid',
          description: 'A reclusive Hollywood icon finally tells her story.',
          coverImage: 'https://covers.openlibrary.org/b/isbn/9781501161933-M.jpg',
          averageRating: 4.6,
          ratingsCount: 1420,
          genres: ['Fiction', 'Romance', 'Historical Fiction']
        }
      ];
      return res.json(mockBooks.slice(0, parseInt(limit)));
    }
    
    const books = await Book.find({})
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(books);
  } catch (error) {
    console.error('Get recent books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
