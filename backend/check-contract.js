/**
 * Quick script to check if contract exists at address
 */

const { ethers } = require('ethers');
const { BLOCKCHAIN_CONFIG, getNetworkConfig } = require('./config/blockchain');

async function checkContract() {
  try {
    const networkConfig = getNetworkConfig();
    const provider = new ethers.providers.JsonRpcProvider(networkConfig.rpcUrl);
    
    const contractAddress = BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS;
    console.log(`Checking contract at: ${contractAddress}`);
    
    // Get contract code
    const code = await provider.getCode(contractAddress);
    
    if (code === '0x') {
      console.log('❌ NO CONTRACT at this address!');
      console.log('   This is just a regular account, not a deployed contract.');
      console.log('\n   Solution: Redeploy your contract and update contractInfo.json');
    } else {
      console.log(`✅ Contract exists! Code length: ${code.length} bytes`);
      console.log(`   First 100 chars of bytecode: ${code.substring(0, 100)}...`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkContract();
