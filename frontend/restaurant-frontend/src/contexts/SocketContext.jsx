// contexts/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [newOrderNotification, setNewOrderNotification] = useState(null);
  const [orderUpdate, setOrderUpdate] = useState(null);
  const { user } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    const serverUrl = 'http://localhost:5000';
    
    const socketInstance = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id);
      setConnected(true);
      
      // If user is admin, join admin room
      if (user && user.role === 'admin') {
        socketInstance.emit('join-admin');
        console.log('👨‍💼 Joined admin room');
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });

    // Listen for new orders (admin only)
    socketInstance.on('new-order', (orderData) => {
      console.log('🆕 New order received:', orderData);
      setNewOrderNotification(orderData);
      
      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Order Received!', {
          body: `Order #${orderData.orderNumber} - $${orderData.totalAmount.toFixed(2)}`,
          icon: '/logo192.png'
        });
      }
      
      // Play notification sound (optional)
      playNotificationSound();
    });

    // Listen for order updates
    socketInstance.on('order-updated', (orderData) => {
      console.log('📦 Order updated:', orderData);
      setOrderUpdate(orderData);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const trackOrder = useCallback((orderId) => {
    if (socket && connected) {
      socket.emit('track-order', orderId);
      console.log(`📦 Tracking order: ${orderId}`);
    }
  }, [socket, connected]);

  const stopTrackingOrder = useCallback((orderId) => {
    if (socket && connected) {
      socket.emit('leave-order', orderId);
      console.log(`📦 Stopped tracking order: ${orderId}`);
    }
  }, [socket, connected]);

  const clearNewOrderNotification = useCallback(() => {
    setNewOrderNotification(null);
  }, []);

  const clearOrderUpdate = useCallback(() => {
    setOrderUpdate(null);
  }, []);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (err) {
      console.log('Notification sound not available');
    }
  };

  const value = {
    socket,
    connected,
    newOrderNotification,
    orderUpdate,
    trackOrder,
    stopTrackingOrder,
    clearNewOrderNotification,
    clearOrderUpdate
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};