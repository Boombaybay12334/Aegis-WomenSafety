// Migration script to fix existing user shard storage
// FROM: shardB_id (NGO) + shardC_id (KMS) 
// TO: shardB (MongoDB) + shardC_id (NGO)

const mongoose = require('mongoose');
require('dotenv').config();

// Import services and models
const User = require('./models/User');
const mockNGO = require('./services/mockNGO'); // Import instance
const mockKMS = require('./services/mockKMS'); // Import instance

async function migrateUserShards() {
    try {
        console.log('🔄 Starting shard storage migration...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aegis');
        console.log('✅ Connected to MongoDB');

        // Use raw collection to avoid model validation issues
        const usersCollection = mongoose.connection.db.collection('users');
        const users = await usersCollection.find({}).toArray();
        console.log(`📊 Found ${users.length} users to migrate`);

        let migrated = 0;
        let errors = 0;

        for (const user of users) {
            try {
                console.log(`\n🔄 Migrating user: ${user.walletAddress}`);
                
                // Skip if already migrated (has shardB field)
                if (user.shardB) {
                    console.log(`✅ User already migrated (has shardB field)`);
                    migrated++;
                    continue;
                }

                // Check if user has old format (shardB_id)
                if (!user.shardB_id) {
                    console.log(`⚠️  User missing shardB_id, skipping`);
                    continue;
                }

                // Step 1: Retrieve Shard B from NGO service
                let shardB;
                try {
                    shardB = await mockNGO.retrieveShardB(user.shardB_id);
                    console.log(`📥 Retrieved Shard B from NGO service`);
                } catch (error) {
                    console.error(`❌ Failed to retrieve Shard B: ${error.message}`);
                    errors++;
                    continue;
                }

                // Step 2: Retrieve Shard C from KMS (if it exists)
                let shardC;
                let newShardCId;
                
                if (user.shardC_id) {
                    try {
                        shardC = await mockKMS.decrypt(user.shardC_id);
                        console.log(`📥 Retrieved Shard C from KMS`);
                        
                        // Store Shard C in NGO service  
                        newShardCId = await mockNGO.storeShardB(user.walletAddress, shardC);
                        console.log(`📤 Stored Shard C in NGO service with ID: ${newShardCId}`);
                    } catch (error) {
                        console.error(`❌ Failed to migrate Shard C: ${error.message}`);
                        // Continue with just Shard B migration
                    }
                }

                // Step 3: Update user record with new storage model using raw update
                const updateData = {
                    $set: {
                        shardB: shardB // Store directly in MongoDB
                    },
                    $unset: { 
                        shardB_id: 1 // Remove old field
                    }
                };

                if (newShardCId) {
                    updateData.$set.shardC_id = newShardCId; // Update to NGO reference
                }

                await usersCollection.updateOne(
                    { _id: user._id }, 
                    updateData
                );
                console.log(`✅ Updated user record with new storage model`);
                
                migrated++;

            } catch (error) {
                console.error(`❌ Migration failed for ${user.walletAddress}:`, error.message);
                errors++;
            }
        }

        console.log(`\n🎉 Migration completed!`);
        console.log(`✅ Successfully migrated: ${migrated} users`);
        console.log(`❌ Errors: ${errors} users`);

        // Verify migration
        console.log(`\n🔍 Verifying migration...`);
        const updatedUsers = await usersCollection.find({}).toArray();
        const withShardB = updatedUsers.filter(u => u.shardB).length;
        const withOldFormat = updatedUsers.filter(u => u.shardB_id).length;
        
        console.log(`📊 Users with new format (shardB field): ${withShardB}`);
        console.log(`📊 Users with old format (shardB_id field): ${withOldFormat}`);

    } catch (error) {
        console.error('🚨 Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
    }
}

// Run migration if called directly
if (require.main === module) {
    migrateUserShards().then(() => {
        console.log('Migration complete');
        process.exit(0);
    }).catch(error => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
}

module.exports = migrateUserShards;