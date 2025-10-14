import React from 'react';
import { Navigate } from 'react-router-dom';
import { getSession } from '../services/accountService';

const ProtectedRoute = ({ children }) => {
  const session = getSession();

  if (!session) {
    // User not logged in, redirect to login page
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;