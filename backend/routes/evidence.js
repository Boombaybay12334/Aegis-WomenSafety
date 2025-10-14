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
const { fundUserWallet, ensureBalanceForAnchoring, processBlockchainData } = require('../services/blockchainService');
// NEW: Import Filebase service for real S3/IPFS storage
const { uploadMultipleFiles, isFilebaseConfigured } = require('../services/filebaseService');

const router = express.Router();

// Security validation helpers
const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

const isValidEvidenceId = (evidenceId) => {
  return typeof evidenceId === 'string' && evidenceId.startsWith('evidence_') && evidenceId.length > 10;
};

/**
 * POST /api/v1/evidence/prepare-anchoring
 * Ensure wallet has sufficient balance before anchoring
 * This should be called by the frontend BEFORE attempting to anchor evidence
 */
router.post('/prepare-anchoring', generalLimiter, async (req, res) => {
  try {
    console.log('⚓ [Evidence] Prepare anchoring request received');
    const { walletAddress } = req.body;

    // Input validation
    if (!walletAddress) {
      console.error('❌ [Evidence] Missing wallet address');
      return res.status(400).json({ error: 'Missing required field: walletAddress' });
    }

    if (!isValidAddress(walletAddress)) {
      console.error('❌ [Evidence] Invalid wallet address:', walletAddress);
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // Verify user exists
    const user = await User.findByWallet(walletAddress);
    if (!user) {
      console.error('❌ [Evidence] User not found:', walletAddress);
      return res.status(404).json({ error: 'User account not found' });
    }

    console.log('✅ [Evidence] User found, checking balance for anchoring...');

    // Ensure balance for anchoring
    const balanceCheckResult = await ensureBalanceForAnchoring(walletAddress, `anchoring_prep_${Date.now()}`);

    if (balanceCheckResult.success) {
      console.log('✅ [Evidence] Wallet ready for anchoring');
      return res.status(200).json({
        success: true,
        ready: true,
        currentBalance: balanceCheckResult.currentBalance,
        minRequired: balanceCheckResult.minRequired,
        fundingPerformed: balanceCheckResult.fundingPerformed,
        message: balanceCheckResult.fundingPerformed 
          ? 'Wallet funded and ready for anchoring' 
          : 'Wallet has sufficient balance for anchoring'
      });
    } else {
      console.error('❌ [Evidence] Failed to prepare wallet for anchoring:', balanceCheckResult.error);
      return res.status(500).json({
        success: false,
        ready: false,
        error: balanceCheckResult.error,
        errorType: balanceCheckResult.errorType
      });
    }

  } catch (error) {
    console.error('🚨 [Evidence] Prepare anchoring failed:', error.message);
    return res.status(500).json({
      success: false,
      ready: false,
      error: 'Failed to prepare wallet for anchoring',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

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

    // NEW: Upload files to Filebase (S3 + IPFS)
    console.log('📤 [Evidence] Starting Filebase upload...');
    
    // Generate evidence ID early for Filebase upload
    const evidenceId = `evidence_${walletAddress.slice(2, 10)}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    let uploadedFiles;
    let cidRoot = null;
    let s3KeyRoot = null;
    
    if (isFilebaseConfigured()) {
      console.log('✅ [Evidence] Filebase configured, uploading to S3/IPFS...');
      
      // Prepare files for upload
      const filesToUpload = files.map(file => ({
        data: file.encryptedData, // base64 string
        fileName: file.fileName,
        fileType: file.fileType,
        fileSize: file.fileSize
      }));
      
      // Upload to Filebase
      const uploadResults = await uploadMultipleFiles(filesToUpload, walletAddress, evidenceId);
      
      // Check for upload failures
      const failedUploads = uploadResults.filter(r => !r.success);
      if (failedUploads.length > 0) {
        console.error('❌ [Evidence] Some files failed to upload:', failedUploads);
        return res.status(500).json({ 
          error: 'Some files failed to upload to storage',
          failedFiles: failedUploads.map(f => f.fileName)
        });
      }
      
      console.log('✅ [Evidence] All files uploaded to Filebase successfully');
      
      // Use the first file's CID as the root CID for now
      // In a more advanced implementation, you could create a directory CID
      cidRoot = uploadResults[0]?.cid || null;
      s3KeyRoot = uploadResults[0]?.s3Key || null;
      
      // Map uploaded files with S3 keys and CIDs
      uploadedFiles = uploadResults.map((uploadResult, index) => ({
        fileName: uploadResult.fileName,
        fileType: uploadResult.fileType,
        fileSize: uploadResult.fileSize,
        s3Key: uploadResult.s3Key,
        cid: uploadResult.cid,
        isDescription: files[index].isDescription || false,
        timestamp: new Date(uploadResult.uploadedAt)
      }));
      
    } else {
      console.log('⚠️  [Evidence] Filebase not configured, using legacy MongoDB storage');
      
      // Legacy mode: store encrypted data in MongoDB
      uploadedFiles = files.map(file => ({
        fileName: file.fileName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        encryptedData: file.encryptedData,
        isDescription: file.isDescription || false,
        timestamp: file.timestamp || new Date()
      }));
    }

    // Create evidence record
    const evidence = new Evidence({
      evidenceId: evidenceId, // Use pre-generated ID
      walletAddress: walletAddress.toLowerCase(),
      files: uploadedFiles, // Use uploaded files with S3 keys and CIDs
      coverImage: coverImage || null,
      steganographyEnabled: steganographyEnabled || false,
      uploadedAt: uploadedAt || new Date(),
      // NEW: Include blockchain data with CID and S3 key roots
      blockchain: {
        ...blockchainData,
        cidRoot: cidRoot,
        s3KeyRoot: s3KeyRoot
      }
    });

    await evidence.save();

    console.log(`📤 [Evidence] Upload successful: ${evidence.evidenceId} (${files.length} files, ${evidence.metadata.totalSize} bytes)`);
    
    // Log storage details
    if (isFilebaseConfigured()) {
      console.log(`🔗 [Evidence] Root CID: ${cidRoot}`);
      console.log(`📦 [Evidence] Root S3 Key: ${s3KeyRoot}`);
    }

    res.status(201).json({
      success: true,
      evidenceId: evidence.evidenceId,
      filesUploaded: files.length,
      totalSize: evidence.metadata.totalSize,
      steganographyEnabled: evidence.steganographyEnabled,
      // NEW: Include blockchain results with CID and S3 key
      blockchain: {
        ...blockchainData,
        cidRoot: cidRoot,
        s3KeyRoot: s3KeyRoot
      }
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
      files: evidence.files, // Includes encrypted data (legacy) OR s3Key/cid (new)
      coverImage: evidence.coverImage,
      description: evidence.description,
      steganographyEnabled: evidence.steganographyEnabled,
      uploadedAt: evidence.uploadedAt,
      metadata: evidence.metadata,
      // NEW: Include blockchain data with CID and S3 key
      blockchain: evidence.blockchain
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