// // routes/payment.js
// const express = require('express');
// const router = express.Router();
// const paymentController = require('../controllers/paymentController');

// // @route   POST /api/payment/initialize
// // @desc    Initialize payment with Paystack
// // @access  Public
// router.post('/initialize', paymentController.initializePayment);

// // @route   GET /api/payment/verify/:reference
// // @desc    Verify payment status
// // @access  Public
// router.get('/verify/:reference', paymentController.verifyPayment);

// // @route   POST /api/payment/webhook
// // @desc    Handle Paystack webhooks
// // @access  Public (but secured with signature verification)
// router.post('/webhook', paymentController.handleWebhook);

// // @route   GET /api/payment/status/:orderId
// // @desc    Get payment status for an order
// // @access  Public
// router.get('/status/:orderId', paymentController.getPaymentStatus);

// module.exports = router;


// // routes/payments.js (or routes/payment.js)
// const express = require('express');
// const router = express.Router();

// // Temporary basic routes until we create the payment controller
// router.post('/initialize', (req, res) => {
//   res.json({ success: true, message: 'Payment initialization endpoint - coming soon' });
// });

// router.get('/verify/:reference', (req, res) => {
//   res.json({ success: true, message: 'Payment verification endpoint - coming soon' });
// });

// module.exports = router;

// routes/payments.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/initialize', paymentController.initializePayment);
router.get('/verify/:reference', paymentController.verifyPayment);

module.exports = router;