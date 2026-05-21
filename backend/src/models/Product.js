const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a product title'],
    trim: true,
  },
  sku: {
    type: String,
    required: [true, 'Please provide a product SKU/Identifier'],
    trim: true,
  },
  originalUrl: {
    type: String,
    required: [true, 'Please provide the original product URL'],
  },
  store: {
    type: String,
    required: [true, 'Please provide the store name'],
    enum: ['amazon', 'flipkart', 'myntra', 'ajio', 'meesho'],
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
  },
  currentPrice: {
    type: Number,
    required: [true, 'Please provide the current price'],
  },
  originalPrice: {
    type: Number,
    required: [true, 'Please provide the original price'],
  },
  discountPercent: {
    type: Number,
    default: 0,
  },
  ratings: {
    type: Number,
    default: 0,
  },
  ratingsCount: {
    type: Number,
    default: 0,
  },
  availability: {
    type: Boolean,
    default: true,
  },
  category: {
    type: String,
    required: [true, 'Please specify the category'],
    default: 'General',
  },
  keywords: [{
    type: String,
  }],
  lastScrapedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to search quickly and uniquely identify items
ProductSchema.index({ store: 1, sku: 1 }, { unique: true });
ProductSchema.index({ title: 'text', category: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
