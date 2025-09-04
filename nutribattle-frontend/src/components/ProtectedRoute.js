// src/components/ProtectedRoute.js
// This component protects routes that require authentication

import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

function ProtectedRoute({ children, requireAdmin = false }) {
  // Check if user is authenticated
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If admin is required but user is not admin, redirect to dashboard
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // If all checks pass, render the protected component
  return children;
}

export default ProtectedRoute;