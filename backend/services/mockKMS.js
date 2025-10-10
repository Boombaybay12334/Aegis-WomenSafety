/**
 * Mock KMS Service for AEGIS Phase 0
 * 
 * SECURITY NOTE: In production, this would use AWS KMS SDK.
 * This mock simulates encrypting and storing Shard C only.
 * 
 * CRITICAL: Backend NEVER combines Shard B + Shard C.
 * Only the client with Shard A can reconstruct the master key.
 */

class MockKMSService {
  constructor() {
    // In-memory storage for demo (production would use AWS KMS)
    this.encryptedShards = new Map();
    this.counter = 0;
    this.isEnabled = process.env.MOCK_KMS_ENABLED === 'true';
    
    if (this.isEnabled) {
      console.log('🔐 [Mock KMS] Service initialized for demo');
    }
  }

  /**
   * Encrypt and store Shard C
   * @param {string} walletAddress - Wallet address for identification
   * @param {string} shardC - Shard C hex string to encrypt and store
   * @returns {string} kms_id - Unique identifier for the encrypted shard
   */
  async encrypt(walletAddress, shardC) {
    if (!this.isEnabled) {
      throw new Error('Mock KMS service is disabled');
    }

    try {
      // Validate inputs
      if (!walletAddress || !shardC) {
        throw new Error('Missing walletAddress or shardC');
      }

      // Generate unique KMS ID
      this.counter++;
      const kmsId = `kms_${walletAddress.toLowerCase()}_${this.counter}_${Date.now()}`;

      // Simulate encryption by base64 encoding (in production: actual KMS encryption)
      const encryptedData = {
        walletAddress: walletAddress.toLowerCase(),
        encryptedShard: Buffer.from(shardC).toString('base64'),
        createdAt: new Date(),
        version: 1
      };

      // Store encrypted shard
      this.encryptedShards.set(kmsId, encryptedData);

      console.log(`🔐 [Mock KMS] Encrypted and stored Shard C for ${walletAddress} with ID: ${kmsId}`);
      
      return kmsId;
    } catch (error) {
      console.error('🚨 [Mock KMS] Encryption failed:', error.message);
      throw new Error('KMS encryption failed');
    }
  }

  /**
   * Decrypt and retrieve Shard C
   * @param {string} kmsId - KMS identifier for the encrypted shard
   * @returns {string} shardC - Decrypted Shard C hex string
   */
  async decrypt(kmsId) {
    if (!this.isEnabled) {
      throw new Error('Mock KMS service is disabled');
    }

    try {
      // Validate input
      if (!kmsId) {
        throw new Error('Missing kmsId');
      }

      // Retrieve encrypted data
      const encryptedData = this.encryptedShards.get(kmsId);
      if (!encryptedData) {
        throw new Error('Shard not found in KMS');
      }

      // Simulate decryption by base64 decoding (in production: actual KMS decryption)
      const shardC = Buffer.from(encryptedData.encryptedShard, 'base64').toString();

      console.log(`🔓 [Mock KMS] Decrypted Shard C for wallet ${encryptedData.walletAddress} using ID: ${kmsId}`);
      
      return shardC;
    } catch (error) {
      console.error('🚨 [Mock KMS] Decryption failed:', error.message);
      throw new Error('KMS decryption failed');
    }
  }

  /**
   * Update encrypted Shard C (for shard rotation after recovery)
   * @param {string} oldKmsId - Old KMS identifier to replace
   * @param {string} walletAddress - Wallet address for verification
   * @param {string} newShardC - New Shard C hex string to encrypt and store
   * @returns {string} newKmsId - New KMS identifier for the updated shard
   */
  async update(oldKmsId, walletAddress, newShardC) {
    if (!this.isEnabled) {
      throw new Error('Mock KMS service is disabled');
    }

    try {
      // Validate inputs
      if (!oldKmsId || !walletAddress || !newShardC) {
        throw new Error('Missing required parameters for KMS update');
      }

      // Verify old shard exists and belongs to the wallet
      const oldData = this.encryptedShards.get(oldKmsId);
      if (!oldData) {
        throw new Error('Old shard not found in KMS');
      }

      if (oldData.walletAddress !== walletAddress.toLowerCase()) {
        throw new Error('Wallet address mismatch for KMS update');
      }

      // Encrypt and store new shard
      const newKmsId = await this.encrypt(walletAddress, newShardC);

      // Mark old shard as superseded (keep for audit trail)
      oldData.supersededAt = new Date();
      oldData.supersededBy = newKmsId;

      console.log(`🔄 [Mock KMS] Updated Shard C for ${walletAddress}: ${oldKmsId} → ${newKmsId}`);
      
      return newKmsId;
    } catch (error) {
      console.error('🚨 [Mock KMS] Update failed:', error.message);
      throw new Error('KMS update failed');
    }
  }

  /**
   * Get service status and statistics (for monitoring)
   * @returns {object} Service status information
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      totalShards: this.encryptedShards.size,
      serviceType: 'Mock KMS (Demo)',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };
  }

  /**
   * Clear all stored shards (for testing only)
   * WARNING: Never use in production
   */
  clearAll() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clear KMS data in production');
    }
    
    this.encryptedShards.clear();
    this.counter = 0;
    console.log('🧹 [Mock KMS] All shards cleared (testing only)');
  }
}

// Export singleton instance
module.exports = new MockKMSService();