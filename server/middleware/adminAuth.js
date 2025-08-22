const auth = require('./auth');

const adminAuth = [
  auth, // First check if user is authenticated
  (req, res, next) => {
    try {
      // Check if user has admin privileges
      if (!req.user.isAdmin) {
        return res.status(403).json({ 
          message: 'Access denied. Admin privileges required.' 
        });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
];

module.exports = adminAuth;
