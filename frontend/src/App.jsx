import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import HomePage from './components/HomePage';
import CreateAccount from './components/CreateAccount';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import UploadEvidence from './components/UploadEvidence';
import Settings from './components/Settings';
import EmergencySOS from './components/EmergencySOS';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import { getSession, logout } from './services/accountService';
import { useInactivityTimer } from './hooks/useInactivityTimer';
import { checkDeadManSwitch, startLocationTracking } from './utils/deadManSwitch';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!getSession());
  const navigate = useNavigate();
  const location = useLocation();

  // Enable inactivity timer when logged in
  if (isLoggedIn) {
    useInactivityTimer();
  }

  useEffect(() => {
    // Check Dead Man's Switch on app load
    if (isLoggedIn) {
      checkDeadManSwitch();
      startLocationTracking();
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    logout();
    console.log('Session after logout:', getSession()); // Log to verify session cleared
    setIsLoggedIn(false); // This triggers re-render
    navigate('/login');
  };
  
  const handleLoginSuccess = () => {
    console.log('🟢 [App] handleLoginSuccess called');
    console.log('🟢 [App] Current session:', getSession());
    setIsLoggedIn(true);
    console.log('🟢 [App] isLoggedIn state set to true');
  };

  // Show navbar only on protected pages
  const showNavbar = isLoggedIn && !['/login', '/signup', '/'].includes(location.pathname);

  return (
    <div className="app-container">
      {showNavbar && <Navbar />}
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
          <Route 
            path="/upload" 
            element={
              <ProtectedRoute>
                <UploadEvidence />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/emergency-sos" 
            element={
              <ProtectedRoute>
                <EmergencySOS />
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
