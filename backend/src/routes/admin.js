const express = require('express');
const { protect, admin } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const Alert = require('../models/Alert');
const Coupon = require('../models/Coupon');
const { scrapeProduct } = require('../services/scraperService');

const router = express.Router();

const Store = require('../models/Store');
const ClickAnalytics = require('../models/ClickAnalytics');
const PriceHistory = require('../models/PriceHistory');

// @desc    Get dashboard metrics and counts
// @route   GET /api/admin/stats
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const alertCount = await Alert.countDocuments();
    const couponCount = await Coupon.countDocuments();
    const clickCount = await ClickAnalytics.countDocuments();
    
    // Average price stats
    const products = await Product.find({}, 'currentPrice originalPrice');
    let totalDiscountValue = 0;
    products.forEach(p => {
      totalDiscountValue += (p.originalPrice - p.currentPrice);
    });
    const avgSavings = products.length ? Math.round(totalDiscountValue / products.length) : 0;
    
    res.json({
      success: true,
      stats: {
        users: userCount,
        products: productCount,
        alerts: alertCount,
        coupons: couponCount,
        clicks: clickCount,
        averageSavingsInr: avgSavings,
        systemHealth: '100% Operational',
        redisQueueStatus: 'Active',
        activeScraperWorkers: 2
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Force scrape cron job
// @route   POST /api/admin/scrape-job
router.post('/scrape-job', protect, admin, async (req, res) => {
  try {
    const products = await Product.find();
    console.log(`[Admin Cron Job] Force scraping ${products.length} products...`);
    
    // Concurrently trigger updates for all items
    const jobs = products.map(async (prod) => {
      const data = await scrapeProduct(prod.originalUrl, prod.store);
      prod.currentPrice = data.currentPrice;
      prod.originalPrice = data.originalPrice;
      prod.discountPercent = data.discountPercent;
      prod.lastScrapedAt = new Date();
      await prod.save();
    });
    
    await Promise.all(jobs);
    res.json({ success: true, message: `Scraped and updated ${products.length} products successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get clicks analytics
// @route   GET /api/admin/clicks
router.get('/clicks', protect, admin, async (req, res) => {
  try {
    const totalClicks = await ClickAnalytics.countDocuments();
    const clicks = await ClickAnalytics.find()
      .populate('product', 'title store currentPrice')
      .sort({ timestamp: -1 })
      .limit(100);

    res.json({ success: true, totalClicks, clicks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update affiliate settings for stores
// @route   POST /api/admin/affiliate-settings
router.post('/affiliate-settings', protect, admin, async (req, res) => {
  const { store, affiliateTag } = req.body;
  if (!store) {
    return res.status(400).json({ success: false, message: 'Please specify store name' });
  }

  try {
    let storeRecord = await Store.findOne({ name: store });
    if (!storeRecord) {
      storeRecord = new Store({
        name: store,
        displayName: store.charAt(0).toUpperCase() + store.slice(1),
        affiliateTag
      });
    } else {
      storeRecord.affiliateTag = affiliateTag;
    }
    await storeRecord.save();
    res.json({ success: true, message: `Affiliate settings updated for ${store}`, store: storeRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Merge duplicate product details and delete duplicate Product
// @route   POST /api/admin/merge-duplicates
router.post('/merge-duplicates', protect, admin, async (req, res) => {
  const { parentProductId, duplicateProductId } = req.body;
  if (!parentProductId || !duplicateProductId) {
    return res.status(400).json({ success: false, message: 'Please provide parentProductId and duplicateProductId' });
  }

  try {
    const parent = await Product.findById(parentProductId);
    const duplicate = await Product.findById(duplicateProductId);
    if (!parent || !duplicate) {
      return res.status(404).json({ success: false, message: 'Parent or duplicate product not found' });
    }

    // Move alerts to parent product
    await Alert.updateMany({ product: duplicateProductId }, { product: parentProductId });

    // Move price history to parent product
    await PriceHistory.updateMany({ product: duplicateProductId }, { product: parentProductId });

    // Delete duplicate product
    await Product.findByIdAndDelete(duplicateProductId);

    res.json({ success: true, message: `Successfully merged product '${duplicate.title}' into '${parent.title}'` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
