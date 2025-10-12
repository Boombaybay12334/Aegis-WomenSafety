/**
 * Backend Blockchain Service - AEGIS
 * 
 * Handles wallet funding and blockchain interaction from backend
 */

const { ethers } = require('ethers');
const { BLOCKCHAIN_CONFIG, getNetworkConfig, validateConfig } = require('../config/blockchain');
const { contractInfo } = require('../config/blockchain');

/**
 * NEW: Create blockchain provider
 */
const createProvider = () => {
  try {
    const networkConfig = getNetworkConfig();
    const provider = new ethers.providers.JsonRpcProvider(networkConfig.rpcUrl);
    return provider;
  } catch (error) {
    console.error('🚨 [Backend Blockchain] Failed to create provider:', error);
    return null;
  }
};

/**
 * NEW: Create funding wallet instance
 */
const createFundingWallet = () => {
  try {
    const provider = createProvider();
    if (!provider) {
      throw new Error('Provider not available');
    }
    
    const wallet = new ethers.Wallet(BLOCKCHAIN_CONFIG.FUNDING_WALLET.PRIVATE_KEY, provider);
    return wallet;
  } catch (error) {
    console.error('🚨 [Backend Blockchain] Failed to create funding wallet:', error);
    return null;
  }
};

/**
 * NEW: Check if user wallet needs funding
 * @param {string} userWalletAddress - User's wallet address
 * @returns {Promise<Object>} Balance check result
 */
