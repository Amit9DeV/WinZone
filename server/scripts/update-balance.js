/**
 * Update User Balance Script
 * 
 * Usage: node scripts/update-balance.js <email> <amount>
 * Example: node scripts/update-balance.js admin@nexicart.com 5000
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User.model');

async function updateBalance() {
  try {
    const email = process.argv[2];
    const amount = parseFloat(process.argv[3]);
    
    if (!email || isNaN(amount)) {
      console.error('❌ Please provide email and amount');
      console.log('Usage: node scripts/update-balance.js <email> <amount>');
      console.log('Example: node scripts/update-balance.js admin@nexicart.com 5000');
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

    user.balance = amount;
    await user.save();

    console.log(`✅ User ${email} balance updated to ${amount} INR`);
    console.log('\n🎮 User needs to refresh the game to see updated balance');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateBalance();


