/**
 * Blockchain Configuration - AEGIS Frontend
 * 
 * Configuration for Polygon zkEVM blockchain integration
 * with fallback to local Hardhat development network
 */

// NEW: Load contract info from blockchaininfo/contractInfo.json
import contractInfoJson from '../../../blockchaininfo/contractInfo.json';

export const BLOCKCHAIN_CONFIG = {
  CONTRACT_ADDRESS: contractInfoJson.address,
  CHAIN_ID: contractInfoJson.chainId,
  NETWORK_NAME: contractInfoJson.network,
  RPC_URL: {
    localhost: 'http://localhost:8545',
    polygon_zkevm: 'https://zkevm-rpc.com',
    polygon_zkevm_testnet: 'https://rpc.public.zkevm-test.net'
  },
  GAS_LIMIT: {
    ANCHOR_EVIDENCE: 150000,
    DEFAULT: 100000
  },
  RETRY_CONFIG: {
    MAX_RETRIES: 2,
    RETRY_DELAY: 1000,
  },
  CONFIRMATION_BLOCKS: 1
};

export const EVIDENCE_ANCHOR_ABI = contractInfoJson.abi;

// Returns environment-specific network configuration (frontend)
export const getNetworkConfig = () => {
  // Try to use Vite/React env vars, fallback to NODE_ENV
  const environment = import.meta.env.MODE || process.env.NODE_ENV || 'development';

  if (environment === 'development') {
    return {
      rpcUrl: BLOCKCHAIN_CONFIG.RPC_URL.localhost,
      chainId: 31337,
      networkName: 'localhost'
    };
  }

  // Production configuration
  // You can set VITE_BLOCKCHAIN_NETWORK or use default
  const network = import.meta.env.VITE_BLOCKCHAIN_NETWORK || 'polygon_zkevm_testnet';
  return {
    rpcUrl: BLOCKCHAIN_CONFIG.RPC_URL[network],
    chainId: network === 'polygon_zkevm' ? 1101 : 1442,
    networkName: network
  };
};

// Returns a keccak256 hash of the privacy policy text
import { ethers } from 'ethers';

const PRIVACY_POLICY_TEXT = `By submitting evidence, you agree to the AEGIS privacy policy and terms of service. Your data will be securely anchored and only accessible to authorized parties.`;

export function getPrivacyPolicyHash() {
  // You can replace PRIVACY_POLICY_TEXT with your actual policy text or a loaded file
  return ethers.utils.id(PRIVACY_POLICY_TEXT);
}
