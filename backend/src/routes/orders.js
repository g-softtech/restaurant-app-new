// routes/orders.js - Enhanced for Phase 6
const express = require('express');
const Order = require('../models/Order');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Public (can be guest or authenticated)
router.post('/', async (req, res) => {
  try {
    console.log('Received order request:', req.body);
    
    const orderData = {
      customerInfo: req.body.customerInfo,
      items: req.body.items,
      totalAmount: req.body.totalAmount,
      paymentMethod: req.body.paymentMethod,
      paymentStatus: req.body.paymentMethod === 'cash' ? 'pending' : 'paid',
      status: 'pending'
    };

    // If user is authenticated, link order to user
    if (req.header('Authorization')) {
      try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-for-development');
        orderData.customer = decoded.userId;
      } catch (err) {
        // If token is invalid, continue as guest order
        console.log('Invalid token, creating guest order');
      }
    }
    
    console.log('Creating order with data:', orderData);
    
    const order = new Order(orderData);
    await order.save();
    
    console.log('Order saved to database:', order._id);
    
    res.json({
      success: true,
      message: 'Order created successfully',
      order: order,
      data: order
    });
    
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// @route   GET /api/orders
// @desc    Get all orders (Admin only)
// @access  Private/Admin
router.get('/', adminAuth, async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get current user's orders
// @access  Private
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Public (for order tracking)
router.get('/:id', async (req, res) => {
  try {
    console.log('Looking for order:', req.params.id);
    
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('statusHistory.updatedBy', 'name');

    if (!order) {
      console.log('Order not found in database');
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    console.log('Order found:', order._id);
    
    res.json({
      success: true,
      data: order
    });
    
  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status, note } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['preparing', 'cancelled'],
      'preparing': ['ready'],
      'ready': ['out_for_delivery'],
      'out_for_delivery': ['delivered'],
      'delivered': [],
      'cancelled': []
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${order.status} to ${status}`
      });
    }

    // Update status using the model method
    await order.updateStatus(status, req.user._id, note);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

// @route   PATCH /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (order.customer && order.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Check if order can be cancelled
    if (!order.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    await order.updateStatus('cancelled', req.user._id, reason || 'Cancelled by user');

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
});

// @route   GET /api/orders/stats/dashboard
// @desc    Get order statistics for dashboard
// @access  Private/Admin
router.get('/stats/dashboard', adminAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await Order.aggregate([
      {
        $facet: {
          totalOrders: [{ $count: 'count' }],
          todayOrders: [
            { $match: { createdAt: { $gte: today } } },
            { $count: 'count' }
          ],
          statusBreakdown: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          totalRevenue: [
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
          ],
          todayRevenue: [
            { 
              $match: { 
                createdAt: { $gte: today },
                paymentStatus: 'paid'
              } 
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalOrders: stats[0].totalOrders[0]?.count || 0,
        todayOrders: stats[0].todayOrders[0]?.count || 0,
        statusBreakdown: stats[0].statusBreakdown,
        totalRevenue: stats[0].totalRevenue[0]?.total || 0,
        todayRevenue: stats[0].todayRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

module.exports = router;