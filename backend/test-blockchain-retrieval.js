/**
 * Test Script: Blockchain Evidence Retrieval
 * 
 * This script allows manual testing of evidence retrieval from blockchain.
 * You can input a passphrase and wallet address to decrypt and view evidence
 * that was previously anchored to the blockchain.
 * 
 * Usage:
 *   node test-blockchain-retrieval.js
 */

const readline = require('readline');
const { ethers } = require('ethers');
const crypto = require('crypto');

// Import blockchain config
const BLOCKCHAIN_CONFIG = require('./config/blockchain');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify question function
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

/**
 * Derive wallet from passphrase
 */
function deriveWalletFromPassphrase(passphrase) {
  const hash = crypto.createHash('sha256').update(passphrase).digest('hex');
  const wallet = new ethers.Wallet(hash);
  return wallet;
}

/**
 * Get provider and contract instance
 */
function getBlockchainConnection() {
  const provider = new ethers.providers.JsonRpcProvider(BLOCKCHAIN_CONFIG.NETWORK.RPC_URL);
  const contract = new ethers.Contract(
    BLOCKCHAIN_CONFIG.CONTRACT.ADDRESS,
    BLOCKCHAIN_CONFIG.CONTRACT.ABI,
    provider
  );
  return { provider, contract };
}

/**
 * Get all evidence IDs for a user
 */
async function getUserEvidenceIds(contract, walletAddress) {
  try {
    console.log(`\n🔍 Fetching evidence IDs for wallet: ${walletAddress}`);
    const evidenceIds = await contract.getUserEvidence(walletAddress);
    return evidenceIds;
  } catch (error) {
    console.error('❌ Error fetching evidence IDs:', error.message);
    return [];
  }
}

/**
 * Get evidence details from blockchain
 */
async function getEvidenceDetails(contract, evidenceId) {
  try {
    console.log(`\n📄 Fetching details for evidence ID: ${evidenceId}`);
    const evidence = await contract.getEvidence(evidenceId);
    
    return {
      evidenceId: evidence.evidenceId,
      userAddress: evidence.userAddress,
      dataHash: evidence.dataHash,
      timestamp: evidence.timestamp.toNumber(),
      blockNumber: evidence.blockNumber.toNumber(),
      encryptedMetadata: evidence.encryptedMetadata
    };
  } catch (error) {
    console.error('❌ Error fetching evidence details:', error.message);
    return null;
  }
}

/**
 * Decrypt metadata using passphrase
 */
function decryptMetadata(encryptedData, passphrase) {
  try {
    // Parse the encrypted data (format: iv:encryptedData)
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = Buffer.from(parts[1], 'hex');
    
    // Derive key from passphrase
    const key = crypto.createHash('sha256').update(passphrase).digest();
    
    // Decrypt
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('❌ Decryption failed:', error.message);
    return null;
  }
}

/**
 * Format timestamp to readable date
 */
function formatTimestamp(timestamp) {
  return new Date(timestamp * 1000).toLocaleString();
}

/**
 * Display evidence details in a formatted way
 */
