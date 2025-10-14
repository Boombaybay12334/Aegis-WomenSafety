/**
 * Blockchain Service - AEGIS Frontend
 * 
 * Handles evidence anchoring to Polygon zkEVM blockchain.
 * Provides graceful fallback when blockchain is unavailable.
 */

import { ethers } from 'ethers';
import { generateWalletFromPassphrase } from './cryptoService';
import { 
  BLOCKCHAIN_CONFIG, 
  EVIDENCE_ANCHOR_ABI, 
  getNetworkConfig,
  getPrivacyPolicyHash 
} from '../config/blockchain';

/**
 * NEW: Create blockchain provider
 */
const createProvider = () => {
  const networkConfig = getNetworkConfig();
  
  try {
    return new ethers.providers.JsonRpcProvider(networkConfig.rpcUrl);
  } catch (error) {
    console.error('🚨 [Blockchain] Failed to create provider:', error);
    return null;
  }
};

/**
 * NEW: Create contract instance
 */
const createContract = (provider, wallet = null) => {
  try {
    const contract = new ethers.Contract(
      BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS,
      EVIDENCE_ANCHOR_ABI,
      wallet || provider
    );
    return contract;
  } catch (error) {
    console.error('🚨 [Blockchain] Failed to create contract:', error);
    return null;
  }
};

/**
 * NEW: Generate evidence merkle root from encrypted files
 */
const generateEvidenceMerkleRoot = (encryptedFiles) => {
  try {
    // Combine all encrypted data for hashing
    const combinedData = encryptedFiles
      .map(file => `${file.fileName}:${file.fileType}:${file.encryptedData}`)
      .join('|');
    
    // Create merkle root hash
    const merkleRoot = ethers.utils.id(combinedData);
    
    console.log('📊 [Blockchain] Generated merkle root:', merkleRoot);
    return merkleRoot;
  } catch (error) {
    console.error('🚨 [Blockchain] Failed to generate merkle root:', error);
    throw new Error(`Merkle root generation failed: ${error.message}`);
  }
};

/**
 * NEW: Convert evidence ID to bytes32 format
 */
const evidenceIdToBytes32 = (evidenceId) => {
  try {
    return ethers.utils.id(evidenceId);
  } catch (error) {
    console.error('🚨 [Blockchain] Failed to convert evidence ID:', error);
    throw new Error(`Evidence ID conversion failed: ${error.message}`);
  }
};

/**
 * NEW: Anchor evidence to blockchain
 * @param {string} evidenceId - Evidence identifier from backend
 * @param {Array} encryptedFiles - Array of encrypted file objects
 * @param {string} walletAddress - User's wallet address
 * @param {string} passphrase - User's passphrase for wallet access
 * @param {string} cidRoot - IPFS CID from Filebase storage
 * @param {string} s3KeyRoot - S3 key from Filebase storage
 * @returns {Promise<Object>} Blockchain transaction result
 */
