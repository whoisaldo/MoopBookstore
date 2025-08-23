const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const auth = require('./middleware/auth');

const app = express();

// CORS Configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://whoisaldo.github.io',
      'https://whoisaldo.github.io/MoopBookstore',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
let isDBConnected = false;

const connectDB = async () => {
  try {
    // Enhanced MongoDB connection with production settings
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      w: 'majority',
      heartbeatFrequencyMS: 10000, // Check connection every 10 seconds
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    };

    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/moops-bookstore';
    const conn = await mongoose.connect(mongoURI, options);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    isDBConnected = true;
    
    // Handle connection events
    conn.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
      isDBConnected = false;
    });
    
    conn.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
      isDBConnected = false;
    });
    
    conn.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
      isDBConnected = true;
    });
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 CRITICAL: Production database connection failed!');
      // In production, we still allow startup but log the issue
      console.log('⚠️ Starting with limited functionality...');
    } else {
      console.log('🔧 Development mode: Continuing with mock data');
    }
    isDBConnected = false;
  }
};

// Connect to database (non-blocking)
connectDB();

// Export isDBConnected for use in routes
app.locals.isDBConnected = () => isDBConnected;

// Periodic database reconnection attempt (every 5 minutes)
setInterval(async () => {
  if (!isDBConnected) {
    console.log('🔄 Attempting to reconnect to database...');
    try {
      await connectDB();
    } catch (error) {
      console.log('❌ Reconnection attempt failed, continuing with mock data');
    }
  }
}, 5 * 60 * 1000); // 5 minutes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: isDBConnected ? 'Connected' : 'Disconnected',
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);



// Test auth endpoint
app.get('/api/test-auth', auth, (req, res) => {
  res.json({
    message: 'Authentication working!',
    user: req.user,
    dbConnected: isDBConnected
  });
});

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app build directory
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Catch all handler: send back React's index.html file for any non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

const PORT = process.env.PORT || 5002;

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, trying port ${PORT + 1}...`);
    const altServer = app.listen(PORT + 1, () => {
      console.log(`Server is running on port ${PORT + 1}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Server is running on port ${PORT + 1}`);
    });
  } else {
    console.error('Server error:', err);
  }
});
