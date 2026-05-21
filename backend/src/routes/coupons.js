const express = require('express');
const Coupon = require('../models/Coupon');

const router = express.Router();

// @desc    Get valid active coupons for a store
// @route   GET /api/coupons
router.get('/', async (req, res) => {
  const { store } = req.query;
  const filter = { isValid: true };
  if (store) {
    filter.store = { $in: [store.toLowerCase(), 'all'] };
  }
  
  try {
    const coupons = await Coupon.find(filter).sort({ upvotes: -1 });
    res.json({ success: true, count: coupons.length, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Auto coupon validator API (called by Chrome Extension)
// @route   POST /api/coupons/validate
router.post('/validate', async (req, res) => {
  const { code, store } = req.body;
  if (!code || !store) {
    return res.status(400).json({ success: false, message: 'Please provide code and store name' });
  }
  
  try {
    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      store: { $in: [store.toLowerCase(), 'all'] },
      isValid: true
    });
    
    if (!coupon) {
      return res.json({ success: false, isValid: false, message: 'Coupon invalid or expired' });
    }
    
    res.json({
      success: true,
      isValid: true,
      coupon: {
        code: coupon.code,
        discountAmount: coupon.discountAmount,
        discountType: coupon.discountType,
        description: coupon.description
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Cast a vote on coupon validity
// @route   POST /api/coupons/:id/vote
router.post('/:id/vote', async (req, res) => {
  const { voteType } = req.body; // 'upvote' or 'downvote'
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    
    if (voteType === 'upvote') {
      coupon.upvotes += 1;
    } else if (voteType === 'downvote') {
      coupon.downvotes += 1;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid voteType' });
    }
    
    // Auto-deprecate coupon if downvotes > upvotes + 10
    if (coupon.downvotes > coupon.upvotes + 10) {
      coupon.isValid = false;
    }
    
    await coupon.save();
    res.json({ success: true, message: 'Vote recorded successfully', upvotes: coupon.upvotes, downvotes: coupon.downvotes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
