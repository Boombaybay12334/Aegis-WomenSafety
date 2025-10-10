/**
 * Account API Routes for AEGIS Phase 0
 * 
 * SECURITY CRITICAL: These endpoints handle sensitive operations.
 * All endpoints implement zero-knowledge architecture:
 * - Backend NEVER receives passphrases or Shard A
 * - Signature verification is MANDATORY for sensitive operations
 * - Input validation prevents injection attacks
 * - Rate limiting prevents abuse
 */

const express = require('express');
const { ethers } = require('ethers');
const User = require('../models/User');
const mockKMS = require('../services/mockKMS');
const mockNGO = require('../services/mockNGO');
const {
  availabilityLimiter,
  createAccountLimiter,
  verifyLimiter,
  recoveryLimiter,
  updateShardsLimiter
} = require('../middleware/rateLimiter');

const router = express.Router();

// Security validation helpers
const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// FIXED: Updated to handle Shamir's Secret Sharing shard format "x:hexdata"
const isValidShardFormat = (shard) => {
  if (typeof shard !== 'string' || shard.length === 0) {
    return false;
  }
  
  // Check if it matches the format "x:hexdata" where x is a number and hexdata is hex
  const shardPattern = /^[1-9]\d*:[a-fA-F0-9]+$/;
  return shardPattern.test(shard);
};

const isValidHexString = (str) => {
  return typeof str === 'string' && /^[a-fA-F0-9]+$/.test(str) && str.length > 0;
};

const verifySignature = (message, signature, expectedAddress) => {
  try {
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error('🚨 [Security] Signature verification failed:', error.message);
    return false;
  }
};

/**
 * POST /api/v1/account/check-availability
 * Check if a wallet address is available for account creation
 */
