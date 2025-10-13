/**
 * Delete a user by wallet address
 */

const mongoose = require('mongoose');
const User = require('./models/User');

const walletAddress = process.argv[2];

if (!walletAddress) {
  console.error('❌ Usage: node delete-user.js <wallet_address>');
  process.exit(1);
}

// Load environment variables
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aegis';

(async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected!');
    
    console.log(`🔍 Looking for user with wallet: ${walletAddress}`);
    
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found!');
      await mongoose.disconnect();
      process.exit(0);
    }
    
    console.log('✅ Found user:');
    console.log(`   Wallet: ${user.walletAddress}`);
    console.log(`   Created: ${user.createdAt}`);
    console.log(`   Shard C ID: ${user.shardC_id}`);
    
    await User.deleteOne({ walletAddress: user.walletAddress });
    console.log('🗑️ User deleted successfully!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
})();
