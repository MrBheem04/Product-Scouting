const express = require('express');
const Alert = require('../models/Alert');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user's configured alerts
// @route   GET /api/alerts
router.get('/', protect, async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user._id }).populate('product');
    res.json({ success: true, count: alerts.length, alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Configure a new price alert
// @route   POST /api/alerts
router.post('/', protect, async (req, res) => {
  const { productId, targetPrice, notificationChannel } = req.body;
  if (!productId || !targetPrice) {
    return res.status(400).json({ success: false, message: 'Please provide productId and targetPrice' });
  }
  
  try {
    // Check if user already has an alert for this product
    let alert = await Alert.findOne({ user: req.user._id, product: productId });
    
    if (alert) {
      alert.targetPrice = targetPrice;
      alert.notificationChannel = notificationChannel || 'email';
      alert.active = true;
      await alert.save();
      return res.json({ success: true, message: 'Alert updated successfully', alert });
    }
    
    alert = await Alert.create({
      user: req.user._id,
      product: productId,
      targetPrice,
      notificationChannel: notificationChannel || 'email',
    });
    
    res.status(201).json({ success: true, message: 'Alert created successfully', alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete/Deactivate alert
// @route   DELETE /api/alerts/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const alert = await Alert.findOne({ _id: req.params.id, user: req.user._id });
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found or unauthorized' });
    }
    await alert.deleteOne();
    res.json({ success: true, message: 'Alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
