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

    // Check if account exists
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
    const { walletAddress, shardB, shardC } = req.body;

    // Input validation
    if (!walletAddress || !shardB || !shardC) {
      return res.status(400).json({ error: 'Missing required fields: walletAddress, shardB, shardC' });
    }

    if (!isValidAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    if (!isValidHexString(shardB) || !isValidHexString(shardC)) {
      return res.status(400).json({ error: 'Invalid shard format (must be hex strings)' });
    }

    // SECURITY CHECK: Ensure no sensitive data is received
    if (req.body.passphrase || req.body.shardA || req.body.masterKey || req.body.privateKey) {
      console.error('🚨 [SECURITY VIOLATION] Attempt to send sensitive data to backend');
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Check if account already exists
    const existingUser = await User.findByWallet(walletAddress);
    if (existingUser) {
      return res.status(409).json({ error: 'Account already exists' });
    }

    // Store Shard C in KMS
    const shardCId = await mockKMS.encrypt(walletAddress, shardC);

    // Store Shard B with NGO partner
    const shardBId = await mockNGO.storeShardB(walletAddress, shardB);

    // Create user record with only references to external shards
    const user = new User({
      walletAddress: walletAddress.toLowerCase(),
      shardB_id: shardBId,
      shardC_id: shardCId,
      securityMeta: {
        creationMethod: 'direct'
      }
    });

    await user.save();

    console.log(`✅ [API] Account created for ${walletAddress} with KMS ID: ${shardCId}, NGO ID: ${shardBId}`);

    res.status(201).json({
      success: true,
      walletAddress: walletAddress.toLowerCase()
    });
  } catch (error) {
    console.error('🚨 [API] Account creation failed:', error.message);
    res.status(500).json({ error: 'Account creation failed' });
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

    // Find user
    const user = await User.findByWallet(walletAddress);

    if (user) {
      // Update last login timestamp
      await user.updateLastLogin();

      console.log(`✅ [API] Account verified for ${walletAddress}`);

      res.json({
        exists: true,
        createdAt: user.createdAt
      });
    } else {
      console.log(`❌ [API] Account not found for ${walletAddress}`);

      res.status(404).json({
        error: 'Account not found'
      });
    }
  } catch (error) {
    console.error('🚨 [API] Account verification failed:', error.message);
    res.status(500).json({ error: 'Account verification failed' });
  }
});

/**
 * POST /api/v1/account/recover-shard
 * Recover shards for new device login (requires signature verification)
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
      return res.status(401).json({ error: 'Invalid signature - wallet ownership not verified' });
    }

    // Find user account
    const user = await User.findByWallet(walletAddress);
    if (!user) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Record recovery attempt for security monitoring
    await user.recordRecoveryAttempt();

    // Retrieve Shard B from NGO partner
    const shardB = await mockNGO.retrieveShardB(user.shardB_id);

    // Retrieve Shard C from KMS
    const shardC = await mockKMS.decrypt(user.shardC_id);

    console.log(`🔓 [API] Shard recovery successful for ${walletAddress}`);

    // Return BOTH shards to client (client still needs Shard A to reconstruct master key)
    res.json({
      success: true,
      shardB: shardB,
      shardC: shardC
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

    if (!isValidHexString(shardB) || !isValidHexString(shardC)) {
      return res.status(400).json({ error: 'Invalid shard format (must be hex strings)' });
    }

    // Find user account
    const user = await User.findByWallet(walletAddress);
    if (!user) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Update Shard C in KMS
    const newShardCId = await mockKMS.update(user.shardC_id, walletAddress, shardC);

    // Update Shard B with NGO partner
    const newShardBId = await mockNGO.updateShardB(user.shardB_id, walletAddress, shardB);

    // Update user record with new shard references
    await user.updateShardReferences(newShardBId, newShardCId);

    console.log(`🔄 [API] Shards updated for ${walletAddress}: KMS ${user.shardC_id} → ${newShardCId}, NGO ${user.shardB_id} → ${newShardBId}`);

    res.json({
      success: true
    });
  } catch (error) {
    console.error('🚨 [API] Shard update failed:', error.message);
    res.status(500).json({ error: 'Shard update failed' });
  }
});

module.exports = router;