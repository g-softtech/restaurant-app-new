// App.js
import React, { useState, useEffect, createContext, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Package, Truck } from "lucide-react";

import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  ShoppingCart, 
  Menu, 
  X, 
  Plus, 
  Minus, 
  Star, 
  Clock, 
  MapPin, 
  Phone, 
  AlertCircle, 
  Loader,
  Home,
  UtensilsCrossed,
  Info,
  MessageCircle
} from 'lucide-react';

// Add these imports at the top of your App.js
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/profile/Profile';
import ProtectedRoute from './components/common/ProtectedRoute';


import {RestaurantProvider, useRestaurant } from './contexts/RestaurantContext'; // Assuming you extract context
import { 
  CreditCard, 
  
  
  User, 
  Mail, 
  
  CheckCircle,
  
  
  ArrowLeft
} from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Payment method options
const PAYMENT_METHODS = [
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
  { id: 'paystack', name: 'Paystack', icon: CreditCard },
  { id: 'cash', name: 'Cash on Delivery', icon: MapPin }
];

// Delivery time options
const DELIVERY_TIMES = [
  { value: 'asap', label: 'ASAP (30-45 mins)' },
  { value: '1hour', label: 'In 1 hour' },
  { value: '2hours', label: 'In 2 hours' },
  { value: 'schedule', label: 'Schedule for later' }
];

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create Context for Global State Management
// const RestaurantContext = createContext();

// Custom Hook to use Restaurant Context
// const useRestaurant = () => {
//   const context = useContext(RestaurantContext);
//   if (!context) {
//     throw new Error('useRestaurant must be used within RestaurantProvider');
//   }
//   return context;
// };

// Context Provider Component
// const RestaurantProvider = ({ children }) => {
//   const [cartItems, setCartItems] = useState([]);
//   const [menuItems, setMenuItems] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [user, setUser] = useState(null);

//   // API Functions
//   const fetchMenuItems = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await axios.get(`${API_BASE_URL}/menu`);
      
//       if (response.data.success) {
//         const transformedItems = response.data.data.map(item => ({
//           id: item._id,
//           name: item.name,
//           price: item.price,
//           description: item.description,
//           category: item.category.charAt(0).toUpperCase() + item.category.slice(1).replace('-', ' '),
//           image: getEmojiForCategory(item.category),
//           rating: item.rating?.average || 4.5,
//           availability: item.availability || true,
//           originalData: item
//         }));
        
//         setMenuItems(transformedItems);
//       } else {
//         throw new Error('Failed to fetch menu items');
//       }
//     } catch (err) {
//       console.error('Error fetching menu:', err);
//       setError(err.response?.data?.message || err.message || 'Failed to load menu');
      
//       // Fallback to sample data
//       const sampleMenuItems = [
//         {
//           id: 'sample-1',
//           name: "Margherita Pizza",
//           price: 18.99,
//           description: "Classic tomato sauce, fresh mozzarella, basil, and olive oil on our house-made dough",
//           category: "Main Course",
//           image: "🍕",
//           rating: 4.8,
//           availability: true
//         },
//         {
//           id: 'sample-2',
//           name: "Caesar Salad",
//           price: 12.99,
//           description: "Crisp romaine lettuce, parmesan cheese, croutons, and our signature caesar dressing",
//           category: "Appetizer",
//           image: "🥗",
//           rating: 4.6,
//           availability: true
//         },
//         {
//           id: 'sample-3',
//           name: "Grilled Salmon",
//           price: 26.99,
//           description: "Fresh Atlantic salmon with lemon herbs, served with roasted vegetables and wild rice",
//           category: "Main Course",
//           image: "🐟",
//           rating: 4.9,
//           availability: true
//         },
//         {
//           id: 'sample-4',
//           name: "Tiramisu",
//           price: 8.99,
//           description: "Traditional Italian dessert with espresso-soaked ladyfingers and mascarpone cream",
//           category: "Dessert",
//           image: "🍰",
//           rating: 4.7,
//           availability: true
//         }
//       ];
//       setMenuItems(sampleMenuItems);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Helper function to get emoji based on category
//   const getEmojiForCategory = (category) => {
//     const categoryEmojis = {
//       'appetizer': '🥗',
//       'main-course': '🍽️',
//       'dessert': '🍰',
//       'beverages': '🥤',
//       'sides': '🍞',
//       'specials': '⭐'
//     };
//     return categoryEmojis[category] || '🍽️';
//   };

//   // Cart Functions
//   const addToCart = (item) => {
//     setCartItems(prev => {
//       const existing = prev.find(cartItem => cartItem.id === item.id);
//       if (existing) {
//         return prev.map(cartItem =>
//           cartItem.id === item.id
//             ? { ...cartItem, quantity: cartItem.quantity + 1 }
//             : cartItem
//         );
//       }
//       return [...prev, { ...item, quantity: 1 }];
//     });
    
//     // Show success notification
//     showNotification(`Added ${item.name} to cart!`, 'success');
//   };

//   const removeFromCart = (itemId) => {
//     setCartItems(prev => prev.filter(item => item.id !== itemId));
//   };

//   const updateQuantity = (itemId, newQuantity) => {
//     if (newQuantity === 0) {
//       removeFromCart(itemId);
//       return;
//     }
//     setCartItems(prev =>
//       prev.map(item =>
//         item.id === itemId ? { ...item, quantity: newQuantity } : item
//       )
//     );
//   };

//   const clearCart = () => {
//     setCartItems([]);
//   };

//   const getTotalPrice = () => {
//     return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
//   };

//   const getTotalItems = () => {
//     return cartItems.reduce((total, item) => total + item.quantity, 0);
//   };

