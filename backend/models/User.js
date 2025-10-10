/**
 * MongoDB User Model for AEGIS Phase 0
 * 
 * SECURITY CRITICAL: This model NEVER stores:
 * - User passphrase
 * - Shard A (always encrypted on client localStorage)
 * - Master encryption key
 * - Wallet private keys
 * - Any decrypted data
 * 
 * Only stores references to externally stored shards (B and C)
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Ethereum wallet address (public identifier)
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
    validate: {
      validator: function(address) {
        // Validate Ethereum address format: 0x + 40 hex characters
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      },
      message: 'Invalid Ethereum wallet address format'
    }
  },

  // Shard B stored directly in MongoDB (our backend)
  shardB: {
    type: String,
    required: true,
    validate: {
      validator: function(shard) {
        // Validate shard format: "x:hexdata" where x is a number and hexdata is hex
        return typeof shard === 'string' && /^[1-9]\d*:[a-fA-F0-9]+$/.test(shard) && shard.length > 5;
      },
      message: 'Invalid shard B format - must be "x:hexdata" format'
    }
  },

  // Reference to Shard C stored in Mock NGO service
  shardC_id: {
    type: String,
    required: true,
    validate: {
      validator: function(id) {
        // Validate NGO ID format  
        return typeof id === 'string' && id.startsWith('ngo_') && id.length > 10;
      },
      message: 'Invalid NGO shard reference ID'
    }
  },

  // Account creation timestamp
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },

  // Last successful login timestamp (for analytics, not security)
  lastLoginAt: {
    type: Date,
    default: null
  },

  // Version for shard rotation tracking
  shardVersion: {
    type: Number,
    default: 1,
    min: 1
  },

  // Security metadata (for monitoring)
  securityMeta: {
    // Number of recovery attempts (for abuse detection)
    recoveryAttempts: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Last recovery attempt timestamp
    lastRecoveryAt: {
      type: Date,
      default: null
    },

    // Account creation method (for analytics)
    creationMethod: {
      type: String,
      enum: ['direct', 'recovery'],
      default: 'direct'
    }
  }
}, {
  // Schema options
  timestamps: false, // We handle timestamps manually
  versionKey: false, // Disable mongoose version key
  
  // Index options
  indexes: [
    { walletAddress: 1 }, // Primary lookup index
    { createdAt: 1 }, // For analytics queries
    { lastLoginAt: 1 }, // For activity monitoring
    { 'securityMeta.lastRecoveryAt': 1 } // For security monitoring
  ]
});

// Pre-save middleware for additional security validation
userSchema.pre('save', function(next) {
  // Ensure wallet address is always lowercase
  if (this.walletAddress) {
    this.walletAddress = this.walletAddress.toLowerCase();
  }

  // Validate that we never accidentally store sensitive data
  const sensitiveFields = ['passphrase', 'shardA', 'masterKey', 'privateKey'];
  for (let field of sensitiveFields) {
    if (this[field] !== undefined) {
      return next(new Error(`SECURITY VIOLATION: Attempt to store sensitive field '${field}'`));
    }
  }

  next();
});

// Instance method to update login timestamp
userSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  return this.save();
};

// Instance method to increment recovery attempts (for security monitoring)
userSchema.methods.recordRecoveryAttempt = function() {
  this.securityMeta.recoveryAttempts += 1;
  this.securityMeta.lastRecoveryAt = new Date();
  return this.save();
};

// Instance method to update shard references after rotation
userSchema.methods.updateShardReferences = function(newShardBId, newShardCId) {
  this.shardB_id = newShardBId;
  this.shardC_id = newShardCId;
  this.shardVersion += 1;
  return this.save();
};

// Static method to find user by wallet address
userSchema.statics.findByWallet = function(walletAddress) {
  return this.findOne({ walletAddress: walletAddress.toLowerCase() });
};

// Static method to get security statistics (anonymized)
userSchema.statics.getSecurityStats = function() {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return Promise.all([
    this.countDocuments(), // Total users
    this.countDocuments({ createdAt: { $gte: last24h } }), // New users last 24h
    this.countDocuments({ createdAt: { $gte: last7d } }), // New users last 7d
    this.countDocuments({ lastLoginAt: { $gte: last24h } }), // Active users last 24h
    this.countDocuments({ 'securityMeta.lastRecoveryAt': { $gte: last24h } }) // Recoveries last 24h
  ]).then(([total, new24h, new7d, active24h, recoveries24h]) => ({
    totalUsers: total,
    newUsersLast24h: new24h,
    newUsersLast7d: new7d,
    activeUsersLast24h: active24h,
    recoveriesLast24h: recoveries24h,
    timestamp: now
  }));
};

// Create the model
const User = mongoose.model('User', userSchema);

module.exports = User;