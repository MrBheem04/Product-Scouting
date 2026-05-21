const express = require('express');
const Product = require('../models/Product');
const PriceHistory = require('../models/PriceHistory');
const { getBuyingInsights, getChatResponse } = require('../services/aiService');

const router = express.Router();

// @desc    Get AI Buying Insights for a product
// @route   POST /api/ai/insights
router.post('/insights', async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ success: false, message: 'Please provide a productId' });
  }
  
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    const priceHistory = await PriceHistory.find({ product: productId });
    const insights = await getBuyingInsights(product, priceHistory);
    
    res.json({ success: true, insights });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    AI Chatbot interaction
// @route   POST /api/ai/chat
router.post('/chat', async (req, res) => {
  const { message, productId } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, message: 'Please provide a message query' });
  }
  
  try {
    let productContext = null;
    if (productId) {
      productContext = await Product.findById(productId);
    }
    
    const chatReply = await getChatResponse(message, productContext);
    res.json({ success: true, reply: chatReply.reply });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
