//  =============================================================================
// 5. Payment Integration Helper (utils/paymentHelper.js)
// =============================================================================

const axios = require('axios');

// Paystack payment integration
exports.initializePaystackPayment = async (orderData) => {
  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: orderData.customer.email,
        amount: orderData.pricing.total * 100, // Convert to kobo
        currency: 'NGN',
        reference: `order_${orderData._id}`,
        callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
        metadata: {
          orderId: orderData._id,
          customerName: `${orderData.customer.firstName} ${orderData.customer.lastName}`,
          customerPhone: orderData.customer.phone
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      data: response.data.data
    };

  } catch (error) {
    console.error('Paystack initialization error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Payment initialization failed'
    };
  }
};

// Verify Paystack payment
exports.verifyPaystackPayment = async (reference) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    return {
      success: true,
      data: response.data.data
    };

  } catch (error) {
    console.error('Paystack verification error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Payment verification failed'
    };
  }
};

// Stripe payment integration (basic setup)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createStripePaymentIntent = async (orderData) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(orderData.pricing.total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId: orderData._id.toString(),
        customerEmail: orderData.customer.email
      }
    });

    return {
      success: true,
      client_secret: paymentIntent.client_secret
    };

  } catch (error) {
    console.error('Stripe payment intent error:', error);
    return {
      success: false,
      message: error.message
    };
  }
};