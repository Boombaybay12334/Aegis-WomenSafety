/**
 * Script to list all users in MongoDB database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aegis';

async function listAllUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const users = await User.find({}).select('walletAddress createdAt lastLoginAt');
    
    console.log(`📊 Total users in database: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('No users found in database.');
    } else {
      console.log('Registered wallet addresses:');
      console.log('='.repeat(80));
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.walletAddress}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   Last Login: ${user.lastLoginAt || 'Never'}`);
        console.log('---');
      });
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listAllUsers();
