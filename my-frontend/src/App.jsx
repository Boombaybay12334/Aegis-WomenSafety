import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import HomePage from './components/HomePage';
import CreateAccount from './components/CreateAccount';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

import { getSession, logout } from './services/accountService';

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
