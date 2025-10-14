/**
 * Evidence Service - AEGIS Phase 1
 * 
 * Handles evidence upload, encryption, and retrieval with zero-knowledge architecture.
 * Uses Shamir's Secret Sharing to reconstruct master key for file encryption.
 */

import { getSession } from './accountService';
import { combineShards, encryptFile, decryptFile } from './cryptoService';
import { getShardForEncryption, uploadEvidenceMetadata, getEvidenceListAPI, getEvidenceAPI, prepareForAnchoring } from './apiService';
// NEW: Import blockchain service
import { anchorEvidenceToBlockchain } from './blockchainService';

/**
 * Upload evidence files with encryption
 * @param {File[]} files - Array of files to upload
 * @param {File|null} coverImage - Optional cover image for steganography
 * @param {string} description - Optional description
 * @returns {Promise<Object>} Upload result
 */
export const uploadEvidence = async (files, coverImage, description = '') => {
  try {
    console.log('📤 [Evidence] Starting evidence upload...');
    console.log(`📄 Files: ${files.length}, Cover: ${coverImage ? 'Yes' : 'No'}`);
    
    // Get current user session
    const session = getSession();
    if (!session) {
      throw new Error('No active session found. Please log in.');
    }
    
    const { walletAddress } = session;
    console.log(`👤 [Evidence] User: ${walletAddress}`);
    
    // Get Shard A from localStorage (always stays on client)
    const encryptedShardA = localStorage.getItem('encryptedShardA');
    const storedPassphrase = sessionStorage.getItem('passphrase');
    
    if (!encryptedShardA) {
      throw new Error('Shard A not found. Please log in again.');
    }
    
    // Get user's passphrase (from session or prompt)
    const passphrase = storedPassphrase || prompt('Enter your passphrase to encrypt evidence:');
    if (!passphrase) {
      throw new Error('Passphrase required for encryption');
    }
    
    // Decrypt Shard A
    const { decryptShardA } = await import('./cryptoService');
    const shardA = decryptShardA(encryptedShardA, passphrase);
    
    // Get Shard B from backend
    console.log('🔑 [Evidence] Retrieving encryption key...');
    const shardBResponse = await getShardForEncryption(walletAddress);
    const shardB = shardBResponse.shardB;
    
    // Reconstruct master key from Shard A + Shard B
    const masterKey = await combineShards([shardA, shardB]);
    console.log('🔐 [Evidence] Master key reconstructed');
    
    // If description exists, create a text file from it
    const filesToEncrypt = [...files];
    if (description && description.trim()) {
      console.log('📝 [Evidence] Adding description as encrypted text file...');
      const descFile = new File([description], 'description.txt', { type: 'text/plain' });
      filesToEncrypt.push(descFile);
    }
    
    // Encrypt each file (including description file if present)
    const encryptedFiles = [];
    for (let i = 0; i < filesToEncrypt.length; i++) {
      const file = filesToEncrypt[i];
      const isDescription = file.name === 'description.txt' && file.type === 'text/plain';
      
      console.log(`🔒 [Evidence] Encrypting file ${i + 1}/${filesToEncrypt.length}: ${file.name}${isDescription ? ' (description)' : ''}`);
      
      const encryptedData = await encryptFile(file, masterKey);
      
      encryptedFiles.push({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        encryptedData: encryptedData,
        isDescription: isDescription, // Flag to identify description file
        timestamp: new Date().toISOString()
      });
    }
    
    // Handle cover image if provided (for steganography)
    let coverImageData = null;
    if (coverImage) {
      console.log('🖼️  [Evidence] Processing cover image for steganography...');
      coverImageData = {
        fileName: coverImage.name,
        fileType: coverImage.type,
        fileSize: coverImage.size,
        // Note: Actual steganography implementation would go here
        // For now, we'll just store the cover image info
      };
    }
    
    // STEP 1: Upload to backend first (backend will upload to Filebase and get CID + S3 key)
    const evidenceData = {
      walletAddress,
      files: encryptedFiles,
      coverImage: coverImageData,
      steganographyEnabled: !!coverImage,
      uploadedAt: new Date().toISOString()
    };
    
    // Upload to backend
    console.log('📤 [Evidence] Uploading to backend (Filebase storage)...');
    const uploadResult = await uploadEvidenceMetadata(evidenceData);
    
    // STEP 2: Blockchain anchoring AFTER backend upload (to get real CID and S3 key)
    let blockchainResult = null;
    try {
      // Check if backend returned CID and S3 key from Filebase
      const cidRoot = uploadResult.blockchain?.cidRoot;
      const s3KeyRoot = uploadResult.blockchain?.s3KeyRoot;
      
      if (cidRoot && s3KeyRoot) {
        console.log('⛓️  [Evidence] Starting blockchain anchoring with real CID and S3 key...');
        console.log(`🔗 CID: ${cidRoot}`);
        console.log(`📦 S3 Key: ${s3KeyRoot}`);
        
        // Ensure wallet has sufficient balance before anchoring
        console.log('💰 [Evidence] Checking wallet balance and funding if needed...');
        const prepareResult = await prepareForAnchoring(walletAddress);
        
        if (prepareResult.success && prepareResult.ready) {
          console.log('✅ [Evidence] Wallet ready for anchoring');
          if (prepareResult.fundingPerformed) {
            console.log(`💰 [Evidence] Wallet was funded: ${prepareResult.currentBalance} ETH`);
          } else {
            console.log(`💰 [Evidence] Wallet has sufficient balance: ${prepareResult.currentBalance} ETH`);
          }
        } else {
          console.warn('⚠️ [Evidence] Failed to prepare wallet for anchoring, will attempt anyway...');
        }
        
        // Attempt blockchain anchoring with real CID and S3 key
        blockchainResult = await anchorEvidenceToBlockchain(
          uploadResult.evidenceId,
          encryptedFiles,
          walletAddress,
          passphrase,
          cidRoot,  // Pass real CID from Filebase
          s3KeyRoot // Pass real S3 key from Filebase
        );
        
        if (blockchainResult.success) {
          console.log('✅ [Evidence] Blockchain anchoring successful');
          console.log(`🧾 Transaction: ${blockchainResult.transactionHash}`);
          console.log(`🧱 Block: ${blockchainResult.blockNumber}`);
          
          // TODO: Send blockchain result back to backend to update evidence record
          // This would be a PATCH request to update the blockchain fields
        } else {
          console.warn('⚠️ [Evidence] Blockchain anchoring failed');
          console.warn(`❌ Error: ${blockchainResult.error}`);
        }
      } else {
        console.warn('⚠️ [Evidence] CID or S3 key not available from backend, skipping blockchain anchoring');
        console.warn('💡 This may be because Filebase is not configured (running in mock mode)');
        blockchainResult = {
          success: false,
          error: 'CID or S3 key not available from storage',
          errorType: 'STORAGE_NOT_CONFIGURED'
        };
      }
      
    } catch (blockchainError) {
      console.warn('⚠️ [Evidence] Blockchain anchoring failed with exception');
      console.warn('❌ Blockchain error:', blockchainError.message);
      
      blockchainResult = {
        success: false,
        error: blockchainError.message,
        errorType: 'BLOCKCHAIN_EXCEPTION'
      };
    }
    
    // Clear sensitive data (masterKey is hex string, not array)
    let masterKeyCopy = masterKey;
    masterKeyCopy = null;
    if (shardA && shardA.fill) {
      shardA.fill(0);
    }
    
    console.log('✅ [Evidence] Upload completed successfully');
    return {
      success: true,
      evidenceId: uploadResult.evidenceId,
      filesUploaded: encryptedFiles.length,
      totalSize: encryptedFiles.reduce((sum, f) => sum + f.fileSize, 0),
      // NEW: Include blockchain result in response
      blockchain: blockchainResult
    };
    
  } catch (error) {
    console.error('🚨 [Evidence] Upload failed:', error);
    console.error('🚨 [Evidence] Error stack:', error.stack);
    console.error('🚨 [Evidence] Error details:', {
      message: error.message,
      name: error.name,
      cause: error.cause
    });
    throw new Error(`Evidence upload failed: ${error.message}`);
  }
};

