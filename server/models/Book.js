const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  publishedDate: {
    type: Date
  },
  pageCount: {
    type: Number
  },
  genres: [{
    type: String,
    trim: true
  }],
  coverImage: {
    type: String,
    default: ''
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingsCount: {
    type: Number,
    default: 0
  },
  // Google Books API ID for external integration
  googleBooksId: {
    type: String,
    unique: true,
    sparse: true
  },
  language: {
    type: String,
    default: 'en'
  },
  publisher: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for search functionality
bookSchema.index({
  title: 'text',
  author: 'text',
  description: 'text'
});

// Update average rating when new review is added
bookSchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { book: this._id } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        ratingsCount: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    this.averageRating = Math.round(stats[0].averageRating * 10) / 10;
    this.ratingsCount = stats[0].ratingsCount;
  } else {
    this.averageRating = 0;
    this.ratingsCount = 0;
  }

  await this.save();
};

module.exports = mongoose.model('Book', bookSchema);
