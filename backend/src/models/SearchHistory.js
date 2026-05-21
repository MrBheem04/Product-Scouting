const mongoose = require('mongoose');

const SearchHistorySchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

SearchHistorySchema.index({ query: 1 });
SearchHistorySchema.index({ timestamp: -1 });

module.exports = mongoose.model('SearchHistory', SearchHistorySchema);
