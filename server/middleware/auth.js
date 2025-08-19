const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Check if we have database connection
    const isDBConnected = req.app.locals.isDBConnected && req.app.locals.isDBConnected();
    
    if (isDBConnected) {
      // Normal database lookup
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: 'Token is not valid' });
      }

      req.user = user;
    } else {
      // Mock user for development without database
      if (decoded.userId && decoded.userId.startsWith('mock_')) {
        req.user = {
          _id: decoded.userId,
          username: decoded.username || 'demo_user',
          displayName: decoded.username ? decoded.username.charAt(0).toUpperCase() + decoded.username.slice(1) : 'Demo User',
          email: `${decoded.username || 'demo'}@example.com`,
          bio: 'Demo user',
          avatar: '',
          favoriteGenres: ['Fiction'],
          readingGoal: 12,
          isPublic: true,
          followers: [],
          following: [],
          joinDate: new Date().toISOString(),
          getPublicProfile: function() {
            return {
              _id: this._id,
              username: this.username,
              displayName: this.displayName,
              email: this.email,
              bio: this.bio,
              avatar: this.avatar,
              favoriteGenres: this.favoriteGenres,
              readingGoal: this.readingGoal,
              isPublic: this.isPublic,
              followers: this.followers,
              following: this.following,
              joinDate: this.joinDate
            };
          }
        };
      } else {
        return res.status(401).json({ message: 'Token is not valid' });
      }
    }
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
