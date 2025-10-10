import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';

// We will load the 'secrets.js' library manually to prevent race conditions.
let secrets;

// An async function to initialize the library. It will only run once.
const initializeSecrets = async () => {
  if (!secrets) {
    // Uses a dynamic import to load the module only when needed.
    const module = await import('secrets.js-grempe');
    secrets = module.default;
  }
};

export const generateWalletFromPassphrase = (passphrase) => {
  // THE FIX IS HERE: It should be 'sha256', not 'sha2s256'.
  const privateKey = ethers.utils.sha256(ethers.utils.toUtf8Bytes(passphrase));
  return new ethers.Wallet(privateKey);
};

export const generateMasterKey = () => {
  return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
};

// This function now ensures the library is ready before using it.
export const splitKey = async (masterKeyHex) => {
  await initializeSecrets(); // Wait for the library to be ready.
  const keyForSharding = secrets.str2hex(masterKeyHex);
  return secrets.share(keyForSharding, 3, 2);
};

export const encryptShardA = (shardA, passphrase) => {
  return CryptoJS.AES.encrypt(shardA, passphrase).toString();
};

export const decryptShardA = (encryptedShardA, passphrase) => {
  const bytes = CryptoJS.AES.decrypt(encryptedShardA, passphrase);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const createSignature = async (wallet, message) => {
  return await wallet.signMessage(message);
};