// Quick fix: Generate dummy shards for existing users so evidence upload works
const mongoose = require('mongoose');
require('dotenv').config();

async function quickFixShards() {
    try {
        console.log('🚀 Quick fix: Adding dummy shards for evidence upload...');
        
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aegis');
        console.log('✅ Connected to MongoDB');

        const usersCollection = mongoose.connection.db.collection('users');
        const users = await usersCollection.find({}).limit(5).toArray(); // Fix first 5 users
        
        console.log(`📊 Fixing ${users.length} users for evidence upload`);

        for (const user of users) {
            // Generate dummy shards (32 bytes hex)
            const dummyShardB = '0123456789abcdef'.repeat(4); // 32 byte hex string
            const dummyShardC = 'fedcba9876543210'.repeat(4); // 32 byte hex string
            
            console.log(`🔧 Fixing user: ${user.walletAddress}`);
            
            // Update to new storage model
            await usersCollection.updateOne(
                { _id: user._id },
                {
                    $set: {
                        shardB: dummyShardB, // Store directly in MongoDB
                        shardC_id: `ngo_${user.walletAddress}_dummy_${Date.now()}` // NGO reference
                    },
                    $unset: {
                        shardB_id: 1 // Remove old field
                    }
                }
            );
            
            console.log(`✅ Fixed ${user.walletAddress}`);
        }

        console.log('\n🎉 Quick fix complete! Evidence upload should work now.');

    } catch (error) {
        console.error('❌ Quick fix failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

quickFixShards();