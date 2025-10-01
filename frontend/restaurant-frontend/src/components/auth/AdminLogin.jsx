// components/auth/AdminLogin.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ArrowLeft, Loader, AlertCircle, User, Lock } from "lucide-react";
import axios from "axios";


const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { login } = useAuth(); // Add this line at the top with other hooks
  const { adminLogin } = useAuth(); // Add this line at the top with other hooks

  // // Redirect if already authenticated as admin
  // useEffect(() => {
  //   if (isAuthenticated && user?.role === "admin") {
  //     navigate("/admin/dashboard");
  //   }
  // }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!credentials.email || !credentials.password) {
  //     setError("Please fill in all fields");
  //     return;
  //   }

  //   setLoading(true);
  //   setError("");

  //   try {
  //     // Attempt to login with admin credentials
  //     const response = await axios.post(`${API_BASE_URL}/auth/login`, {
  //       email: credentials.email,
  //       password: credentials.password,
  //       //  adminLogin: true // Flag to indicate admin login attempt
  //     });

  //     //   if (response.data.success && response.data.user.role === 'admin') {
  //     //     // Store admin token
  //     //     localStorage.setItem('token', response.data.token);
  //     //     localStorage.setItem('isAdminAuthenticated', 'true');

  //     //     // Navigate to admin dashboard
  //     //     navigate('/admin/dashboard');
  //     //   } else {
  //     //     setError('Invalid admin credentials or insufficient permissions');
  //     //   }
  //     // Check if login was successful and user is admin
  //     //   if (
  //     //     response.data.token &&
  //     //     response.data.user &&
  //     //     response.data.user.role === "admin"
  //     //   ) {
  //     //     localStorage.setItem("token", response.data.token);
  //     //     localStorage.setItem("isAdminAuthenticated", "true");
  //     //     navigate("/admin/dashboard");
  //     //   } else if (response.data.user && response.data.user.role !== "admin") {
  //     //     setError("Access denied. Admin privileges required.");
  //     //   } else {
  //     //     setError("Invalid admin credentials or insufficient permissions");
  //     //   }

  //     // Then in handleSubmit, replace the success section:
  //     // if (response.data.success && response.data.user.role === 'admin') {
  //     //   // Update AuthContext
  //     //   login(response.data.token, response.data.user); // This updates the context

  //     //   // Also set localStorage for persistence
  //     //   localStorage.setItem('token', response.data.token);
  //     //   localStorage.setItem('isAdminAuthenticated', 'true');

  //     //   // Navigate to admin dashboard
  //     //   navigate('/admin/dashboard');

  //     // } else if (response.data.user && response.data.user.role !== "admin") {
  //     //         setError("Access denied. Admin privileges required.");
  //     //       } else {
  //     //         setError("Invalid admin credentials or insufficient permissions");
  //     //       }

  //     if (response.data.success && response.data.user.role === "admin") {
  //       // Use the adminLogin method from AuthContext
  //       adminLogin(response.data.token, response.data.user);

  //       // Navigate to admin dashboard
  //       navigate("/admin/dashboard", { replace: true });
  //     } else {
  //       setError("Invalid admin credentials or insufficient permissions");
  //     }
  //   } catch (err) {
  //     console.error("Admin login error:", err);
  //     if (err.response?.status === 401) {
  //       setError("Invalid admin credentials");
  //     } else if (err.response?.status === 403) {
  //       setError("Access denied. Admin privileges required.");
  //     } else {
  //       setError("Login failed. Please try again.");
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Demo admin credentials for development
  
//   const handleSubmit = async (e) => {
//   e.preventDefault();
  
//   if (!credentials.email || !credentials.password) {
//     setError('Please fill in all fields');
//     return;
//   }

//   setLoading(true);
//   setError('');

//   try {
//     const response = await axios.post(`${API_BASE_URL}/auth/login`, {
//       email: credentials.email,
//       password: credentials.password,
//     });

//     console.log('1. Login response:', response.data);

//     if (response.data.success && response.data.user.role === 'admin') {
//       console.log('2. Admin verified, calling adminLogin');
      
//       await adminLogin(response.data.token, response.data.user);
      
//       console.log('3. After adminLogin - localStorage check:');
//       console.log('   Token:', localStorage.getItem('token'));
//       console.log('   User:', localStorage.getItem('user'));
//       console.log('   IsAuthenticated:', isAuthenticated);
//       console.log('   User from state:', user);
      
//       console.log('4. About to navigate to /admin/dashboard');
//       navigate('/admin/dashboard', { replace: true });
//       console.log('5. Navigate called');
      
//     } else {
//       setError('Invalid admin credentials or insufficient permissions');
//     }
//   } catch (err) {
//     console.error('Admin login error:', err);
//     setError('Login failed. Please try again.');
//   } finally {
//     setLoading(false);
//   }
// };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!credentials.email || !credentials.password) {
    setError('Please fill in all fields');
    return;
  }

  setLoading(true);
  setError('');

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: credentials.email,
      password: credentials.password,
    });

    if (response.data.success && response.data.user.role === 'admin') {
      // Store everything in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('isAdminAuthenticated', 'true');
      
      // Force full page reload to admin dashboard
      window.location.href = '/admin/dashboard';
    } else {
      setError('Invalid admin credentials or insufficient permissions');
    }
  } catch (err) {
    console.error('Admin login error:', err);
    setError('Login failed. Please try again.');
  } finally {
    setLoading(false);
  }
};
  
  const fillDemoCredentials = () => {
    setCredentials({
      email: "admin@bellavista.com",
      password: "admin123",
    });
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-gray-600 hover:text-orange-600 transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Restaurant
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
            <p className="text-gray-600 mt-2">
              Sign in to access the restaurant management dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Authentication Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="admin@bellavista.com"
                  disabled={loading}
                  required
                />
                <User className="h-5 w-5 text-gray-400 absolute left-4 top-4" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Enter admin password"
                  disabled={loading}
                  required
                />
                <Lock className="h-5 w-5 text-gray-400 absolute left-4 top-4" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader className="h-5 w-5 animate-spin mr-2" />
                  Signing in...
                </div>
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </form>

          {/* Demo Credentials for Development */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Demo Credentials
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    For development only
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                >
                  Use Demo
                </button>
              </div>
              <div className="mt-2 text-xs text-blue-700">
                <p>Email: admin@bellavista.com</p>
                <p>Password: admin123</p>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start text-sm text-gray-600">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Security Notice</p>
                <p className="text-xs mt-1">
                  Admin access is restricted and monitored. Only authorized
                  personnel should use this login.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
