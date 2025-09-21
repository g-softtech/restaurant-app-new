const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 500 },
  price: { type: Number, required: true, min: 0 },
  originalPrice: Number,
  category: { type: String, required: true, enum: ['appetizer','main-course','dessert','beverages','sides','specials'], lowercase: true },
  image: { type: String, default: 'https://via.placeholder.com/300x200/cccccc/666666?text=Food+Item' },
  ingredients: [String],
  allergens: [{ type: String, enum: ['gluten','dairy','nuts','soy','eggs','seafood'], lowercase: true }],
  nutritionalInfo: { calories: Number, protein: Number, carbs: Number, fat: Number },
  preparationTime: { type: Number, default: 20 },
  isAvailable: { type: Boolean, default: true },
  isVegetarian: { type: Boolean, default: false },
  isVegan: { type: Boolean, default: false },
  spiceLevel: { type: String, enum: ['mild','medium','hot','extra-hot'], default: 'mild' },
  rating: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
