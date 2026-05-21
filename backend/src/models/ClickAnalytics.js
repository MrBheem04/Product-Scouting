const mongoose = require('mongoose');

const ClickAnalyticsSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  store: {
    type: String,
    required: true,
    enum: ['amazon', 'flipkart', 'myntra', 'ajio', 'meesho'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  url: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

ClickAnalyticsSchema.index({ store: 1, timestamp: -1 });

module.exports = mongoose.model('ClickAnalytics', ClickAnalyticsSchema);
