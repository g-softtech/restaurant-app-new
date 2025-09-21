// controllers/paymentController.js
const Order = require('../models/Order');
const axios = require("axios");

// Initialize payment with Paystack
exports.initializePayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Prepare Paystack request
    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: order.customer.email,
        amount: Math.round(order.pricing.total * 100), // amount in kobo
        reference: `order_${order._id}_${Date.now()}`,
        callback_url: `${process.env.FRONTEND_URL}/payment/callback`
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("Paystack Init Response:", paystackResponse.data);

    res.json({
      success: true,
      data: paystackResponse.data.data
    });

  } catch (error) {
    console.error('Payment initialization error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Payment initialization failed',
      error: error.response?.data || error.message
    });
  }
};

// Verify payment with axios (consistent with initialization)
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    console.log('Verifying payment reference:', reference);

    // Extract order ID from reference
    const orderIdMatch = reference.match(/order_([a-f0-9]{24})_/);
    if (!orderIdMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reference format'
      });
    }
    
    const orderId = orderIdMatch[1];
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify with Paystack using axios
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Paystack verification response:', response.data);

    if (response.data.status && response.data.data.status === 'success') {
      const paystackData = response.data.data;
      
      // Verify amount (convert from kobo to naira)
      const paidAmount = paystackData.amount / 100;
      const orderAmount = order.pricing.total;
      
      if (Math.abs(paidAmount - orderAmount) > 0.01) {
        console.log('Amount mismatch:', { paid: paidAmount, expected: orderAmount });
        return res.status(400).json({
          success: false,
          message: 'Payment amount mismatch'
        });
      }

      // Update order status
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      order.transactionId = reference;
      
      order.statusHistory.push({
        status: 'confirmed',
        timestamp: new Date(),
        notes: 'Payment confirmed via Paystack'
      });

      await order.save();
      console.log('Order updated successfully:', order.orderNumber);

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          order: order,
          payment: paystackData
        }
      });
      
    } else {
      console.log('Payment verification failed:', response.data);
      
      order.paymentStatus = 'failed';
      order.statusHistory.push({
        status: 'payment_failed',
        timestamp: new Date(),
        notes: 'Payment verification failed'
      });
      
      await order.save();
      
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        data: response.data.data
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.response?.data || error.message
    });
  }
};