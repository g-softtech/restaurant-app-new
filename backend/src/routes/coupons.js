// routes/coupons.js
const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { auth, adminAuth } = require('../middleware/auth');

// Public routes
// @route   POST /api/coupons/validate
// @desc    Validate coupon code
// @access  Public
router.post('/validate', couponController.validateCoupon);

// Admin routes
// @route   POST /api/coupons
// @desc    Create new coupon
// @access  Private/Admin
router.post('/', adminAuth, couponController.createCoupon);

// @route   GET /api/coupons
// @desc    Get all coupons
// @access  Private/Admin
router.get('/', adminAuth, couponController.getAllCoupons);

// @route   GET /api/coupons/stats/overview
// @desc    Get coupon statistics
// @access  Private/Admin
router.get('/stats/overview', adminAuth, couponController.getCouponStats);

// @route   GET /api/coupons/:id
// @desc    Get single coupon
// @access  Private/Admin
router.get('/:id', adminAuth, couponController.getCoupon);

// @route   PUT /api/coupons/:id
// @desc    Update coupon
// @access  Private/Admin
router.put('/:id', adminAuth, couponController.updateCoupon);

// @route   DELETE /api/coupons/:id
// @desc    Delete/Deactivate coupon
// @access  Private/Admin
router.delete('/:id', adminAuth, couponController.deleteCoupon);

module.exports = router;