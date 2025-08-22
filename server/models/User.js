const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  favoriteGenres: [{
    type: String,
    trim: true
  }],
  readingGoal: {
    type: Number,
    default: 12
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  joinDate: {
    type: Date,
    default: Date.now
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get public profile data
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    username: this.username,
    displayName: this.displayName,
    bio: this.bio,
    avatar: this.avatar,
    favoriteGenres: this.favoriteGenres,
    readingGoal: this.readingGoal,
    isPublic: this.isPublic,
    followers: this.followers,
    following: this.following,
    joinDate: this.joinDate
  };
};

<<<<<<< Current (Your changes)
=======
// Get admin profile data (includes sensitive info for admins)
userSchema.methods.getAdminProfile = function() {
  return {
    _id: this._id,
    username: this.username,
    email: this.email,
    displayName: this.displayName,
    bio: this.bio,
    avatar: this.avatar,
    favoriteGenres: this.favoriteGenres,
    readingGoal: this.readingGoal,
    isPublic: this.isPublic,
    isAdmin: this.isAdmin,
    followers: this.followers,
    following: this.following,
    joinDate: this.joinDate,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

>>>>>>> Incoming (Background Agent changes)
module.exports = mongoose.model('User', userSchema);
