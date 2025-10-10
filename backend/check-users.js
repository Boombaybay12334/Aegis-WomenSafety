// Quick database check script
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/aegis', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const UserSchema = new mongoose.Schema({
  walletAddress: String,
  shardB_id: String,
  shardC_id: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    const users = await User.find({}).limit(5);
    console.log(`📊 Found ${users.length} users:`);
    
    for (const user of users) {
      console.log(`👤 ${user.walletAddress}`);
      console.log(`   Shard B ID: ${user.shardB_id}`);
      console.log(`   Shard C ID: ${user.shardC_id}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUsers();