import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};
