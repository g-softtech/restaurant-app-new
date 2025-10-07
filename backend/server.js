// server.js - Enhanced with Socket.IO
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

// Import routes
const orderRoutes = require('./src/routes/orders');
const paymentRoutes = require('./src/routes/payments');
const menuRoutes = require('./src/routes/menu');
const authRoutes = require('./src/routes/auth');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.IO Configuration
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/auth', authRoutes);

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

connectDB();

// Admin Stats Route
app.get('/api/admin/stats', require('./src/middleware/auth').adminAuth, async (req, res) => {
  try {
    const Order = require('./src/models/Order');
    const MenuItem = require('./src/models/MenuItem');
    
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const activeMenuItems = await MenuItem.countDocuments({ availability: true });
    
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const totalRevenue = revenueResult[0]?.total || 0;
    
    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        activeMenuItems,
        totalRevenue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Health Check Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    socketConnections: io.engine.clientsCount
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Restaurant API Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);
  
  // Join admin room for admin users
  socket.on('join-admin', () => {
    socket.join('admin-room');
    console.log(`👨‍💼 Admin joined: ${socket.id}`);
  });
  
  // Join order tracking room for specific order
  socket.on('track-order', (orderId) => {
    socket.join(`order-${orderId}`);
    console.log(`📦 User tracking order: ${orderId}`);
  });
  
  // Leave order tracking room
  socket.on('leave-order', (orderId) => {
    socket.leave(`order-${orderId}`);
    console.log(`📦 User stopped tracking order: ${orderId}`);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
  
  // Heartbeat for connection monitoring
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });
});

// Helper function to emit real-time updates (can be called from routes)
global.emitOrderUpdate = (orderId, orderData) => {
  // Notify specific order trackers
  io.to(`order-${orderId}`).emit('order-updated', orderData);
  
  // Notify all admins
  io.to('admin-room').emit('order-updated', orderData);
  
  console.log(`📢 Order update emitted for order: ${orderId}`);
};

global.emitNewOrder = (orderData) => {
  // Notify all admins about new order
  io.to('admin-room').emit('new-order', orderData);
  console.log(`🆕 New order notification sent to admins`);
};

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 Socket.IO enabled on port ${PORT}`);
});