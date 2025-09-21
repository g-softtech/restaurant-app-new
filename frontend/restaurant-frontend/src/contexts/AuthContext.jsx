
// // ============================================
// // 1. contexts/AuthContext.js - Authentication Context
// // ============================================
// import React, { createContext, useContext, useReducer, useEffect } from 'react';
// import axios from 'axios';

// const AuthContext = createContext();

// // Auth reducer to manage state
// const authReducer = (state, action) => {
//   switch (action.type) {
//     case 'AUTH_START':
//       return { ...state, loading: true, error: null };
//     case 'AUTH_SUCCESS':
//       return {
//         ...state,
//         loading: false,
//         isAuthenticated: true,
//         user: action.payload.user,
//         token: action.payload.token,
//         error: null
//       };
//     case 'AUTH_ERROR':
//       return {
//         ...state,
//         loading: false,
//         isAuthenticated: false,
//         user: null,
//         token: null,
//         error: action.payload
//       };
//     case 'LOGOUT':
//       return {
//         ...state,
//         isAuthenticated: false,
//         user: null,
//         token: null,
//         error: null
//       };
//     case 'CLEAR_ERROR':
//       return { ...state, error: null };
//     default:
//       return state;
//   }
// };

// // Initial state
// const initialState = {
//   isAuthenticated: false,
//   user: null,
//   token: localStorage.getItem('token'),
//   loading: false,
//   error: null
// };

// export const AuthProvider = ({ children }) => {
//   const [state, dispatch] = useReducer(authReducer, initialState);

//   // Set axios default header when token changes
//   useEffect(() => {
//     if (state.token) {
//       axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
//       // Load user data on app start
//       loadUser();
//     } else {
//       delete axios.defaults.headers.common['Authorization'];
//     }
//   }, [state.token]);

//   // Load user from token
//   const loadUser = async () => {
//     try {
//       const response = await axios.get('http://localhost:5000/api/auth/me');
//       dispatch({
//         type: 'AUTH_SUCCESS',
//         payload: {
//           user: response.data.user,
//           token: state.token
//         }
//       });
//     } catch (error) {
//       console.error('Load user error:', error);
//       // If token is invalid, clear it
//       localStorage.removeItem('token');
//       dispatch({ type: 'LOGOUT' });
//     }
//   };

//   // Register user
//   const register = async (userData) => {
//     try {
//       dispatch({ type: 'AUTH_START' });
      
//       const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      
//       // Store token in localStorage
//       localStorage.setItem('token', response.data.token);
      
//       dispatch({
//         type: 'AUTH_SUCCESS',
//         payload: {
//           user: response.data.user,
//           token: response.data.token
//         }
//       });
      
//       return response.data;
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || 'Registration failed';
//       dispatch({
//         type: 'AUTH_ERROR',
//         payload: errorMsg
//       });
//       throw new Error(errorMsg);
//     }
//   };

//   // Login user
//   const login = async (credentials) => {
//     try {
//       dispatch({ type: 'AUTH_START' });
      
//       const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
      
//       // Store token in localStorage
//       localStorage.setItem('token', response.data.token);
      
//       dispatch({
//         type: 'AUTH_SUCCESS',
//         payload: {
//           user: response.data.user,
//           token: response.data.token
//         }
//       });
      
//       return response.data;
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || 'Login failed';
//       dispatch({
//         type: 'AUTH_ERROR',
//         payload: errorMsg
//       });
//       throw new Error(errorMsg);
//     }
//   };

//   // Logout user
//   const logout = () => {
//     localStorage.removeItem('token');
//     delete axios.defaults.headers.common['Authorization'];
//     dispatch({ type: 'LOGOUT' });
//   };

//   // Update profile
//   const updateProfile = async (userData) => {
//     try {
//       const response = await axios.put('http://localhost:5000/api/auth/profile', userData);
//       dispatch({
//         type: 'AUTH_SUCCESS',
//         payload: {
//           user: response.data.user,
//           token: state.token
//         }
//       });
//       return response.data;
//     } catch (error) {
//       throw error;
//     }
//   };

//   // Clear error
//   const clearError = () => {
//     dispatch({ type: 'CLEAR_ERROR' });
//   };

