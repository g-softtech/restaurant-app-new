import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAuth = true, requiredRole = null }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // For admin routes, check localStorage directly AND AuthContext
  if (requiredRole === 'admin') {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    
    const userData = JSON.parse(storedUser);
    
    if (userData.role !== 'admin') {
      return <Navigate to="/admin/login" state={{ from: location, error: 'Admin access required' }} replace />;
    }
    
    // If we reach here, admin is authenticated
    console.log('Admin authenticated, rendering children');
    return children;
  }

  // For regular routes, respect loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;