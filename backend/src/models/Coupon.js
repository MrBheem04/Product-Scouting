const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please provide the coupon code'],
    trim: true,
    uppercase: true,
  },
  store: {
    type: String,
    required: [true, 'Please specify the store this coupon applies to'],
    enum: ['amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'all'],
    default: 'all',
  },
  discountAmount: {
    type: Number,
    required: [true, 'Please specify the discount value'],
  },
  discountType: {
    type: String,
    enum: ['flat', 'percent'],
    default: 'percent',
  },
  description: {
    type: String,
    required: [true, 'Please provide a coupon description'],
  },
  expiryDate: {
    type: Date,
  },
  isValid: {
    type: Boolean,
    default: true,
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  downvotes: {
    type: Number,
    default: 0,
  },
  verifiedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Coupon', CouponSchema);