const checkWalletBalance = async (userWalletAddress) => {
  try {
    if (!BLOCKCHAIN_CONFIG.ENABLE_BLOCKCHAIN) {
      return { needsFunding: false, reason: 'Blockchain disabled' };
    }
    
    const provider = createProvider();
    if (!provider) {
      throw new Error('Provider not available');
    }
    
    const balance = await provider.getBalance(userWalletAddress);
    const balanceEth = ethers.utils.formatEther(balance);
    const threshold = BLOCKCHAIN_CONFIG.FUNDING_WALLET.MIN_BALANCE_THRESHOLD;
    
    console.log(`💰 [Backend Blockchain] Wallet ${userWalletAddress} balance: ${balanceEth} ETH`);
    
    const needsFunding = parseFloat(balanceEth) < parseFloat(threshold);
    
    return {
      success: true,
      walletAddress: userWalletAddress,
      balance: balanceEth,
      threshold: threshold,
      needsFunding: needsFunding,
      checkedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('🚨 [Backend Blockchain] Balance check failed:', error);
    return {
      success: false,
      error: error.message,
      walletAddress: userWalletAddress,
      needsFunding: false // Fail safe - don't fund on error
    };
  }
};

// Helper to get contract ABI from contractInfo
const getContractABI = () => contractInfo.abi;

/**
 * NEW: Fund user wallet with ETH for blockchain transactions
 * @param {string} userWalletAddress - User's wallet address
 * @param {string} evidenceId - Evidence ID for logging
 * @returns {Promise<Object>} Funding result
 */
const fundUserWallet = async (userWalletAddress, evidenceId) => {
  const startTime = Date.now();
  
  try {
    console.log(`💳 [Backend Blockchain] Starting wallet funding for: ${userWalletAddress}`);
    console.log(`📋 Evidence ID: ${evidenceId}`);
    
    // Check if funding is enabled
    if (!BLOCKCHAIN_CONFIG.ENABLE_FUNDING) {
      console.log('💳 [Backend Blockchain] Wallet funding disabled in config');
      return {
        success: true,
        skipped: true,
        reason: 'Funding disabled in configuration'
      };
    }
    
    if (!BLOCKCHAIN_CONFIG.ENABLE_BLOCKCHAIN) {
      console.log('💳 [Backend Blockchain] Blockchain integration disabled');
      return {
        success: true,
        skipped: true,
        reason: 'Blockchain integration disabled'
      };
    }
    
    // Validate configuration
    if (!validateConfig()) {
      throw new Error('Blockchain configuration validation failed');
    }
    
    // Check if user wallet needs funding
    const balanceCheck = await checkWalletBalance(userWalletAddress);
    if (!balanceCheck.success) {
      throw new Error(`Balance check failed: ${balanceCheck.error}`);
    }
    
    if (!balanceCheck.needsFunding) {
      console.log(`💰 [Backend Blockchain] Wallet has sufficient balance: ${balanceCheck.balance} ETH`);
      return {
        success: true,
        skipped: true,
        reason: 'Wallet has sufficient balance',
        currentBalance: balanceCheck.balance,
        threshold: balanceCheck.threshold
      };
    }
    
    console.log(`💸 [Backend Blockchain] Wallet needs funding (balance: ${balanceCheck.balance} ETH < ${balanceCheck.threshold} ETH)`);
    
    // Create funding wallet
    const fundingWallet = createFundingWallet();
    if (!fundingWallet) {
      throw new Error('Failed to create funding wallet');
    }
    
    console.log(`🏦 [Backend Blockchain] Funding wallet: ${fundingWallet.address}`);
    
    // Check funding wallet balance
    const fundingBalance = await fundingWallet.getBalance();
    const fundingBalanceEth = ethers.utils.formatEther(fundingBalance);
    const fundingAmount = BLOCKCHAIN_CONFIG.FUNDING_WALLET.FUNDING_AMOUNT;
    
    console.log(`🏦 [Backend Blockchain] Funding wallet balance: ${fundingBalanceEth} ETH`);
    
    if (parseFloat(fundingBalanceEth) < parseFloat(fundingAmount)) {
      throw new Error(`Insufficient funding wallet balance: ${fundingBalanceEth} ETH < ${fundingAmount} ETH`);
    }
    
    // Prepare funding transaction
    const fundingAmountWei = ethers.utils.parseEther(fundingAmount);
    
    console.log(`💸 [Backend Blockchain] Preparing to send ${fundingAmount} ETH to ${userWalletAddress}`);
    
    // Execute funding transaction with retry logic
    let transaction;
    let retries = 0;
    const maxRetries = BLOCKCHAIN_CONFIG.RETRY_CONFIG.MAX_RETRIES;
    
    while (retries <= maxRetries) {
      try {
        console.log(`🚀 [Backend Blockchain] Sending funding transaction (attempt ${retries + 1}/${maxRetries + 1})...`);
        
        transaction = await fundingWallet.sendTransaction({
          to: userWalletAddress,
          value: fundingAmountWei,
          gasLimit: BLOCKCHAIN_CONFIG.GAS_LIMITS.FUNDING_TRANSFER
        });
        
        console.log(`📧 [Backend Blockchain] Funding transaction submitted: ${transaction.hash}`);
        break;
        
      } catch (txError) {
        retries++;
        console.error(`🚨 [Backend Blockchain] Funding attempt ${retries} failed:`, txError.message);
        
        if (retries > maxRetries) {
          throw new Error(`Funding failed after ${maxRetries + 1} attempts: ${txError.message}`);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, BLOCKCHAIN_CONFIG.RETRY_CONFIG.RETRY_DELAY));
      }
    }
    
    // Wait for confirmation
    console.log('⏳ [Backend Blockchain] Waiting for funding confirmation...');
    const receipt = await transaction.wait(BLOCKCHAIN_CONFIG.CONFIRMATION_BLOCKS);
    
    const executionTime = Date.now() - startTime;
    console.log(`✅ [Backend Blockchain] Wallet funding completed successfully!`);
    console.log(`🧾 Block: ${receipt.blockNumber}`);
    console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
    console.log(`⏱️ Execution time: ${executionTime}ms`);
    
    // Verify new balance
    const newBalanceCheck = await checkWalletBalance(userWalletAddress);
    
    return {
      success: true,
      transactionHash: transaction.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      amountSent: fundingAmount,
      previousBalance: balanceCheck.balance,
      newBalance: newBalanceCheck.success ? newBalanceCheck.balance : 'unknown',
      executionTime: executionTime,
      evidenceId: evidenceId,
      fundedAt: new Date().toISOString()
    };
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('🚨 [Backend Blockchain] Wallet funding failed:', error);
    console.error('🚨 [Backend Blockchain] Error details:', {
      message: error.message,
      userWallet: userWalletAddress,
      evidenceId: evidenceId,
      executionTime: `${executionTime}ms`
    });
    
    return {
      success: false,
      error: error.message,
      errorType: error.code || 'FUNDING_FAILED',
      userWalletAddress: userWalletAddress,
      evidenceId: evidenceId,
      executionTime: executionTime,
      attemptedAt: new Date().toISOString()
    };
  }
};

