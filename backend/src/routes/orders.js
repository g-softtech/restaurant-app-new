


// ============================================
// 5. Update routes/orders.js - Support authenticated users
// ============================================
const express = require('express');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Middleware to optionally authenticate
const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    // If token exists, use auth middleware
    return auth(req, res, next);
  }
  // If no token, continue as guest
  next();
};

// @route   POST /api/orders
// @desc    Create new order
// @access  Public (guest) or Private (authenticated)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { items, customerInfo, totalAmount, paymentMethod, paymentIntentId } = req.body;

    const orderData = {
      items,
      customerInfo,
      totalAmount,
      paymentMethod,
      paymentIntentId,
      status: 'pending'
    };

    // If user is authenticated, link the order
    if (req.user) {
      orderData.customer = req.user._id;
    }

    const order = new Order(orderData);
    await order.save();

    // Populate menu items
    await order.populate('items.menuItem');

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error creating order' });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get user's order history
// @access  Private
router.get('/my-orders', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ customer: req.user._id })
      .populate('items.menuItem')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments({ customer: req.user._id });

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total: totalOrders,
        pages: Math.ceil(totalOrders / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// @route   GET /api/orders/:orderId
// @desc    Get single order
// @access  Public (with order ID) or Private (user's order)
router.get('/:orderId', optionalAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.menuItem');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If user is authenticated, check if they own the order
    if (req.user && order.customer && order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error fetching order' });
  }
});

module.exports = router;