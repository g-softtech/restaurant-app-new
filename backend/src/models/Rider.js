const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleType: { type: String, enum: ['bike','scooter','car'], required: true },
  vehicleNumber: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  currentLocation: { latitude: Number, longitude: Number, lastUpdated: Date },
  currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  deliveryStats: { totalDeliveries: { type: Number, default: 0 }, completedDeliveries: { type: Number, default: 0 }, averageDeliveryTime: { type: Number, default: 0 } }
}, { timestamps: true });

module.exports = mongoose.model('Rider', riderSchema);