//   // Notification function
//   const showNotification = (message, type = 'info') => {
//     // You can implement a toast notification system here
//     console.log(`${type.toUpperCase()}: ${message}`);
//   };

//   // Load menu items on mount
//   useEffect(() => {
//     fetchMenuItems();
//   }, []);

//   const value = {
//     // State
//     cartItems,
//     menuItems,
//     loading,
//     error,
//     user,
//     // Functions
//     addToCart,
//     removeFromCart,
//     updateQuantity,
//     clearCart,
//     getTotalPrice,
//     getTotalItems,
//     fetchMenuItems,
//     showNotification,
//     setUser
//   };

//   return (
//     <RestaurantContext.Provider value={value}>
//       {children}
//     </RestaurantContext.Provider>
//   );
// };

// Navigation Component
// Update your Navigation component in App.js
const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getTotalItems, loading, error } = useRestaurant();
  const { user, isAuthenticated, logout } = useAuth(); // ADD THIS LINE
  const location = useLocation();
  const navigate = useNavigate(); // ADD THIS LINE

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/menu', label: 'Menu', icon: UtensilsCrossed },
    { path: '/about', label: 'About', icon: Info },
    { path: '/contact', label: 'Contact', icon: MessageCircle }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  // ADD THIS FUNCTION
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Bella Vista
            </Link>
            {loading && (
              <div className="ml-3 flex items-center text-orange-600">
                <Loader className="h-4 w-4 animate-spin mr-1" />
                <span className="text-sm">Loading...</span>
              </div>
            )}
            {error && (
              <div className="ml-3 flex items-center text-amber-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">Using sample menu</span>
              </div>
            )}
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-all duration-200 relative ${
                      isActive(item.path)
                        ? 'text-orange-600'
                        : 'text-gray-700 hover:text-orange-600'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{item.label}</span>
                    {isActive(item.path) && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Cart and Authentication Section */}
          <div className="flex items-center space-x-4">
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-orange-600 transition-all duration-200 hover:scale-105"
            >
              <ShoppingCart className="h-6 w-6" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* REPLACE YOUR EXISTING AUTHENTICATION SECTION WITH THIS */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors">
                  <User className="h-6 w-6" />
                  <span className="hidden md:block font-medium">{user?.name}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-orange-500"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-500"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-orange-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 text-base font-medium w-full transition-all duration-200 rounded-md ${
                      isActive(item.path)
                        ? 'text-orange-600 bg-orange-50'
                        : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Mobile Authentication Links */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-md"
                    >
                      <User className="h-5 w-5" />
                      <span>My Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md w-full text-left"
                    >
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 rounded-md"
                    >
                      <span>Login</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-base font-medium bg-orange-500 text-white hover:bg-orange-600 rounded-md mx-3 mt-2"
                    >
                      <span>Sign Up</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
// Home Page Component
const HomePage = () => {
  const { menuItems } = useRestaurant();
  const navigate = useNavigate();

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 via-red-600 to-pink-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative text-center px-4 z-10">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-fade-in">Bella Vista</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-90 leading-relaxed">
            Authentic Italian cuisine crafted with passion and the finest ingredients
          </p>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/menu')}
              className="bg-white text-orange-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg mr-4"
            >
              Explore Our Menu
            </button>
            {menuItems.length > 0 && (
              <p className="text-lg opacity-90 mt-4">
                ✨ Fresh menu with {menuItems.length} delicious items available now!
              </p>
            )}
          </div>
        </div>
        {/* Floating elements for visual appeal */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white opacity-10 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-white opacity-5 rounded-full animate-float-delayed"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Why Choose Bella Vista?</h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Experience the perfect blend of traditional Italian flavors and modern culinary excellence
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300">
                <Star className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Premium Quality</h3>
              <p className="text-gray-600 leading-relaxed">Only the finest ingredients sourced from trusted suppliers across Italy</p>
            </div>
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300">
                <Clock className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Fast Delivery</h3>
              <p className="text-gray-600 leading-relaxed">Quick preparation and delivery without compromising on authentic taste and quality</p>
            </div>
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300">
                <MapPin className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Prime Location</h3>
              <p className="text-gray-600 leading-relaxed">Conveniently located in the heart of the city with easy access</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Menu Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Featured Dishes</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {menuItems.slice(0, 3).map(item => (
              <div key={item.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-5xl mb-4 text-center">{item.image}</div>
                <h3 className="text-xl font-semibold mb-2 text-center">{item.name}</h3>
                <p className="text-gray-600 text-center mb-4 line-clamp-2">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-orange-600">${item.price}</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/menu')}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              View Full Menu
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

// Menu Page Component
const MenuPage = () => {
  const { menuItems, loading, error, addToCart } = useRestaurant();

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-16 w-16 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading our delicious menu...</p>
        </div>
      </div>
    );
  }

  const categories = [...new Set(menuItems.map(item => item.category))];
  
  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-5xl font-bold text-center text-gray-900 mb-6">Our Menu</h1>
        {error && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 text-amber-800 p-4 mb-8 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p className="font-semibold">Note: Using sample menu data</p>
            </div>
            <p className="text-sm mt-1">API connection: {error}</p>
          </div>
        )}
        <p className="text-center text-gray-600 mb-16 text-lg">
          Featuring {menuItems.length} carefully crafted dishes made with love ❤️
        </p>
        
        {categories.map(category => (
          <div key={category} className="mb-16">
            <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center">{category}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {menuItems
                .filter(item => item.category === category)
                .map(item => (
                  <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="text-5xl mb-4 text-center">{item.image}</div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
                          <div className="flex items-center justify-center mb-3">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1 font-medium">{item.rating}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-6 leading-relaxed text-center">{item.description}</p>
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-3xl font-bold text-orange-600">${item.price}</span>
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        disabled={!item.availability}
                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                          item.availability 
                            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-lg' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {item.availability ? 'Add to Cart' : 'Unavailable'}
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Cart Page Component
const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice } = useRestaurant();
  const navigate = useNavigate();

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-5xl font-bold text-center text-gray-900 mb-12">Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-32 w-32 text-gray-300 mx-auto mb-6" />
            <p className="text-2xl text-gray-600 mb-6">Your cart is empty</p>
            <p className="text-gray-500 mb-8">Add some delicious items from our menu!</p>
            <button
              onClick={() => navigate('/menu')}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-8 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-6">
                    <div className="text-3xl">{item.image}</div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-orange-600 font-bold text-lg">${item.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 rounded-full bg-white hover:bg-gray-200 transition-colors shadow-sm"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 rounded-full bg-white hover:bg-gray-200 transition-colors shadow-sm"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xl font-bold text-gray-900 w-24 text-right">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex justify-between items-center text-3xl font-bold text-gray-900 mb-8">
                <span>Total: ${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => navigate('/menu')}
                  className="w-full bg-gray-200 text-gray-800 py-4 px-8 rounded-lg text-xl font-semibold hover:bg-gray-300 transition-all duration-300"
                >
                  Continue Shopping
                </button>
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-8 rounded-lg text-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// About Page Component
const AboutPage = () => {
  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-5xl font-bold text-center text-gray-900 mb-16">About Bella Vista</h1>
        <div className="bg-white rounded-xl shadow-md p-12">
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Welcome to Bella Vista, where passion meets culinary excellence. For over 20 years, we have been 
              serving authentic Italian cuisine crafted with love and the finest ingredients sourced directly from Italy.
            </p>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Our chef-driven menu features traditional recipes passed down through generations, complemented 
              by modern techniques and seasonal ingredients sourced from local farms. Every dish tells a story 
              of heritage, tradition, and innovation.
            </p>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Whether you're dining in our restaurant or ordering for delivery, we're committed to providing 
              an unforgettable culinary experience that brings the authentic taste of Italy to your table.
            </p>
            <div className="text-center mt-12">
              <p className="text-orange-600 font-semibold text-xl italic">
                "La famiglia è tutto" - Family is everything
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Contact Page Component
const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would typically send the form data to your backend
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-5xl font-bold text-center text-gray-900 mb-16">Contact Us</h1>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-white rounded-xl shadow-md p-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">Get in Touch</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <MapPin className="h-6 w-6 text-orange-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Address</h3>
                  <p className="text-gray-700">123 Gourmet Street<br/>Food District, Culinary Quarter</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Phone className="h-6 w-6 text-orange-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Phone</h3>
                  <p className="text-gray-700">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Clock className="h-6 w-6 text-orange-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Hours</h3>
                  <div className="text-gray-700 space-y-1">
                    <p>Monday - Thursday: 11:00 AM - 10:00 PM</p>
                    <p>Friday - Saturday: 11:00 AM - 11:00 PM</p>
                    <p>Sunday: 12:00 PM - 9:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};


// Enhanced CheckoutPage Component - Replace your current checkout in App.js

// const CheckoutPage = () => {
//   const { cartItems, getTotalPrice, clearCart, showNotification } = useRestaurant();
  
//    const { isAuthenticated, user, loading: authLoading } = useAuth();
//   const navigate = useNavigate();

//    // Form state
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     address: '',
//     city: '',
//     postalCode: '',
//     deliveryInstructions: '',
//     paymentMethod: 'paystack',
//     deliveryTime: 'asap',
//     scheduledTime: '',
//     notes: ''
//   });

//   // UI State
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [orderSuccess, setOrderSuccess] = useState(false);
//   const [orderId, setOrderId] = useState(null);

//   // ADD THIS AUTHENTICATION CHECK
//   useEffect(() => {
//     if (!authLoading && !isAuthenticated) {
//       showNotification('Please login to proceed with checkout', 'error');
//       navigate('/login', { state: { from: { pathname: '/checkout' } } });
//     }
//   }, [isAuthenticated, loading, navigate, showNotification]);

//     // Add this useEffect instead:
// useEffect(() => {
//   if (cartItems.length === 0 && !orderSuccess) {
//     navigate('/cart');
//   }
// }, [cartItems, orderSuccess, navigate]);



//   // ADD THIS AUTH CHECK
//   if (!isAuthenticated) {
//     return (
//       <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
//       </div>
//     );
//   }


//   // ADD THIS LOADING CHECK
//   if (loading) {
//     return (
//       <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
//       </div>
//     );
//   }

//     if (!isAuthenticated) {
//     return null; // Will redirect via useEffect above
//   }


  
//   // // Form state
//   // const [formData, setFormData] = useState({
//   //   firstName: '',
//   //   lastName: '',
//   //   email: '',
//   //   phone: '',
//   //   address: '',
//   //   city: '',
//   //   postalCode: '',
//   //   deliveryInstructions: '',
//   //   paymentMethod: 'paystack',
//   //   deliveryTime: 'asap',
//   //   scheduledTime: '',
//   //   notes: ''
//   // });

//   // // UI State
//   // const [errors, setErrors] = useState({});
//   // const [loading, setLoading] = useState(false);
//   // const [orderSuccess, setOrderSuccess] = useState(false);
//   // const [orderId, setOrderId] = useState(null);

//   // Redirect if cart is empty
//   // if (cartItems.length === 0 && !orderSuccess) {
//   //   navigate('/cart');
//   //   return null;
//   // }


// // Add this early return:
// if (cartItems.length === 0 && !orderSuccess) {
//   return null;
// }

//   // Form validation
//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
//     if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
//     if (!formData.email.trim()) newErrors.email = 'Email is required';
//     if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
//     if (!formData.address.trim()) newErrors.address = 'Delivery address is required';
//     if (!formData.city.trim()) newErrors.city = 'City is required';

//     // Email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (formData.email && !emailRegex.test(formData.email)) {
//       newErrors.email = 'Please enter a valid email address';
//     }

//     // Phone validation  
//     if (formData.phone && formData.phone.length < 10) {
//       newErrors.phone = 'Please enter a valid phone number';
//     }

//     // Scheduled time validation
//     if (formData.deliveryTime === 'schedule' && !formData.scheduledTime) {
//       newErrors.scheduledTime = 'Please select a scheduled time';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // Handle form input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));

//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//   };

//   // Calculate totals
//   const subtotal = getTotalPrice();
//   const deliveryFee = subtotal > 50 ? 0 : 5.99;
//   const tax = subtotal * 0.08;
//   const total = subtotal + deliveryFee + tax;

//   // Handle order submission
//   const handlePlaceOrder = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       console.log('Form validation failed:', errors);
//       showNotification('Please fill in all required fields', 'error');
//       return;
//     }
//     console.log('Form validation passed, submitting order...');

//     setLoading(true);

//     try {
//       // Prepare order data
//       // const orderData = {
//       //   customer: {
//       //     firstName: formData.firstName,
//       //     lastName: formData.lastName,
//       //     email: formData.email,
//       //     phone: formData.phone
//       //   },
//       //   delivery: {
//       //     address: formData.address,
//       //     city: formData.city,
//       //     postalCode: formData.postalCode,
//       //     instructions: formData.deliveryInstructions,
//       //     time: formData.deliveryTime,
//       //     scheduledTime: formData.scheduledTime
//       //   },
//       //   items: cartItems.map(item => ({
//       //     menuItem: item.id,
//       //     name: item.name,
//       //     price: item.price,
//       //     quantity: item.quantity
//       //   })),
//       //   pricing: {
//       //     subtotal: subtotal,
//       //     deliveryFee: deliveryFee,
//       //     tax: tax,
//       //     total: total
//       //   },
//       //   paymentMethod: formData.paymentMethod,
//       //   notes: formData.notes,
//       //   status: 'pending'
//       // };

//       // Prepare order data in the format your backend expects
//     const orderData = {
//       items: cartItems.map(item => ({
//         menuItem: item.id,
//         name: item.name,
//         price: item.price,
//         quantity: item.quantity
//       })),
//       customerInfo: {
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         email: formData.email,
//         phone: formData.phone,
//         address: formData.address,
//         city: formData.city,
//         postalCode: formData.postalCode,
//         deliveryInstructions: formData.deliveryInstructions,
//         notes: formData.notes
//       },
//       totalAmount: total,
//       paymentMethod: formData.paymentMethod,
//       // Add paymentIntentId if using Stripe, or leave empty for cash
//       paymentIntentId: formData.paymentMethod === 'cash' ? null : undefined
//     };

//     console.log('Sending order data:', orderData); // Debug log


//       // Submit order to backend
//       const response = await axios.post(`${process.env.REACT_APP_API_URL}/orders`, orderData);
//        console.log('Full response:', response);
//     console.log('Response status:', response.status);
//     console.log('Response data:', response.data);
//     console.log('Response data keys:', Object.keys(response.data));

//       // if (response.data.success) {
//       //   const newOrderId = response.data.data._id;
//       //   setOrderId(newOrderId);

//          // CHECK MULTIPLE RESPONSE FORMATS
//     if (response.data.success || response.data.order || response.data.message) {
//       const newOrderId = response.data.order?._id || response.data.data?._id;
//       console.log('Order ID found:', newOrderId);
//       setOrderId(newOrderId);
        
//         // Handle payment processing
//         if (formData.paymentMethod === 'paystack') {
//           await processPaystackPayment(newOrderId);
//         } else if (formData.paymentMethod === 'cash') {
//           console.log('Processing cash payment...');
//           // Cash on delivery - order is complete
//           setOrderSuccess(true);
//           clearCart();
//           showNotification('Order placed successfully!', 'success');
//         }
//       } else {console.log('Unexpected response format - full response:', response.data);
//       showNotification('Order may have been created but response format is unexpected', 'warning');
//       }
//     } catch (error) {
//       console.error('Order submission error:', error);
//       console.error('Full error:', error);
//     console.error('Error response:', error.response);
//     console.error('Error status:', error.response?.status);
//     console.error('Error data:', error.response?.data);
//       showNotification(
//         error.response?.data?.message || 'Failed to place order. Please try again.',
//         'error'
//       );
//     } finally {
//        console.log('Setting loading to false');
//       setLoading(false);
//     }
//   };

//   // Process Paystack payment
//   const processPaystackPayment = async (orderId) => {
//     try {
//       // Initialize payment with backend
//       const response = await axios.post(`${process.env.REACT_APP_API_URL}/payment/initialize`, {
//         orderId: orderId
//       });

//       if (response.data.success) {
//         const { authorization_url } = response.data.data;
        
//         // Redirect to Paystack payment page
//         window.location.href = authorization_url;
//       } else {
//         throw new Error('Payment initialization failed');
//       }
      
//     } catch (error) {
//       console.error('Payment processing error:', error);
//       showNotification('Payment initialization failed. Please try again.', 'error');
//     }
//   };

//   // Success page
//   if (orderSuccess) {
//     return (
//       <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
//           <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
//           <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
//           <p className="text-gray-600 mb-2">Thank you for your order!</p>
//           {orderId && (
//             <p className="text-sm text-gray-500 mb-6">
//               Order ID: <span className="font-mono">{orderId.slice(-8)}</span>
//             </p>
//           )}
//           <div className="space-y-3">
//             <button
//               onClick={() => navigate('/track-order/' + orderId)}
//               className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
//             >
//               Track Your Order
//             </button>
//             <button
//               onClick={() => navigate('/')}
//               className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
//             >
//               Back to Home
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="pt-16 min-h-screen bg-gray-50">
//       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         {/* Header */}
//         <div className="flex items-center mb-8">
//           <button
//             onClick={() => navigate('/cart')}
//             className="mr-4 p-2 text-gray-600 hover:text-orange-600 transition-colors"
//           >
//             <ArrowLeft className="h-6 w-6" />
//           </button>
//           <h1 className="text-4xl font-bold text-gray-900">Checkout</h1>
//         </div>

//         <form onSubmit={handlePlaceOrder}>
//           <div className="grid lg:grid-cols-3 gap-8">
            
//             {/* Left Column - Forms */}
//             <div className="lg:col-span-2 space-y-6">
              
//               {/* Customer Information */}
//               <div className="bg-white rounded-xl shadow-sm p-6">
//                 <h2 className="text-xl font-semibold mb-4 flex items-center">
//                   <User className="h-5 w-5 mr-2 text-orange-600" />
//                   Customer Information
//                 </h2>
//                 <div className="grid md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       First Name *
//                     </label>
//                     <input
//                       type="text"
//                       name="firstName"
//                       value={formData.firstName}
//                       onChange={handleInputChange}
//                       className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
//                         errors.firstName ? 'border-red-500' : 'border-gray-300'
//                       }`}
//                     />
//                     {errors.firstName && (
//                       <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
//                     )}
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Last Name *
//                     </label>
//                     <input
//                       type="text"
//                       name="lastName"
//                       value={formData.lastName}
//                       onChange={handleInputChange}
//                       className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
//                         errors.lastName ? 'border-red-500' : 'border-gray-300'
//                       }`}
//                     />
//                     {errors.lastName && (
//                       <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
//                     )}
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Email *
//                     </label>
//                     <input
//                       type="email"
//                       name="email"
//                       value={formData.email}
//                       onChange={handleInputChange}
//                       className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
//                         errors.email ? 'border-red-500' : 'border-gray-300'
//                       }`}
//                     />
//                     {errors.email && (
//                       <p className="text-red-500 text-sm mt-1">{errors.email}</p>
//                     )}
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Phone Number *
//                     </label>
//                     <input
//                       type="tel"
//                       name="phone"
//                       value={formData.phone}
//                       onChange={handleInputChange}
//                       placeholder="+234 123 456 7890"
//                       className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
//                         errors.phone ? 'border-red-500' : 'border-gray-300'
//                       }`}
//                     />
//                     {errors.phone && (
//                       <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Delivery Information */}
//               <div className="bg-white rounded-xl shadow-sm p-6">
//                 <h2 className="text-xl font-semibold mb-4 flex items-center">
//                   <MapPin className="h-5 w-5 mr-2 text-orange-600" />
//                   Delivery Information
//                 </h2>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Delivery Address *
//                     </label>
//                     <input
//                       type="text"
//                       name="address"
//                       value={formData.address}
//                       onChange={handleInputChange}
//                       placeholder="Street address, building, apartment"
//                       className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
//                         errors.address ? 'border-red-500' : 'border-gray-300'
//                       }`}
//                     />
//                     {errors.address && (
//                       <p className="text-red-500 text-sm mt-1">{errors.address}</p>
//                     )}
//                   </div>
//                   <div className="grid md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         City *
//                       </label>
//                       <input
//                         type="text"
//                         name="city"
//                         value={formData.city}
//                         onChange={handleInputChange}
//                         placeholder="Lagos, Abuja, etc."
//                         className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
//                           errors.city ? 'border-red-500' : 'border-gray-300'
//                         }`}
//                       />
//                       {errors.city && (
//                         <p className="text-red-500 text-sm mt-1">{errors.city}</p>
//                       )}
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Postal Code
//                       </label>
//                       <input
//                         type="text"
//                         name="postalCode"
//                         value={formData.postalCode}
//                         onChange={handleInputChange}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
//                       />
//                     </div>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Delivery Instructions
//                     </label>
//                     <textarea
//                       name="deliveryInstructions"
//                       value={formData.deliveryInstructions}
//                       onChange={handleInputChange}
//                       rows="3"
//                       placeholder="Gate code, building entrance, etc."
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Payment Method */}
//               <div className="bg-white rounded-xl shadow-sm p-6">
//                 <h2 className="text-xl font-semibold mb-4 flex items-center">
//                   <CreditCard className="h-5 w-5 mr-2 text-orange-600" />
//                   Payment Method
//                 </h2>
//                 <div className="space-y-3">
//                   <label className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
//                     <input
//                       type="radio"
//                       name="paymentMethod"
//                       value="paystack"
//                       checked={formData.paymentMethod === 'paystack'}
//                       onChange={handleInputChange}
//                       className="mr-3 text-orange-600"
//                     />
//                     <CreditCard className="h-5 w-5 mr-3 text-gray-600" />
//                     <div>
//                       <span className="font-medium text-gray-700">Pay with Card</span>
//                       <p className="text-sm text-gray-500">Secure payment via Paystack</p>
//                     </div>
//                   </label>
                  
//                   <label className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
//                     <input
//                       type="radio"
//                       name="paymentMethod"
//                       value="cash"
//                       checked={formData.paymentMethod === 'cash'}
//                       onChange={handleInputChange}
//                       className="mr-3 text-orange-600"
//                     />
//                     <MapPin className="h-5 w-5 mr-3 text-gray-600" />
//                     <div>
//                       <span className="font-medium text-gray-700">Cash on Delivery</span>
//                       <p className="text-sm text-gray-500">Pay when order arrives</p>
//                     </div>
//                   </label>
//                 </div>
//               </div>

//               {/* Order Notes */}
//               <div className="bg-white rounded-xl shadow-sm p-6">
//                 <h2 className="text-xl font-semibold mb-4">Order Notes</h2>
//                 <textarea
//                   name="notes"
//                   value={formData.notes}
//                   onChange={handleInputChange}
//                   rows="3"
//                   placeholder="Any special requests or dietary restrictions?"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
//                 />
//               </div>
//             </div>

//             {/* Right Column - Order Summary */}
//             <div className="lg:col-span-1">
//               <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
//                 <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                
//                 {/* Order Items */}
//                 <div className="space-y-4 mb-6">
//                   {cartItems.map(item => (
//                     <div key={item.id} className="flex justify-between items-start">
//                       <div className="flex-1">
//                         <span className="font-medium text-gray-900">{item.name}</span>
//                         <div className="text-sm text-gray-500">
//                           ₦{item.price} x {item.quantity}
//                         </div>
//                       </div>
//                       <span className="font-semibold text-gray-900">
//                         ₦{(item.price * item.quantity).toFixed(2)}
//                       </span>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Pricing Breakdown */}
//                 <div className="border-t border-gray-200 pt-4 space-y-2">
//                   <div className="flex justify-between text-gray-600">
//                     <span>Subtotal</span>
//                     <span>₦{subtotal.toFixed(2)}</span>
//                   </div>
//                   <div className="flex justify-between text-gray-600">
//                     <span>Delivery Fee</span>
//                     <span>{deliveryFee === 0 ? 'FREE' : `₦${deliveryFee.toFixed(2)}`}</span>
//                   </div>
//                   <div className="flex justify-between text-gray-600">
//                     <span>Tax</span>
//                     <span>₦{tax.toFixed(2)}</span>
//                   </div>
//                   <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
//                     <span>Total</span>
//                     <span>₦{total.toFixed(2)}</span>
//                   </div>
//                 </div>

//                 {/* Free Delivery Notice */}
//                 {subtotal < 50 && (
//                   <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
//                     <p className="text-sm text-orange-800">
//                       Add ₦{(50 - subtotal).toFixed(2)} more for free delivery!
//                     </p>
//                   </div>
//                 )}

//                 {/* Place Order Button */}
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
//                 >
//                   {loading ? (
//                     <div className="flex items-center justify-center">
//                       <Loader className="h-5 w-5 animate-spin mr-2" />
//                       Processing...
//                     </div>
//                   ) : (
//                     `Place Order - ₦${total.toFixed(2)}`
//                   )}
//                 </button>

//                 {/* Security Notice */}
//                 <div className="mt-4 flex items-start text-sm text-gray-500">
//                   <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
//                   <span>Your payment information is secure and encrypted via Paystack.</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };


// Checkout Page Component (Placeholder for Phase 3)
// const CheckoutPage = () => {
//   const { cartItems, getTotalPrice, clearCart } = useRestaurant();
//   const navigate = useNavigate();

//   const handlePlaceOrder = () => {
//     // This will be implemented in Phase 3 with payment integration
//     alert('Order placement will be implemented in Phase 3 with payment integration!');
//     clearCart();
//     navigate('/');
//   };

//   if (cartItems.length === 0) {
//     navigate('/cart');
//     return null;
//   }

//   return (
//     <div className="pt-16 min-h-screen bg-gray-50">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <h1 className="text-5xl font-bold text-center text-gray-900 mb-12">Checkout</h1>
        
//         <div className="grid md:grid-cols-2 gap-8">
//           {/* Order Summary */}
//           <div className="bg-white rounded-xl shadow-md p-8">
//             <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
//             <div className="space-y-4">
//               {cartItems.map(item => (
//                 <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200">
//                   <div>
//                     <span className="font-medium">{item.name}</span>
//                     <span className="text-gray-500 ml-2">x{item.quantity}</span>
//                   </div>
//                   <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
//                 </div>
//               ))}
//               <div className="flex justify-between items-center pt-4 text-xl font-bold">
//                 <span>Total:</span>
//                 <span>${getTotalPrice().toFixed(2)}</span>
//               </div>
//             </div>
//           </div>

//           {/* Delivery Information */}
//           <div className="bg-white rounded-xl shadow-md p-8">
//             <h2 className="text-2xl font-semibold mb-6">Delivery Information</h2>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
//                 <input
//                   type="text"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//                   placeholder="Enter your full name"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
//                 <input
//                   type="tel"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//                   placeholder="Enter your phone number"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
//                 <textarea
//                   rows="3"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
//                   placeholder="Enter your complete delivery address"
//                 ></textarea>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
//                 <textarea
//                   rows="2"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
//                   placeholder="Any special instructions for delivery"
//                 ></textarea>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="mt-8 text-center">
//           <button
//             onClick={handlePlaceOrder}
//             className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-12 py-4 rounded-lg text-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
//           >
//             Place Order - ${getTotalPrice().toFixed(2)}
//           </button>
//           <p className="text-gray-500 text-sm mt-4">
//             Payment integration will be added in Phase 3
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

const CheckoutPage = () => {
  const { cartItems, getTotalPrice, clearCart, showNotification } = useRestaurant();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    // Customer Details
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Delivery Details
    address: '',
    city: '',
    postalCode: '',
    deliveryInstructions: '',
    
    // Order Details
    paymentMethod: 'card',
    deliveryTime: 'asap',
    scheduledTime: '',
    
    // Additional
    notes: ''
  });

  // UI State
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Redirect if cart is empty
  if (cartItems.length === 0 && !orderSuccess) {
    navigate('/cart');
    return null;
  }

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Delivery address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Scheduled time validation
    if (formData.deliveryTime === 'schedule' && !formData.scheduledTime) {
      newErrors.scheduledTime = 'Please select a scheduled time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Calculate totals
  const subtotal = getTotalPrice();
  const deliveryFee = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + deliveryFee + tax;

  // Handle order submission
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);

    try {
      // Prepare order data
      const orderData = {
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        },
        delivery: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          instructions: formData.deliveryInstructions,
          time: formData.deliveryTime,
          scheduledTime: formData.scheduledTime
        },
        items: cartItems.map(item => ({
          menuItem: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        pricing: {
          subtotal: subtotal,
          deliveryFee: deliveryFee,
          tax: tax,
          total: total
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        status: 'pending'
      };

      // Submit order to backend
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/orders`, orderData);

      if (response.data.success) {
        const newOrderId = response.data.data._id;
        setOrderId(newOrderId);
        
        // Handle payment processing
        if (formData.paymentMethod === 'card' || formData.paymentMethod === 'paystack') {
          await processPayment(newOrderId, total);
        } else {
          // Cash on delivery - order is complete
          setOrderSuccess(true);
          clearCart();
          showNotification('Order placed successfully!', 'success');
        }
      }
    } catch (error) {
      console.error('Order submission error:', error);
      showNotification(
        error.response?.data?.message || 'Failed to place order. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Process payment (placeholder for Stripe/Paystack integration)
  const processPayment = async (orderId, amount) => {
    try {
      // This is where you'd integrate with Stripe, Paystack, etc.
      // For now, we'll simulate a successful payment
      
      if (formData.paymentMethod === 'paystack') {
        // Paystack integration would go here
        await simulatePaystackPayment(orderId, amount);
      } else {
        // Stripe integration would go here
        await simulateStripePayment(orderId, amount);
      }
      
      setOrderSuccess(true);
      clearCart();
      showNotification('Payment successful! Order confirmed.', 'success');
      
    } catch (error) {
      console.error('Payment processing error:', error);
      showNotification('Payment failed. Please try again.', 'error');
    }
  };

  // Simulate payment processing (replace with real payment integration)
  const simulatePaystackPayment = async (orderId, amount) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate random success/failure for demo
    if (Math.random() > 0.1) { // 90% success rate
      return { success: true, transactionId: 'TXN_' + Date.now() };
    } else {
      throw new Error('Payment declined');
    }
  };

  const simulateStripePayment = async (orderId, amount) => {
    // Similar simulation for Stripe
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (Math.random() > 0.1) {
      return { success: true, transactionId: 'STRIPE_' + Date.now() };
    } else {
      throw new Error('Card declined');
    }
  };

  // Success page
  if (orderSuccess) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
          <p className="text-gray-600 mb-2">Thank you for your order!</p>
          {orderId && (
            <p className="text-sm text-gray-500 mb-6">
              Order ID: <span className="font-mono">{orderId.slice(-8)}</span>
            </p>
          )}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/orders')} // Will be implemented in Phase 5
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Track Your Order
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="mr-4 p-2 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Checkout</h1>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Customer Information */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-orange-600" />
                  Customer Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-orange-600" />
                  Delivery Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street address, building, apartment"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                          errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Instructions
                    </label>
                    <textarea
                      name="deliveryInstructions"
                      value={formData.deliveryInstructions}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Gate code, building entrance, etc."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Time */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-orange-600" />
                  Delivery Time
                </h2>
                <div className="space-y-3">
                  {DELIVERY_TIMES.map((time) => (
                    <label key={time.value} className="flex items-center">
                      <input
                        type="radio"
                        name="deliveryTime"
                        value={time.value}
                        checked={formData.deliveryTime === time.value}
                        onChange={handleInputChange}
                        className="mr-3 text-orange-600"
                      />
                      <span className="text-gray-700">{time.label}</span>
                    </label>
                  ))}
                  
                  {formData.deliveryTime === 'schedule' && (
                    <div className="ml-6 mt-3">
                      <input
                        type="datetime-local"
                        name="scheduledTime"
                        value={formData.scheduledTime}
                        onChange={handleInputChange}
                        min={new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                        className={`px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                          errors.scheduledTime ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.scheduledTime && (
                        <p className="text-red-500 text-sm mt-1">{errors.scheduledTime}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-orange-600" />
                  Payment Method
                </h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => {
                    const IconComponent = method.icon;
                    return (
                      <label key={method.id} className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={formData.paymentMethod === method.id}
                          onChange={handleInputChange}
                          className="mr-3 text-orange-600"
                        />
                        <IconComponent className="h-5 w-5 mr-3 text-gray-600" />
                        <span className="font-medium text-gray-700">{method.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Order Notes</h2>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Any special requests or dietary restrictions?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
                />
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                
                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{item.name}</span>
                        <div className="text-sm text-gray-500">
                          ${item.price} x {item.quantity}
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing Breakdown */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Free Delivery Notice */}
                {subtotal < 50 && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      Add ${(50 - subtotal).toFixed(2)} more for free delivery!
                    </p>
                  </div>
                )}

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <Loader className="h-5 w-5 animate-spin mr-2" />
                      Processing...
                    </div>
                  ) : (
                    `Place Order - $${total.toFixed(2)}`
                  )}
                </button>

                {/* Security Notice */}
                <div className="mt-4 flex items-start text-sm text-gray-500">
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Your payment information is secure and encrypted.</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};





// 404 Not Found Page
const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

// Payment Callback Component - Add this to your App.js

const PaymentCallbackPage = () => {
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const navigate = useNavigate();
  const { clearCart } = useRestaurant();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const reference = urlParams.get('reference');
        
        if (!reference) {
          setPaymentStatus('error');
          setLoading(false);
          return;
        }

        // Verify payment with backend
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/payment/verify/${reference}`
        );

        if (response.data.success) {
          setPaymentStatus('success');
          setOrderData(response.data.data.order);
          clearCart();
        } else {
          setPaymentStatus('failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setPaymentStatus('error');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [clearCart]);

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-16 w-16 text-orange-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success' && orderData) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-4">Your order has been confirmed and payment received.</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-mono font-semibold">{orderData.orderNumber}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Total Paid:</span>
              <span className="font-semibold text-green-600">₦{orderData.pricing.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold text-orange-600 capitalize">
                {orderData.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/track-order/' + orderData._id)}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Track Your Order
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Payment failed or error
  return (
    <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
        <X className="h-20 w-20 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {paymentStatus === 'failed' ? 'Payment Failed' : 'Payment Error'}
        </h1>
        <p className="text-gray-600 mb-6">
          {paymentStatus === 'failed' 
            ? 'Your payment could not be processed. Please try again.'
            : 'There was an error verifying your payment. Please contact support.'
          }
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};





// Order Tracking Component - Add this to your App.js

const OrderTrackingPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/orders/${id}`);
        if (response.data.success) {
          setOrder(response.data.data);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        setError('Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  // Status step configuration
  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { key: 'preparing', label: 'Preparing', icon: UtensilsCrossed },
    { key: 'ready', label: 'Ready', icon: Package },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle }
  ];

  const getStatusIndex = (status) => {
    return statusSteps.findIndex(step => step.key === status);
  };

  const getStatusColor = (stepIndex, currentIndex) => {
    if (stepIndex <= currentIndex) return 'text-green-600 bg-green-100';
    return 'text-gray-400 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-16 w-16 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Order #{order.orderNumber}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Order Progress */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-6">Order Progress</h2>
              
              <div className="space-y-4">
                {statusSteps.map((step, index) => {
                  const IconComponent = step.icon;
                  const isCompleted = index <= currentStatusIndex;
                  const isActive = index === currentStatusIndex;
                  
                  return (
                    <div key={step.key} className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                        isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${
                          isCompleted ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {step.label}
                        </p>
                        {isActive && (
                          <p className="text-sm text-orange-600">Current status</p>
                        )}
                      </div>
                      {index < statusSteps.length - 1 && (
                        <div className={`w-px h-8 ml-5 ${
                          isCompleted ? 'bg-green-200' : 'bg-gray-200'
                        }`}></div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Status History */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Status History</h3>
                  <div className="space-y-3">
                    {order.statusHistory.slice().reverse().map((history, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="capitalize font-medium">
                          {history.status.replace('_', ' ')}
                        </span>
                        <span className="text-gray-500">
                          {new Date(history.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">₦{item.price} each</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">x{item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₦{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₦{order.pricing.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>₦{order.pricing.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>₦{order.pricing.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>₦{order.pricing.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentStatus.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="capitalize">{order.paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Details</h2>
              
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 text-sm">Customer</span>
                  <p className="font-medium">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                </div>
                
                <div>
                  <span className="text-gray-600 text-sm">Phone</span>
                  <p className="font-medium">{order.customer.phone}</p>
                </div>
                
                <div>
                  <span className="text-gray-600 text-sm">Address</span>
                  <p className="font-medium">
                    {order.delivery.address}, {order.delivery.city}
                    {order.delivery.postalCode && `, ${order.delivery.postalCode}`}
                  </p>
                </div>

                {order.delivery.instructions && (
                  <div>
                    <span className="text-gray-600 text-sm">Instructions</span>
                    <p className="font-medium">{order.delivery.instructions}</p>
                  </div>
                )}

                {order.estimatedDeliveryTime && (
                  <div>
                    <span className="text-gray-600 text-sm">Estimated Delivery</span>
                    <p className="font-medium">
                      {new Date(order.estimatedDeliveryTime).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <RestaurantProvider>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route
                path="/payment/callback"
                element={<PaymentCallbackPage />}
              />
              <Route path="/track-order/:id" element={<OrderTrackingPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>

            {/* Custom CSS for animations */}
            <style jsx>{`
              @keyframes float {
                0%,
                100% {
                  transform: translateY(0px);
                }
                50% {
                  transform: translateY(-20px);
                }
              }
              @keyframes float-delayed {
                0%,
                100% {
                  transform: translateY(0px);
                }
                50% {
                  transform: translateY(-15px);
                }
              }
              @keyframes fade-in {
                from {
                  opacity: 0;
                  transform: translateY(30px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              .animate-float {
                animation: float 6s ease-in-out infinite;
              }
              .animate-float-delayed {
                animation: float-delayed 8s ease-in-out infinite;
              }
              .animate-fade-in {
                animation: fade-in 1s ease-out;
              }
              .line-clamp-2 {
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
              }
            `}</style>
          </div>
        </RestaurantProvider>
      </AuthProvider>
    </Router>
  );
};

export default App; 