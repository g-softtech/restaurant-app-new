// Create routes/payment.js
require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const axios = require('axios');
const Order = require('../models/Order');
const router = express.Router();

// Paystack secret key (add to your .env file)
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Initialize payment
router.post('/initialize', async (req, res) => {
    console.log('Payment initialize request received:', req.body);
  try {
    const { orderId } = req.body;
    
    // Get order from database
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Paystack expects amount in kobo (multiply by 100)
    const amountInKobo = Math.round(order.totalAmount * 100);

    // Initialize payment with Paystack
    const paystackData = {
      email: order.customerInfo.email,
      amount: amountInKobo,
      reference: `order_${orderId}_${Date.now()}`,
      callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
      metadata: {
        orderId: orderId,
        customerName: `${order.customerInfo.firstName} ${order.customerInfo.lastName}`,
        phone: order.customerInfo.phone
      }
    };

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      paystackData,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status) {
      // Update order with payment reference
      await Order.findByIdAndUpdate(orderId, {
        paymentReference: paystackData.reference,
        paymentStatus: 'pending'
      });

      res.json({
        success: true,
        data: response.data.data,
        message: 'Payment initialized successfully'
      });
    } else {
      throw new Error('Payment initialization failed');
    }

  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Payment initialization failed',
      error: error.message
    });
  }
});

// Verify payment
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    // Verify payment with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );

    if (response.data.status && response.data.data.status === 'success') {
      const orderId = response.data.data.metadata.orderId;
      
      // Update order status
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: 'paid',
          status: 'confirmed',
          paymentData: response.data.data
        },
        { new: true }
      );

      res.json({
        success: true,
        data: {
          order: updatedOrder,
          payment: response.data.data
        },
        message: 'Payment verified successfully'
      });
    } else {
      // Payment failed
      const orderId = response.data.data.metadata?.orderId;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'failed'
        });
      }

      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        data: response.data.data
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

// Paystack webhook (optional - for real-time updates)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash === req.headers['x-paystack-signature']) {
      const event = req.body;
      
      if (event.event === 'charge.success') {
        const orderId = event.data.metadata.orderId;
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'paid',
          status: 'confirmed'
        });
      }
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error');
  }
});

module.exports = router;