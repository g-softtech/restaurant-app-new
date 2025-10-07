// contexts/RestaurantContext.jsx - Enhanced with Socket.IO
import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import { useSocket } from './SocketContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const RestaurantContext = createContext();

const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within RestaurantProvider');
  }
  return context;
};

const RestaurantProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  // Get socket context for real-time updates
  const { orderUpdate, newOrderNotification, clearOrderUpdate, clearNewOrderNotification } = useSocket();

  // Handle real-time order updates
  useEffect(() => {
    if (orderUpdate) {
      console.log('Order update received in RestaurantContext:', orderUpdate);
      // You can add additional logic here if needed
      // For example, updating local order cache
    }
  }, [orderUpdate]);

  // Handle new order notifications (for admin)
  useEffect(() => {
    if (newOrderNotification) {
      console.log('New order notification received:', newOrderNotification);
      showNotification(`New Order! #${newOrderNotification.orderNumber}`, 'success');
      
      // Clear notification after showing
      setTimeout(() => {
        clearNewOrderNotification();
      }, 5000);
    }
  }, [newOrderNotification, clearNewOrderNotification]);

  // Fetch menu items
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/menu`);
      
      if (response.data.success) {
        const transformedItems = response.data.data.map(item => ({
          id: item._id,
          name: item.name,
          price: item.price,
          description: item.description,
          category: item.category.charAt(0).toUpperCase() + item.category.slice(1).replace('-', ' '),
          image: getEmojiForCategory(item.category),
          rating: item.rating?.average || 4.5,
          availability: item.availability || true,
          originalData: item
        }));
        
        setMenuItems(transformedItems);
      } else {
        throw new Error('Failed to fetch menu items');
      }
    } catch (err) {
      console.error('Error fetching menu:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load menu');
      
      // Fallback to sample data
      const sampleMenuItems = [
        {
          id: 'sample-1',
          name: "Margherita Pizza",
          price: 18.99,
          description: "Classic tomato sauce, fresh mozzarella, basil, and olive oil on our house-made dough",
          category: "Main Course",
          image: "🍕",
          rating: 4.8,
          availability: true
        },
        {
          id: 'sample-2',
          name: "Caesar Salad",
          price: 12.99,
          description: "Crisp romaine lettuce, parmesan cheese, croutons, and our signature caesar dressing",
          category: "Appetizer",
          image: "🥗",
          rating: 4.6,
          availability: true
        },
        {
          id: 'sample-3',
          name: "Grilled Salmon",
          price: 26.99,
          description: "Fresh Atlantic salmon with lemon herbs, served with roasted vegetables and wild rice",
          category: "Main Course",
          image: "🐟",
          rating: 4.9,
          availability: true
        },
        {
          id: 'sample-4',
          name: "Tiramisu",
          price: 8.99,
          description: "Traditional Italian dessert with espresso-soaked ladyfingers and mascarpone cream",
          category: "Dessert",
          image: "🍰",
          rating: 4.7,
          availability: true
        }
      ];
      setMenuItems(sampleMenuItems);
    } finally {
      setLoading(false);
    }
  };

  const getEmojiForCategory = (category) => {
    const categoryEmojis = {
      'appetizer': '🥗',
      'main-course': '🍽️',
      'dessert': '🍰',
      'beverages': '🥤',
      'sides': '🍞',
      'specials': '⭐'
    };
    return categoryEmojis[category] || '🍽️';
  };

  // Cart Functions
  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    
    showNotification(`Added ${item.name} to cart!`, 'success');
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Notification function (you can enhance this with a toast library)
  const showNotification = (message, type = 'info') => {
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = `fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in ${
      type === 'success' ? 'bg-green-500' :
      type === 'error' ? 'bg-red-500' :
      type === 'warning' ? 'bg-yellow-500' :
      'bg-blue-500'
    } text-white font-medium`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  // Load menu items on mount
  useEffect(() => {
    fetchMenuItems();
  }, []);

  const value = {
    // State
    cartItems,
    menuItems,
    loading,
    error,
    user,
    // Functions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    fetchMenuItems,
    showNotification,
    setUser,
    // Real-time data
    orderUpdate,
    newOrderNotification
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};

export { RestaurantProvider, useRestaurant };