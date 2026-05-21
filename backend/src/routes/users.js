const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'scout_price_jwt_secret_token_key_2026', {
    expiresIn: '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
router.post('/register', async (req, res) => {
  const { name, email, password, referralCode } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    // Check if referred by someone
    let referredByUser = null;
    if (referralCode) {
      referredByUser = await User.findOne({ referralCode });
    }
    
    const selfReferral = 'SP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const user = await User.create({
      name,
      email,
      password,
      referralCode: selfReferral,
      referredBy: referredByUser ? referredByUser._id : undefined,
      cashbackBalance: referredByUser ? 50.0 : 0.0 // Give sign-up bonus if referred
    });
    
    if (referredByUser) {
      // Credit referring user
      referredByUser.cashbackBalance += 100.0;
      await referredByUser.save();
    }
    
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        referralCode: user.referralCode,
        cashbackBalance: user.cashbackBalance
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        referralCode: user.referralCode,
        cashbackBalance: user.cashbackBalance
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar,
      referralCode: req.user.referralCode,
      cashbackBalance: req.user.cashbackBalance
    }
  });
});

// @desc    Get watchlist / saved products
// @route   GET /api/users/watchlist
router.get('/watchlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedProducts');
    res.json({ success: true, watchlist: user.savedProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Add product to watchlist
// @route   POST /api/users/watchlist/:productId
router.post('/watchlist/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.savedProducts.includes(req.params.productId)) {
      return res.status(400).json({ success: false, message: 'Product already watchlisted' });
    }
    user.savedProducts.push(req.params.productId);
    await user.save();
    res.json({ success: true, message: 'Product added to watchlist', watchlistCount: user.savedProducts.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Remove product from watchlist
// @route   DELETE /api/users/watchlist/:productId
router.delete('/watchlist/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.savedProducts = user.savedProducts.filter(id => id.toString() !== req.params.productId);
    await user.save();
    res.json({ success: true, message: 'Product removed from watchlist', watchlistCount: user.savedProducts.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
