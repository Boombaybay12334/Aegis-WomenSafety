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

/**
 * Evidence API functions
 */

// Evidence API base URL
const EVIDENCE_API_URL = 'http://localhost:5000/api/v1/evidence';

/**
 * Get Shard B for evidence encryption
 */
export const getShardForEncryption = async (walletAddress) => {
  console.log(`[API] Getting shard for encryption: ${walletAddress}`);
  
  const response = await fetch(`${API_BASE_URL}/get-shard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get encryption shard');
  }
  
  return await response.json();
};

/**
 * Upload evidence metadata and encrypted files
 */
export const uploadEvidenceMetadata = async (evidenceData) => {
  try {
    console.log(`[API] Uploading evidence metadata for: ${evidenceData.walletAddress}`);
    console.log(`[API] Evidence API URL: ${EVIDENCE_API_URL}/upload`);
    console.log(`[API] Files to upload: ${evidenceData.files.length}`);
    
    const response = await fetch(`${EVIDENCE_API_URL}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evidenceData)
    });
    
    console.log(`[API] Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Error response: ${errorText}`);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        console.error(`[API] Failed to parse error response:`, parseError);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`[API] Upload successful:`, result);
    return result;
    
  } catch (error) {
    console.error(`[API] Upload failed:`, error);
    console.error(`[API] Error details:`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
};

/**
 * Get list of evidence for a wallet address
 */
export const getEvidenceListAPI = async (walletAddress) => {
  console.log(`[API] Getting evidence list for: ${walletAddress}`);
  
  const response = await fetch(`${EVIDENCE_API_URL}/list/${walletAddress}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get evidence list');
  }
  
  return await response.json();
};

/**
 * Get specific evidence by ID
 */
export const getEvidenceAPI = async (evidenceId) => {
  console.log(`[API] Getting evidence: ${evidenceId}`);
  
  const response = await fetch(`${EVIDENCE_API_URL}/${evidenceId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get evidence');
  }
  
  return await response.json();
};