/**
 * Emergency Routes - AEGIS Phase 1
 * 
 * API endpoints for SOS alerts, dead man's switch, and emergency response.
 * Critical security endpoints for emergency situations.
 */

const express = require('express');
const SOS = require('../models/SOS');
const User = require('../models/User');
const Evidence = require('../models/Evidence');
const { availabilityLimiter, generalLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Security validation helpers
const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * POST /api/v1/emergency/sos
 * Send manual emergency SOS alert
 */
router.post('/sos', generalLimiter, async (req, res) => {
  try {
    const { 
      walletAddress, 
      alertType, 
      location, 
      customMessage, 
      urgency, 
      timestamp 
    } = req.body;

    // Input validation
    if (!walletAddress || !alertType) {
      return res.status(400).json({ error: 'Missing required fields: walletAddress, alertType' });
    }

    if (!isValidAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    if (!['manual', 'automatic'].includes(alertType)) {
      return res.status(400).json({ error: 'Invalid alert type. Must be "manual" or "automatic"' });
    }

    // Verify user exists
    const user = await User.findByWallet(walletAddress);
    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }

    // Validate location if provided
    if (location && (typeof location.lat !== 'number' || typeof location.lng !== 'number')) {
      return res.status(400).json({ error: 'Invalid location format' });
    }

    // Create SOS record
    const sos = new SOS({
      walletAddress: walletAddress.toLowerCase(),
      alertType,
      urgency: urgency || 'high',
      location: location || null,
      customMessage: customMessage || '',
      timestamp: timestamp || new Date()
    });

    await sos.save();

    // Get user's evidence for emergency access
    const userEvidence = await Evidence.findByWallet(walletAddress).select('evidenceId');
    if (userEvidence.length > 0) {
      sos.relatedEvidence = userEvidence.map(evidence => ({
        evidenceId: evidence.evidenceId,
        accessGranted: true
      }));
      await sos.save();
    }

    // Simulate notifying authorities (in production, this would be real API calls)
    await simulateAuthorityNotification(sos);

    console.log(`🚨 [Emergency] SOS alert created: ${sos.sosId}`);
    console.log(`👤 User: ${walletAddress}`);
    console.log(`📍 Location: ${location ? `${location.lat}, ${location.lng}` : 'Not provided'}`);
    console.log(`💬 Message: ${customMessage || 'Standard emergency alert'}`);
    console.log(`📄 Evidence: ${userEvidence.length} items accessible`);

    res.status(201).json({
      success: true,
      sosId: sos.sosId,
      alertType: sos.alertType,
      urgency: sos.urgency,
      timestamp: sos.timestamp,
      evidenceAccessible: userEvidence.length,
      authoritiesNotified: sos.authorities.length
    });

  } catch (error) {
    console.error('🚨 [Emergency] SOS creation failed:', error.message);
    res.status(500).json({ error: 'Failed to create SOS alert' });
  }
});

/**
 * POST /api/v1/emergency/dead-man-switch
 * Trigger automatic SOS via dead man's switch
 */
router.post('/dead-man-switch', generalLimiter, async (req, res) => {
  try {
    const { 
      walletAddress, 
      daysSinceLogin, 
      location, 
      customMessage, 
      timestamp 
    } = req.body;

    // Input validation
    if (!walletAddress || typeof daysSinceLogin !== 'number') {
      return res.status(400).json({ error: 'Missing required fields: walletAddress, daysSinceLogin' });
    }

    if (!isValidAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    if (daysSinceLogin < 1) {
      return res.status(400).json({ error: 'Invalid daysSinceLogin value' });
    }

    // Verify user exists
    const user = await User.findByWallet(walletAddress);
    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }

    // Create automatic SOS record
    const sos = new SOS({
      walletAddress: walletAddress.toLowerCase(),
      alertType: 'automatic',
      urgency: 'critical',
      location: location || null,
      customMessage: customMessage || `Automatic SOS triggered: User inactive for ${daysSinceLogin} days`,
      daysSinceLogin,
      timestamp: timestamp || new Date()
    });

    await sos.save();

    // Get user's evidence for emergency access
    const userEvidence = await Evidence.findByWallet(walletAddress).select('evidenceId');
    if (userEvidence.length > 0) {
      sos.relatedEvidence = userEvidence.map(evidence => ({
        evidenceId: evidence.evidenceId,
        accessGranted: true
      }));
      await sos.save();
    }

    // Simulate notifying authorities with higher priority
    await simulateAuthorityNotification(sos, true);

    console.log(`💀 [Emergency] Dead man's switch triggered: ${sos.sosId}`);
    console.log(`👤 User: ${walletAddress}`);
    console.log(`⏰ Inactive for: ${daysSinceLogin} days`);
    console.log(`📍 Location: ${location ? `${location.lat}, ${location.lng}` : 'Not provided'}`);
    console.log(`📄 Evidence: ${userEvidence.length} items accessible`);

    res.status(201).json({
      success: true,
      sosId: sos.sosId,
      alertType: sos.alertType,
      urgency: sos.urgency,
      daysSinceLogin,
      timestamp: sos.timestamp,
      evidenceAccessible: userEvidence.length,
      authoritiesNotified: sos.authorities.length
    });

  } catch (error) {
    console.error('🚨 [Emergency] Dead man\'s switch failed:', error.message);
    res.status(500).json({ error: 'Failed to trigger dead man\'s switch' });
  }
});

/**
 * GET /api/v1/emergency/history/:walletAddress
 * Get SOS history for a user
 */
router.get('/history/:walletAddress', generalLimiter, async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!isValidAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // Find SOS events for the user
    const sosHistory = await SOS.findByWallet(walletAddress).limit(50); // Last 50 events

    console.log(`📋 [Emergency] History request for ${walletAddress}: ${sosHistory.length} events`);

    res.json({
      success: true,
      walletAddress: walletAddress.toLowerCase(),
      count: sosHistory.length,
      history: sosHistory.map(sos => sos.toSecureJSON())
    });

  } catch (error) {
    console.error('🚨 [Emergency] History retrieval failed:', error.message);
    res.status(500).json({ error: 'Failed to retrieve SOS history' });
  }
});

