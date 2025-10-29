// controllers/loyaltyController.js
const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Get user's loyalty points and history
// @route   GET /api/loyalty/my-points
// @access  Private
exports.getMyLoyaltyPoints = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('loyalty loyaltyHistory')
      .populate('loyaltyHistory.relatedOrder', 'orderNumber totalAmount');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Calculate points value (e.g., 100 points = $1)
    const pointsValue = user.loyalty.points / 100;
    
    // Get tier benefits
    const tierBenefits = getTierBenefits(user.loyalty.tier);
    
    res.json({
      success: true,
      loyalty: {
        currentPoints: user.loyalty.points,
        pointsValue: pointsValue,
        totalEarned: user.loyalty.totalPointsEarned,
        totalRedeemed: user.loyalty.totalPointsRedeemed,
        tier: user.loyalty.tier,
        tierBenefits: tierBenefits,
        nextTier: getNextTierInfo(user.loyalty.totalPointsEarned),
        lastEarned: user.loyalty.lastEarnedAt,
        lastRedeemed: user.loyalty.lastRedeemedAt
      },
      history: user.loyaltyHistory.slice(-20).reverse() // Last 20 transactions
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Calculate points for order amount
// @route   POST /api/loyalty/calculate-points
// @access  Private
exports.calculatePoints = async (req, res) => {
  try {
    const { orderAmount } = req.body;
    
    if (!orderAmount || orderAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid order amount is required'
      });
    }
    
    const user = await User.findById(req.user._id);
    const tier = user?.loyalty?.tier || 'bronze';
    
    const points = User.calculatePointsForAmount(orderAmount, tier);
    const pointsValue = points / 100;
    
    res.json({
      success: true,
      orderAmount,
      pointsToEarn: points,
      pointsValue: pointsValue,
      tier: tier,
      message: `You will earn ${points} points (worth $${pointsValue.toFixed(2)}) on this order`
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Calculate discount for points redemption
// @route   POST /api/loyalty/calculate-discount
// @access  Private
exports.calculateDiscount = async (req, res) => {
  try {
    const { pointsToRedeem, orderAmount } = req.body;
    
    if (!pointsToRedeem || pointsToRedeem <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid points amount is required'
      });
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user has enough points
    if (user.loyalty.points < pointsToRedeem) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient loyalty points'
      });
    }
    
    // Minimum points redemption (e.g., 100 points)
    const MIN_REDEMPTION = 100;
    if (pointsToRedeem < MIN_REDEMPTION) {
      return res.status(400).json({
        success: false,
        message: `Minimum ${MIN_REDEMPTION} points required for redemption`
      });
    }
    
    // Calculate discount (100 points = $1)
    const discount = pointsToRedeem / 100;
    
    // Check if discount exceeds order amount
    const maxDiscount = orderAmount ? Math.min(discount, orderAmount * 0.5) : discount;
    
    res.json({
      success: true,
      pointsToRedeem: pointsToRedeem,
      discount: maxDiscount,
      remainingPoints: user.loyalty.points - pointsToRedeem,
      message: orderAmount && maxDiscount < discount 
        ? 'Discount limited to 50% of order amount' 
        : 'Points can be redeemed'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's loyalty transaction history
// @route   GET /api/loyalty/history
// @access  Private
exports.getLoyaltyHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const user = await User.findById(req.user._id)
      .select('loyaltyHistory')
      .populate('loyaltyHistory.relatedOrder', 'orderNumber totalAmount createdAt');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Sort history by most recent first
    const sortedHistory = user.loyaltyHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice((page - 1) * limit, page * limit);
    
    res.json({
      success: true,
      history: sortedHistory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: user.loyaltyHistory.length,
        hasMore: page * limit < user.loyaltyHistory.length
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get loyalty program overview
// @route   GET /api/loyalty/program-info
// @access  Public
exports.getProgramInfo = async (req, res) => {
  try {
    res.json({
      success: true,
      program: {
        name: 'Foodie Rewards',
        description: 'Earn points on every order and redeem them for discounts',
        conversionRate: {
          earning: '1 point per $1 spent',
          redemption: '100 points = $1 discount'
        },
        minRedemption: 100,
        maxDiscountPercent: 50,
        tiers: [
          {
            name: 'bronze',
            pointsRequired: 0,
            multiplier: 1,
            benefits: [
              'Earn 1 point per $1 spent',
              'Birthday reward',
              'Exclusive member deals'
            ]
          },
          {
            name: 'silver',
            pointsRequired: 2000,
            multiplier: 1.25,
            benefits: [
              'Earn 1.25 points per $1 spent',
              'Priority customer support',
              'Early access to new menu items',
              'Free delivery on orders over $30'
            ]
          },
          {
            name: 'gold',
            pointsRequired: 5000,
            multiplier: 1.5,
            benefits: [
              'Earn 1.5 points per $1 spent',
              'Double points on special days',
              'Complimentary appetizer monthly',
              'Free delivery on all orders'
            ]
          },
          {
            name: 'platinum',
            pointsRequired: 10000,
            multiplier: 2,
            benefits: [
              'Earn 2 points per $1 spent',
              'Triple points on special days',
              'VIP customer service',
              'Exclusive events access',
              'Personalized menu recommendations'
            ]
          }
        ]
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Admin: Adjust user loyalty points
// @route   POST /api/loyalty/admin/adjust
// @access  Private/Admin
exports.adjustLoyaltyPoints = async (req, res) => {
  try {
    const { userId, points, description } = req.body;
    
    if (!userId || !points || !description) {
      return res.status(400).json({
        success: false,
        message: 'User ID, points, and description are required'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Adjust points
    const oldBalance = user.loyalty.points;
    user.loyalty.points += points;
    
    // Prevent negative balance
    if (user.loyalty.points < 0) {
      user.loyalty.points = 0;
    }
    
    // Update totals
    if (points > 0) {
      user.loyalty.totalPointsEarned += points;
    } else {
      user.loyalty.totalPointsRedeemed += Math.abs(points);
    }
    
    // Update tier
    user.updateLoyaltyTier();
    
    // Add to history
    user.loyaltyHistory.push({
      type: 'adjusted',
      points: points,
      balance: user.loyalty.points,
      description: `Admin adjustment: ${description}`
    });
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Loyalty points adjusted successfully',
      adjustment: {
        oldBalance: oldBalance,
        newBalance: user.loyalty.points,
        change: points
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Admin: Get loyalty statistics
// @route   GET /api/loyalty/admin/stats
// @access  Private/Admin
exports.getLoyaltyStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $facet: {
          tierDistribution: [
            {
              $group: {
                _id: '$loyalty.tier',
                count: { $sum: 1 }
              }
            }
          ],
          totalPoints: [
            {
              $group: {
                _id: null,
                totalActive: { $sum: '$loyalty.points' },
                totalEarned: { $sum: '$loyalty.totalPointsEarned' },
                totalRedeemed: { $sum: '$loyalty.totalPointsRedeemed' }
              }
            }
          ],
          activeUsers: [
            {
              $match: {
                'loyalty.points': { $gt: 0 }
              }
            },
            { $count: 'count' }
          ]
        }
      }
    ]);
    
    res.json({
      success: true,
      stats: {
        tierDistribution: stats[0].tierDistribution,
        totalPointsActive: stats[0].totalPoints[0]?.totalActive || 0,
        totalPointsEarned: stats[0].totalPoints[0]?.totalEarned || 0,
        totalPointsRedeemed: stats[0].totalPoints[0]?.totalRedeemed || 0,
        activeUsers: stats[0].activeUsers[0]?.count || 0
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to get tier benefits
function getTierBenefits(tier) {
  const benefits = {
    bronze: ['Earn 1 point per $1', 'Birthday reward', 'Member deals'],
    silver: ['Earn 1.25 points per $1', 'Priority support', 'Free delivery over $30'],
    gold: ['Earn 1.5 points per $1', 'Double points days', 'Monthly appetizer'],
    platinum: ['Earn 2 points per $1', 'Triple points days', 'VIP service', 'Exclusive events']
  };
  
  return benefits[tier] || benefits.bronze;
}

// Helper function to get next tier info
function getNextTierInfo(totalPoints) {
  const tiers = [
    { name: 'bronze', required: 0 },
    { name: 'silver', required: 2000 },
    { name: 'gold', required: 5000 },
    { name: 'platinum', required: 10000 }
  ];
  
  for (let i = 0; i < tiers.length; i++) {
    if (totalPoints < tiers[i].required) {
      return {
        tier: tiers[i].name,
        pointsRequired: tiers[i].required,
        pointsNeeded: tiers[i].required - totalPoints
      };
    }
  }
  
  return null; // Already at highest tier
}