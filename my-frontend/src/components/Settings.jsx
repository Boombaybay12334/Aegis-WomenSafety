import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSession } from '../services/accountService';

export default function Settings() {
  const session = getSession();
  
  // Load saved settings from localStorage
  const [steganographyEnabled, setSteganographyEnabled] = useState(
    localStorage.getItem('steganographyEnabled') === 'true'
  );
  const [inactivityTime, setInactivityTime] = useState(
    localStorage.getItem('inactivityTime') || '5'
  );
  const [emergencyContact, setEmergencyContact] = useState(
    localStorage.getItem('emergencyContact') || ''
  );
  const [randomTabSwitch, setRandomTabSwitch] = useState(
    localStorage.getItem('randomTabSwitch') === 'true'
  );
  const [lockOnInactivity, setLockOnInactivity] = useState(
    localStorage.getItem('lockOnInactivity') === 'true'
  );
  const [deadManSwitch, setDeadManSwitch] = useState(
    localStorage.getItem('deadManSwitch') === 'true'
  );
  const [deadManDays, setDeadManDays] = useState(
    localStorage.getItem('deadManDays') || '30'
  );
  const [locationSharing, setLocationSharing] = useState(false);
  
  const [feedback, setFeedback] = useState('');
  const [showContactInput, setShowContactInput] = useState(!emergencyContact);
  const [lastLoginDate, setLastLoginDate] = useState('');

  useEffect(() => {
    // Get last login date
    const lastLogin = localStorage.getItem('lastLoginDate');
    if (lastLogin) {
      const date = new Date(lastLogin);
      setLastLoginDate(date.toLocaleDateString());
    }

    // Check if location permission is granted
    if (deadManSwitch && navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationSharing(result.state === 'granted');
      });
    }
  }, [deadManSwitch]);

  if (!session) {
    return <p>Loading...</p>;
  }

  const handleDeadManSwitchToggle = (enabled) => {
    setDeadManSwitch(enabled);
    
    if (enabled) {
      // Request location permission when enabling Dead Man's Switch
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocationSharing(true);
            // Store current location
            localStorage.setItem('userLocation', JSON.stringify({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              timestamp: new Date().toISOString()
            }));
            setFeedback('Location sharing enabled for Dead Man\'s Switch');
            setTimeout(() => setFeedback(''), 3000);
          },
          (error) => {
            setLocationSharing(false);
            setFeedback('Location access denied. Dead Man\'s Switch will work without location.');
            setTimeout(() => setFeedback(''), 5000);
          }
        );
      }
    }
  };

  const handleSaveSettings = () => {
    // Validate emergency contact if provided
    if (emergencyContact && !/^\d{10}$/.test(emergencyContact)) {
      setFeedback('Please enter a valid 10-digit phone number');
      return;
    }

    // Save all settings to localStorage
    localStorage.setItem('steganographyEnabled', steganographyEnabled);
    localStorage.setItem('inactivityTime', inactivityTime);
    localStorage.setItem('emergencyContact', emergencyContact);
    localStorage.setItem('randomTabSwitch', randomTabSwitch);
    localStorage.setItem('lockOnInactivity', lockOnInactivity);
    localStorage.setItem('deadManSwitch', deadManSwitch);
    localStorage.setItem('deadManDays', deadManDays);
    
    // Update last login date
    localStorage.setItem('lastLoginDate', new Date().toISOString());

    // Update location if Dead Man's Switch is enabled
    if (deadManSwitch && locationSharing) {
      updateLocation();
    }

    setFeedback('Settings saved successfully!');
    setTimeout(() => setFeedback(''), 3000);
  };

  const updateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          localStorage.setItem('userLocation', JSON.stringify({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date().toISOString()
          }));
        },
        (error) => {
          console.error('Location update failed:', error);
        }
      );
    }
  };

  const handleEmergencyContactChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only numbers
    if (value.length <= 10) {
      setEmergencyContact(value);
    }
  };

  return (
    <div className="container">
      <h1>Settings</h1>
      <p className="subtitle">Configure your safety and security preferences</p>

      {/* Steganography Settings */}
      <div className="settings-section">
        <h3>🔒 Privacy & Security</h3>
        
        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="steganography"
            checked={steganographyEnabled}
            onChange={(e) => setSteganographyEnabled(e.target.checked)}
          />
          <label htmlFor="steganography">
            Enable Steganography (Hide evidence inside images)
          </label>
        </div>
        <p style={{fontSize: '0.85em', color: '#6c757d', marginLeft: '30px', marginTop: '-10px'}}>
          When enabled, your evidence will be encrypted and hidden inside cover images.
        </p>
      </div>

      {/* Inactivity Settings */}
      <div className="settings-section">
        <h3>⏱️ Inactivity Protection</h3>
        
        <div className="form-group">
          <label>Auto-lock after inactivity (minutes)</label>
          <select 
            className="input-field"
            value={inactivityTime}
            onChange={(e) => setInactivityTime(e.target.value)}
          >
            <option value="1">1 minute</option>
            <option value="2">2 minutes</option>
            <option value="5">5 minutes</option>
            <option value="10">10 minutes</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
          </select>
        </div>

        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="lockOnInactivity"
            checked={lockOnInactivity}
            onChange={(e) => setLockOnInactivity(e.target.checked)}
          />
          <label htmlFor="lockOnInactivity">
            Lock app after inactivity
          </label>
        </div>

        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="randomTabSwitch"
            checked={randomTabSwitch}
            onChange={(e) => setRandomTabSwitch(e.target.checked)}
          />
          <label htmlFor="randomTabSwitch">
            Switch to Google.com randomly for cover
          </label>
        </div>
        <p style={{fontSize: '0.85em', color: '#6c757d', marginLeft: '30px', marginTop: '-10px'}}>
          Randomly redirects to Google.com to avoid suspicion if someone checks your tabs.
        </p>
      </div>

      {/* Emergency Contact */}
      <div className="settings-section">
        <h3>🚨 Emergency SOS</h3>
        
        {emergencyContact && !showContactInput ? (
          <div className="info-box">
            <p><strong>Emergency Contact:</strong> +91 {emergencyContact}</p>
            <button 
              onClick={() => setShowContactInput(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-color)',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
                marginTop: '10px'
              }}
            >
              Change contact number
            </button>
          </div>
        ) : (
          <>
            <div className="form-group">
              <label>Emergency Contact Number</label>
              <input 
                type="tel" 
                className="input-field"
                placeholder="Enter 10-digit mobile number"
                value={emergencyContact}
                onChange={handleEmergencyContactChange}
                maxLength="10"
              />
              <p style={{fontSize: '0.85em', color: '#6c757d', marginTop: '5px'}}>
                This number will receive your SOS alerts. Asked only once and stored securely.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Dead Man's Switch */}
      <div className="settings-section">
        <h3>⚠️ Dead Man's Switch</h3>
        
        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="deadManSwitch"
            checked={deadManSwitch}
            onChange={(e) => handleDeadManSwitchToggle(e.target.checked)}
          />
          <label htmlFor="deadManSwitch">
            Enable automatic SOS if not logged in for extended period
          </label>
        </div>

        {deadManSwitch && (
          <>
            <div className="form-group" style={{marginTop: '15px'}}>
              <label>Send SOS to authorities if not logged in for:</label>
              <select 
                className="input-field"
                value={deadManDays}
                onChange={(e) => setDeadManDays(e.target.value)}
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="21">21 days</option>
                <option value="30">30 days (recommended)</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>

            {/* Location Sharing Status */}
            <div className="info-box" style={{marginTop: '15px', backgroundColor: locationSharing ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 38, 38, 0.1)'}}>
              <p style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px'}}>
                <span style={{fontSize: '1.2em'}}>{locationSharing ? '📍' : '⚠️'}</span>
                <strong>Location Sharing: {locationSharing ? 'Enabled' : 'Disabled'}</strong>
              </p>
              <p style={{fontSize: '0.85em', color: '#6c757d', marginTop: '5px'}}>
                {locationSharing 
                  ? 'Your location will be shared with authorities if Dead Man\'s Switch is triggered.'
                  : 'Location access is required for Dead Man\'s Switch to share your location with authorities.'}
              </p>
            </div>

            {lastLoginDate && (
              <div className="info-box" style={{marginTop: '10px'}}>
                <p><strong>Last Login:</strong> {lastLoginDate}</p>
                <p style={{fontSize: '0.85em', color: '#6c757d', marginTop: '5px'}}>
                  Login regularly to prevent automatic SOS alerts.
                </p>
              </div>
            )}

            <div className="warning-box" style={{marginTop: '15px'}}>
              <strong>⚠️ Important:</strong> If you don't login for {deadManDays} days, an automatic SOS alert 
              will be sent to authorities with:
              <ul style={{marginTop: '10px', marginBottom: '0', paddingLeft: '20px'}}>
                <li>Your encrypted evidence</li>
                <li>Your last known location {locationSharing ? '✓' : '(not enabled)'}</li>
                <li>Emergency contact information</li>
                <li>Timestamp of last activity</li>
              </ul>
              <p style={{marginTop: '10px', marginBottom: '0', fontSize: '0.9em'}}>
                This is a critical safety measure in case something happens to you.
              </p>
            </div>
          </>
        )}
      </div>

      {feedback && (
        <div className={feedback.includes('denied') ? "form-feedback error" : "form-feedback success"} style={{marginTop: '20px'}}>
          {feedback}
        </div>
      )}

      <button 
        onClick={handleSaveSettings}
        className="main-btn"
        style={{marginTop: '20px'}}
      >
        Save Settings
      </button>
    </div>
  );
}
