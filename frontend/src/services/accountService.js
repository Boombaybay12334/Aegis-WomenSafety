import * as crypto from './cryptoService';
import * as api from './apiService';

const SESSION_KEY = 'aegis_session';

export const signUp = async (passphrase) => {
  let masterKey, shardA, shardB, shardC;
  
  try {
    console.log('🔵 [SignUp] Passphrase received:', passphrase); // DEBUG
    const wallet = crypto.generateWalletFromPassphrase(passphrase);
    const { address } = wallet;
    console.log('🔵 [SignUp] Wallet generated:', address); // DEBUG
    
    masterKey = crypto.generateMasterKey();
    
    // This line is now async and needs 'await'.
    [shardA, shardB, shardC] = await crypto.splitKey(masterKey);

    // This will throw error if account exists in backend (409 status)
    await api.createAccount({ walletAddress: address, shardB, shardC });
    
    const encryptedShardA = crypto.encryptShardA(shardA, passphrase);
    const userData = {
      walletAddress: address,
      encryptedShardA: encryptedShardA,
      createdAt: new Date().toISOString(),
    };
    
    // Always overwrite localStorage for this wallet address
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
  // Only store session data in sessionStorage (cleared on tab close)
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  
  // Note: walletAddress and passphrase are stored in sessionStorage only
  // They are cleared when browser tab closes
  // localStorage keeps encrypted shards and keys for same-device login
};

export const logout = () => {
  // Clear session data (wallet address, decrypted shard A)
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem('passphrase');
  
  // Note: We do NOT clear localStorage items like:
  // - aegis_user_{address} (encrypted shard A, needed for same-device login)
  // - encryptedShardA (needed for evidence encryption)
  // These persist across sessions for same-device login
};

export const getSession = () => {
  const sessionData = sessionStorage.getItem(SESSION_KEY);
  return sessionData ? JSON.parse(sessionData) : null;
};