/**
 * Get list of user's evidence
 * @param {string} walletAddress - User's wallet address
 * @returns {Promise<Array>} List of evidence metadata
 */
export const getEvidenceList = async (walletAddress) => {
  try {
    console.log(`📋 [Evidence] Fetching evidence list for: ${walletAddress}`);
    
    const evidenceList = await getEvidenceListAPI(walletAddress);
    
    console.log(`📋 [Evidence] Found ${evidenceList.length} evidence items`);
    return evidenceList;
    
  } catch (error) {
    console.error('🚨 [Evidence] Failed to fetch evidence list:', error);
    throw new Error(`Failed to get evidence list: ${error.message}`);
  }
};

/**
 * View/decrypt specific evidence
 * @param {string} evidenceId - Evidence ID to view
 * @returns {Promise<Object>} Decrypted evidence data
 */
export const viewEvidence = async (evidenceId) => {
  try {
    console.log(`👁️  [Evidence] Viewing evidence: ${evidenceId}`);
    
    // Get current user session
    const session = getSession();
    if (!session) {
      throw new Error('No active session found. Please log in.');
    }
    
    const { walletAddress } = session;
    
    // Get evidence metadata from backend
    const evidence = await getEvidenceAPI(evidenceId);
    
    // Verify ownership
    if (evidence.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new Error('Access denied: You can only view your own evidence');
    }
    
    // Get Shard A from localStorage
    const encryptedShardA = localStorage.getItem('encryptedShardA');
    const storedPassphrase = sessionStorage.getItem('passphrase');
    
    if (!encryptedShardA) {
      throw new Error('Shard A not found. Please log in again.');
    }
    
    // Get user's passphrase (from session or prompt)
    const passphrase = storedPassphrase || prompt('Enter your passphrase to view evidence:');
    if (!passphrase) {
      throw new Error('Passphrase required for decryption');
    }
    
    // Decrypt Shard A
    const { decryptShardA } = await import('./cryptoService');
    const shardA = decryptShardA(encryptedShardA, passphrase);
    
    // Get Shard B from backend
    const shardBResponse = await getShardForEncryption(walletAddress);
    const shardB = shardBResponse.shardB;
    
    // Reconstruct master key
    const masterKey = await combineShards([shardA, shardB]);
    
    // Decrypt files
    const decryptedFiles = [];
    let description = '';
    
    for (const fileData of evidence.files) {
      const decryptedBlob = await decryptFile(
        fileData.encryptedData,
        masterKey,
        fileData.fileName,
        fileData.fileType
      );
      
      // Check if this is the description file
      if (fileData.isDescription && fileData.fileName === 'description.txt') {
        // Read description content
        const text = await decryptedBlob.text();
        description = text;
        console.log('📝 [Evidence] Found encrypted description');
      } else {
        // Create download URL for regular files
        const url = URL.createObjectURL(decryptedBlob);
        
        decryptedFiles.push({
          ...fileData,
          blob: decryptedBlob,
          url: url
        });
      }
    }
    
    // Clear sensitive data
    masterKey.fill(0);
    shardA.fill && shardA.fill(0);
    
    console.log(`✅ [Evidence] Evidence decrypted: ${decryptedFiles.length} files`);
    
    return {
      evidenceId: evidence.evidenceId,
      description: description, // Now comes from decrypted file
      uploadedAt: evidence.uploadedAt,
      files: decryptedFiles,
      steganographyEnabled: evidence.steganographyEnabled
    };
    
  } catch (error) {
    console.error('🚨 [Evidence] Failed to view evidence:', error);
    throw new Error(`Failed to view evidence: ${error.message}`);
  }
};

/**
 * Delete evidence (frontend only - marks as deleted)
 * @param {string} evidenceId - Evidence ID to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteEvidence = async (evidenceId) => {
  try {
    console.log(`🗑️  [Evidence] Deleting evidence: ${evidenceId}`);
    
    // Get current user session
    const session = getSession();
    if (!session) {
      throw new Error('No active session found. Please log in.');
    }
    
    // TODO: Implement backend call to mark evidence as deleted
    // For now, just return success
    console.log('✅ [Evidence] Evidence deleted (placeholder)');
    return true;
    
  } catch (error) {
    console.error('🚨 [Evidence] Failed to delete evidence:', error);
    throw new Error(`Failed to delete evidence: ${error.message}`);
  }
};