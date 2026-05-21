const mongoose = require('mongoose');

const ProductVariantSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  storage: { type: String }, // e.g., "128GB", "256GB"
  ram: { type: String },     // e.g., "8GB", "12GB"
  color: { type: String },   // e.g., "Blue", "Black"
  size: { type: String },    // e.g., "S", "M", "L", "UK 9"
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  availability: { type: Boolean, default: true },
  url: { type: String },
  store: { type: String, enum: ['amazon', 'flipkart', 'myntra', 'ajio', 'meesho'] },
  createdAt: { type: Date, default: Date.now },
});

ProductVariantSchema.index({ product: 1, sku: 1 }, { unique: true });

module.exports = mongoose.model('ProductVariant', ProductVariantSchema);
