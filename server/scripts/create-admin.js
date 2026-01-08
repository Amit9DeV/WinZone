/**
 * Create Admin User Script
 * Run this to create an admin user in MongoDB
 * 
 * Usage: node scripts/create-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User.model');

async function createAdmin() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/winzone';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Admin user details
    const adminEmail = process.argv[2] || 'admin@example.com';
    const adminPassword = process.argv[3] || 'admin123';
    const adminName = process.argv[4] || 'Admin';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      // Update existing user to admin
      existingAdmin.role = 'ADMIN';
      existingAdmin.name = adminName;
      if (adminPassword !== 'admin123') {
        existingAdmin.password = adminPassword;
      }
      await existingAdmin.save();
      console.log(`✅ Updated existing user to ADMIN: ${adminEmail}`);
    } else {
      // Create new admin user
      const admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'ADMIN',
        balance: 10000, // Give admin some starting balance
        totalBets: 0,
        totalWins: 0,
        totalLosses: 0,
        winPercentage: 0,
      });
      console.log(`✅ Created admin user: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
    }

    console.log('\n📝 Admin Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n🎮 You can now login at http://localhost:3000/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();


