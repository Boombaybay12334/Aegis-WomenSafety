import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as accountService from '../services/accountService';

// Accept the onLoginSuccess prop
export default function LoginScreen({ onLoginSuccess }) {
  const [passphrase, setPassphrase] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passphrase) {
      setFeedback('Please enter your passphrase.');
      return;
    }
    setIsLoading(true);
    setFeedback('');

    try {
      await accountService.login(passphrase);
      onLoginSuccess(); // Notify the App component of the successful login
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      setFeedback('Login failed. Please check your passphrase and try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Welcome Back to Aegis</h1>
      <p className="subtitle">Enter your secret passphrase to log in.</p>
      <div className="info-box" style={{ textAlign: 'center' }}>
        Lost your passphrase? Unfortunately, it cannot be recovered.
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Your Passphrase</label>
          <input 
            type="password" 
            className="input-field" 
            value={passphrase} 
            onChange={e => setPassphrase(e.target.value)} 
            placeholder="Enter your secret passphrase"
          />
        </div>
        {feedback && <div className="form-feedback error">{feedback}</div>}
        <button type="submit" className="main-btn" disabled={isLoading}>
          {isLoading ? 'Logging In...' : 'Login'}
        </button>
      </form>
      <p className="footer-link">
        Don't have an account? <Link to="/signup">Create one</Link>
      </p>
    </div>
  );
}