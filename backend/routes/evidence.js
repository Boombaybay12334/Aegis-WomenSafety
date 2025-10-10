/**
 * Evidence Routes - AEGIS Phase 1
 * 
 * API endpoints for evidence upload, retrieval, and management.
 * Implements zero-knowledge architecture with proper security validation.
 */

const express = require('express');
const Evidence = require('../models/Evidence');
const User = require('../models/User');
const { availabilityLimiter, generalLimiter } = require('../middleware/rateLimiter');
// NEW: Import blockchain service
const { fundUserWallet, processBlockchainData } = require('../services/blockchainService');

const router = express.Router();

// Security validation helpers
const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

const isValidEvidenceId = (evidenceId) => {
  return typeof evidenceId === 'string' && evidenceId.startsWith('evidence_') && evidenceId.length > 10;
};

/**
 * POST /api/v1/evidence/upload
 * Upload encrypted evidence files
 */
router.post('/upload', generalLimiter, async (req, res) => {
  try {
    console.log('📥 [Evidence] Upload request received');
    console.log('📥 [Evidence] Request body keys:', Object.keys(req.body));
    console.log('📥 [Evidence] Files count:', req.body.files ? req.body.files.length : 'undefined');
    
    // NEW: Extract blockchain data from request
    const { walletAddress, files, coverImage, description, steganographyEnabled, uploadedAt, blockchain } = req.body;

    // Input validation
    if (!walletAddress || !files || !Array.isArray(files) || files.length === 0) {
      console.error('❌ [Evidence] Missing required fields');
      return res.status(400).json({ error: 'Missing required fields: walletAddress, files' });
    }

    if (!isValidAddress(walletAddress)) {
      console.error('❌ [Evidence] Invalid wallet address:', walletAddress);
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    console.log('✅ [Evidence] Basic validation passed');

    // Verify user exists
    const user = await User.findByWallet(walletAddress);
    if (!user) {
      console.error('❌ [Evidence] User not found:', walletAddress);
      return res.status(404).json({ error: 'User account not found' });
    }

    console.log('✅ [Evidence] User found:', walletAddress);

    // Validate files
    for (const file of files) {
      if (!file.fileName || !file.fileType || !file.encryptedData || typeof file.fileSize !== 'number') {
        console.error('❌ [Evidence] Invalid file format:', file);
        return res.status(400).json({ error: 'Invalid file format: missing required fields' });
      }
      
      if (file.fileSize > 16 * 1024 * 1024) { // 16MB limit
        return res.status(400).json({ error: `File too large: ${file.fileName} exceeds 16MB limit` });
      }
      
      // Validate base64 format (basic check)
      if (typeof file.encryptedData !== 'string' || file.encryptedData.length === 0) {
        return res.status(400).json({ error: 'Invalid encrypted data format' });
      }
    }

    console.log('✅ [Evidence] File validation passed');

    // NEW: Process blockchain data from frontend
    const blockchainData = processBlockchainData(blockchain);
    console.log('⛓️  [Evidence] Blockchain data processed:', blockchainData.anchored ? 'anchored' : 'not anchored');

    // Create evidence record
    const evidence = new Evidence({
      walletAddress: walletAddress.toLowerCase(),
      files: files.map(file => ({
        fileName: file.fileName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        encryptedData: file.encryptedData,
        isDescription: file.isDescription || false, // ADD: Support for description flag
        timestamp: file.timestamp || new Date()
      })),
      coverImage: coverImage || null,
      steganographyEnabled: steganographyEnabled || false,
      uploadedAt: uploadedAt || new Date(),
      // NEW: Include blockchain data
      blockchain: blockchainData
    });

    await evidence.save();

    console.log(`📤 [Evidence] Upload successful: ${evidence.evidenceId} (${files.length} files, ${evidence.metadata.totalSize} bytes)`);

    // NEW: Fund user wallet after successful evidence upload
    let fundingResult = null;
    try {
      console.log('💳 [Evidence] Initiating wallet funding...');
      fundingResult = await fundUserWallet(walletAddress, evidence.evidenceId);
      
      if (fundingResult.success && !fundingResult.skipped) {
        console.log(`✅ [Evidence] Wallet funding successful: ${fundingResult.transactionHash}`);
      } else if (fundingResult.skipped) {
        console.log(`ℹ️  [Evidence] Wallet funding skipped: ${fundingResult.reason}`);
      } else {
        console.warn(`⚠️ [Evidence] Wallet funding failed: ${fundingResult.error}`);
      }
    } catch (fundingError) {
      console.warn('⚠️ [Evidence] Wallet funding failed with exception:', fundingError.message);
      fundingResult = {
        success: false,
        error: fundingError.message,
        errorType: 'FUNDING_EXCEPTION'
      };
    }

    res.status(201).json({
      success: true,
      evidenceId: evidence.evidenceId,
      filesUploaded: files.length,
      totalSize: evidence.metadata.totalSize,
      steganographyEnabled: evidence.steganographyEnabled,
      // NEW: Include blockchain and funding results
      blockchain: blockchainData,
      funding: fundingResult
    });

  } catch (error) {
    console.error('🚨 [Evidence] Upload failed:', error.message);
    console.error('🚨 [Evidence] Error stack:', error.stack);
    console.error('🚨 [Evidence] Error details:', error);
    
    // More specific error handling
    if (error.name === 'ValidationError') {
      console.error('🚨 [Evidence] Validation error:', error.message);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
    
    res.status(500).json({ 
      error: 'Evidence upload failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/v1/evidence/list/:walletAddress
 * Get list of evidence for a wallet address
 */
router.get('/list/:walletAddress', generalLimiter, async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!isValidAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // Find evidence (without encrypted data for performance)
    const evidenceList = await Evidence.findByWallet(walletAddress).select('-files.encryptedData');

    console.log(`📋 [Evidence] List request for ${walletAddress}: ${evidenceList.length} items`);

    res.json({
      success: true,
      walletAddress: walletAddress.toLowerCase(),
      count: evidenceList.length,
      evidence: evidenceList.map(evidence => evidence.toSecureJSON())
    });

  } catch (error) {
    console.error('🚨 [Evidence] List failed:', error.message);
    res.status(500).json({ error: 'Failed to retrieve evidence list' });
  }
});

/**
 * GET /api/v1/evidence/:evidenceId
 * Get specific evidence with encrypted data
 */
router.get('/:evidenceId', generalLimiter, async (req, res) => {
  try {
    const { evidenceId } = req.params;

    if (!isValidEvidenceId(evidenceId)) {
      return res.status(400).json({ error: 'Invalid evidence ID format' });
    }

    // Find evidence with encrypted data
    const evidence = await Evidence.findByEvidenceId(evidenceId);
    if (!evidence) {
      return res.status(404).json({ error: 'Evidence not found' });
    }

    console.log(`👁️  [Evidence] View request for ${evidenceId} by wallet ${evidence.walletAddress}`);

    res.json({
      success: true,
      evidenceId: evidence.evidenceId,
      walletAddress: evidence.walletAddress,
      files: evidence.files, // Includes encrypted data
      coverImage: evidence.coverImage,
      description: evidence.description,
      steganographyEnabled: evidence.steganographyEnabled,
      uploadedAt: evidence.uploadedAt,
      metadata: evidence.metadata
    });

  } catch (error) {
    console.error('🚨 [Evidence] View failed:', error.message);
    res.status(500).json({ error: 'Failed to retrieve evidence' });
  }
});

/**
 * DELETE /api/v1/evidence/:evidenceId
 * Mark evidence as deleted (soft delete)
 */
router.delete('/:evidenceId', generalLimiter, async (req, res) => {
  try {
    const { evidenceId } = req.params;
    const { walletAddress } = req.body;

    if (!isValidEvidenceId(evidenceId)) {
      return res.status(400).json({ error: 'Invalid evidence ID format' });
    }

    if (!walletAddress || !isValidAddress(walletAddress)) {
      return res.status(400).json({ error: 'Valid wallet address required for deletion' });
    }

    // Find evidence
    const evidence = await Evidence.findByEvidenceId(evidenceId);
    if (!evidence) {
      return res.status(404).json({ error: 'Evidence not found' });
    }

    // Verify ownership
    if (evidence.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(403).json({ error: 'Access denied: You can only delete your own evidence' });
    }

    // Soft delete
    await evidence.markAsDeleted();

    console.log(`🗑️  [Evidence] Deleted: ${evidenceId} by ${walletAddress}`);

    res.json({
      success: true,
      evidenceId: evidenceId,
      message: 'Evidence marked as deleted'
    });

  } catch (error) {
    console.error('🚨 [Evidence] Delete failed:', error.message);
    res.status(500).json({ error: 'Failed to delete evidence' });
  }
});

/**
 * GET /api/v1/evidence/stats/summary
 * Get anonymized statistics for monitoring
 */
router.get('/stats/summary', availabilityLimiter, async (req, res) => {
  try {
    const stats = await Evidence.getSecurityStats();

    console.log('📊 [Evidence] Stats requested');

    res.json({
      success: true,
      stats: {
        totalEvidence: stats.totalEvidence,
        totalFiles: stats.totalFiles,
        totalSizeMB: Math.round(stats.totalSizeBytes / (1024 * 1024) * 100) / 100,
        steganographyUsage: stats.steganographyCount,
        uniqueUsers: stats.uniqueUsers,
        timestamp: stats.timestamp
      }
    });

  } catch (error) {
    console.error('🚨 [Evidence] Stats failed:', error.message);
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
});

module.exports = router;