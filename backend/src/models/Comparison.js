const mongoose = require('mongoose');

const ComparisonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide comparison context or title'],
    trim: true,
  },
  category: {
    type: String,
    default: 'General',
  },
  stores: [{
    storeName: {
      type: String,
      required: true,
      enum: ['amazon', 'flipkart', 'myntra', 'ajio', 'meesho'],
    },
    price: {
      type: Number,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    deliveryCharges: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    availability: {
      type: Boolean,
      default: true,
    },
  }],
  cheapestStore: {
    type: String,
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to calculate the cheapest store
ComparisonSchema.pre('save', function (next) {
  if (this.stores && this.stores.length > 0) {
    let cheapest = this.stores[0];
    for (let i = 1; i < this.stores.length; i++) {
      if (this.stores[i].price < cheapest.price) {
        cheapest = this.stores[i];
      }
    }
    this.cheapestStore = cheapest.storeName;
  }
  next();
});

module.exports = mongoose.model('Comparison', ComparisonSchema);
