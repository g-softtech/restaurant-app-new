// // const mongoose = require('mongoose');

// // const orderSchema = new mongoose.Schema({
// //   customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: function(){ return !this.guestInfo } },
// //   guestInfo: { name: String, email: String, phone: String },
// //   items: [{
// //     menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
// //     quantity: { type: Number, required: true, min: 1 },
// //     price: { type: Number, required: true },
// //     specialInstructions: String
// //   }],
// //   subtotal: { type: Number, required: true, min: 0 },
// //   tax: { type: Number, default: 0 },
// //   deliveryFee: { type: Number, default: 0 },
// //   discount: { amount: { type: Number, default: 0 }, code: String, type: { type: String, enum: ['percentage','fixed'] } },
// //   totalPrice: { type: Number, required: true, min: 0 },
// //   status: { type: String, enum: ['pending','confirmed','preparing','ready','out-for-delivery','delivered','cancelled'], default: 'pending' },
// //   paymentMethod: { type: String, enum: ['cash','card','online'], required: true },
// //   paymentStatus: { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
// //   paymentId: String,
// //   deliveryAddress: { street: String, city: String, state: String, zipCode: String, landmark: String, instructions: String },
// //   deliveryType: { type: String, enum: ['delivery','pickup'], default: 'delivery' },
// //   estimatedDeliveryTime: Date,
// //   actualDeliveryTime: Date,
// //   assignedRider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
// //   notes: String,
// //   statusHistory: [{ status: String, timestamp: { type: Date, default: Date.now }, note: String }]
// // }, { timestamps: true });

// // orderSchema.pre('save', function(next) {
// //   if (this.isNew) {
// //     this.statusHistory.push({ status: this.status, timestamp: new Date(), note: 'Order placed' });
// //   }
// //   next();
// // });

// // module.exports = mongoose.model('Order', orderSchema);




// // 1. Order Model (models/Order.js)
// const mongoose = require('mongoose');

// const orderItemSchema = new mongoose.Schema({
//   menuItem: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'MenuItem',
//     required: true
//   },
//   name: {
//     type: String,
//     required: true
//   },
//   price: {
//     type: Number,
//     required: true
//   },
//   quantity: {
//     type: Number,
//     required: true,
//     min: 1
//   }
// });

// const orderSchema = new mongoose.Schema({
//   // Order ID (auto-generated)
//   orderNumber: {
//     type: String,
//     unique: true
//   },
//   // Add this to your order schema
// paymentDetails: {
//   gateway: String, // 'paystack', 'stripe', etc.
//   gatewayTransactionId: String,
//   paidAt: Date,
//   channel: String, // 'card', 'bank', etc.
//   currency: String,
//   amountPaid: Number
// },
// // Add this field to your Order schema
// customer: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: 'User',
//   required: false  // Keep optional for guest orders
// },

//   // Customer Information
//   customer: {
//     firstName: {
//       type: String,
//       required: true,
//       trim: true
//     },
//     lastName: {
//       type: String,
//       required: true,
//       trim: true
//     },
//     email: {
//       type: String,
//       required: true,
//       trim: true,
//       lowercase: true
//     },
//     phone: {
//       type: String,
//       required: true,
//       trim: true
//     }
//   },

//   // Delivery Information
//   delivery: {
//     address: {
//       type: String,
//       required: true,
//       trim: true
//     },
//     city: {
//       type: String,
//       required: true,
//       trim: true
//     },
//     postalCode: {
//       type: String,
//       trim: true
//     },
//     instructions: {
//       type: String,
//       trim: true
//     },
//     time: {
//       type: String,
//       enum: ['asap', '1hour', '2hours', 'schedule'],
//       default: 'asap'
//     },
//     scheduledTime: {
//       type: Date
//     }
//   },

//   // Order Items
//   items: [orderItemSchema],

//   // Pricing
//   pricing: {
//     subtotal: {
//       type: Number,
//       required: true
//     },
//     deliveryFee: {
//       type: Number,
//       default: 0
//     },
//     tax: {
//       type: Number,
//       default: 0
//     },
//     total: {
//       type: Number,
//       required: true
//     }
//   },

//   // Payment & Status
//   paymentMethod: {
//     type: String,
//     enum: ['card', 'paystack', 'cash'],
//     required: true
//   },
//   paymentStatus: {
//     type: String,
//     enum: ['pending', 'paid', 'failed', 'refunded'],
//     default: 'pending'
//   },
//   transactionId: {
//     type: String
//   },

//   // Order Status
//   status: {
//     type: String,
//     enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
//     default: 'pending'
//   },

//   // Additional Information
//   notes: {
//     type: String,
//     trim: true
//   },

//   // Timestamps
//   estimatedDeliveryTime: {
//     type: Date
//   },
  
//   // Tracking
//   statusHistory: [{
//     status: String,
//     timestamp: {
//       type: Date,
//       default: Date.now
//     },
//     notes: String
//   }]
// }, {
//   timestamps: true
// });

// // Generate order number before saving
// orderSchema.pre('save', async function(next) {
//   if (this.isNew) {
//     const count = await mongoose.model('Order').countDocuments();
//     this.orderNumber = `ORD${String(count + 1).padStart(6, '0')}`;
    
//     // Set estimated delivery time
//     const now = new Date();
//     if (this.delivery.time === 'asap') {
//       this.estimatedDeliveryTime = new Date(now.getTime() + 45 * 60000); // 45 minutes
//     } else if (this.delivery.time === '1hour') {
//       this.estimatedDeliveryTime = new Date(now.getTime() + 60 * 60000); // 1 hour
//     } else if (this.delivery.time === '2hours') {
//       this.estimatedDeliveryTime = new Date(now.getTime() + 120 * 60000); // 2 hours
//     } else if (this.delivery.time === 'schedule') {
//       this.estimatedDeliveryTime = this.delivery.scheduledTime;
//     }
    
//     // Add initial status to history
//     this.statusHistory.push({
//       status: this.status,
//       timestamp: new Date(),
//       notes: 'Order placed'
//     });
//   }
//   next();
// });

// module.exports = mongoose.model('Order', orderSchema);


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