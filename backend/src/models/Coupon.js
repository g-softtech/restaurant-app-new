// models/Coupon.js
const mongoose = require('mongoose');

const couponUsageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  discountAmount: {
    type: Number,
    required: true
  },
  usedAt: {
    type: Date,
    default: Date.now
  }
});

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Discount Type
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  
  // Discount Value
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Maximum discount amount (for percentage coupons)
  maxDiscount: {
    type: Number,
    min: 0
  },
  
  // Minimum order amount required
  minOrderAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Validity Period
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  
  // Usage Limits
  usageLimit: {
    type: Number,
    default: null
  },
  usageLimitPerUser: {
    type: Number,
    default: 1
  },
  currentUsageCount: {
    type: Number,
    default: 0
  },
  
  // Restrictions
  applicableCategories: [{
    type: String
  }],
  
  excludedCategories: [{
    type: String
  }],
  
  firstOrderOnly: {
    type: Boolean,
    default: false
  },
  
  // User restrictions
  applicableToUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  excludedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Usage tracking
  usageHistory: [couponUsageSchema],
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  notes: String
  
}, {
  timestamps: true
});

// Indexes
couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });

// Method to check if coupon is valid
couponSchema.methods.isValid = function() {
  const now = new Date();
  
  if (!this.isActive) {
    return { valid: false, message: 'Coupon is inactive' };
  }
  
  if (now < this.validFrom) {
    return { valid: false, message: 'Coupon is not yet valid' };
  }
  
  if (now > this.validUntil) {
    return { valid: false, message: 'Coupon has expired' };
  }
  
  if (this.usageLimit !== null && this.currentUsageCount >= this.usageLimit) {
    return { valid: false, message: 'Coupon usage limit reached' };
  }
  
  return { valid: true };
};

// Method to check if user can use this coupon
couponSchema.methods.canBeUsedBy = function(userId, userOrderCount = 0) {
  const validityCheck = this.isValid();
  if (!validityCheck.valid) {
    return validityCheck;
  }
  
  if (this.firstOrderOnly && userOrderCount > 0) {
    return { valid: false, message: 'Coupon is only valid for first orders' };
  }
  
  if (this.excludedUsers.length > 0 && this.excludedUsers.includes(userId)) {
    return { valid: false, message: 'You are not eligible for this coupon' };
  }
  
  if (this.applicableToUsers.length > 0 && !this.applicableToUsers.includes(userId)) {
    return { valid: false, message: 'This coupon is not available for your account' };
  }
  
  const userUsageCount = this.usageHistory.filter(
    usage => usage.user.toString() === userId.toString()
  ).length;
  
  if (userUsageCount >= this.usageLimitPerUser) {
    return { valid: false, message: 'You have already used this coupon the maximum number of times' };
  }
  
  return { valid: true };
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function(orderAmount, items = []) {
  if (orderAmount < this.minOrderAmount) {
    return {
      applicable: false,
      message: `Minimum order amount of $${this.minOrderAmount.toFixed(2)} required`,
      discount: 0
    };
  }
  
  let applicableAmount = orderAmount;
  
  if (this.applicableCategories.length > 0 || this.excludedCategories.length > 0) {
    applicableAmount = items.reduce((sum, item) => {
      if (this.applicableCategories.length > 0) {
        if (!this.applicableCategories.includes(item.category)) {
          return sum;
        }
      }
      
      if (this.excludedCategories.length > 0) {
        if (this.excludedCategories.includes(item.category)) {
          return sum;
        }
      }
      
      return sum + (item.price * item.quantity);
    }, 0);
  }
  
  if (applicableAmount === 0) {
    return {
      applicable: false,
      message: 'No items in your cart are eligible for this coupon',
      discount: 0
    };
  }
  
  let discount = 0;
  
  if (this.discountType === 'percentage') {
    discount = (applicableAmount * this.discountValue) / 100;
    
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = Math.min(this.discountValue, applicableAmount);
  }
  
  return {
    applicable: true,
    discount: Math.round(discount * 100) / 100,
    message: 'Coupon applied successfully'
  };
};

// Method to record usage
couponSchema.methods.recordUsage = function(userId, orderId, discountAmount) {
  this.currentUsageCount += 1;
  this.usageHistory.push({
    user: userId,
    order: orderId,
    discountAmount: discountAmount
  });
  
  return this.save();
};

// Static method to find valid coupon by code
couponSchema.statics.findValidCoupon = async function(code) {
  const coupon = await this.findOne({
    code: code.toUpperCase(),
    isActive: true
  });
  
  if (!coupon) {
    throw new Error('Invalid coupon code');
  }
  
  const validityCheck = coupon.isValid();
  if (!validityCheck.valid) {
    throw new Error(validityCheck.message);
  }
  
  return coupon;
};

module.exports = mongoose.model('Coupon', couponSchema);