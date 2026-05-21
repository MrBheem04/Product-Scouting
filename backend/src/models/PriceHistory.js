const mongoose = require('mongoose');

const PriceHistorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index by product and timestamp for quick graph ordering
PriceHistorySchema.index({ product: 1, timestamp: -1 });

module.exports = mongoose.model('PriceHistory', PriceHistorySchema);
