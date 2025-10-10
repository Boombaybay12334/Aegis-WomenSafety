import React, { useState, useEffect } from 'react';
import { getSession } from '../services/accountService';

export default function Settings() {
  const session = getSession();
  
  // All settings state
  const [steganographyEnabled, setSteganographyEnabled] = useState(
    localStorage.getItem('steganographyEnabled') === 'true'
  );
  const [inactivityTime, setInactivityTime] = useState(
    localStorage.getItem('inactivityTime') || '5'
  );
  const [inactivityAction, setInactivityAction] = useState(
    localStorage.getItem('inactivityAction') || 'none'
  );
  const [autoSOS, setAutoSOS] = useState(
    localStorage.getItem('autoSOS') === 'true'
  );
  const [autoSOSDays, setAutoSOSDays] = useState(
    localStorage.getItem('autoSOSDays') || '30'
  );
  
  const [feedback, setFeedback] = useState('');
  const [lastLoginDate, setLastLoginDate] = useState('');
  const [locationSharing, setLocationSharing] = useState(false);

  useEffect(() => {
    // Get last login date
    const lastLogin = localStorage.getItem('lastLoginDate');
    if (lastLogin) {
      const date = new Date(lastLogin);
      setLastLoginDate(date.toLocaleDateString());
    }

    // Check if location permission is granted
    if (autoSOS && navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationSharing(result.state === 'granted');
      });
    }
  }, [autoSOS]);

  if (!session) {
    return <p>Loading...</p>;
  }

  const handleInactivityActionChange = (action) => {
    setInactivityAction(action);
    
    if (action === 'none') {
      setFeedback('Inactivity protection disabled');
    } else if (action === 'lock') {
      setFeedback('App will lock after inactivity');
    } else if (action === 'switch') {
      setFeedback('Tab will switch to Google.com after inactivity');
    }
    
    setTimeout(() => setFeedback(''), 2000);
  };

  const handleAutoSOSToggle = (enabled) => {
    setAutoSOS(enabled);
    
    if (enabled) {
      // Request location permission when enabling Auto SOS
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocationSharing(true);
            localStorage.setItem('userLocation', JSON.stringify({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              timestamp: new Date().toISOString()
            }));
            setFeedback('Location sharing enabled for Automatic SOS');
            setTimeout(() => setFeedback(''), 3000);
          },
          (error) => {
            setLocationSharing(false);
            setFeedback('Location access denied. Automatic SOS will work without location.');
            setTimeout(() => setFeedback(''), 5000);
          }
        );
      }
    }
  };

  const handleSaveSettings = () => {
    // Save all settings to localStorage
    localStorage.setItem('steganographyEnabled', steganographyEnabled);
    localStorage.setItem('inactivityTime', inactivityTime);
    localStorage.setItem('inactivityAction', inactivityAction);
    localStorage.setItem('autoSOS', autoSOS);
    localStorage.setItem('autoSOSDays', autoSOSDays);
    
    // Update last login date
    localStorage.setItem('lastLoginDate', new Date().toISOString());

    // Update location if Auto SOS is enabled
    if (autoSOS && locationSharing) {
      updateLocation();
    }

    setFeedback('✓ All settings saved successfully!');
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
          <label>Inactivity timer (minutes)</label>
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
          <p style={{fontSize: '0.85em', color: '#6c757d', marginTop: '5px'}}>
            Action will trigger if you're inactive for this duration
          </p>
        </div>

        <div style={{marginTop: '15px'}}>
          <label style={{fontWeight: '600', display: 'block', marginBottom: '10px'}}>
            What should happen after inactivity?
          </label>
          
          <div className="radio-group" style={{marginBottom: '10px'}}>
            <input 
              type="radio" 
              id="inactivity-none"
              name="inactivityAction"
              checked={inactivityAction === 'none'}
              onChange={() => handleInactivityActionChange('none')}
            />
            <label htmlFor="inactivity-none">
              Do nothing (disable inactivity protection)
            </label>
          </div>

          <div className="radio-group" style={{marginBottom: '10px'}}>
            <input 
              type="radio" 
              id="inactivity-lock"
              name="inactivityAction"
              checked={inactivityAction === 'lock'}
              onChange={() => handleInactivityActionChange('lock')}
            />
            <label htmlFor="inactivity-lock">
              🔒 Lock app and logout
            </label>
          </div>
          <p style={{fontSize: '0.85em', color: '#6c757d', marginLeft: '30px', marginTop: '-5px', marginBottom: '10px'}}>
            You'll need to login again with your passphrase
          </p>

          <div className="radio-group">
            <input 
              type="radio" 
              id="inactivity-switch"
              name="inactivityAction"
              checked={inactivityAction === 'switch'}
              onChange={() => handleInactivityActionChange('switch')}
            />
            <label htmlFor="inactivity-switch">
              🌐 Switch to Google.com
            </label>
          </div>
          <p style={{fontSize: '0.85em', color: '#6c757d', marginLeft: '30px', marginTop: '-5px'}}>
            Instantly redirects to Google to avoid suspicion
          </p>
        </div>
      </div>

      {/* Automatic SOS */}
      <div className="settings-section">
        <h3>⚠️ Automatic SOS After Inactivity</h3>
        
        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="autoSOS"
            checked={autoSOS}
            onChange={(e) => handleAutoSOSToggle(e.target.checked)}
          />
          <label htmlFor="autoSOS">
            Enable automatic SOS if I don't login for extended period
          </label>
        </div>

        {autoSOS && (
          <>
            <div className="form-group" style={{marginTop: '15px'}}>
              <label>Send automatic SOS to authorities if not logged in for:</label>
              <select 
                className="input-field"
                value={autoSOSDays}
                onChange={(e) => setAutoSOSDays(e.target.value)}
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="21">21 days</option>
                <option value="30">30 days (recommended)</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>

            <div className="info-box" style={{marginTop: '15px', backgroundColor: locationSharing ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 38, 38, 0.1)'}}>
              <p style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px'}}>
                <span style={{fontSize: '1.2em'}}>{locationSharing ? '📍' : '⚠️'}</span>
                <strong>Location Sharing: {locationSharing ? 'Enabled' : 'Disabled'}</strong>
              </p>
              <p style={{fontSize: '0.85em', color: '#6c757d', marginTop: '5px'}}>
                {locationSharing 
                  ? 'Your location will be shared with authorities if Automatic SOS is triggered.'
                  : 'Location access is required to share your location with authorities.'}
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
              <strong>⚠️ Important:</strong> If you don't login for {autoSOSDays} days, an automatic SOS alert 
              will be sent to authorities with:
              <ul style={{marginTop: '10px', marginBottom: '0', paddingLeft: '20px'}}>
                <li>Your encrypted evidence</li>
                <li>Your last known location {locationSharing ? '✓' : '(not enabled)'}</li>
                <li>Timestamp of last activity</li>
                <li>Alert to NCW, Police, and Women's Helpline</li>
              </ul>
              <p style={{marginTop: '10px', marginBottom: '0', fontSize: '0.9em'}}>
                This is a critical safety measure in case something happens to you.
              </p>
            </div>
          </>
        )}

        {!autoSOS && (
          <div className="info-box" style={{marginTop: '15px', backgroundColor: '#f8fafc'}}>
            <p style={{margin: 0}}>
              Automatic SOS is <strong>disabled</strong>. Only manual SOS (via the 🚨 SOS button in navbar) is active.
            </p>
          </div>
        )}

        <div className="info-box" style={{marginTop: '15px', backgroundColor: '#f0f9ff'}}>
          <p><strong>All SOS alerts are sent directly to:</strong></p>
          <ul style={{marginTop: '8px', marginBottom: '0', paddingLeft: '20px', fontSize: '0.9em'}}>
            <li>National Commission for Women (NCW)</li>
            <li>Local Police Department</li>
            <li>Women's Helpline (1091)</li>
          </ul>
        </div>
      </div>

      {feedback && (
        <div className={feedback.includes('denied') || feedback.includes('disabled') ? "form-feedback error" : "form-feedback success"} style={{marginTop: '20px'}}>
          {feedback}
        </div>
      )}

      <button 
        onClick={handleSaveSettings}
        className="main-btn"
        style={{marginTop: '20px'}}
      >
        💾 Save All Settings
      </button>
    </div>
  );
}
