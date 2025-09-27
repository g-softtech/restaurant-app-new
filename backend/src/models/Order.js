
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
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
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

  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },

  // Timestamps and tracking
  estimatedDeliveryTime: Date,
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }]
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD${String(count + 1).padStart(6, '0')}`;
    
    // Add initial status to history
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      notes: 'Order placed'
    });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);