/**
 * GET /api/v1/emergency/stats/summary
 * Get emergency statistics for monitoring
 */
router.get('/stats/summary', availabilityLimiter, async (req, res) => {
  try {
    const stats = await SOS.getEmergencyStats();

    console.log('📊 [Emergency] Stats requested');

    res.json({
      success: true,
      stats: {
        totalAlerts: stats.totalAlerts,
        manualAlerts: stats.manualAlerts,
        automaticAlerts: stats.automaticAlerts,
        criticalAlerts: stats.criticalAlerts,
        resolvedAlerts: stats.resolvedAlerts,
        uniqueUsers: stats.uniqueUsers,
        lastAlert: stats.lastAlert,
        timestamp: stats.timestamp
      }
    });

  } catch (error) {
    console.error('🚨 [Emergency] Stats failed:', error.message);
    res.status(500).json({ error: 'Failed to retrieve emergency statistics' });
  }
});

/**
 * GET /api/v1/emergency/active
 * Get all active SOS alerts (for emergency services)
 */
router.get('/active', availabilityLimiter, async (req, res) => {
  try {
    const activeAlerts = await SOS.findActiveAlerts().limit(100);

    console.log(`🚨 [Emergency] Active alerts requested: ${activeAlerts.length} found`);

    res.json({
      success: true,
      count: activeAlerts.length,
      alerts: activeAlerts.map(sos => sos.toSecureJSON())
    });

  } catch (error) {
    console.error('🚨 [Emergency] Active alerts retrieval failed:', error.message);
    res.status(500).json({ error: 'Failed to retrieve active alerts' });
  }
});

/**
 * POST /api/v1/emergency/acknowledge/:sosId
 * Acknowledge an SOS alert (for emergency services)
 */
router.post('/acknowledge/:sosId', generalLimiter, async (req, res) => {
  try {
    const { sosId } = req.params;
    const { authority, notes } = req.body;

    if (!sosId || !authority) {
      return res.status(400).json({ error: 'Missing required fields: sosId, authority' });
    }

    const sos = await SOS.findOne({ sosId });
    if (!sos) {
      return res.status(404).json({ error: 'SOS alert not found' });
    }

    await sos.markAsAcknowledged(authority, notes);

    console.log(`✅ [Emergency] SOS acknowledged: ${sosId} by ${authority}`);

    res.json({
      success: true,
      sosId: sos.sosId,
      status: sos.status,
      acknowledgedBy: authority,
      acknowledgedAt: new Date()
    });

  } catch (error) {
    console.error('🚨 [Emergency] SOS acknowledgment failed:', error.message);
    res.status(500).json({ error: 'Failed to acknowledge SOS alert' });
  }
});

/**
 * Simulate authority notification (replace with real API calls in production)
 */
async function simulateAuthorityNotification(sos, isDeadManSwitch = false) {
  const authorities = [
    { name: 'NCW', priority: isDeadManSwitch ? 'CRITICAL' : 'HIGH' },
    { name: 'Police', priority: isDeadManSwitch ? 'CRITICAL' : 'HIGH' },
    { name: 'Women\'s Helpline', priority: isDeadManSwitch ? 'CRITICAL' : 'MEDIUM' }
  ];

  console.log(`📞 [Emergency] Notifying authorities for ${sos.sosId}...`);

  for (const authority of authorities) {
    try {
      // In production, these would be real API calls to:
      // - NCW emergency system
      // - Local police dispatch
      // - Women's helpline alert system
      
      console.log(`  📤 ${authority.name}: ${authority.priority} alert sent`);
      
      // Mark authority as notified
      const authIndex = sos.authorities.findIndex(a => a.name === authority.name);
      if (authIndex !== -1) {
        sos.authorities[authIndex].notified = true;
        sos.authorities[authIndex].notifiedAt = new Date();
      }
      
      // Simulate API response delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.warn(`  ⚠️  ${authority.name}: Failed to send alert - ${error.message}`);
    }
  }

  await sos.save();
  console.log(`📞 [Emergency] Authority notifications completed for ${sos.sosId}`);
}

module.exports = router;