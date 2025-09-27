// In routes/orders.js - replace with this version that saves to database
const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    console.log('Received order request:', req.body);
    
    // Create the order data for your Order model
    const orderData = {
      customerInfo: req.body.customerInfo,
      items: req.body.items,
      totalAmount: req.body.totalAmount,
      paymentMethod: req.body.paymentMethod,
      status: 'pending'
    };
    
    console.log('Creating order with data:', orderData);
    
    // Save to database
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

// Add the GET route for tracking
router.get('/:orderId', async (req, res) => {
  try {
    console.log('Looking for order:', req.params.orderId);
    
    const order = await Order.findById(req.params.orderId);
    
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
      message: 'Error fetching order'
    });
  }
});

// Add to routes/orders.js
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;