const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  reviewText: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  readStatus: {
    type: String,
    enum: ['want-to-read', 'currently-reading', 'read'],
    required: true
  },
  startDate: {
    type: Date
  },
  finishDate: {
    type: Date
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Ensure one review per user per book
reviewSchema.index({ user: 1, book: 1 }, { unique: true });

// Update book rating after review save/update/delete
reviewSchema.post('save', async function() {
  const Book = mongoose.model('Book');
  const book = await Book.findById(this.book);
  if (book) {
    await book.updateRating();
  }
});

reviewSchema.post('findOneAndUpdate', async function(doc) {
  if (doc) {
    const Book = mongoose.model('Book');
    const book = await Book.findById(doc.book);
    if (book) {
      await book.updateRating();
    }
  }
});

reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    const Book = mongoose.model('Book');
    const book = await Book.findById(doc.book);
    if (book) {
      await book.updateRating();
    }
  }
});

module.exports = mongoose.model('Review', reviewSchema);
