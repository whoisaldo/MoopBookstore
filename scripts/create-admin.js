#!/usr/bin/env node

/**
 * Script to create an admin account with the specific email
 * Run this script to create your admin account
 */

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();

// Import the User model
const User = require('../server/models/User');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@moopsbookstore.com';
const ADMIN_USERNAME = 'aliyounes';
const ADMIN_PASSWORD = 'admin123'; // Change this to your desired password
const ADMIN_DISPLAY_NAME = 'Ali Younes';

async function createAdminUser() {
  try {
    // Connect to MongoDB if available
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/moops-bookstore';
    
    try {
      await mongoose.connect(mongoURI);
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.log('⚠️ MongoDB not available, this is fine for development');
    }

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists:');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Admin: ${existingAdmin.isAdmin ? 'Yes' : 'No'}`);
      
      if (!existingAdmin.isAdmin) {
        console.log('🔄 Updating existing user to admin...');
        existingAdmin.isAdmin = true;
        await existingAdmin.save();
        console.log('✅ User updated to admin successfully!');
      }
      
      return;
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    
    const adminUser = new User({
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      displayName: ADMIN_DISPLAY_NAME,
      bio: 'System Administrator',
      isAdmin: true,
      favoriteGenres: ['Admin', 'System'],
      readingGoal: 12,
      isPublic: true
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log(`   Username: ${ADMIN_USERNAME}`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Admin: Yes`);
    console.log('');
    console.log('🔐 You can now login with these credentials');
    console.log('🌐 Access admin panel at: /admin');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
    process.exit(0);
  }
}

// Run the script
createAdminUser();
