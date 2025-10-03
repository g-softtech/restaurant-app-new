// models/Order.js - Enhanced for Phase 6
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem'
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  note: String
});

const orderSchema = new mongoose.Schema({
  // Order number
  orderNumber: {
    type: String,
    unique: true
  },

  // Link to authenticated user (optional for guest orders)
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },

  // Customer info (for both guest and authenticated users)
  customerInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: String,
    deliveryInstructions: String,
    notes: String
  },

  // Order items
  items: [orderItemSchema],

  // Pricing
  totalAmount: {
    type: Number,
    required: true
  },

  // Payment info
  paymentMethod: {
    type: String,
    enum: ['card', 'paystack', 'cash'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentReference: String,
  paymentData: Object,
  paymentIntentId: String,

  // Status with detailed history
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },

  // Status history for tracking
  statusHistory: [statusHistorySchema],

  // Delivery tracking
  assignedRider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,

  // Timestamps for each status
  confirmedAt: Date,
  preparingAt: Date,
  readyAt: Date,
  outForDeliveryAt: Date,
  deliveredAt: Date,
  cancelledAt: Date

}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${new Date().getFullYear()}${String(count + 1).padStart(6, '0')}`;
    
    // Add initial status to history
    if (this.statusHistory.length === 0) {
      this.statusHistory.push({
        status: this.status,
        timestamp: new Date(),
        note: 'Order placed'
      });
    }
  }
  next();
});

// Method to update status with history tracking
orderSchema.methods.updateStatus = function(newStatus, updatedBy, note) {
  this.status = newStatus;
  
  // Add to status history
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy: updatedBy,
    note: note
  });
  
  // Update specific timestamp fields
  const timestamp = new Date();
  switch(newStatus) {
    case 'confirmed':
      this.confirmedAt = timestamp;
      break;
    case 'preparing':
      this.preparingAt = timestamp;
      break;
    case 'ready':
      this.readyAt = timestamp;
      break;
    case 'out_for_delivery':
      this.outForDeliveryAt = timestamp;
      // Set estimated delivery time (30 minutes from now)
      this.estimatedDeliveryTime = new Date(timestamp.getTime() + 30 * 60000);
      break;
    case 'delivered':
      this.deliveredAt = timestamp;
      this.actualDeliveryTime = timestamp;
      break;
    case 'cancelled':
      this.cancelledAt = timestamp;
      break;
  }
  
  return this.save();
};

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

module.exports = mongoose.model('Order', orderSchema);