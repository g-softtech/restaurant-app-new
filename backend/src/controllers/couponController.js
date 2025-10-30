// controllers/couponController.js
const Coupon = require('../models/coupon');
const User = require('../models/User');

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Public
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount, items, userId } = req.body;
    
    if (!code || !orderAmount) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code and order amount are required'
      });
    }
    
    // Find coupon
    const coupon = await Coupon.findValidCoupon(code);
    
    // Check if user can use coupon
    if (userId) {
      const user = await User.findById(userId);
      const orderCount = user ? user.orderHistory.length : 0;
      
      const userCheck = coupon.canBeUsedBy(userId, orderCount);
      if (!userCheck.valid) {
        return res.status(400).json({
          success: false,
          message: userCheck.message
        });
      }
    }
    
    // Calculate discount
    const discountResult = coupon.calculateDiscount(orderAmount, items || []);
    
    if (!discountResult.applicable) {
      return res.status(400).json({
        success: false,
        message: discountResult.message
      });
    }
    
    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      },
      discount: discountResult.discount,
      message: discountResult.message
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new coupon (Admin only)
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res) => {
  try {
    const couponData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const coupon = await Coupon.create(couponData);
    
    res.status(201).json({
      success: true,
      coupon
    });
    
  } catch (error) {
    // Handle duplicate code error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all coupons (Admin only)
// @route   GET /api/coupons
// @access  Private/Admin
exports.getAllCoupons = async (req, res) => {
  try {
    const { status, sort } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status === 'active') {
      query.isActive = true;
      query.validUntil = { $gte: new Date() };
    } else if (status === 'expired') {
      query.validUntil = { $lt: new Date() };
    } else if (status === 'inactive') {
      query.isActive = false;
    }
    
    let couponsQuery = Coupon.find(query).populate('createdBy', 'name email');
    
    // Sort
    if (sort === 'newest') {
      couponsQuery = couponsQuery.sort({ createdAt: -1 });
    } else if (sort === 'expiring') {
      couponsQuery = couponsQuery.sort({ validUntil: 1 });
    } else if (sort === 'popular') {
      couponsQuery = couponsQuery.sort({ currentUsageCount: -1 });
    }
    
    const coupons = await couponsQuery;
    
    res.json({
      success: true,
      count: coupons.length,
      coupons
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single coupon (Admin only)
// @route   GET /api/coupons/:id
// @access  Private/Admin
exports.getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('usageHistory.user', 'name email')
      .populate('usageHistory.order', 'orderNumber totalAmount');
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }
    
    res.json({
      success: true,
      coupon
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update coupon (Admin only)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }
    
    // Don't allow changing code if coupon has been used
    if (req.body.code && coupon.currentUsageCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change code for a coupon that has been used'
      });
    }
    
    // Update fields
    const allowedUpdates = [
      'description', 'discountType', 'discountValue', 'maxDiscount',
      'minOrderAmount', 'validFrom', 'validUntil', 'usageLimit',
      'usageLimitPerUser', 'applicableCategories', 'excludedCategories',
      'firstOrderOnly', 'isActive', 'notes'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        coupon[field] = req.body[field];
      }
    });
    
    await coupon.save();
    
    res.json({
      success: true,
      coupon
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete/Deactivate coupon (Admin only)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }
    
    // If coupon has been used, just deactivate it instead of deleting
    if (coupon.currentUsageCount > 0) {
      coupon.isActive = false;
      await coupon.save();
      
      return res.json({
        success: true,
        message: 'Coupon deactivated successfully'
      });
    }
    
    // Delete if never used
    await coupon.deleteOne();
    
    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get coupon statistics (Admin only)
// @route   GET /api/coupons/stats/overview
// @access  Private/Admin
exports.getCouponStats = async (req, res) => {
  try {
    const now = new Date();
    
    const stats = await Coupon.aggregate([
      {
        $facet: {
          active: [
            {
              $match: {
                isActive: true,
                validUntil: { $gte: now }
              }
            },
            { $count: 'count' }
          ],
          expired: [
            {
              $match: {
                validUntil: { $lt: now }
              }
            },
            { $count: 'count' }
          ],
          inactive: [
            {
              $match: {
                isActive: false
              }
            },
            { $count: 'count' }
          ],
          totalUsage: [
            {
              $group: {
                _id: null,
                total: { $sum: '$currentUsageCount' }
              }
            }
          ],
          totalDiscount: [
            {
              $unwind: '$usageHistory'
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$usageHistory.discountAmount' }
              }
            }
          ]
        }
      }
    ]);
    
    const result = {
      activeCoupons: stats[0].active[0]?.count || 0,
      expiredCoupons: stats[0].expired[0]?.count || 0,
      inactiveCoupons: stats[0].inactive[0]?.count || 0,
      totalUsageCount: stats[0].totalUsage[0]?.total || 0,
      totalDiscountGiven: stats[0].totalDiscount[0]?.total || 0
    };
    
    res.json({
      success: true,
      stats: result
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};