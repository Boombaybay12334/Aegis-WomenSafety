/**
 * SOS Model - AEGIS Phase 1
 * 
 * MongoDB model for storing emergency SOS events and dead man's switch triggers.
 * Critical for tracking emergency situations and ensuring proper authority notification.
 */

const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  lat: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  lng: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  accuracy: {
    type: Number,
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const SOSSchema = new mongoose.Schema({
  sosId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
    match: /^0x[a-fA-F0-9]{40}$/
  },
  alertType: {
    type: String,
    required: true,
    enum: ['manual', 'automatic'],
    index: true
  },
  urgency: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'high'
  },
  location: LocationSchema,
  customMessage: {
    type: String,
    maxlength: 500,
    default: ''
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  // For automatic SOS (dead man's switch)
  daysSinceLogin: {
    type: Number,
    min: 0
  },
  // Authorities notified
  authorities: [{
    name: {
      type: String,
      required: true
    },
    notified: {
      type: Boolean,
      default: false
    },
    notifiedAt: Date,
    response: String
  }],
  // SOS status
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'responded', 'resolved', 'false_alarm'],
    default: 'pending',
    index: true
  },
  resolvedAt: Date,
  // Related evidence (if any)
  relatedEvidence: [{
    evidenceId: String,
    accessGranted: {
      type: Boolean,
      default: true
    }
  }],
  // Response tracking
  responses: [{
    authority: String,
    responseTime: Date,
    action: String,
    notes: String
  }]
}, {
  timestamps: true
});

// Indexes for performance and querying
SOSSchema.index({ walletAddress: 1, timestamp: -1 });
SOSSchema.index({ alertType: 1, status: 1 });
SOSSchema.index({ urgency: 1, timestamp: -1 });
SOSSchema.index({ timestamp: -1 });

// Static methods
SOSSchema.statics.findByWallet = function(walletAddress) {
  return this.find({ 
    walletAddress: walletAddress.toLowerCase()
  }).sort({ timestamp: -1 });
};

SOSSchema.statics.findActiveAlerts = function() {
  return this.find({
    status: { $in: ['pending', 'acknowledged'] }
  }).sort({ urgency: -1, timestamp: -1 });
};

SOSSchema.statics.getEmergencyStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalAlerts: { $sum: 1 },
        manualAlerts: {
          $sum: { $cond: [{ $eq: ['$alertType', 'manual'] }, 1, 0] }
        },
        automaticAlerts: {
          $sum: { $cond: [{ $eq: ['$alertType', 'automatic'] }, 1, 0] }
        },
        criticalAlerts: {
          $sum: { $cond: [{ $eq: ['$urgency', 'critical'] }, 1, 0] }
        },
        resolvedAlerts: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        uniqueUsers: { $addToSet: '$walletAddress' },
        lastAlert: { $max: '$timestamp' }
      }
    },
    {
      $project: {
        _id: 0,
        totalAlerts: 1,
        manualAlerts: 1,
        automaticAlerts: 1,
        criticalAlerts: 1,
        resolvedAlerts: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        lastAlert: 1,
        timestamp: new Date()
      }
    }
  ]);
  
  return stats[0] || {
    totalAlerts: 0,
    manualAlerts: 0,
    automaticAlerts: 0,
    criticalAlerts: 0,
    resolvedAlerts: 0,
    uniqueUsers: 0,
    lastAlert: null,
    timestamp: new Date()
  };
};

// Instance methods
SOSSchema.methods.markAsAcknowledged = function(authority, notes) {
  this.status = 'acknowledged';
  this.responses.push({
    authority,
    responseTime: new Date(),
    action: 'acknowledged',
    notes: notes || 'Alert acknowledged'
  });
  return this.save();
};

SOSSchema.methods.markAsResolved = function(authority, notes) {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  this.responses.push({
    authority,
    responseTime: new Date(),
    action: 'resolved',
    notes: notes || 'Situation resolved'
  });
  return this.save();
};

SOSSchema.methods.addAuthorityResponse = function(authority, action, notes) {
  this.responses.push({
    authority,
    responseTime: new Date(),
    action,
    notes
  });
  return this.save();
};

// Pre-save middleware
SOSSchema.pre('save', function(next) {
  // Generate sosId if not exists
  if (!this.sosId) {
    const timestamp = Date.now();
    const type = this.alertType === 'manual' ? 'M' : 'A';
    const urgency = this.urgency.charAt(0).toUpperCase();
    const wallet = this.walletAddress.slice(2, 8);
    this.sosId = `SOS_${type}${urgency}_${wallet}_${timestamp}`;
  }
  
  // Set default authorities based on alert type
  if (this.authorities.length === 0) {
    this.authorities = [
      { name: 'NCW', notified: false },
      { name: 'Police', notified: false },
      { name: 'Women\'s Helpline', notified: false }
    ];
  }
  
  next();
});

// Security methods
SOSSchema.methods.toSecureJSON = function() {
  const obj = this.toObject();
  
  // For public APIs, remove sensitive location details if needed
  // Currently keeping all data as this is for emergency response
  
  return obj;
};

const SOS = mongoose.model('SOS', SOSSchema);

module.exports = SOS;