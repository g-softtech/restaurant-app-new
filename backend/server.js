// server entry point
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');


// Import the orders routes
const orderRoutes = require('./src/routes/orders');

// Add this with your other route imports
const paymentRoutes = require('./src/routes/payments');



// Add this new import ⬇️
const menuRoutes = require('./src/routes/menu');

const authRoutes = require('./src/routes/auth'); 


// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/orders', orderRoutes);

app.use('/api/payment', paymentRoutes);
app.use('/api/auth', require('./src/routes/auth'));


// Add this new route ⬇️
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

// Connect to Database
connectDB();

// server.js - Add this route
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

// Add this to your server.js
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test Route
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Restaurant API Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});



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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

