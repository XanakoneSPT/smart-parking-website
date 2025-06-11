import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading state if auth check is in progress
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If role is required, check if user has it
  if (requiredRole) {
    const hasRole = requiredRole === 'Admin' ? user.is_admin : true;
    if (!hasRole) {
      return <Navigate to="/parking-management" />;
    }
  }

  // If authenticated and has required role, render children
  return children;
};

export default ProtectedRoute; 