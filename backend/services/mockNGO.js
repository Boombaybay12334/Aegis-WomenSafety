/**
 * Mock NGO Service for AEGIS Phase 0
 * 
 * SECURITY NOTE: In production, this would call real NGO partner APIs.
 * This mock simulates storing Shard B with NGO partners.
 * 
 * CRITICAL: NGO service and KMS are separate systems.
 * Backend coordinates but NEVER combines Shard B + Shard C.
 */

class MockNGOService {
  constructor() {
    // In-memory storage for demo (production would use NGO partner APIs)
    this.shardStorage = new Map();
    this.counter = 0;
    this.isEnabled = process.env.MOCK_NGO_ENABLED === 'true';
    
    if (this.isEnabled) {
      console.log('🏥 [Mock NGO] Service initialized for demo');
    }
  }

  /**
   * Store Shard B with NGO partner
   * @param {string} walletAddress - Wallet address for identification
   * @param {string} shardB - Shard B hex string to store
   * @returns {string} ngo_id - Unique identifier for the stored shard
   */
  async storeShardB(walletAddress, shardB) {
    if (!this.isEnabled) {
      throw new Error('Mock NGO service is disabled');
    }

    try {
      // Validate inputs
      if (!walletAddress || !shardB) {
        throw new Error('Missing walletAddress or shardB');
      }

      // Generate unique NGO ID
      this.counter++;
      const ngoId = `ngo_${walletAddress.toLowerCase()}_${this.counter}_${Date.now()}`;

      // Store shard data with metadata
      const shardData = {
        walletAddress: walletAddress.toLowerCase(),
        shardB: shardB,
        createdAt: new Date(),
        version: 1,
        partnerOrg: 'Mock NGO Partner', // In production: actual NGO identifier
        securityLevel: 'encrypted_at_rest'
      };

      // Store shard
      this.shardStorage.set(ngoId, shardData);

      console.log(`🏥 [Mock NGO] Stored Shard B for ${walletAddress} with ID: ${ngoId}`);
      
      return ngoId;
    } catch (error) {
      console.error('🚨 [Mock NGO] Store operation failed:', error.message);
      throw new Error('NGO storage failed');
    }
  }

  /**
   * Retrieve Shard B from NGO partner
   * @param {string} ngoId - NGO identifier for the stored shard
   * @returns {string} shardB - Retrieved Shard B hex string
   */
  async retrieveShardB(ngoId) {
    if (!this.isEnabled) {
      throw new Error('Mock NGO service is disabled');
    }

    try {
      // Validate input
      if (!ngoId) {
        throw new Error('Missing ngoId');
      }

      // Retrieve shard data
      const shardData = this.shardStorage.get(ngoId);
      if (!shardData) {
        throw new Error('Shard not found in NGO storage');
      }

      // Log access for audit trail
      console.log(`🏥 [Mock NGO] Retrieved Shard B for wallet ${shardData.walletAddress} using ID: ${ngoId}`);
      
      return shardData.shardB;
    } catch (error) {
      console.error('🚨 [Mock NGO] Retrieval failed:', error.message);
      throw new Error('NGO retrieval failed');
    }
  }

  /**
   * Update Shard B (for shard rotation after recovery)
   * @param {string} oldNgoId - Old NGO identifier to replace
   * @param {string} walletAddress - Wallet address for verification
   * @param {string} newShardB - New Shard B hex string to store
   * @returns {string} newNgoId - New NGO identifier for the updated shard
   */
  async updateShardB(oldNgoId, walletAddress, newShardB) {
    if (!this.isEnabled) {
      throw new Error('Mock NGO service is disabled');
    }

    try {
      // Validate inputs
      if (!oldNgoId || !walletAddress || !newShardB) {
        throw new Error('Missing required parameters for NGO update');
      }

      // Verify old shard exists and belongs to the wallet
      const oldData = this.shardStorage.get(oldNgoId);
      if (!oldData) {
        throw new Error('Old shard not found in NGO storage');
      }

      if (oldData.walletAddress !== walletAddress.toLowerCase()) {
        throw new Error('Wallet address mismatch for NGO update');
      }

      // Store new shard
      const newNgoId = await this.storeShardB(walletAddress, newShardB);

      // Mark old shard as superseded (keep for audit trail)
      oldData.supersededAt = new Date();
      oldData.supersededBy = newNgoId;

      console.log(`🔄 [Mock NGO] Updated Shard B for ${walletAddress}: ${oldNgoId} → ${newNgoId}`);
      
      return newNgoId;
    } catch (error) {
      console.error('🚨 [Mock NGO] Update failed:', error.message);
      throw new Error('NGO update failed');
    }
  }

  /**
   * Get service status and statistics (for monitoring)
   * @returns {object} Service status information
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      totalShards: this.shardStorage.size,
      serviceType: 'Mock NGO Partner API (Demo)',
      partnerOrgs: ['Mock NGO Partner'], // In production: list of actual partners
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };
  }

  /**
   * Get anonymized statistics for reporting (no wallet addresses)
   * @returns {object} Anonymous statistics for NGO reporting
   */
  getAnonymousStats() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    let recentActivity = 0;
    this.shardStorage.forEach(shard => {
      if (shard.createdAt > last24h) {
        recentActivity++;
      }
    });

    return {
      totalAccounts: this.shardStorage.size,
      newAccountsLast24h: recentActivity,
      serviceUptime: process.uptime(),
      lastUpdated: now
    };
  }

  /**
   * Clear all stored shards (for testing only)
   * WARNING: Never use in production
   */
  clearAll() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clear NGO data in production');
    }
    
    this.shardStorage.clear();
    this.counter = 0;
    console.log('🧹 [Mock NGO] All shards cleared (testing only)');
  }
}

// Export singleton instance
module.exports = new MockNGOService();