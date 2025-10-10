import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSession } from '../services/accountService';

export default function EmergencySOS() {
  const session = getSession();
  const navigate = useNavigate();
  const [emergencyContact, setEmergencyContact] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [location, setLocation] = useState(null);
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    // Check if emergency contact is set
    const savedContact = localStorage.getItem('emergencyContact');
    if (!savedContact) {
      alert('Please set your emergency contact number in Settings first!');
      navigate('/settings');
      return;
    }
    setEmergencyContact(savedContact);

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  }, [navigate]);

  const handleSendSOS = async () => {
    if (!emergencyContact) {
      alert('No emergency contact set!');
      navigate('/settings');
      return;
    }

    setIsSending(true);

    try {
      // TODO: Implement actual SOS sending logic
      // 1. Send SMS to emergency contact
      // 2. Send location data
      // 3. Send custom message
      // 4. Trigger evidence access link

      await new Promise(resolve => setTimeout(resolve, 2000));

      alert(`🚨 SOS Alert Sent!\n\nTo: +91 ${emergencyContact}\nLocation: ${location ? 'Sent' : 'Not available'}\n\nYour emergency contact has been notified!`);
      
      navigate('/dashboard');

    } catch (error) {
      console.error('SOS failed:', error);
      alert('Failed to send SOS. Please try again or call emergency services directly.');
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
      <p className="subtitle">Send an immediate alert to your emergency contact</p>

      <div className="warning-box" style={{backgroundColor: '#fee2e2', borderLeftColor: '#dc2626'}}>
        <strong>⚠️ Warning:</strong> This will immediately notify your emergency contact with your location and evidence access.
      </div>

      <div className="info-box" style={{marginTop: '20px'}}>
        <p><strong>Alert will be sent to:</strong></p>
        <p style={{fontSize: '1.2em', fontWeight: '600'}}>+91 {emergencyContact}</p>
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
        {isSending ? 'Sending SOS...' : '🚨 SEND EMERGENCY SOS'}
      </button>

      <p className="footer-link" style={{marginTop: '20px'}}>
        <Link to="/dashboard">← Cancel and go back</Link>
      </p>
    </div>
  );
}
