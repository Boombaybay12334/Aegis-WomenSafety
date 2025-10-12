/**
 * Test: Verify user wallet address and balance for blockchain anchoring
 *
 * Run with: node backend/test-wallet-balance.js
 * Make sure backend, frontend, and blockchain node are running
 */

const { ethers } = require('ethers');
const { BLOCKCHAIN_CONFIG } = require('./config/blockchain');

// Example passphrase (replace with actual user passphrase for real test)
const userPassphrase = 'test-user-passphrase';

// Reconstruct user wallet from passphrase
const userWallet = new ethers.Wallet(ethers.utils.sha256(ethers.utils.toUtf8Bytes(userPassphrase)));

console.log('User Wallet Address:', userWallet.address);

// Connect to blockchain provider
const provider = new ethers.providers.JsonRpcProvider(BLOCKCHAIN_CONFIG.RPC_URL.localhost);

async function printWalletBalance() {
  try {
    const balance = await provider.getBalance(userWallet.address);
    console.log('User Wallet Balance (ETH):', ethers.utils.formatEther(balance));
  } catch (err) {
    console.error('Error fetching wallet balance:', err.message);
  }
}

printWalletBalance();
