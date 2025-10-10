/**
 * Backend Blockchain Configuration - AEGIS
 * 
 * Configuration for blockchain integration and wallet funding
 */

const fs = require('fs');
const path = require('path');

// NEW: Load contract deployment data
const loadDeploymentData = () => {
  try {
    const deploymentPath = path.join(__dirname, '../../blockchain/aegis-blockchain/deployment.json');
    const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    return deploymentData;
  } catch (error) {
    console.error('🚨 [Blockchain Config] Failed to load deployment data:', error.message);
    // Fallback configuration
    return {
      address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      network: 'localhost',
      chainId: '31337'
    };
  }
};

// NEW: Blockchain configuration
const deploymentData = loadDeploymentData();

const BLOCKCHAIN_CONFIG = {
  // Contract configuration
  CONTRACT_ADDRESS: deploymentData.address,
  CHAIN_ID: parseInt(deploymentData.chainId),
  NETWORK_NAME: deploymentData.network,
  
  // Network RPC URLs
  RPC_URL: {
    localhost: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
    polygon_zkevm: 'https://zkevm-rpc.com',
    polygon_zkevm_testnet: 'https://rpc.public.zkevm-test.net'
  },
  
  // Funding wallet configuration (for user wallet funding)
  FUNDING_WALLET: {
    PRIVATE_KEY: process.env.FUNDING_WALLET_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    FUNDING_AMOUNT: process.env.FUNDING_AMOUNT || '0.001', // ETH amount to fund user wallets
    MIN_BALANCE_THRESHOLD: process.env.MIN_BALANCE_THRESHOLD || '0.0005' // Minimum balance before funding
  },
  
  // Gas configuration
  GAS_LIMITS: {
    FUNDING_TRANSFER: 21000,  // Standard ETH transfer
    DEFAULT: 100000
  },
  
  // Retry configuration
  RETRY_CONFIG: {
    MAX_RETRIES: 2,
    RETRY_DELAY: 1000, // milliseconds
  },
  
  // Block confirmation requirements
  CONFIRMATION_BLOCKS: 1,
  
  // Service settings
  ENABLE_FUNDING: process.env.ENABLE_WALLET_FUNDING !== 'false', // Default enabled
  ENABLE_BLOCKCHAIN: process.env.ENABLE_BLOCKCHAIN !== 'false'   // Default enabled
};

// NEW: Get environment-specific network configuration
const getNetworkConfig = () => {
  const environment = process.env.NODE_ENV || 'development';
  
  if (environment === 'development') {
    return {
      rpcUrl: BLOCKCHAIN_CONFIG.RPC_URL.localhost,
      chainId: 31337,
      networkName: 'localhost'
    };
  }
  
  // Production configuration
  const network = process.env.BLOCKCHAIN_NETWORK || 'polygon_zkevm_testnet';
  return {
    rpcUrl: BLOCKCHAIN_CONFIG.RPC_URL[network],
    chainId: network === 'polygon_zkevm' ? 1101 : 1442, // Mainnet : Testnet
    networkName: network
  };
};

// NEW: Validation functions
const validateConfig = () => {
  const config = getNetworkConfig();
  
  if (!config.rpcUrl) {
    console.error('🚨 [Blockchain Config] Missing RPC URL for network:', config.networkName);
    return false;
  }
  
  if (!BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS) {
    console.error('🚨 [Blockchain Config] Missing contract address');
    return false;
  }
  
  if (!BLOCKCHAIN_CONFIG.FUNDING_WALLET.PRIVATE_KEY) {
    console.error('🚨 [Blockchain Config] Missing funding wallet private key');
    return false;
  }
  
  return true;
};

// NEW: Log configuration on module load
const logConfiguration = () => {
  const config = getNetworkConfig();
  
  console.log('⛓️  [Blockchain Config] Configuration loaded:');
  console.log(`   Network: ${config.networkName} (Chain ID: ${config.chainId})`);
  console.log(`   RPC URL: ${config.rpcUrl}`);
  console.log(`   Contract: ${BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS}`);
  console.log(`   Funding enabled: ${BLOCKCHAIN_CONFIG.ENABLE_FUNDING}`);
  console.log(`   Blockchain enabled: ${BLOCKCHAIN_CONFIG.ENABLE_BLOCKCHAIN}`);
  console.log(`   Funding amount: ${BLOCKCHAIN_CONFIG.FUNDING_WALLET.FUNDING_AMOUNT} ETH`);
  
  const isValid = validateConfig();
  if (isValid) {
    console.log('✅ [Blockchain Config] Configuration validation passed');
  } else {
    console.log('❌ [Blockchain Config] Configuration validation failed');
  }
};

// Initialize configuration
logConfiguration();

module.exports = {
  BLOCKCHAIN_CONFIG,
  getNetworkConfig,
  validateConfig,
  deploymentData
};