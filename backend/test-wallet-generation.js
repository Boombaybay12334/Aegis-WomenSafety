/**
 * Test script to verify wallet generation from different passphrases
 */

const { ethers } = require('ethers');

function generateWalletFromPassphrase(passphrase) {
  const privateKey = ethers.utils.sha256(ethers.utils.toUtf8Bytes(passphrase));
  const wallet = new ethers.Wallet(privateKey);
  return wallet;
}

// Test with different passphrases
console.log('Testing wallet generation from passphrases:\n');

const passphrases = [
  'Abhinav12334',
  'Abhinav123345',  // Changed slightly
  'Abhinav12334!',
  'Different12334'
];

passphrases.forEach(passphrase => {
  const wallet = generateWalletFromPassphrase(passphrase);
  console.log(`Passphrase: "${passphrase}"`);
  console.log(`Wallet Address: ${wallet.address}`);
  console.log('---');
});

// Test if same passphrase generates same address
console.log('\nTesting consistency (same passphrase, multiple times):');
const testPassphrase = 'Abhinav12334';
for (let i = 0; i < 3; i++) {
  const wallet = generateWalletFromPassphrase(testPassphrase);
  console.log(`Attempt ${i + 1}: ${wallet.address}`);
}
