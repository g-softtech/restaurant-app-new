// routes/loyalty.js
const express = require('express');
const router = express.Router();
const loyaltyController = require('../controllers/loyaltyController');
const { auth, adminAuth } = require('../middleware/auth');

// Public routes
// @route   GET /api/loyalty/program-info
// @desc    Get loyalty program information
// @access  Public
router.get('/program-info', loyaltyController.getProgramInfo);

// Customer routes (require authentication)
// @route   GET /api/loyalty/my-points
// @desc    Get current user's loyalty points and info
// @access  Private
router.get('/my-points', auth, loyaltyController.getMyLoyaltyPoints);

// @route   POST /api/loyalty/calculate-points
// @desc    Calculate points for order amount
// @access  Private
router.post('/calculate-points', auth, loyaltyController.calculatePoints);

// @route   POST /api/loyalty/calculate-discount
// @desc    Calculate discount for points redemption
// @access  Private
router.post('/calculate-discount', auth, loyaltyController.calculateDiscount);

// @route   GET /api/loyalty/history
// @desc    Get user's loyalty transaction history
// @access  Private
router.get('/history', auth, loyaltyController.getLoyaltyHistory);

// Admin routes
// @route   POST /api/loyalty/admin/adjust
// @desc    Adjust user's loyalty points (admin only)
// @access  Private/Admin
router.post('/admin/adjust', adminAuth, loyaltyController.adjustLoyaltyPoints);

// @route   GET /api/loyalty/admin/stats
// @desc    Get loyalty program statistics
// @access  Private/Admin
router.get('/admin/stats', adminAuth, loyaltyController.getLoyaltyStats);

module.exports = router;