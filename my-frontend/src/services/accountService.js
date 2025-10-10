import * as crypto from './cryptoService';
import * as api from './apiService';

const SESSION_KEY = 'aegis_session';
const CURRENT_WALLET_KEY = 'aegis_current_wallet';

export const signUp = async (passphrase) => {
  const wallet = crypto.generateWalletFromPassphrase(passphrase);
  const { address } = wallet;
  const masterKey = crypto.generateMasterKey();
  
  // This line is now async and needs 'await'.
  const [shardA, shardB, shardC] = await crypto.splitKey(masterKey);

  await api.createAccount({ walletAddress: address, shardB, shardC });
  const encryptedShardA = crypto.encryptShardA(shardA, passphrase);
  const userData = {
    walletAddress: address,
    encryptedShardA: encryptedShardA,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(`aegis_user_${address}`, JSON.stringify(userData));
  createSession(address, shardA);
  return { walletAddress: address };
};

export const login = async (passphrase) => {
  const wallet = crypto.generateWalletFromPassphrase(passphrase);
  const { address } = wallet;
  await api.verifyAccount(address);
  const localUserData = localStorage.getItem(`aegis_user_${address}`);
  let shardA;
  if (localUserData) {
    console.log('Local data found. Decrypting Shard A...');
    const { encryptedShardA } = JSON.parse(localUserData);
    shardA = crypto.decryptShardA(encryptedShardA, passphrase);
    if (!shardA) throw new Error('Decryption failed. Invalid passphrase.');
  } else {
    console.log('No local data. Initiating new device recovery...');
    const timestamp = new Date().toISOString();
    const message = `Aegis account recovery for ${address} at ${timestamp}`;
    const signature = await crypto.createSignature(wallet, message);
    const { shardA: newShardA } = await api.recoverShard({ walletAddress: address, message, signature });
    shardA = newShardA;
    const encryptedShardA = crypto.encryptShardA(shardA, passphrase);
    const newUserData = { walletAddress: address, encryptedShardA, createdAt: timestamp };
    localStorage.setItem(`aegis_user_${address}`, JSON.stringify(newUserData));
  }
  createSession(address, shardA);
  return { walletAddress: address };
};

export const createSession = (walletAddress, decryptedShardA) => {
  const sessionData = {
    walletAddress,
    decryptedShardA,
    loggedInAt: new Date().toISOString(),
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  localStorage.setItem(CURRENT_WALLET_KEY, walletAddress);
};

export const logout = () => {
  sessionStorage.removeItem(SESSION_KEY);
};

export const getSession = () => {
  const sessionData = sessionStorage.getItem(SESSION_KEY);
  return sessionData ? JSON.parse(sessionData) : null;
};