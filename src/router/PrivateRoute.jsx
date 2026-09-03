import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user, authChecked } = useSelector((s) => s.auth);
  if (!authChecked) return null; // wait for the initial auth check to finish
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && user.role !== 'seller') return <Navigate to="/login" replace />;

  if (user?.seller_status !== 'approved') {
    if (user?.seller_status === 'pending' || user?.seller_status === 'rejected') {
      return <Navigate to="/onboarding/success" replace />;
    }
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default PrivateRoute;
