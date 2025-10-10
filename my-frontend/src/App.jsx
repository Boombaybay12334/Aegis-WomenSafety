import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';

import HomePage from './components/HomePage';
import CreateAccount from './components/CreateAccount';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

import { getSession, logout } from './services/accountService';

const Header = ({ isLoggedIn, onLogout }) => {
  const session = isLoggedIn ? getSession() : null;

  return (
    <header className="app-header">
      {/* This line uses your logo.png from the public folder */}
      <Link to="/" className="logo">
        <img src="/logo.png" alt="Aegis Logo" />
        <span>Aegis</span>
      </Link>
      <nav>
        <div className="nav-items">
          <a href="tel:1091" className="helpline">Women Helpline: 1091</a>
          {isLoggedIn && session ? (
            <>
              <span className="wallet-display">
                {`${session.walletAddress.slice(0, 6)}...${session.walletAddress.slice(-4)}`}
              </span>
              <button onClick={onLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link cta">Sign Up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!getSession());
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    navigate('/login');
  };
  
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="app-container">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<CreateAccount onSignUpSuccess={handleLoginSuccess} />} />
          <Route path="/login" element={<LoginScreen onLoginSuccess={handleLoginSuccess} />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}