//   const value = {
//     ...state,
//     register,
//     login,
//     logout,
//     updateProfile,
//     clearError
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // Custom hook to use auth context
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };







// ============================================
// 1. contexts/AuthContext.js - Authentication Context
// ============================================
// import React, { createContext, useContext, useReducer, useEffect } from 'react';
// import axios from 'axios';

// const AuthContext = createContext();

// // Auth reducer to manage state
// const authReducer = (state, action) => {
//   switch (action.type) {
//     case 'AUTH_START':
//       return { ...state, loading: true, error: null };
//     case 'AUTH_SUCCESS':
//       return {
//         ...state,
//         loading: false,
//         isAuthenticated: true,
//         user: action.payload.user,
//         token: action.payload.token,
//         error: null
//       };
//     case 'AUTH_ERROR':
//       return {
//         ...state,
//         loading: false,
//         isAuthenticated: false,
//         user: null,
//         token: null,
//         error: action.payload
//       };
//     case 'LOGOUT':
//       return {
//         ...state,
//         isAuthenticated: false,
//         user: null,
//         token: null,
//         error: null
//       };
//     case 'CLEAR_ERROR':
//       return { ...state, error: null };
//     default:
//       return state;
//   }
// };

// // Initial state
// const initialState = {
//   isAuthenticated: false,
//   user: null,
//   token: localStorage.getItem('token'),
//   loading: false,
//   error: null
// };

// export const AuthProvider = ({ children }) => {
//   const [state, dispatch] = useReducer(authReducer, initialState);

//   // Set axios default header when token changes
// useEffect(() => {
//     console.log('Token effect triggered');
//   if (state.token) {
//     axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
//   } else {
//     delete axios.defaults.headers.common['Authorization'];
//   }
// }, [state.token]);

// // ⬇️ Add the second useEffect right here
//   useEffect(() => {
//     if (state.token) {
//       loadUser();
//     }
//   }, []);

//   // Load user from token
//   // const loadUser = async () => {
//   //   try {
//   //     const response = await axios.get('http://localhost:5000/api/auth/me');
//   //     dispatch({
//   //       type: 'AUTH_SUCCESS',
//   //       payload: {
//   //         user: response.data.user,
//   //         token: state.token
//   //       }
//   //     });
//   //   } catch (error) {
//   //     console.error('Load user error:', error);
//   //     // If token is invalid, clear it
//   //     localStorage.removeItem('token');
//   //     dispatch({ type: 'LOGOUT' });
//   //   }
//   // };

//   const loadUser = async () => {
//     console.log('loadUser called');
//   try {
//     const response = await axios.get('http://localhost:5000/api/auth/me');
//     if (!state.user) { // ✅ Prevent unnecessary dispatch
//       dispatch({
//         type: 'AUTH_SUCCESS',
//         payload: {
//           user: response.data.user,
//           token: localStorage.getItem('token')
//         }
//       });
//     }
//   } catch (error) {
//     console.error('Load user error:', error);
//     localStorage.removeItem('token');
//     dispatch({ type: 'LOGOUT' });
//   }
// };


//   // Register user
//   const register = async (userData) => {
//     try {
//       dispatch({ type: 'AUTH_START' });
      
//       const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      
//       // Store token in localStorage
//       localStorage.setItem('token', response.data.token);
      
//       dispatch({
//         type: 'AUTH_SUCCESS',
//         payload: {
//           user: response.data.user,
//           token: response.data.token
//         }
//       });
      
//       return response.data;
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || 'Registration failed';
//       dispatch({
//         type: 'AUTH_ERROR',
//         payload: errorMsg
//       });
//       throw new Error(errorMsg);
//     }
//   };

//   // Login user
//   const login = async (credentials) => {
//     try {
//       dispatch({ type: 'AUTH_START' });
      
//       const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
      
//       // Store token in localStorage
//       localStorage.setItem('token', response.data.token);
      
//       dispatch({
//         type: 'AUTH_SUCCESS',
//         payload: {
//           user: response.data.user,
//           token: response.data.token
//         }
//       });
      