router.post('/check-availability', availabilityLimiter, async (req, res) => {
  try {
    const { walletAddress } = req.body;

    // Input validation
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    if (!isValidAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // Check availability
    const existingUser = await User.findByWallet(walletAddress);
    const available = !existingUser;

    console.log(`🔍 [API] Availability check for ${walletAddress}: ${available ? 'Available' : 'Taken'}`);

    res.json({ available });
  } catch (error) {
    console.error('🚨 [API] Availability check failed:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/v1/account/create
 * Create a new anonymous account
 */
router.post('/create', createAccountLimiter, async (req, res) => {
  try {
    console.log('🔄 [API] Account creation request received');
    const { walletAddress, shardB, shardC } = req.body;

    console.log(`🔍 [API] Request data:`, {
      walletAddress: walletAddress || 'missing',
      shardBLength: shardB ? shardB.length : 'missing',
      shardCLength: shardC ? shardC.length : 'missing'
    });

    // Input validation
    if (!walletAddress || !shardB || !shardC) {
      console.error('❌ [API] Missing required fields');
      return res.status(400).json({ error: 'Missing required fields: walletAddress, shardB, shardC' });
    }

    if (!isValidAddress(walletAddress)) {
      console.error('❌ [API] Invalid wallet address format:', walletAddress);
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // FIXED: Use the correct shard validation function
    if (!isValidShardFormat(shardB) || !isValidShardFormat(shardC)) {
      console.log('🚨 [DEBUG] Invalid shard format received:');
      console.log('  shardB:', shardB);
      console.log('  shardC:', shardC);
      return res.status(400).json({ error: 'Invalid shard format (must be "x:hexdata" format)' });
    }

    // SECURITY CHECK: Ensure no sensitive data is received
    if (req.body.passphrase || req.body.shardA || req.body.masterKey || req.body.privateKey) {
      console.error('🚨 [SECURITY VIOLATION] Attempt to send sensitive data to backend');
      return res.status(400).json({ error: 'Invalid request data' });
    }

    console.log('🔍 [API] Checking if account already exists...');
    // Check if account already exists
    const existingUser = await User.findByWallet(walletAddress);
    if (existingUser) {
      console.error('❌ [API] Account already exists for:', walletAddress);
      return res.status(409).json({ error: 'Account already exists' });
    }

    console.log('🔄 [API] Storing Shard C in NGO service...');
    // Store Shard C in NGO service
    const shardCId = await mockNGO.storeShardB(walletAddress, shardC); // Using NGO service for Shard C
    console.log('✅ [API] Shard C stored with ID:', shardCId);

    console.log('🔄 [API] Creating user record in MongoDB...');
    // Create user record with Shard B stored directly in MongoDB
    const user = new User({
      walletAddress: walletAddress.toLowerCase(),
      shardB: shardB, // Store directly in MongoDB
      shardC_id: shardCId, // NGO service reference
      securityMeta: {
        creationMethod: 'direct'
      }
    });

    console.log('🔄 [API] Saving user to MongoDB...');
    await user.save();
    console.log('✅ [API] User saved successfully!');

    console.log(`✅ [API] Account created for ${walletAddress} with Shard C ID: ${shardCId}`);
    console.log(`✅ [API] Shard B stored directly in MongoDB`);

    res.status(201).json({
      success: true,
      walletAddress: walletAddress.toLowerCase()
    });
  } catch (error) {
    console.error('🚨 [API] Account creation failed:', error.message);
    console.error('🚨 [API] Error stack:', error.stack);
    
    // More specific error handling
    if (error.code === 11000) {
      console.error('🚨 [API] Duplicate key error - account already exists');
      return res.status(409).json({ error: 'Account already exists' });
    }
    
    if (error.name === 'ValidationError') {
      console.error('🚨 [API] Validation error:', error.message);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
    
    res.status(500).json({ 
      error: 'Account creation failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/v1/account/verify
 * Verify if an account exists (for login)
 */
router.post('/verify', verifyLimiter, async (req, res) => {
  try {
    const { walletAddress } = req.body;

    // Input validation
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    if (!isValidAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // Find user and update last login time
    const user = await User.findByWallet(walletAddress);
    
    if (user) {
      user.lastLoginAt = new Date();
      await user.save();
      
      console.log(`✅ [API] Account verified for ${walletAddress}`);
      
      res.json({
        exists: true,
        createdAt: user.createdAt
      });
    } else {
      console.log(`❌ [API] Account not found for ${walletAddress}`);
      
      res.json({
        exists: false
      });
    }
  } catch (error) {
    console.error('🚨 [API] Account verification failed:', error.message);
    res.status(500).json({ error: 'Account verification failed' });
  }
});

/**
 * POST /api/v1/account/recover-shard
 * Recover shards for new device login (with signature verification)
 */
router.post('/recover-shard', recoveryLimiter, async (req, res) => {
  try {
    const { walletAddress, message, signature } = req.body;

    // Input validation
    if (!walletAddress || !message || !signature) {
      return res.status(400).json({ error: 'Missing required fields: walletAddress, message, signature' });
    }

    if (!isValidAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // CRITICAL SECURITY: Verify signature to prove wallet ownership
    if (!verifySignature(message, signature, walletAddress)) {
      console.error(`🚨 [SECURITY] Invalid signature for recovery attempt: ${walletAddress}`);
      return res.status(401).json({ error: 'Invalid signature - wallet ownership not proven' });
    }

    // Find user account
    const user = await User.findByWallet(walletAddress);
    if (!user) {
      console.error(`🚨 [SECURITY] Recovery attempt for non-existent account: ${walletAddress}`);
      return res.status(404).json({ error: 'Account not found' });
    }

    // Retrieve shards: B from MongoDB, C from NGO service
    const shardB = user.shardB; // Direct from MongoDB
    const shardC = await mockNGO.retrieveShardB(user.shardC_id); // From NGO service

    // Log successful recovery (but not the shard data)
    console.log(`🔓 [API] Shard recovery successful for ${walletAddress}`);
    console.log(`    Message: ${message}`);
    console.log(`    Shard B: Retrieved from MongoDB`);
    console.log(`    NGO ID: ${user.shardC_id}`);

    res.json({
      success: true,
      shardB,
      shardC
    });
  } catch (error) {
    console.error('🚨 [API] Shard recovery failed:', error.message);
    res.status(500).json({ error: 'Shard recovery failed' });
  }
});

/**
 * POST /api/v1/account/update-shards
 * Update stored shards after recovery (shard rotation for security)
 */
router.post('/update-shards', updateShardsLimiter, async (req, res) => {
  try {
    const { walletAddress, shardB, shardC } = req.body;

    // Input validation
    if (!walletAddress || !shardB || !shardC) {
      return res.status(400).json({ error: 'Missing required fields: walletAddress, shardB, shardC' });
    }

    if (!isValidAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // FIXED: Use the correct shard validation function
    if (!isValidShardFormat(shardB) || !isValidShardFormat(shardC)) {
      return res.status(400).json({ error: 'Invalid shard format (must be "x:hexdata" format)' });
    }

    // Find user account
    const user = await User.findByWallet(walletAddress);
    if (!user) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Update Shard C in KMS
    const newShardCId = await mockKMS.update(user.shardC_id, walletAddress, shardC);

    // Update Shard B with NGO
    const newShardBId = await mockNGO.updateShardB(user.shardB_id, walletAddress, shardB);

    // Update user record
    user.shardB_id = newShardBId;
    user.shardC_id = newShardCId;
    user.securityMeta.lastShardRotation = new Date();
    await user.save();

    console.log(`🔄 [API] Shards updated for ${walletAddress} - New KMS ID: ${newShardCId}, New NGO ID: ${newShardBId}`);

    res.json({ success: true });
  } catch (error) {
    console.error('🚨 [API] Shard update failed:', error.message);
    res.status(500).json({ error: 'Shard update failed' });
  }
});

/**
 * POST /api/v1/account/get-shard
 * Get Shard B for evidence encryption (lightweight version of recovery)
 */
router.post('/get-shard', verifyLimiter, async (req, res) => {
  try {
    console.log('🔑 [API] Get-shard request received');
    console.log('🔑 [API] Request body:', req.body);
    
    const { walletAddress } = req.body;

    // Input validation
    if (!walletAddress) {
      console.error('❌ [API] Missing wallet address');
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    if (!isValidAddress(walletAddress)) {
      console.error('❌ [API] Invalid wallet address format:', walletAddress);
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    console.log('✅ [API] Wallet address validation passed:', walletAddress);

    // Find user account
    const user = await User.findByWallet(walletAddress);
    if (!user) {
      console.error('❌ [API] User not found in database:', walletAddress);
      return res.status(404).json({ error: 'Account not found' });
    }

    console.log('✅ [API] User found in database');
    console.log('🔑 [API] User shardB_id:', user.shardB_id);
    console.log('🔑 [API] User shardC_id:', user.shardC_id);

    // Check if NGO service is enabled
    // Retrieve Shard B directly from MongoDB (no external service needed)
    console.log('🔑 [API] Retrieving Shard B from MongoDB...');
    const shardB = user.shardB;
    console.log('✅ [API] Shard B retrieved successfully from MongoDB');

    // Log shard access (but not the shard data itself)
    console.log(`🔑 [API] Shard B retrieved for encryption: ${walletAddress}`);
    console.log(`    Source: MongoDB (direct storage)`);

    res.json({
      success: true,
      shardB
    });
  } catch (error) {
    console.error('🚨 [API] Shard retrieval failed:', error.message);
    console.error('🚨 [API] Error stack:', error.stack);
    console.error('🚨 [API] Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Shard retrieval failed' });
  }
});

/**
 * GET /api/v1/account/debug/:walletAddress
 * Debug user account and shard storage (DEVELOPMENT ONLY)
 */
router.get('/debug/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    console.log('🔍 [DEBUG] Checking account:', walletAddress);
    
    if (!isValidAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // Find user account
    const user = await User.findByWallet(walletAddress);
    if (!user) {
      return res.status(404).json({ 
        error: 'Account not found',
        debug: {
          walletAddress,
          found: false
        }
      });
    }

    // Check Shard B (stored directly in MongoDB)
    let shardBExists = false;
    let shardBError = null;
    try {
      const shardB = user.shardB;
      shardBExists = !!(shardB && shardB.length > 0);
      if (!shardBExists) {
        shardBError = "Shard B not found in MongoDB";
      }
    } catch (error) {
      shardBError = error.message;
    }

    // Try to retrieve Shard C from NGO service
    let shardCExists = false;
    let shardCError = null;
    try {
      const shardC = await mockNGO.retrieveShardB(user.shardC_id);
      shardCExists = !!shardC;
    } catch (error) {
      shardCError = error.message;
    }

    const debugInfo = {
      user: {
        walletAddress: user.walletAddress,
        shardB: user.shardB ? 'Stored in MongoDB' : 'Missing',
        shardC_id: user.shardC_id,
        createdAt: user.createdAt,
        securityMeta: user.securityMeta
      },
      services: {
        ngo: mockNGO.getStatus()
      },
      shards: {
        shardB: {
          exists: shardBExists,
          error: shardBError,
          storage: 'MongoDB (direct)'
        },
        shardC: {
          exists: shardCExists,
          error: shardCError,
          id: user.shardC_id,
          storage: 'NGO service'
        }
      }
    };

    console.log('🔍 [DEBUG] Account debug info:', debugInfo);

    res.json({
      success: true,
      debug: debugInfo
    });

  } catch (error) {
    console.error('🚨 [DEBUG] Debug failed:', error);
    res.status(500).json({ 
      error: 'Debug failed',
      details: error.message
    });
  }
});

/**
 * POST /api/v1/account/repair-shards
 * Repair broken shard storage for existing users (DEVELOPMENT ONLY)
 */
router.post('/repair-shards', async (req, res) => {
  try {
    const { walletAddress, shardB, shardC } = req.body;
    
    console.log('🔧 [REPAIR] Repairing shards for:', walletAddress);
    
    if (!walletAddress || !shardB || !shardC) {
      return res.status(400).json({ error: 'Missing required fields: walletAddress, shardB, shardC' });
    }

    if (!isValidAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // Find existing user
    const user = await User.findByWallet(walletAddress);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ [REPAIR] User found, proceeding with shard repair');

    // Store new Shard B with NGO partner
    const newShardBId = await mockNGO.storeShardB(walletAddress, shardB);
    console.log('✅ [REPAIR] New Shard B stored:', newShardBId);

    // Store new Shard C in KMS  
    const newShardCId = await mockKMS.encrypt(walletAddress, shardC);
    console.log('✅ [REPAIR] New Shard C stored:', newShardCId);

    // Update user record
    user.shardB_id = newShardBId;
    user.shardC_id = newShardCId;
    user.securityMeta.lastUpdated = new Date();
    user.securityMeta.repairCount = (user.securityMeta.repairCount || 0) + 1;
    
    await user.save();

    console.log('✅ [REPAIR] User record updated successfully');

    res.json({
      success: true,
      message: 'Shards repaired successfully',
      newShardIds: {
        shardB_id: newShardBId,
        shardC_id: newShardCId
      }
    });

  } catch (error) {
    console.error('🚨 [REPAIR] Repair failed:', error);
    res.status(500).json({ 
      error: 'Shard repair failed',
      details: error.message
    });
  }
});

module.exports = router;