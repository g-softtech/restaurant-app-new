// components/orders/OrderHistory.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Eye,
  Loader,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      preparing: Package,
      ready: Package,
      out_for_delivery: Truck,
      delivered: CheckCircle,
      cancelled: XCircle
    };
    return icons[status] || Clock;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-purple-100 text-purple-800',
      out_for_delivery: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-16 w-16 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error Loading Orders</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchOrders}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center text-gray-600 hover:text-orange-600 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Profile
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Order History</h1>
          <p className="text-gray-600">View all your past orders and track current deliveries</p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start exploring our menu!</p>
            <button
              onClick={() => navigate('/menu')}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const StatusIcon = getStatusIcon(order.status);
              const statusColor = getStatusColor(order.status);
              
              return (
                <div key={order._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <p className="text-lg font-bold text-gray-900 mt-2">
                          ${order.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Order Items Summary */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {order.items.slice(0, 3).map((item, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">
                            {item.quantity}x {item.name}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="mb-4 text-sm text-gray-600">
                      <p>Deliver to: {order.customerInfo.address}, {order.customerInfo.city}</p>
                      {order.assignedRider && (
                        <p className="mt-1">Rider: {order.assignedRider.name} - {order.assignedRider.phone}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/track-order/${order._id}`)}
                        className="flex-1 flex items-center justify-center gap-2 bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        Track Order
                      </button>
                      
                      {order.status === 'delivered' && (
                        <button
                          onClick={() => {
                            // Reorder functionality - copy items to cart
                            navigate('/menu');
                          }}
                          className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                          Reorder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;