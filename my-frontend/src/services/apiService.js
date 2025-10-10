// --- MOCK BACKEND DATABASE ---
// In a real app, this data lives on the server.
const mockDB = {
  users: {}, // Stores user metadata by wallet address
  shards: {}, // Stores Shard B and Shard C by wallet address
};
// -----------------------------

const FAKE_NETWORK_DELAY = 800; // ms

/**
 * [MOCK] Checks if a wallet address already exists.
 */
export const checkAvailability = (walletAddress) => {
  console.log(`[API MOCK] Checking availability for: ${walletAddress}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const isTaken = !!mockDB.users[walletAddress.toLowerCase()];
      resolve({ available: !isTaken });
    }, FAKE_NETWORK_DELAY);
  });
};

/**
 * [MOCK] Creates a new user account.
 */
export const createAccount = ({ walletAddress, shardB, shardC }) => {
  console.log(`[API MOCK] Creating account for: ${walletAddress}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const lowerCaseAddress = walletAddress.toLowerCase();
      if (mockDB.users[lowerCaseAddress]) {
        return reject({ status: 409, message: 'Account already exists' });
      }
      mockDB.users[lowerCaseAddress] = {
        walletAddress: walletAddress,
        createdAt: new Date().toISOString(),
      };
      mockDB.shards[lowerCaseAddress] = { shardB, shardC };
      console.log('[API MOCK] Mock DB State:', mockDB);
      resolve({ success: true, walletAddress });
    }, FAKE_NETWORK_DELAY);
  });
};

/**
 * [MOCK] Verifies if an account exists during login.
 */
export const verifyAccount = (walletAddress) => {
  console.log(`[API MOCK] Verifying account: ${walletAddress}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockDB.users[walletAddress.toLowerCase()];
      if (user) {
        resolve({ exists: true, ...user });
      } else {
        reject({ status: 404, message: 'Account not found' });
      }
    }, FAKE_NETWORK_DELAY);
  });
};

/**
 * [MOCK] Recovers shardB and shardC for new device login.
 * FIXED: Now returns shardB and shardC instead of shardA
 */
export const recoverShard = ({ walletAddress, message, signature }) => {
  console.log(`[API MOCK] Attempting shard recovery for: ${walletAddress}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const lowerCaseAddress = walletAddress.toLowerCase();
      // In a real backend, we'd cryptographically verify the signature.
      // Here, we'll just check if the account and shards exist.
      const user = mockDB.users[lowerCaseAddress];
      const userShards = mockDB.shards[lowerCaseAddress];

      if (!user || !userShards) {
        return reject({ status: 404, message: 'Cannot recover: account not found.' });
      }
      
      // FIXED: Return shardB and shardC, NOT shardA
      // Backend should NEVER have access to shardA
      console.log(`[API MOCK] Recovery successful. Returning shardB and shardC.`);
      resolve({ 
        success: true, 
        shardB: userShards.shardB, 
        shardC: userShards.shardC 
      });
    }, FAKE_NETWORK_DELAY);
  });
};

/**
 * [MOCK] Updates stored shards after recovery re-split.
 * NEW FUNCTION: Needed for proper Shamir's Secret Sharing flow
 */
export const updateShards = ({ walletAddress, shardB, shardC }) => {
  console.log(`[API MOCK] Updating shards for: ${walletAddress}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const lowerCaseAddress = walletAddress.toLowerCase();
      const user = mockDB.users[lowerCaseAddress];
      
      if (!user) {
        return reject({ status: 404, message: 'Account not found for shard update.' });
      }
      
      // Update the stored shards with new ones
      mockDB.shards[lowerCaseAddress] = { shardB, shardC };
      console.log(`[API MOCK] Shards updated successfully for ${walletAddress}`);
      console.log('[API MOCK] Updated DB State:', mockDB);
      
      resolve({ success: true });
    }, FAKE_NETWORK_DELAY);
  });
};