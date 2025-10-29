// models/User.js - Enhanced with Loyalty Points System
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  label: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: String,
  isDefault: {
    type: Boolean,
    default: false
  }
});

const loyaltySchema = new mongoose.Schema({
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPointsEarned: {
    type: Number,
    default: 0
  },
  totalPointsRedeemed: {
    type: Number,
    default: 0
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  lastEarnedAt: Date,
  lastRedeemedAt: Date
});

const loyaltyHistorySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['earned', 'redeemed', 'expired', 'adjusted'],
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  balance: {
    type: Number,
    required: true
  },
  description: String,
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'rider'],
    default: 'customer'
  },
  
  // Saved addresses
  addresses: [addressSchema],
  
  // Loyalty Points System
  loyalty: {
    type: loyaltySchema,
    default: () => ({})
  },
  
  // Loyalty transaction history
  loyaltyHistory: [loyaltyHistorySchema],
  
  // Order history reference
  orderHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Method to add loyalty points
userSchema.methods.addLoyaltyPoints = function(points, description, orderId = null) {
  // Add points
  this.loyalty.points += points;
  this.loyalty.totalPointsEarned += points;
  this.loyalty.lastEarnedAt = new Date();
  
  // Update tier based on total points earned
  this.updateLoyaltyTier();
  
  // Add to history
  this.loyaltyHistory.push({
    type: 'earned',
    points: points,
    balance: this.loyalty.points,
    description: description || `Earned ${points} points`,
    relatedOrder: orderId
  });
  
  return this.save();
};

// Method to redeem loyalty points
userSchema.methods.redeemLoyaltyPoints = function(points, description, orderId = null) {
  if (this.loyalty.points < points) {
    throw new Error('Insufficient loyalty points');
  }
  
  // Deduct points
  this.loyalty.points -= points;
  this.loyalty.totalPointsRedeemed += points;
  this.loyalty.lastRedeemedAt = new Date();
  
  // Add to history
  this.loyaltyHistory.push({
    type: 'redeemed',
    points: -points,
    balance: this.loyalty.points,
    description: description || `Redeemed ${points} points`,
    relatedOrder: orderId
  });
  
  return this.save();
};

// Method to update loyalty tier
userSchema.methods.updateLoyaltyTier = function() {
  const totalPoints = this.loyalty.totalPointsEarned;
  
  if (totalPoints >= 10000) {
    this.loyalty.tier = 'platinum';
  } else if (totalPoints >= 5000) {
    this.loyalty.tier = 'gold';
  } else if (totalPoints >= 2000) {
    this.loyalty.tier = 'silver';
  } else {
    this.loyalty.tier = 'bronze';
  }
};

// Method to calculate points for order amount
userSchema.statics.calculatePointsForAmount = function(amount, tier = 'bronze') {
  // Base: 1 point per $1 spent
  let multiplier = 1;
  
  // Tier bonuses
  switch(tier) {
    case 'silver':
      multiplier = 1.25;
      break;
    case 'gold':
      multiplier = 1.5;
      break;
    case 'platinum':
      multiplier = 2;
      break;
  }
  
  return Math.floor(amount * multiplier);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);