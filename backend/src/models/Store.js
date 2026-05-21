const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['amazon', 'flipkart', 'myntra', 'ajio', 'meesho'],
  },
  displayName: {
    type: String,
    required: true,
  },
  logoUrl: {
    type: String,
  },
  affiliateTag: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('Store', StoreSchema);
