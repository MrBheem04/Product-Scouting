const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const ClickAnalytics = require('../models/ClickAnalytics');
const Product = require('../models/Product');
const Store = require('../models/Store');

// @desc    Track click analytics and redirect to e-commerce store with affiliate parameters
// @route   GET /api/affiliate/redirect
router.get('/redirect', async (req, res) => {
  const { productId, store, url, token } = req.query;

  if (!productId || !store || !url) {
    return res.status(400).send('<h1>Bad Request</h1><p>Missing required redirection parameters.</p>');
  }

  try {
    // Optional User detection from JWT token passed in query parameter
    let userId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production_abc123xyz');
        userId = decoded.id;
      } catch (err) {
        // Continue logging click as anonymous if token is expired/invalid
      }
    }

    // Record click analytics
    await ClickAnalytics.create({
      product: productId,
      store,
      userId,
      url: decodeURIComponent(url)
    });

    // Fetch store metadata to check if affiliate key or tag exists
    let targetUrl = decodeURIComponent(url);
    const storeMeta = await Store.findOne({ name: store });
    
    if (storeMeta && storeMeta.affiliateTag) {
      try {
        const parsedUrl = new URL(targetUrl);
        if (store === 'amazon') {
          parsedUrl.searchParams.set('tag', storeMeta.affiliateTag);
          targetUrl = parsedUrl.toString();
        } else if (store === 'flipkart') {
          parsedUrl.searchParams.set('affid', storeMeta.affiliateTag);
          targetUrl = parsedUrl.toString();
        }
      } catch (e) {
        // fallback to original url if parsing fails
      }
    }

    // Return a referrer-shield page to strip referrer headers and avoid CDN blocks
    res.setHeader('Content-Type', 'text/html');
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="referrer" content="no-referrer">
          <title>Connecting to Store...</title>
          <style>
            body {
              background-color: #020617;
              color: #f8fafc;
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .loader {
              border: 3px solid #1e293b;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              border-left-color: #8b5cf6;
              animation: spin 0.8s linear infinite;
              margin-bottom: 20px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            p {
              font-size: 14px;
              font-weight: 500;
              opacity: 0.9;
            }
          </style>
          <script>
            window.onload = function() {
              window.location.replace(${JSON.stringify(targetUrl)});
            };
          </script>
        </head>
        <body>
          <div class="loader"></div>
          <p>Redirecting to merchant store...</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('[Affiliate] Redirect error:', error);
    const fallbackUrl = decodeURIComponent(url);
    res.setHeader('Content-Type', 'text/html');
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="referrer" content="no-referrer">
          <script>
            window.onload = function() {
              window.location.replace(${JSON.stringify(fallbackUrl)});
            };
          </script>
        </head>
        <body></body>
      </html>
    `);
  }
});

// @desc    Get click analytics report (for admin)
// @route   GET /api/affiliate/stats
router.get('/stats', async (req, res) => {
  try {
    const totalClicks = await ClickAnalytics.countDocuments();
    
    // Group clicks by store
    const clicksByStore = await ClickAnalytics.aggregate([
      { $group: { _id: '$store', count: { $sum: 1 } } }
    ]);

    // Group clicks by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const clicksTimeline = await ClickAnalytics.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top products clicked
    const topProducts = await ClickAnalytics.aggregate([
      { $group: { _id: '$product', clicks: { $sum: 1 } } },
      { $sort: { clicks: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          title: '$productDetails.title',
          store: '$productDetails.store',
          price: '$productDetails.currentPrice',
          clicks: 1
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalClicks,
        clicksByStore: clicksByStore.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        clicksTimeline,
        topProducts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