export const anchorEvidenceToBlockchain = async (evidenceId, encryptedFiles, walletAddress, passphrase, cidRoot = null, s3KeyRoot = null) => {
  const startTime = Date.now();
  
  try {
    console.log('⛓️  [Blockchain] Starting evidence anchoring...');
    console.log(`📋 Evidence ID: ${evidenceId}`);
    console.log(`👤 Wallet: ${walletAddress}`);
    console.log(`📄 Files: ${encryptedFiles.length}`);
    console.log(`🔗 CID Root: ${cidRoot || 'not provided (will use placeholder)'}`);
    console.log(`📦 S3 Key Root: ${s3KeyRoot || 'not provided (will use placeholder)'}`);
    
    // Create provider
    const provider = createProvider();
    if (!provider) {
      throw new Error('Failed to connect to blockchain network');
    }
    
    // Check network connectivity
    try {
      await provider.getNetwork();
      console.log('✅ [Blockchain] Network connection established');
    } catch (networkError) {
      throw new Error(`Network connectivity failed: ${networkError.message}`);
    }
    
    // Create wallet from passphrase
    const wallet = generateWalletFromPassphrase(passphrase);
    const connectedWallet = wallet.connect(provider);
    
    console.log('🔑 [Blockchain] Wallet connected:', wallet.address);
    
    // Verify wallet address matches
    if (wallet.address.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new Error('Wallet address mismatch - security validation failed');
    }
    
    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 [Blockchain] Wallet balance: ${ethers.utils.formatEther(balance)} ETH`);
    
    if (balance.lt(ethers.utils.parseEther('0.001'))) {
      console.warn('⚠️ [Blockchain] Low wallet balance - transaction may fail');
    }
    
    // Generate blockchain parameters
    const evidenceIdBytes32 = evidenceIdToBytes32(evidenceId);
    const merkleRoot = generateEvidenceMerkleRoot(encryptedFiles);
    
    // Use real CID and S3 key if provided, otherwise use placeholders
    const finalCidRoot = cidRoot 
      ? ethers.utils.id(cidRoot) 
      : ethers.utils.id('aegis-evidence-cid-placeholder');
    
    const finalS3Key = s3KeyRoot 
      ? ethers.utils.id(s3KeyRoot) 
      : ethers.utils.id(`aegis-s3-placeholder-${evidenceId}`);
    
    const policyId = getPrivacyPolicyHash();
    
    console.log('📊 [Blockchain] Transaction parameters prepared');
    console.log(`🔗 Evidence ID (bytes32): ${evidenceIdBytes32}`);
    console.log(`🌳 Merkle Root: ${merkleRoot}`);
    console.log(`📦 CID Root (bytes32): ${finalCidRoot}`);
    console.log(`🗂️  S3 Key (bytes32): ${finalS3Key}`);
    console.log(`📜 Policy ID: ${policyId}`);
    
    // Create contract instance
    const contract = createContract(provider, connectedWallet);
    if (!contract) {
      throw new Error('Failed to create contract instance');
    }
    
    // Estimate gas
    let gasEstimate;
    try {
      gasEstimate = await contract.estimateGas.anchorEvidence(
        evidenceIdBytes32,
        merkleRoot,
        finalCidRoot,
        finalS3Key,
        policyId
      );
      console.log(`⛽ [Blockchain] Gas estimate: ${gasEstimate.toString()}`);
    } catch (gasError) {
      console.warn('⚠️ [Blockchain] Gas estimation failed, using default:', gasError.message);
      gasEstimate = ethers.BigNumber.from(BLOCKCHAIN_CONFIG.GAS_LIMIT.ANCHOR_EVIDENCE);
    }
    
    // Execute transaction with retry logic
    let transaction;
    let retries = 0;
    const maxRetries = BLOCKCHAIN_CONFIG.RETRY_CONFIG.MAX_RETRIES;
    
    while (retries <= maxRetries) {
      try {
        console.log(`🚀 [Blockchain] Submitting transaction (attempt ${retries + 1}/${maxRetries + 1})...`);
        
        transaction = await contract.anchorEvidence(
          evidenceIdBytes32,
          merkleRoot,
          finalCidRoot,
          finalS3Key,
          policyId,
          {
            gasLimit: gasEstimate.mul(120).div(100), // 20% buffer
            gasPrice: await provider.getGasPrice()
          }
        );
        
        console.log(`📧 [Blockchain] Transaction submitted: ${transaction.hash}`);
        break;
        
      } catch (txError) {
        retries++;
        console.error(`🚨 [Blockchain] Transaction attempt ${retries} failed:`, txError.message);
        
        if (retries > maxRetries) {
          throw new Error(`Transaction failed after ${maxRetries + 1} attempts: ${txError.message}`);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, BLOCKCHAIN_CONFIG.RETRY_CONFIG.RETRY_DELAY));
      }
    }
    
    // Wait for confirmation
    console.log('⏳ [Blockchain] Waiting for transaction confirmation...');
    const receipt = await transaction.wait(BLOCKCHAIN_CONFIG.CONFIRMATION_BLOCKS);
    
    const executionTime = Date.now() - startTime;
    console.log(`✅ [Blockchain] Evidence anchored successfully!`);
    console.log(`🧾 Block: ${receipt.blockNumber}`);
    console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
    console.log(`⏱️ Execution time: ${executionTime}ms`);
    
    // Return structured response
    return {
      success: true,
      transactionHash: transaction.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      merkleRoot: merkleRoot,
      cidRoot: cidRoot || null, // Original CID (not hashed)
      s3KeyRoot: s3KeyRoot || null, // Original S3 key (not hashed)
      evidenceIdBytes32: evidenceIdBytes32,
      policyId: policyId,
      timestamp: new Date().toISOString(),
      executionTime: executionTime,
      confirmedAt: new Date().toISOString()
    };
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('🚨 [Blockchain] Evidence anchoring failed:', error);
    console.error('🚨 [Blockchain] Error details:', {
      message: error.message,
      stack: error.stack,
      executionTime: `${executionTime}ms`
    });
    
    // Return structured error response
    return {
      success: false,
      error: error.message,
      errorType: error.code || 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString(),
      executionTime: executionTime
    };
  }
};

/**
 * NEW: Verify evidence on blockchain
 * @param {string} evidenceId - Evidence identifier
 * @returns {Promise<Object>} Verification result
 */
export const verifyEvidenceOnBlockchain = async (evidenceId) => {
  try {
    console.log('🔍 [Blockchain] Starting evidence verification...');
    console.log(`📋 Evidence ID: ${evidenceId}`);
    
    const provider = createProvider();
    if (!provider) {
      throw new Error('Failed to connect to blockchain network');
    }
    
    const contract = createContract(provider);
    if (!contract) {
      throw new Error('Failed to create contract instance');
    }
    
    const evidenceIdBytes32 = evidenceIdToBytes32(evidenceId);
    console.log(`🔗 Evidence ID (bytes32): ${evidenceIdBytes32}`);
    
    // Call verify function (this emits an event)
    const anchor = await contract.verifyEvidence(evidenceIdBytes32);
    
    console.log('✅ [Blockchain] Evidence verification completed');
    
    return {
      success: true,
      evidenceId: evidenceId,
      anchor: {
        merkleRoot: anchor.merkleRoot,
        cidRoot: anchor.cidRoot,
        s3Key: anchor.s3Key,
        timestamp: new Date(Number(anchor.timestamp) * 1000).toISOString(),
        policyId: anchor.policyId,
        submitter: anchor.submitter,
        exists: anchor.exists
      },
      verifiedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('🚨 [Blockchain] Evidence verification failed:', error);
    
    return {
      success: false,
      error: error.message,
      errorType: error.code || 'VERIFICATION_FAILED',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * NEW: Get user's anchored evidence list
 * @param {string} walletAddress - User's wallet address
 * @returns {Promise<Object>} User's evidence list
 */
export const getUserAnchoredEvidence = async (walletAddress) => {
  try {
    console.log('📋 [Blockchain] Getting user anchored evidence...');
    console.log(`👤 Wallet: ${walletAddress}`);
    
    const provider = createProvider();
    if (!provider) {
      throw new Error('Failed to connect to blockchain network');
    }
    
    const contract = createContract(provider);
    if (!contract) {
      throw new Error('Failed to create contract instance');
    }
    
    const anchorIds = await contract.getUserAnchors(walletAddress);
    
    console.log(`📄 [Blockchain] Found ${anchorIds.length} anchored evidence items`);
    
    return {
      success: true,
      walletAddress: walletAddress,
      count: anchorIds.length,
      evidenceIds: anchorIds,
      retrievedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('🚨 [Blockchain] Failed to get user evidence:', error);
    
    return {
      success: false,
      error: error.message,
      errorType: error.code || 'RETRIEVAL_FAILED',
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * NEW: Check blockchain service health
 * @returns {Promise<Object>} Service health status
 */
export const checkBlockchainHealth = async () => {
  try {
    const provider = createProvider();
    if (!provider) {
      throw new Error('Provider creation failed');
    }
    
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    return {
      success: true,
      network: network.name,
      chainId: network.chainId,
      blockNumber: blockNumber,
      contractAddress: BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS,
      rpcUrl: getNetworkConfig().rpcUrl,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};