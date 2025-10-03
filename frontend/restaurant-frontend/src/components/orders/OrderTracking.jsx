// components/orders/OrderTracking.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  Phone,
  User,
  AlertCircle,
  Loader,
  ArrowLeft,
  UtensilsCrossed
} from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchOrderDetails, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setOrder(response.data.data);
      }
    } catch (err) {
      console.error('Fetch order error:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    {
      key: 'pending',
      label: 'Order Placed',
      icon: Clock,
      description: 'Your order has been received'
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      icon: CheckCircle,
      description: 'Restaurant confirmed your order'
    },
    {
      key: 'preparing',
      label: 'Preparing',
      icon: UtensilsCrossed,
      description: 'Your food is being prepared'
    },
    {
      key: 'ready',
      label: 'Ready',
      icon: Package,
      description: 'Order is ready for pickup/delivery'
    },
    {
      key: 'out_for_delivery',
      label: 'Out for Delivery',
      icon: Truck,
      description: 'Your order is on the way'
    },
    {
      key: 'delivered',
      label: 'Delivered',
      icon: CheckCircle,
      description: 'Order has been delivered'
    }
  ];

  const getStatusIndex = (status) => {
    return statusSteps.findIndex(step => step.key === status);
  };

  const getCurrentStep = () => {
    if (!order) return 0;
    const index = getStatusIndex(order.status);
    return index >= 0 ? index : 0;
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-16 w-16 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
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
            onClick={() => navigate('/menu')}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const currentStep = getCurrentStep();
  const currentStatus = statusSteps[currentStep];

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-orange-600 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Order #{order.orderNumber}</p>
          <p className="text-sm text-gray-500">
            Placed on {formatTime(order.createdAt)}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Progress */}
          <div className="lg:col-span-2">
            {/* Current Status Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Current Status</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {currentStatus?.label || order.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {currentStatus && (
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                    <currentStatus.icon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">{currentStatus.label}</p>
                    <p className="text-gray-600">{currentStatus.description}</p>
                  </div>
                </div>
              )}

              {order.estimatedDeliveryTime && order.status === 'out_for_delivery' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Estimated delivery: {formatTime(order.estimatedDeliveryTime)}
                  </p>
                </div>
              )}
            </div>

            {/* Progress Timeline */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-6">Order Progress</h2>
              
              <div className="space-y-6">
                {statusSteps.map((step, index) => {
                  const IconComponent = step.icon;
                  const isCompleted = index <= currentStep;
                  const isActive = index === currentStep;

                  return (
                    <div key={step.key} className="relative">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                          isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                            {step.label}
                          </p>
                          <p className={`text-sm ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                            {step.description}
                          </p>
                          {isActive && (
                            <p className="text-sm text-orange-600 font-medium mt-1">Current status</p>
                          )}
                        </div>
                      </div>

                      {index < statusSteps.length - 1 && (
                        <div className={`w-px h-6 ml-5 ${
                          isCompleted ? 'bg-green-200' : 'bg-gray-200'
                        }`}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b last:border-b-0">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">${item.price} each</p>
                    </div>
                    <div className="text-center mx-4">
                      <p className="font-medium">×{item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            {/* Delivery Details */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Details</h2>
              
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 text-sm block">Customer</span>
                  <p className="font-medium">
                    {order.customerInfo.firstName} {order.customerInfo.lastName}
                  </p>
                </div>

                <div>
                  <span className="text-gray-600 text-sm block">Phone</span>
                  <p className="font-medium">{order.customerInfo.phone}</p>
                </div>

                <div>
                  <span className="text-gray-600 text-sm block">Address</span>
                  <p className="font-medium">
                    {order.customerInfo.address}, {order.customerInfo.city}
                    {order.customerInfo.postalCode && `, ${order.customerInfo.postalCode}`}
                  </p>
                </div>

                {order.customerInfo.deliveryInstructions && (
                  <div>
                    <span className="text-gray-600 text-sm block">Instructions</span>
                    <p className="font-medium">{order.customerInfo.deliveryInstructions}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Rider Info (if assigned) */}
            {order.assignedRider && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Delivery Rider</h2>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium">{order.assignedRider.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-2" />
                    <span>{order.assignedRider.phone}</span>
                  </div>
                  {order.assignedRider.vehicleType && (
                    <div className="flex items-center">
                      <Truck className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="capitalize">{order.assignedRider.vehicleType}</span>
                      {order.assignedRider.vehicleNumber && (
                        <span className="ml-2 text-gray-600">({order.assignedRider.vehicleNumber})</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="capitalize font-medium">{order.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              <button
                onClick={fetchOrderDetails}
                className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-medium transition-colors"
              >
                Refresh Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;