function displayEvidenceDetails(evidence, decryptedMetadata) {
  console.log('\n' + '='.repeat(80));
  console.log('📋 EVIDENCE DETAILS');
  console.log('='.repeat(80));
  
  console.log(`\n🆔 Evidence ID: ${evidence.evidenceId}`);
  console.log(`👤 User Address: ${evidence.userAddress}`);
  console.log(`#️⃣  Data Hash: ${evidence.dataHash}`);
  console.log(`⏰ Timestamp: ${formatTimestamp(evidence.timestamp)}`);
  console.log(`🧱 Block Number: ${evidence.blockNumber}`);
  
  if (decryptedMetadata) {
    console.log('\n📦 DECRYPTED METADATA:');
    console.log(JSON.stringify(decryptedMetadata, null, 2));
    
    if (decryptedMetadata.files && Array.isArray(decryptedMetadata.files)) {
      console.log(`\n📁 Files (${decryptedMetadata.files.length}):`);
      decryptedMetadata.files.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.originalName || file.name || 'Unknown'}`);
        console.log(`     Type: ${file.type || 'Unknown'}`);
        console.log(`     Size: ${file.size ? (file.size / 1024).toFixed(2) + ' KB' : 'Unknown'}`);
        if (file.hash) console.log(`     Hash: ${file.hash}`);
      });
    }
  } else {
    console.log('\n⚠️  Could not decrypt metadata (wrong passphrase or corrupted data)');
  }
  
  console.log('\n' + '='.repeat(80));
}

/**
 * Main test function
 */
async function main() {
  console.log('🧪 Blockchain Evidence Retrieval Test');
  console.log('=====================================\n');
  
  try {
    // Get user input
    console.log('Please provide the following information:\n');
    
    const passphrase = await question('Enter passphrase: ');
    
    if (!passphrase || passphrase.trim().length === 0) {
      console.error('❌ Passphrase cannot be empty!');
      rl.close();
      return;
    }
    
    // Derive wallet
    console.log('\n🔑 Deriving wallet from passphrase...');
    const wallet = deriveWalletFromPassphrase(passphrase);
    console.log(`✅ Wallet Address: ${wallet.address}`);
    
    // Ask if user wants to use derived address or custom address
    const useCustomAddress = await question('\nUse a different wallet address? (y/n): ');
    let walletAddress = wallet.address;
    
    if (useCustomAddress.toLowerCase() === 'y') {
      const customAddress = await question('Enter wallet address: ');
      if (ethers.utils.isAddress(customAddress)) {
        walletAddress = customAddress;
        console.log(`✅ Using custom address: ${walletAddress}`);
      } else {
        console.error('❌ Invalid address format, using derived address');
      }
    }
    
    // Connect to blockchain
    console.log('\n⛓️  Connecting to blockchain...');
    const { provider, contract } = getBlockchainConnection();
    
    // Check connection
    const network = await provider.getNetwork();
    console.log(`✅ Connected to network: ${network.name} (chainId: ${network.chainId})`);
    
    // Get wallet balance
    const balance = await provider.getBalance(walletAddress);
    console.log(`💰 Wallet Balance: ${ethers.utils.formatEther(balance)} ETH`);
    
    // Fetch evidence IDs
    const evidenceIds = await getUserEvidenceIds(contract, walletAddress);
    
    if (evidenceIds.length === 0) {
      console.log('\n⚠️  No evidence found for this wallet address');
      rl.close();
      return;
    }
    
    console.log(`\n✅ Found ${evidenceIds.length} evidence record(s)`);
    
    // Ask which evidence to retrieve
    if (evidenceIds.length === 1) {
      console.log('\n📄 Retrieving the single evidence record...');
      const evidence = await getEvidenceDetails(contract, evidenceIds[0]);
      
      if (evidence) {
        const decryptedMetadata = decryptMetadata(evidence.encryptedMetadata, passphrase);
        displayEvidenceDetails(evidence, decryptedMetadata);
      }
    } else {
      // List all evidence IDs
      console.log('\n📋 Available Evidence IDs:');
      evidenceIds.forEach((id, index) => {
        console.log(`  ${index + 1}. ${id}`);
      });
      
      const choice = await question('\nEnter number to retrieve (or "all" for all records): ');
      
      if (choice.toLowerCase() === 'all') {
        console.log('\n📦 Retrieving all evidence records...');
        for (const evidenceId of evidenceIds) {
          const evidence = await getEvidenceDetails(contract, evidenceId);
          if (evidence) {
            const decryptedMetadata = decryptMetadata(evidence.encryptedMetadata, passphrase);
            displayEvidenceDetails(evidence, decryptedMetadata);
          }
        }
      } else {
        const index = parseInt(choice) - 1;
        if (index >= 0 && index < evidenceIds.length) {
          const evidence = await getEvidenceDetails(contract, evidenceIds[index]);
          if (evidence) {
            const decryptedMetadata = decryptMetadata(evidence.encryptedMetadata, passphrase);
            displayEvidenceDetails(evidence, decryptedMetadata);
          }
        } else {
          console.error('❌ Invalid choice');
        }
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    rl.close();
  }
}

// Run the test
main().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
