// components/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import axios from 'axios';
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  Truck,
  Star,
  Loader,
  AlertCircle,
  LogOut,
  MoreVertical,
  Calendar,
  Phone,
  MapPin,
  Mail,
  Bell
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const AdminDashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data state
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeMenuItems: 0,
    pendingOrders: 0
  });
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Form state for menu items
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Pizza',
    image: '🍕',
    availability: true
  });

// Socket.IO integration
const { connected, newOrderNotification, orderUpdate, clearNewOrderNotification } = useSocket();
const [showNotificationBadge, setShowNotificationBadge] = useState(false);
const [notificationCount, setNotificationCount] = useState(0);

// Set axios default headers
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Axios token configured');
  }
}, []);

// Check admin authentication

  // Check admin authentication
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  // Handle new order notifications
  useEffect(() => {
    if (newOrderNotification) {
      console.log('New order notification in admin:', newOrderNotification);
      
      // Show notification badge
      setShowNotificationBadge(true);
      setNotificationCount(prev => prev + 1);
      
      // Refresh orders list
      fetchOrders();
      fetchStats();
      
      // Play sound and show alert
      playNotificationSound();
      showNewOrderAlert(newOrderNotification);
      
      // Clear after 5 seconds
      setTimeout(() => {
        clearNewOrderNotification();
      }, 5000);
    }
  }, [newOrderNotification, clearNewOrderNotification]);

  // Handle order status updates
  useEffect(() => {
    if (orderUpdate) {
      console.log('Order update in admin:', orderUpdate);
      
      // Update the order in the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderUpdate._id 
            ? { ...order, status: orderUpdate.status, statusHistory: orderUpdate.statusHistory }
            : order
        )
      );
    }
  }, [orderUpdate]);


  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchOrders(),
        fetchMenuItems(),
        fetchStats()
      ]);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data.success) {
        const sortedOrders = response.data.orders.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
      }
    } catch (err) {
      console.error('Orders fetch error:', err);
      // Use sample data if API fails
      setOrders([
        {
          _id: '1',
          customerInfo: { firstName: 'John', lastName: 'Doe', phone: '+1234567890', email: 'john@example.com' },
          items: [{ name: 'Margherita Pizza', quantity: 2, price: 12.99 }],
          totalAmount: 25.98,
          status: 'pending',
          createdAt: new Date().toISOString(),
          paymentMethod: 'card'
        }
      ]);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/menu`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data.success) {
        setMenuItems(response.data.menuItems || response.data.data);
      }
    } catch (err) {
      console.error('Menu items fetch error:', err);
      // Use sample data if API fails
      setMenuItems([
        { 
          _id: '1', 
          name: 'Margherita Pizza', 
          price: 12.99, 
          category: 'Pizza', 
          availability: true,
          description: 'Fresh tomatoes, mozzarella, basil',
          image: '🍕'
        },
        { 
          _id: '2', 
          name: 'Caesar Salad', 
          price: 8.99, 
          category: 'Salads', 
          availability: true,
          description: 'Crisp romaine, parmesan, croutons',
          image: '🥗'
        }
      ]);
    }
  };

  

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
      // Calculate stats from available data
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const activeMenuItems = menuItems.filter(item => item.availability).length;
      
      setStats({
        totalOrders: orders.length,
        totalRevenue,
        activeMenuItems,
        pendingOrders
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    logout();
    navigate('/admin/login');
  };

  // Order management functions
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      alert(`Order updated to ${newStatus}`);
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update order status');
    }
  };

  // Menu management functions
  const handleAddItem = async () => {
    if (!itemForm.name || !itemForm.price) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const itemData = {
        ...itemForm,
        price: parseFloat(itemForm.price)
      };

      if (editingItem) {
        await axios.put(`${API_BASE_URL}/menu/${editingItem._id}`, itemData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        setMenuItems(prev => prev.map(item => 
          item._id === editingItem._id ? { ...item, ...itemData } : item
        ));
      } else {
        const response = await axios.post(`${API_BASE_URL}/menu`, itemData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.data.success) {
          setMenuItems(prev => [...prev, response.data.data]);
        }
      }
      
      // Reset form
      setItemForm({
        name: '',
        description: '',
        price: '',
        category: 'Pizza',
        image: '🍕',
        availability: true
      });
      setEditingItem(null);
      setShowAddModal(false);
      
    } catch (err) {
      console.error('Menu item save error:', err);
      alert('Failed to save menu item');
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category,
      image: item.image || '🍕',
      availability: item.availability
    });
    setShowAddModal(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/menu/${itemId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setMenuItems(prev => prev.filter(item => item._id !== itemId));
    } catch (err) {
      console.error('Delete item error:', err);
      alert('Failed to delete menu item');
    }
  };

  // Utility functions
  const getStatusColor = (status) => {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
      'preparing': 'bg-orange-100 text-orange-800 border-orange-200',
      'ready': 'bg-purple-100 text-purple-800 border-purple-200',
      'out_for_delivery': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'delivered': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      'pending': Clock,
      'confirmed': CheckCircle,
      'preparing': Package,
      'ready': Package,
      'out_for_delivery': Truck,
      'delivered': CheckCircle,
      'cancelled': XCircle
    };
    const IconComponent = statusIcons[status] || Clock;
    return <IconComponent size={14} />;
  };

   const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (err) {
      console.log('Notification sound not available');
    }
  };

  const showNewOrderAlert = (orderData) => {
    // Create floating notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg shadow-2xl z-50 animate-slide-in max-w-sm';
    notification.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm font-bold">🆕 New Order Received!</p>
          <p class="text-xs mt-1">Order #${orderData.orderNumber}</p>
          <p class="text-xs">$${orderData.totalAmount.toFixed(2)} • ${orderData.items.length} items</p>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  };

  const clearNotificationBadge = () => {
    setShowNotificationBadge(false);
    setNotificationCount(0);
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerInfo?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customerInfo?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-16 w-16 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
       {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Bella Vista Restaurant Management</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Real-time Connection Status */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                {connected ? 'Live' : 'Offline'}
              </div>

              {/* Notification Bell */}
              <button
                onClick={clearNotificationBadge}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Bell className={`h-5 w-5 ${showNotificationBadge ? 'text-orange-600 animate-bounce' : 'text-gray-600'}`} />
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {notificationCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate('/')}
                className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
              >
                View Restaurant
              </button>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-8 px-4">
            <div className="space-y-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
                { id: 'orders', label: 'Order Management', icon: ShoppingBag },
                { id: 'menu', label: 'Menu Management', icon: Package },
                { id: 'analytics', label: 'Analytics', icon: DollarSign }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon size={20} className="mr-3" />
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          {/* Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Dashboard Overview</h2>
              
              {/* Stats Cards */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="text-blue-600" size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="text-green-600" size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Active Items</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeMenuItems}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Package className="text-purple-600" size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Pending Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="text-orange-600" size={24} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold">Recent Orders</h3>
                </div>
                <div className="divide-y">
                  {orders.slice(0, 5).map(order => (
                    <div key={order._id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {order.customerInfo?.firstName} {order.customerInfo?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.items?.length} items • ${order.totalAmount?.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {order.status?.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Orders Management */}
          {activeTab === 'orders' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Order Management</h2>
                <div className="flex gap-4">
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredOrders.map(order => (
                  <div key={order._id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{'ORD-' + order._id.slice(-8).toUpperCase()}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {order.customerInfo?.firstName} {order.customerInfo?.lastName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone size={14} />
                            {order.customerInfo?.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail size={14} />
                            {order.customerInfo?.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(order.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)} mb-2`}>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            {order.status?.replace('_', ' ').toUpperCase()}
                          </div>
                        </div>
                        <p className="text-lg font-bold">${order.totalAmount?.toFixed(2)}</p>
                        <p className="text-sm text-gray-500 capitalize">{order.paymentMethod}</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Items:</h4>
                      <div className="grid gap-2">
                        {order.items?.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Update Buttons */}
                    <div className="flex gap-2 flex-wrap mb-4">
                      {['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'].map(status => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(order._id, status)}
                          disabled={order.status === status}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            order.status === status
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                          }`}
                        >
                          {status.replace('_', ' ').toUpperCase()}
                        </button>
                      ))}
                    </div>

                    {/* Delivery Address */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <MapPin size={16} />
                        Delivery Address:
                      </h4>
                      <p className="text-sm text-gray-600">
                        {order.customerInfo?.address}
                        {order.customerInfo?.city && `, ${order.customerInfo.city}`}
                        {order.customerInfo?.postalCode && ` ${order.customerInfo.postalCode}`}
                      </p>
                      {order.customerInfo?.deliveryInstructions && (
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Instructions:</strong> {order.customerInfo.deliveryInstructions}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredOrders.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No orders found</p>
                  <p className="text-gray-400 text-sm">Orders will appear here once customers start placing them</p>
                </div>
              )}
            </div>
          )}

          {/* Menu Management */}
          {activeTab === 'menu' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Menu Management</h2>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setItemForm({
                      name: '',
                      description: '',
                      price: '',
                      category: 'Pizza',
                      image: '🍕',
                      availability: true
                    });
                    setShowAddModal(true);
                  }}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Menu Item
                </button>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {menuItems.map(item => (
                  <div key={item._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-4xl mb-2">{item.image}</div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.availability 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.availability ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-2xl font-bold text-orange-500">${item.price}</span>
                        <span className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600">
                          {item.category}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {menuItems.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No menu items found</p>
                  <p className="text-gray-400 text-sm mb-4">Add your first menu item to get started</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Add First Item
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Analytics */}
          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Analytics & Reports</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Revenue Chart Placeholder */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <TrendingUp size={48} className="mx-auto mb-2" />
                      <p className="font-medium">Chart Integration</p>
                      <p className="text-sm">Revenue trends will be displayed here</p>
                      <p className="text-xs mt-1">(Requires Chart.js or Recharts)</p>
                    </div>
                  </div>
                </div>

                {/* Top Menu Items */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4">Popular Menu Items</h3>
                  <div className="space-y-4">
                    {menuItems.slice(0, 5).map((item, index) => (
                      <div key={item._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">${item.price}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star size={16} className="text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">4.{Math.floor(Math.random() * 9)}</span>
                          </div>
                          <p className="text-xs text-gray-500">{Math.floor(Math.random() * 50) + 10} orders</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Status Distribution */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4">Order Status Distribution</h3>
                  <div className="space-y-3">
                    {[
                      { status: 'pending', count: orders.filter(o => o.status === 'pending').length, color: 'bg-yellow-400' },
                      { status: 'preparing', count: orders.filter(o => o.status === 'preparing').length, color: 'bg-orange-400' },
                      { status: 'delivered', count: orders.filter(o => o.status === 'delivered').length, color: 'bg-green-400' }
                    ].map(({ status, count, color }) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${color}`}></div>
                          <span className="capitalize font-medium">{status.replace('_', ' ')}</span>
                        </div>
                        <span className="font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4">Quick Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Order Value</span>
                      <span className="font-bold text-green-600">
                        ${orders.length > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Menu Items</span>
                      <span className="font-bold">{menuItems.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Available Items</span>
                      <span className="font-bold text-green-600">{stats.activeMenuItems}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Completion Rate</span>
                      <span className="font-bold text-blue-600">
                        {orders.length > 0 ? 
                          Math.round((orders.filter(o => o.status === 'delivered').length / orders.length) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Menu Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter item name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Describe the item..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={itemForm.price}
                    onChange={(e) => setItemForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="Pizza">Pizza</option>
                    <option value="Burgers">Burgers</option>
                    <option value="Pasta">Pasta</option>
                    <option value="Salads">Salads</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Appetizers">Appetizers</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emoji/Image</label>
                <input
                  type="text"
                  value={itemForm.image}
                  onChange={(e) => setItemForm(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="🍕 (emoji or image URL)"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="availability"
                  checked={itemForm.availability}
                  onChange={(e) => setItemForm(prev => ({ ...prev, availability: e.target.checked }))}
                  className="mr-3 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="availability" className="text-sm font-medium text-gray-700">
                  Available for ordering
                </label>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                  setItemForm({
                    name: '',
                    description: '',
                    price: '',
                    category: 'Pizza',
                    image: '🍕',
                    availability: true
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                {editingItem ? 'Update' : 'Add'} Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;