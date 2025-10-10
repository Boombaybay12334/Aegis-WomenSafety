// Real backend API connection
const API_BASE_URL = 'http://localhost:5000/api/v1/account';

/**
 * Checks if a wallet address is available for registration.
 */
export const checkAvailability = async (walletAddress) => {
  console.log(`[API] Checking availability for: ${walletAddress}`);
  
  const response = await fetch(`${API_BASE_URL}/check-availability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to check availability');
  }
  
  return await response.json();
};

/**
 * Creates a new user account with wallet address and shards.
 */
export const createAccount = async ({ walletAddress, shardB, shardC }) => {
  console.log(`[API] Creating account for: ${walletAddress}`);
  
  const response = await fetch(`${API_BASE_URL}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress, shardB, shardC })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create account');
  }
  
  return await response.json();
};

/**
 * Verifies if an account exists during login.
 */
export const verifyAccount = async (walletAddress) => {
  console.log(`[API] Verifying account: ${walletAddress}`);
  
  const response = await fetch(`${API_BASE_URL}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Account not found');
  }
  
  return await response.json();
};

/**
 * Recovers shardB and shardC for new device login.
 * Requires cryptographic signature to prove wallet ownership.
 */
export const recoverShard = async ({ walletAddress, message, signature }) => {
  console.log(`[API] Attempting shard recovery for: ${walletAddress}`);
  
  const response = await fetch(`${API_BASE_URL}/recover-shard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress, message, signature })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Cannot recover: account not found');
  }
  
  console.log(`[API] Recovery successful. Returning shardB and shardC.`);
  return await response.json();
};

/**
 * Updates stored shards after recovery re-split.
 * Called after successful recovery to rotate shards for security.
 */
export const updateShards = async ({ walletAddress, shardB, shardC }) => {
  console.log(`[API] Updating shards for: ${walletAddress}`);
  
  const response = await fetch(`${API_BASE_URL}/update-shards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress, shardB, shardC })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Account not found for shard update');
  }
  
  console.log(`[API] Shards updated successfully for ${walletAddress}`);
  return await response.json();
};