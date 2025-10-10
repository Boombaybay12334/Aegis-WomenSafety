/**
 * Blockchain Configuration - AEGIS Frontend
 * 
 * Configuration for Polygon zkEVM blockchain integration
 * with fallback to local Hardhat development network
 */

// NEW: Read contract address from deployment.json
import deploymentData from '../../../blockchain/aegis-blockchain/deployment.json';

// NEW: Blockchain network configuration
export const BLOCKCHAIN_CONFIG = {
  // Contract configuration
  CONTRACT_ADDRESS: deploymentData.address,
  CHAIN_ID: parseInt(deploymentData.chainId),
  NETWORK_NAME: deploymentData.network,
  
  // Network RPC URLs
  RPC_URL: {
    localhost: 'http://localhost:8545',
    polygon_zkevm: 'https://zkevm-rpc.com', // Production Polygon zkEVM
    polygon_zkevm_testnet: 'https://rpc.public.zkevm-test.net' // Testnet
  },
  
  // Gas configuration
  GAS_LIMIT: {
    ANCHOR_EVIDENCE: 150000,    // Gas limit for evidence anchoring
    DEFAULT: 100000             // Default gas limit
  },
  
  // Retry configuration
  RETRY_CONFIG: {
    MAX_RETRIES: 2,
    RETRY_DELAY: 1000, // 1 second
  },
  
  // Block confirmation requirements
  CONFIRMATION_BLOCKS: 1
};

// NEW: Environment-specific configuration
export const getNetworkConfig = () => {
  const isDevelopment = import.meta.env.DEV;
  
  if (isDevelopment) {
    return {
      rpcUrl: BLOCKCHAIN_CONFIG.RPC_URL.localhost,
      chainId: 31337,
      networkName: 'localhost'
    };
  }
  
  // Production configuration (Polygon zkEVM)
  return {
    rpcUrl: BLOCKCHAIN_CONFIG.RPC_URL.polygon_zkevm,
    chainId: 1101,
    networkName: 'polygon-zkevm'
  };
};

// NEW: Contract ABI for EvidenceAnchor
export const EVIDENCE_ANCHOR_ABI = [
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "evidenceId",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "merkleRoot",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "cidRoot",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "s3Key",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "policyId",
        "type": "bytes32"
      }
    ],
    "name": "anchorEvidence",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "evidenceId",
        "type": "bytes32"
      }
    ],
    "name": "verifyEvidence",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "merkleRoot",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "cidRoot",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "s3Key",
            "type": "bytes32"
          },
          {
            "internalType": "uint64",
            "name": "timestamp",
            "type": "uint64"
          },
          {
            "internalType": "bytes32",
            "name": "policyId",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "submitter",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          }
        ],
        "internalType": "struct EvidenceAnchor.Anchor",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserAnchors",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// NEW: Privacy policy configuration
export const PRIVACY_POLICY = {
  ID: 'aegis-privacy-v1.0',
  VERSION: '1.0',
  HASH: null // Will be computed when needed
};

// NEW: Helper function to get privacy policy hash
export const getPrivacyPolicyHash = () => {
  const { ethers } = require('ethers');
  if (!PRIVACY_POLICY.HASH) {
    PRIVACY_POLICY.HASH = ethers.utils.id(PRIVACY_POLICY.ID);
  }
  return PRIVACY_POLICY.HASH;
};