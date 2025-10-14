import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSession } from '../services/accountService';
import { sendEmergencySOS, getCurrentLocation } from '../services/sosService';

export default function EmergencySOS() {
  const session = getSession();
  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);
  const [location, setLocation] = useState(null);
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    // Get current location using SOS service
    getCurrentLocation()
      .then(locationData => {
        setLocation(locationData);
        console.log('📍 Location obtained for SOS:', locationData);
      })
      .catch(error => {
        console.warn('🌍 Location not available:', error.message);
      });
  }, []);

  const handleSendSOS = async () => {
    setIsSending(true);

    try {
      console.log('🚨 Initiating emergency SOS...');
      
      // Send real SOS alert using sosService
      const sosResult = await sendEmergencySOS(location, customMessage);

      console.log('✅ SOS sent successfully:', sosResult);

      alert(`🚨 EMERGENCY SOS SENT!\n\nSOS ID: ${sosResult.sosId}\n\nAlerts sent to:\n✓ National Commission for Women (NCW)\n✓ Local Police Department\n✓ Women's Helpline (1091)\n\nLocation: ${location ? `${location.lat}, ${location.lng}` : 'Not available'}\nMessage: ${customMessage || 'Standard emergency alert'}\n\nAuthorities have been notified and your evidence is accessible!`);
      
      navigate('/dashboard');

    } catch (error) {
      console.error('SOS failed:', error);
      alert(`Failed to send SOS: ${error.message}\n\nPlease try again or call:\n• 1091 (Women's Helpline)\n• 100 (Police)\n• 112 (Emergency Services)\ndirectly.`);
    } finally {
      setIsSending(false);
    }
  };

  if (!session) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container">
      <h1 style={{color: '#dc2626'}}>🚨 Emergency SOS</h1>
      <p className="subtitle">Send immediate alert to authorities</p>

      <div className="warning-box" style={{backgroundColor: '#fee2e2', borderLeftColor: '#dc2626'}}>
        <strong>⚠️ Warning:</strong> This will immediately notify authorities with your location and evidence access.
      </div>

      <div className="info-box" style={{marginTop: '20px'}}>
        <p><strong>Alerts will be sent to:</strong></p>
        <ul style={{marginTop: '10px', marginBottom: '0', paddingLeft: '20px'}}>
          <li>📞 <strong>National Commission for Women (NCW)</strong></li>
          <li>👮 <strong>Local Police Department</strong></li>
          <li>🆘 <strong>Women's Helpline - 1091</strong></li>
        </ul>
      </div>

      {location && (
        <div className="info-box">
          <p><strong>Your current location:</strong></p>
          <p style={{fontSize: '0.9em', fontFamily: 'monospace'}}>
            Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
          </p>
          <a 
            href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{color: 'var(--primary-color)', fontSize: '0.9em'}}
          >
            View on Google Maps →
          </a>
        </div>
      )}

      <div className="form-group" style={{marginTop: '20px'}}>
        <label>Custom Message (Optional)</label>
        <textarea 
          className="input-field"
          placeholder="Add any additional details about your emergency..."
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          rows="4"
        />
      </div>

      <button 
        onClick={handleSendSOS}
        className="main-btn"
        style={{backgroundColor: '#dc2626', marginTop: '20px'}}
        disabled={isSending}
      >
        {isSending ? 'Sending SOS...' : '🚨 SEND EMERGENCY SOS TO AUTHORITIES'}
      </button>

      <div className="info-box" style={{marginTop: '20px', backgroundColor: '#fff3cd'}}>
        <p style={{fontSize: '0.9em', margin: 0}}>
          <strong>Emergency Helplines:</strong><br />
          Women's Helpline: <strong>1091</strong> | Police: <strong>100</strong> | Ambulance: <strong>108</strong>
        </p>
      </div>
    </div>
  );
}
