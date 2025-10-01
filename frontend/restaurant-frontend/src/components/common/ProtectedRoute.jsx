
// 5. components/common/ProtectedRoute.js - Route Protection
// ============================================
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';


const ProtectedRoute = ({ children, requireAuth = true, requiredRole = null }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Check for admin role first (before loading check)
  if (requiredRole === 'admin') {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('ProtectedRoute - Admin check:', { token: !!token, storedUser: !!storedUser });
    
    // If no token or user in localStorage, redirect to admin login
    if (!token || !storedUser) {
      console.log('No token or user, redirecting to /admin/login');
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    
    const userData = JSON.parse(storedUser);
    console.log('User data:', userData);
    
    // Check if user has admin role
    if (userData.role !== 'admin') {
      console.log('Not admin role, redirecting to /admin/login');
      return <Navigate to="/admin/login" state={{ from: location, error: 'Admin access required' }} replace />;
    }
    
    console.log('Admin verified, rendering children');
    // User is admin, allow access
    return children;
  }

  // For non-admin routes, check loading
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

// const ProtectedRoute = ({ children, requireAuth = true, requiredRole = null }) => {
//   const { isAuthenticated, loading, user } = useAuth();
//   const location = useLocation();

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
//           <p>Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   // Check for admin role
//   if (requiredRole === 'admin') {
//     const token = localStorage.getItem('token');
//     const storedUser = localStorage.getItem('user');
    
//     // If no token or user in localStorage, redirect to admin login
//     if (!token || !storedUser) {
//       return <Navigate to="/admin/login" state={{ from: location }} replace />;
//     }
    
//     const userData = JSON.parse(storedUser);
    
//     // Check if user has admin role
//     if (userData.role !== 'admin') {
//       return <Navigate to="/admin/login" state={{ from: location, error: 'Admin access required' }} replace />;
//     }
    
//     // User is admin, allow access
//     return children;
//   }

//   if (requireAuth && !isAuthenticated) {
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   if (!requireAuth && isAuthenticated) {
//     return <Navigate to="/" replace />;
//   }

//   return children;
// };

export default ProtectedRoute;