//       return response.data;
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || 'Login failed';
//       dispatch({
//         type: 'AUTH_ERROR',
//         payload: errorMsg
//       });
//       throw new Error(errorMsg);
//     }
//   };

//   // Logout user
//   const logout = () => {
//     localStorage.removeItem('token');
//     delete axios.defaults.headers.common['Authorization'];
//     dispatch({ type: 'LOGOUT' });
//   };

//   // Update profile
//   const updateProfile = async (userData) => {
//     try {
//       const response = await axios.put('http://localhost:5000/api/auth/profile', userData);
//       dispatch({
//         type: 'AUTH_SUCCESS',
//         payload: {
//           user: response.data.user,
//           token: state.token
//         }
//       });
//       return response.data;
//     } catch (error) {
//       throw error;
//     }
//   };

//   // Clear error
//   const clearError = () => {
//     dispatch({ type: 'CLEAR_ERROR' });
//   };

//   const value = {
//     ...state,
//     register,
//     login,
//     logout,
//     updateProfile,
//     clearError
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // Custom hook to use auth context
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };


import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('token'),
  loading: false, // Change back to false
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get('http://localhost:5000/api/auth/me');
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.data.user,
          token: token
        }
      });
    } catch (error) {
      console.error('Load user error:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Fix register function
  // const register = async (userData) => {
  //   dispatch({ type: 'AUTH_START' });
    
  //   try {
  //     const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      
  //     if (response.data.success) {
  //       localStorage.setItem('token', response.data.token);
        
  //       dispatch({
  //         type: 'AUTH_SUCCESS',
  //         payload: {
  //           user: response.data.user,
  //           token: response.data.token
  //         }
  //       });
        
  //       return { success: true, message: response.data.message };
  //     } else {
  //       dispatch({
  //         type: 'AUTH_ERROR',
  //         payload: response.data.message
  //       });
  //       return { success: false, message: response.data.message };
  //     }
  //   } catch (error) {
  //     const errorMsg = error.response?.data?.message || 'Registration failed';
  //     dispatch({
  //       type: 'AUTH_ERROR',
  //       payload: errorMsg
  //     });
  //     return { success: false, message: errorMsg };
  //   }
  // };

// Similarly update register function:
const register = async (userData) => {
  dispatch({ type: 'AUTH_START' });
  
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', userData);
    console.log('Backend response:', response.data); // Add this to see actual response
    
    // Check if response has token (indicating success) instead of success field
    if (response.data.token && response.data.user) {
      localStorage.setItem('token', response.data.token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.data.user,
          token: response.data.token
        }
      });
      
      return { success: true, message: response.data.message || 'Registration successful' };
    } else {
      dispatch({
        type: 'AUTH_ERROR',
        payload: response.data.message || 'Registration failed'
      });
      return { success: false, message: response.data.message || 'Registration failed' };
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Registration failed';
    dispatch({
      type: 'AUTH_ERROR',
      payload: errorMsg
    });
    return { success: false, message: errorMsg };
  }
};

  
  // Fix login function
  const login = async (credentials) => {
  dispatch({ type: 'AUTH_START' });
  
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
    console.log('Backend response:', response.data); // Add this to see actual response
    
    // Check if response has token (indicating success) instead of success field
    if (response.data.token && response.data.user) {
      localStorage.setItem('token', response.data.token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.data.user,
          token: response.data.token
        }
      });
      
      return { success: true, message: response.data.message || 'Login successful' };
    } else {
      // Handle case where login fails but doesn't throw error
      dispatch({
        type: 'AUTH_ERROR',
        payload: response.data.message || 'Login failed'
      });
      return { success: false, message: response.data.message || 'Login failed' };
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || 'Login failed';
    dispatch({
      type: 'AUTH_ERROR',
      payload: errorMsg
    });
    return { success: false, message: errorMsg };
  }
};


  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const updateProfile = async (userData) => {
    try {
      const response = await axios.put('http://localhost:5000/api/auth/profile', userData);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.data.user,
          token: state.token
        }
      });
      return { success: true, ...response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Update failed' };
    }
  };

  const value = {
    ...state,
    register,
    login,
    logout,
    updateProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};












