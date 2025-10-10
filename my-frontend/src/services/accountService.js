import * as crypto from './cryptoService';
import * as api from './apiService';

const SESSION_KEY = 'aegis_session';
const CURRENT_WALLET_KEY = 'aegis_current_wallet';

export const signUp = async (passphrase) => {
  let masterKey, shardA, shardB, shardC;
  
  try {
    const wallet = crypto.generateWalletFromPassphrase(passphrase);
    const { address } = wallet;
    masterKey = crypto.generateMasterKey();
    
    // This line is now async and needs 'await'.
    [shardA, shardB, shardC] = await crypto.splitKey(masterKey);

    await api.createAccount({ walletAddress: address, shardB, shardC });
    const encryptedShardA = crypto.encryptShardA(shardA, passphrase);
    const userData = {
      walletAddress: address,
      encryptedShardA: encryptedShardA,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(`aegis_user_${address}`, JSON.stringify(userData));
    
    // Store encrypted Shard A for evidence encryption
    localStorage.setItem('encryptedShardA', encryptedShardA);
    sessionStorage.setItem('passphrase', passphrase);
    
    createSession(address, shardA);
    
    return { walletAddress: address };
  } finally {
    // Clear sensitive data from memory
    crypto.clearSensitiveData({ masterKey, shardA, shardB, shardC });
  }
};

export const login = async (passphrase) => {
  const wallet = crypto.generateWalletFromPassphrase(passphrase);
  const { address } = wallet;
  await api.verifyAccount(address);
  const localUserData = localStorage.getItem(`aegis_user_${address}`);
  let shardA;
  
  if (localUserData) {
    // SAME DEVICE LOGIN
    console.log('Local data found. Decrypting Shard A...');
    const { encryptedShardA } = JSON.parse(localUserData);
    shardA = crypto.decryptShardA(encryptedShardA, passphrase);
    if (!shardA) throw new Error('Decryption failed. Invalid passphrase.');
    
    // Store encrypted Shard A for evidence encryption
    localStorage.setItem('encryptedShardA', encryptedShardA);
    sessionStorage.setItem('passphrase', passphrase);
  } else {
    // NEW DEVICE RECOVERY - FIXED IMPLEMENTATION
    console.log('No local data. Initiating new device recovery...');
    let masterKey, newShardA, newShardB, newShardC;
    
    try {
      const timestamp = new Date().toISOString();
      const message = `Aegis account recovery for ${address} at ${timestamp}`;
      const signature = await crypto.createSignature(wallet, message);
      
      // Get shardB and shardC from backend
      const { shardB, shardC } = await api.recoverShard({ 
        walletAddress: address, 
        message, 
        signature 
      });
      
      // Combine shardB + shardC to reconstruct master key
      masterKey = await crypto.combineShards([shardB, shardC]);
      
      // Re-split master key into NEW shards
      [newShardA, newShardB, newShardC] = await crypto.splitKey(masterKey);
      
      // Update backend with new shardB and shardC
      await api.updateShards({ 
        walletAddress: address, 
        shardB: newShardB, 
        shardC: newShardC 
      });
      
      // Encrypt and store new shardA locally
      const encryptedShardA = crypto.encryptShardA(newShardA, passphrase);
      const newUserData = { 
        walletAddress: address, 
        encryptedShardA, 
        createdAt: timestamp 
      };
      localStorage.setItem(`aegis_user_${address}`, JSON.stringify(newUserData));
      
      // Store encrypted Shard A for evidence encryption
      localStorage.setItem('encryptedShardA', encryptedShardA);
      sessionStorage.setItem('passphrase', passphrase);
      
      shardA = newShardA;
    } catch (error) {
      console.error('Recovery failed:', error);
      throw new Error('Account recovery failed. Please check your passphrase.');
    } finally {
      // Clear sensitive data from memory
      crypto.clearSensitiveData({ masterKey, newShardA, newShardB, newShardC });
    }
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
  sessionStorage.removeItem('passphrase');
  localStorage.removeItem('encryptedShardA');
  localStorage.removeItem(CURRENT_WALLET_KEY);
};

export const getSession = () => {
  const sessionData = sessionStorage.getItem(SESSION_KEY);
  return sessionData ? JSON.parse(sessionData) : null;
};