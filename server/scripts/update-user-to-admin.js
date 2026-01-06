/**
 * Update Existing User to Admin
 * 
 * Usage: node scripts/update-user-to-admin.js <email>
 * Example: node scripts/update-user-to-admin.js user@example.com
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User.model');

async function updateToAdmin() {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.error('❌ Please provide an email address');
      console.log('Usage: node scripts/update-user-to-admin.js <email>');
      process.exit(1);
    }

    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/winzone';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Find and update user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    user.role = 'ADMIN';
    await user.save();

    console.log(`✅ User ${email} updated to ADMIN`);
    console.log('\n🎮 User can now login and access admin panel');
    console.log('   Note: User may need to logout and login again');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateToAdmin();

