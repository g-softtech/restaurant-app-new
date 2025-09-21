import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create Context for Global State Management
const RestaurantContext = createContext();

// Custom Hook to use Restaurant Context
const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within RestaurantProvider');
  }
  return context;
};

// Context Provider Component
const RestaurantProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // API Functions
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

  // Helper function to get emoji based on category
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
    
    // Show success notification
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

  // Notification function
  const showNotification = (message, type = 'info') => {
    // You can implement a toast notification system here
    console.log(`${type.toUpperCase()}: ${message}`);
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
    setUser
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};
export { RestaurantProvider, useRestaurant };
