/**
 * Full Live Test: Evidence Anchoring Flow
 *
 * - Generates a random passphrase
 * - Reconstructs wallet
 * - Simulates file upload
 * - Anchors evidence on blockchain
 * - Prints all live outputs
 *
 * Run with: node backend/test-evidence-anchor.js
 */

const { ethers } = require('ethers');
const crypto = require('crypto');
const { BLOCKCHAIN_CONFIG, contractInfo } = require('./config/blockchain');

// 1. Generate random passphrase
const userPassphrase = 'test-' + crypto.randomBytes(8).toString('hex');
console.log('Random Passphrase:', userPassphrase);

// 2. Reconstruct wallet
const userWallet = new ethers.Wallet(ethers.utils.sha256(ethers.utils.toUtf8Bytes(userPassphrase)));
console.log('User Wallet Address:', userWallet.address);

// 3. Connect to blockchain provider
const provider = new ethers.providers.JsonRpcProvider(BLOCKCHAIN_CONFIG.RPC_URL.localhost);
const connectedWallet = userWallet.connect(provider);

// 4. Simulate file upload (random buffer)
const fileBuffer = crypto.randomBytes(128);
console.log('Simulated File Size:', fileBuffer.length, 'bytes');

// 5. Generate mock merkle root, CID, S3 key, policy ID
const evidenceId = ethers.utils.id('evidence-' + Date.now() + '-' + Math.random());
const merkleRoot = ethers.utils.id(fileBuffer.toString('hex'));
const cidRoot = ethers.utils.id('ipfs-cid-' + evidenceId);
const s3Key = ethers.utils.id('s3-key-' + evidenceId);
const policyId = ethers.utils.id('aegis-privacy-v1.0');

console.log('Evidence ID:', evidenceId);
console.log('Merkle Root:', merkleRoot);
console.log('CID Root:', cidRoot);
console.log('S3 Key:', s3Key);
console.log('Policy ID:', policyId);

// 6. Create contract instance
const contract = new ethers.Contract(BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS, contractInfo.abi, connectedWallet);

async function runTest() {
  try {
    // Print initial balance
    const initialBalance = await provider.getBalance(userWallet.address);
    console.log('Initial Wallet Balance (ETH):', ethers.utils.formatEther(initialBalance));

    // 7. Anchor evidence on blockchain
    console.log('Anchoring evidence on blockchain...');
    const tx = await contract.anchorEvidence(evidenceId, merkleRoot, cidRoot, s3Key, policyId);
    console.log('Transaction Hash:', tx.hash);
    const receipt = await tx.wait(BLOCKCHAIN_CONFIG.CONFIRMATION_BLOCKS);
    console.log('Block Number:', receipt.blockNumber);
    console.log('Gas Used:', receipt.gasUsed.toString());

    // 8. Print final balance
    const finalBalance = await provider.getBalance(userWallet.address);
    console.log('Final Wallet Balance (ETH):', ethers.utils.formatEther(finalBalance));

    // 9. Read anchor from contract
    const anchor = await contract.anchors(evidenceId);
    console.log('Anchor Data from Contract:', anchor);
  } catch (err) {
    console.error('Test failed:', err);
  }
}

runTest();
