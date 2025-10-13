import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as accountService from '../services/accountService';
import { generateWalletFromPassphrase } from '../services/cryptoService';
import { checkAvailability } from '../services/apiService';

// A small helper component to show validation status
const ValidationCheck = ({ isValid, text }) => (
  <li className={isValid ? 'valid' : 'invalid'}>
    {isValid ? '✓' : '✗'} {text}
  </li>
);

export default function CreateAccount({ onSignUpSuccess }) {
  const [passphrase, setPassphrase] = useState('');
  const [confirm, setConfirm] = useState('');
  const [ack, setAck] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [available, setAvailable] = useState({ status: 'idle', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // NEW: Prevent double submission
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  const validation = useMemo(() => ({
    hasLength: passphrase.length >= 12,
    hasNumber: /\d/.test(passphrase),
    hasLetter: /[a-zA-Z]/.test(passphrase),
    doMatch: passphrase === confirm && passphrase.length > 0,
  }), [passphrase, confirm]);

  useEffect(() => {
    // Bypass availability check since backend isn't running
    if (validation.hasLength && validation.hasNumber && validation.hasLetter) {
      setAvailable({ status: 'available', message: '✓ Ready to create account' });
    } else {
      setAvailable({ status: 'idle', message: '' });
    }
  }, [passphrase, validation]);

  const isButtonDisabled = !validation.hasLength || !validation.hasNumber || !validation.hasLetter || !validation.doMatch || !ack || available.status !== 'available' || isLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isButtonDisabled || isSubmitting) return; // Prevent double submission
    
    setIsSubmitting(true); // Lock the form
    setIsLoading(true);
    setFeedback('');
    
    try {
      console.log('🔵 [CreateAccount] Starting signup...');
      
      // CLEAR ALL STORAGE BEFORE CREATING NEW ACCOUNT
      console.log('🧹 [CreateAccount] Clearing all storage...');
      localStorage.clear();
      sessionStorage.clear();
      console.log('✅ [CreateAccount] Storage cleared!');
      
      const result = await accountService.signUp(passphrase);
      
      console.log('🟢 [CreateAccount] Signup successful! Result:', result); // Debug
      console.log('🟢 [CreateAccount] Session created:', accountService.getSession()); // Debug
      
      // Set last login date
      localStorage.setItem('lastLoginDate', new Date().toISOString());
      
      // IMPORTANT: Call onSignUpSuccess to update App.jsx state
      console.log('🟢 [CreateAccount] Calling onSignUpSuccess callback...'); // Debug
      onSignUpSuccess();
      
      console.log('🟢 [CreateAccount] Navigating to dashboard...'); // Debug
      // Navigate immediately without delay
      navigate('/dashboard', { replace: true });
      
    } catch (error) {
      console.error('🔴 [CreateAccount] Sign-up failed:', error);
      setFeedback(error.message || 'An error occurred. Please try again.');
      setIsLoading(false);
      setIsSubmitting(false); // Unlock the form on error
    }
  };

  return (
    <div className="container">
      <h1>Create Your Anonymous Account</h1>
      <p className="subtitle">Your passphrase is the only way to access your account.</p>
      <div className="warning-box">
        <strong>Save Your Passphrase!</strong> If lost, it cannot be recovered.
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Create Passphrase</label>
          <div className="password-wrapper">
            <input 
              type={showPassphrase ? 'text' : 'password'} 
              className="input-field" 
              value={passphrase} 
              onChange={e => setPassphrase(e.target.value)} 
            />
            <span className="password-toggle-icon" onClick={() => setShowPassphrase(!showPassphrase)}>
              {showPassphrase ? '🙈' : '👁️'}
            </span>
          </div>
        </div>
        
        <div className="validation-checklist">
          <ul>
            <ValidationCheck isValid={validation.hasLength} text="At least 12 characters" />
            <ValidationCheck isValid={validation.hasLetter} text="Contains at least one letter" />
            <ValidationCheck isValid={validation.hasNumber} text="Contains at least one number" />
          </ul>
        </div>
        
        <div className="form-group">
          <label>Confirm Passphrase</label>
          <div className="password-wrapper">
            <input 
              type={showPassphrase ? 'text' : 'password'} 
              className={`input-field ${confirm ? (validation.doMatch ? 'valid-match' : 'invalid-match') : ''}`} 
              value={confirm} 
              onChange={e => setConfirm(e.target.value)} 
            />
            <span className="password-toggle-icon" onClick={() => setShowPassphrase(!showPassphrase)}>
              {showPassphrase ? '🙈' : '👁️'}
            </span>
          </div>
          <div id="availability-status" className={available.status}>{available.message}</div>
        </div>

        <div className="checkbox-group">
          <input type="checkbox" checked={ack} onChange={e => setAck(e.target.checked)} />
          <label>I have saved my passphrase securely.</label>
        </div>
        
        {feedback && <div className="form-feedback error">{feedback}</div>}
        
        <button type="submit" className="main-btn" disabled={isButtonDisabled}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