/**
 * NEW: Get blockchain service health status
 * @returns {Promise<Object>} Service health information
 */
const getBlockchainServiceHealth = async () => {
  try {
    const provider = createProvider();
    if (!provider) {
      throw new Error('Provider not available');
    }
    
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    // Check funding wallet
    const fundingWallet = createFundingWallet();
    let fundingWalletStatus = 'unavailable';
    let fundingBalance = '0';
    
    if (fundingWallet) {
      try {
        const balance = await fundingWallet.getBalance();
        fundingBalance = ethers.utils.formatEther(balance);
        fundingWalletStatus = 'available';
      } catch (balanceError) {
        fundingWalletStatus = 'error';
      }
    }
    
    return {
      success: true,
      blockchain: {
        network: network.name,
        chainId: network.chainId,
        blockNumber: blockNumber,
        provider: 'connected'
      },
      funding: {
        enabled: BLOCKCHAIN_CONFIG.ENABLE_FUNDING,
        walletStatus: fundingWalletStatus,
        walletBalance: fundingBalance,
        fundingAmount: BLOCKCHAIN_CONFIG.FUNDING_WALLET.FUNDING_AMOUNT
      },
      contract: {
        address: BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS,
        network: BLOCKCHAIN_CONFIG.NETWORK_NAME
      },
      config: {
        blockchainEnabled: BLOCKCHAIN_CONFIG.ENABLE_BLOCKCHAIN,
        fundingEnabled: BLOCKCHAIN_CONFIG.ENABLE_FUNDING,
        isValid: validateConfig()
      },
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('🚨 [Backend Blockchain] Health check failed:', error);
    
    return {
      success: false,
      error: error.message,
      config: {
        blockchainEnabled: BLOCKCHAIN_CONFIG.ENABLE_BLOCKCHAIN,
        fundingEnabled: BLOCKCHAIN_CONFIG.ENABLE_FUNDING,
        isValid: validateConfig()
      },
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * NEW: Process blockchain data from frontend
 * @param {Object} blockchainData - Blockchain result from frontend
 * @returns {Object} Processed blockchain data for database
 */
const processBlockchainData = (blockchainData) => {
  if (!blockchainData) {
    return {
      txHash: null,
      blockNumber: null,
      gasUsed: null,
      merkleRoot: null,
      anchored: false,
      error: 'No blockchain data provided'
    };
  }
  
  if (blockchainData.success) {
    return {
      txHash: blockchainData.transactionHash || null,
      blockNumber: blockchainData.blockNumber || null,
      gasUsed: blockchainData.gasUsed || null,
      merkleRoot: blockchainData.merkleRoot || null,
      anchored: true,
      anchoredAt: blockchainData.confirmedAt || blockchainData.timestamp,
      executionTime: blockchainData.executionTime,
      error: null
    };
  } else {
    return {
      txHash: null,
      blockNumber: null,
      gasUsed: null,
      merkleRoot: null,
      anchored: false,
      error: blockchainData.error || 'Unknown blockchain error',
      errorType: blockchainData.errorType || 'UNKNOWN',
      attemptedAt: blockchainData.timestamp
    };
  }
};

module.exports = {
  fundUserWallet,
  checkWalletBalance,
  getBlockchainServiceHealth,
  processBlockchainData,
  createProvider,
  createFundingWallet
};