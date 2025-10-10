/**
 * SOS Service - AEGIS Phase 1
 * 
 * Handles emergency alerts and dead man's switch functionality.
 * Integrates with backend to log SOS events and trigger emergency protocols.
 */

import { getSession } from './accountService';

// SOS API base URL
const SOS_API_URL = 'http://localhost:5000/api/v1/emergency';

/**
 * Send emergency SOS alert
 * @param {Object} location - User's current location {lat, lng}
 * @param {string} customMessage - Optional custom message
 * @returns {Promise<Object>} SOS result
 */
export const sendEmergencySOS = async (location, customMessage = '') => {
  try {
    console.log('🚨 [SOS] Initiating emergency alert...');
    console.log(`📍 Location: ${location ? `${location.lat}, ${location.lng}` : 'Not available'}`);
    
    // Get current user session
    const session = getSession();
    if (!session) {
      throw new Error('No active session found. Please log in.');
    }
    
    const { walletAddress } = session;
    
    // Prepare SOS data
    const sosData = {
      walletAddress,
      alertType: 'manual',
      location: location || null,
      customMessage: customMessage || '',
      timestamp: new Date().toISOString(),
      urgency: 'high'
    };
    
    // Send SOS to backend
    console.log('📤 [SOS] Sending alert to authorities...');
    const response = await fetch(`${SOS_API_URL}/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sosData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send SOS alert');
    }
    
    const result = await response.json();
    
    // Simulate sending to external authorities (for demo)
    await simulateAuthorityAlerts(sosData);
    
    console.log('✅ [SOS] Emergency alert sent successfully');
    console.log(`🆔 SOS ID: ${result.sosId}`);
    
    return {
      success: true,
      sosId: result.sosId,
      alertsSent: ['NCW', 'Police', 'Women\'s Helpline'],
      location: location,
      timestamp: sosData.timestamp
    };
    
  } catch (error) {
    console.error('🚨 [SOS] Emergency alert failed:', error);
    throw new Error(`Emergency alert failed: ${error.message}`);
  }
};

/**
 * Trigger automatic SOS (dead man's switch)
 * @param {number} daysSinceLogin - Days since last login
 * @param {Object} location - User's last known location
 * @returns {Promise<Object>} Auto-SOS result
 */
export const triggerDeadManSwitch = async (daysSinceLogin, location) => {
  try {
    console.log('💀 [SOS] Triggering dead man\'s switch...');
    console.log(`⏰ Days since login: ${daysSinceLogin}`);
    
    // Get current user session or stored user data
    let walletAddress;
    const session = getSession();
    
    if (session) {
      walletAddress = session.walletAddress;
    } else {
      // Try to get from localStorage for background checks
      const userKeys = Object.keys(localStorage).filter(key => key.startsWith('aegis_user_'));
      if (userKeys.length === 0) {
        throw new Error('No user data found for dead man\'s switch');
      }
      // Extract wallet address from first user key
      walletAddress = userKeys[0].replace('aegis_user_', '');
    }
    
    // Prepare auto-SOS data
    const sosData = {
      walletAddress,
      alertType: 'automatic',
      location: location || null,
      customMessage: `Automatic SOS triggered: User inactive for ${daysSinceLogin} days. This may indicate an emergency situation.`,
      timestamp: new Date().toISOString(),
      urgency: 'critical',
      daysSinceLogin
    };
    
    // Send auto-SOS to backend
    console.log('📤 [SOS] Sending automatic alert...');
    const response = await fetch(`${SOS_API_URL}/dead-man-switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sosData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to trigger dead man\'s switch');
    }
    
    const result = await response.json();
    
    // Simulate sending to external authorities
    await simulateAuthorityAlerts(sosData);
    
    console.log('✅ [SOS] Dead man\'s switch triggered successfully');
    console.log(`🆔 Auto-SOS ID: ${result.sosId}`);
    
    return {
      success: true,
      sosId: result.sosId,
      alertType: 'automatic',
      daysSinceLogin,
      alertsSent: ['NCW', 'Police', 'Women\'s Helpline'],
      location: location,
      timestamp: sosData.timestamp
    };
    
  } catch (error) {
    console.error('🚨 [SOS] Dead man\'s switch failed:', error);
    throw new Error(`Dead man's switch failed: ${error.message}`);
  }
};

/**
 * Get SOS history for current user
 * @returns {Promise<Array>} List of SOS events
 */
export const getSOSHistory = async () => {
  try {
    console.log('📋 [SOS] Fetching SOS history...');
    
    const session = getSession();
    if (!session) {
      throw new Error('No active session found. Please log in.');
    }
    
    const { walletAddress } = session;
    
    const response = await fetch(`${SOS_API_URL}/history/${walletAddress}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get SOS history');
    }
    
    const result = await response.json();
    
    console.log(`📋 [SOS] Found ${result.history.length} SOS events`);
    return result.history;
    
  } catch (error) {
    console.error('🚨 [SOS] Failed to fetch SOS history:', error);
    throw new Error(`Failed to get SOS history: ${error.message}`);
  }
};

/**
 * Test SOS system (for development/testing)
 * @returns {Promise<Object>} Test result
 */
export const testSOSSystem = async () => {
  try {
    console.log('🧪 [SOS] Testing SOS system...');
    
    const testLocation = { lat: 28.6139, lng: 77.2090 }; // New Delhi coordinates
    const testMessage = 'This is a test SOS alert - please ignore';
    
    const result = await sendEmergencySOS(testLocation, testMessage);
    
    console.log('✅ [SOS] Test completed successfully');
    return { ...result, test: true };
    
  } catch (error) {
    console.error('🚨 [SOS] Test failed:', error);
    throw new Error(`SOS test failed: ${error.message}`);
  }
};

/**
 * Simulate sending alerts to external authorities (for demo)
 * @param {Object} sosData - SOS data to send
 */
const simulateAuthorityAlerts = async (sosData) => {
  // Simulate API calls to external services
  const authorities = [
    { name: 'NCW', url: 'https://api.ncw.gov.in/emergency' },
    { name: 'Police', url: 'https://api.police.gov.in/emergency' },
    { name: 'Women\'s Helpline', url: 'https://api.womenshelpline.in/alert' }
  ];
  
  console.log('📞 [SOS] Notifying authorities...');
  
  for (const authority of authorities) {
    try {
      // In real implementation, these would be actual API calls
      // For demo, we'll just log the attempt
      console.log(`  📤 ${authority.name}: Alert sent (simulated)`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.warn(`  ⚠️  ${authority.name}: Failed to send alert - ${error.message}`);
    }
  }
  
  console.log('📞 [SOS] Authority notifications completed');
};

/**
 * Get current location for SOS
 * @returns {Promise<Object>} Location object {lat, lng}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        });
      },
      (error) => {
        console.warn('🌍 [SOS] Location access denied:', error.message);
        reject(new Error(`Location access failed: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};