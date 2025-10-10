import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/accountService';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePanicSwitch = () => {
    // Immediately switch to Google
    window.location.href = 'https://www.google.com';
  };

  return (
    <header className="app-header">
      <Link to="/dashboard" className="logo">
        Aegis
      </Link>
      <nav className="nav-items">
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/upload" className="nav-link">Upload</Link>
        <Link to="/settings" className="nav-link">⚙️ Settings</Link>
        <Link to="/emergency-sos" className="nav-link" style={{color: '#dc2626', fontWeight: '700'}}>
          🚨 SOS
        </Link>
        <button onClick={handlePanicSwitch} className="panic-btn" title="Quick switch to Google">
          🔒 Panic
        </button>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>
    </header>
  );
}
