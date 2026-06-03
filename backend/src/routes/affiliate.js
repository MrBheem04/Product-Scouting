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
      url: url // Express query parser already decodes the outer query. Redundant double-decoding causes space/special char errors.
    });

    // Fetch store metadata to check if affiliate key or tag exists
    let targetUrl = url;
    const storeMeta = await Store.findOne({ name: store });
    
    if (storeMeta && storeMeta.affiliateTag) {
      try {
        const parsedUrl = new URL(targetUrl);
        if (store === 'amazon') {
          if (storeMeta.affiliateTag && storeMeta.affiliateTag !== 'scoutprice-21') {
            parsedUrl.searchParams.set('tag', storeMeta.affiliateTag);
            targetUrl = parsedUrl.toString();
          }
        } else if (store === 'flipkart') {
          if (storeMeta.affiliateTag && storeMeta.affiliateTag !== 'scoutprice-aff') {
            parsedUrl.searchParams.set('affid', storeMeta.affiliateTag);
            targetUrl = parsedUrl.toString();
          }
        }
      } catch (e) {
        // fallback to original url if parsing fails
      }
    }

    // Escape double quotes for safe embedding in HTML attributes
    const escapedTargetUrl = targetUrl.replace(/"/g, '&quot;');

    // Prevent browser from caching redirection responses
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Force browser to strip the referrer header
    res.setHeader('Referrer-Policy', 'no-referrer');

    // Return a referrer-shield page to strip referrer headers and avoid CDN blocks
    res.setHeader('Content-Type', 'text/html');
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="referrer" content="no-referrer">
          <meta http-equiv="refresh" content="0; url=${escapedTargetUrl}">
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
              margin-bottom: 5px;
            }
            .btn {
              margin-top: 15px;
              padding: 10px 20px;
              background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-size: 12px;
              font-weight: bold;
              box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
              transition: opacity 0.2s;
            }
            .btn:hover {
              opacity: 0.9;
            }
          </style>
        </head>
        <body>
          <div class="loader"></div>
          <p>Redirecting to merchant store...</p>
          <a href="${escapedTargetUrl}" rel="noreferrer" id="redirect-link" class="btn">Click here if not redirected</a>
          
          <script>
            // Programmatically trigger a click on the noreferrer link to strip referrer headers
            setTimeout(function() {
              try {
                var btn = document.getElementById('redirect-link');
                btn.click();
              } catch(e) {
                window.location.replace(${JSON.stringify(targetUrl)});
              }
            }, 50);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('[Affiliate] Redirect error:', error);
    const fallbackUrl = url;
    const escapedFallbackUrl = fallbackUrl.replace(/"/g, '&quot;');
    
    // Prevent browser from caching redirection responses
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Referrer-Policy', 'no-referrer');
    
    res.setHeader('Content-Type', 'text/html');
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="referrer" content="no-referrer">
          <meta http-equiv="refresh" content="0; url=${escapedFallbackUrl}">
          <title>Redirecting...</title>
        </head>
        <body>
          <a href="${escapedFallbackUrl}" rel="noreferrer" id="redirect-link">Click here to proceed</a>
          <script>
            setTimeout(function() {
              try {
                document.getElementById('redirect-link').click();
              } catch(e) {
                window.location.replace(${JSON.stringify(fallbackUrl)});
              }
            }, 50);
          </script>
        </body>
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
