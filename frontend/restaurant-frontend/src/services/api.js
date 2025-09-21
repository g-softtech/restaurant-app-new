// frontend/restaurant-frontend/src/services/api.js
import axios from 'axios';

// API base URL - your backend server
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Menu API functions
export const menuAPI = {
  // Get all menu items
  getAllItems: async () => {
    const response = await api.get('/menu');
    return response.data;
  },

  // Get items by category
  getByCategory: async (category) => {
    const response = await api.get(`/menu/category/${category}`);
    return response.data;
  },

  // Get single item
  getById: async (id) => {
    const response = await api.get(`/menu/${id}`);
    return response.data;
  }
};

// Order API functions (for later)
export const orderAPI = {
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  }
};

export default api;