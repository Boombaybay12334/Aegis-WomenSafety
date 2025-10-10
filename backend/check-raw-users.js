// Raw database check without model validation
const mongoose = require('mongoose');
require('dotenv').config();

async function checkRawUsers() {
  try {
    console.log('🔍 Checking raw users in database...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aegis');
    console.log('✅ Connected to MongoDB');

    // Get raw collection without model validation
    const usersCollection = mongoose.connection.db.collection('users');
    const users = await usersCollection.find({}).limit(10).toArray();
    
    console.log(`📊 Found ${users.length} users in raw collection:`);
    
    for (const user of users) {
      console.log(`\n👤 ${user.walletAddress}`);
      console.log(`   Fields:`, Object.keys(user));
      
      if (user.shardB_id) {
        console.log(`   ✅ shardB_id: ${user.shardB_id}`);
      }
      if (user.shardB) {
        console.log(`   ✅ shardB: ${user.shardB.substring(0, 20)}...`);
      }
      if (user.shardC_id) {
        console.log(`   ✅ shardC_id: ${user.shardC_id}`);
      }
      console.log(`   📅 Created: ${user.createdAt}`);
    }

    // Count total users
    const totalCount = await usersCollection.countDocuments({});
    console.log(`\n📊 Total users in database: ${totalCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkRawUsers();