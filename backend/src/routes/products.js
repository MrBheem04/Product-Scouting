const express = require('express');
const Product = require('../models/Product');
const PriceHistory = require('../models/PriceHistory');
const Comparison = require('../models/Comparison');
const { scrapeProduct } = require('../services/scraperService');

const router = express.Router();

const searchService = require('../services/searchService');
const matchService = require('../services/matchService');
const { cacheMiddleware } = require('../middleware/cache');
const { getUrlsByTitle, getUrlsForSku } = require('../config/productUrls');

// @desc    Get all catalog products (routed through Elasticsearch with Mongo fallback)
// @route   GET /api/products
router.get('/', cacheMiddleware(60), async (req, res) => {
  const { store, category, search, sort, page, limit } = req.query;
  
  try {
    const results = await searchService.searchProducts({
      query: search,
      category,
      store,
      sort,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 12
    });
    
    res.json({
      success: true,
      total: results.total,
      page: results.page,
      pages: results.pages,
      products: results.products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get instant autocomplete search suggestions
// @route   GET /api/products/suggestions
router.get('/suggestions', cacheMiddleware(300), async (req, res) => {
  const { q } = req.query;
  try {
    const suggestions = await searchService.getSuggestions(q);
    res.json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Unified search and scrape
// @route   POST /api/products/search
router.post('/search', async (req, res) => {
  const { url, store } = req.body;
  if (!url || !store) {
    return res.status(400).json({ success: false, message: 'Please provide product URL and store name' });
  }
  
  try {
    // 1. Perform scraping operation first
    const data = await scrapeProduct(url, store);
    
    // 2. Check if product already exists by url or exact parsed SKU
    const queries = [{ originalUrl: url }];
    if (data.sku && !data.sku.includes(Date.now().toString().slice(0, 4))) {
      queries.push({ sku: data.sku });
    }
    
    let product = await Product.findOne({ $or: queries });
    
    if (!product) {
      // 3. Create new product
      product = new Product({
        title: data.title || 'Product Scouting Item',
        sku: data.sku || `${store.toUpperCase().slice(0, 3)}-${Date.now()}`,
        originalUrl: url,
        store: store || data.store || 'amazon',
        image: data.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
        currentPrice: data.currentPrice || 999,
        originalPrice: data.originalPrice || 1999,
        discountPercent: data.discountPercent || 0,
        ratings: data.ratings || 4.2,
        ratingsCount: data.ratingsCount || 120,
        availability: data.availability ?? true,
        category: data.category || 'Electronics',
        keywords: data.keywords || [store, 'scraped'],
      });
      await product.save();
    } else {
      // 4. Update existing price and details
      product.title = data.title || product.title;
      product.currentPrice = data.currentPrice || product.currentPrice;
      product.originalPrice = data.originalPrice || product.originalPrice;
      product.discountPercent = data.discountPercent ?? product.discountPercent;
      product.ratings = data.ratings || product.ratings;
      product.ratingsCount = data.ratingsCount || product.ratingsCount;
      product.availability = data.availability ?? product.availability;
      if (data.image) product.image = data.image;
      product.originalUrl = url;
      product.lastScrapedAt = new Date();
      await product.save();
    }
    
    // 5. Log price history tick
    await PriceHistory.create({
      product: product._id,
      price: product.currentPrice
    });

    // 6. Update Search Index
    await searchService.indexProduct(product);
    
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single product details with dynamically resolved specifications variants
// @route   GET /api/products/:id
router.get('/:id', cacheMiddleware(60), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Dynamic variant matching using matchService
    const allProducts = await Product.find({ _id: { $ne: product._id }, category: product.category });
    const matchingVariants = allProducts.filter(p => matchService.isProductMatch(product.title, p.title));

    // Map matching variants into standard specs structure (color, size, storage)
    const variants = matchingVariants.map(v => {
      const specs = matchService.extractSpecs(v.title);
      return {
        _id: v._id,
        title: v.title,
        store: v.store,
        price: v.currentPrice,
        sku: v.sku,
        url: v.originalUrl,
        ...specs
      };
    });

    // Extract specs of root product itself
    const rootSpecs = matchService.extractSpecs(product.title);

    res.json({
      success: true,
      product: {
        ...product.toObject(),
        specs: rootSpecs
      },
      variants
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get product price history
// @route   GET /api/products/:id/history
router.get('/:id/history', async (req, res) => {
  try {
    const history = await PriceHistory.find({ product: req.params.id }).sort({ timestamp: 1 });
    res.json({ success: true, count: history.length, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Compare Product cross-platform
// @route   POST /api/products/compare
router.post('/compare', async (req, res) => {
  const { title, category } = req.body;
  try {
    let comparison = await Comparison.findOne({ title: new RegExp(title.substring(0, 15), 'i') });
    if (!comparison) {
      // Try fuzzy search across all seeded comparisons in the DB
      const cleanTitle = title.trim();
      const allComparisons = await Comparison.find();
      const searchWords = cleanTitle.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length >= 2);
      
      if (searchWords.length > 0) {
        let bestComp = null;
        let maxOverlap = 0;
        
        for (const comp of allComparisons) {
          const compWords = comp.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length >= 2);
          let overlap = 0;
          for (const word of searchWords) {
            if (compWords.includes(word)) {
              overlap++;
            }
          }
          const ratio = overlap / Math.min(searchWords.length, compWords.length);
          if (ratio >= 0.5 && ratio > maxOverlap) {
            maxOverlap = ratio;
            bestComp = comp;
          }
        }
        
        if (bestComp) {
          comparison = bestComp;
        }
      }
    }

    let matchedProduct = null;

    if (!comparison) {
      // Look up a matched product in our DB to get a realistic price baseline
      const Product = require('../models/Product');
      const cleanTitle = title.trim();
      
      // Fuzzy lookup matched product in our DB using matchService
      const allProducts = await Product.find();
      matchedProduct = allProducts.find(p => matchService.isProductMatch(cleanTitle, p.title));
      
      const basePrice = matchedProduct ? matchedProduct.currentPrice : (Math.floor(Math.random() * 5000) + 1500);
      const storeUrls = getUrlsByTitle(cleanTitle) || (matchedProduct ? getUrlsForSku(matchedProduct.sku) : null);

      const storesToInclude = [];
      const defaultStoreConfigs = {
        amazon: { rating: 4.4, deliveryCharges: basePrice > 499 ? 0 : 40, priceFactor: 0.0 },
        flipkart: { rating: 4.2, deliveryCharges: basePrice > 500 ? 0 : 40, priceFactor: -0.03 },
        myntra: { rating: 4.3, deliveryCharges: 0, priceFactor: 0.02 },
        ajio: { rating: 4.1, deliveryCharges: 50, priceFactor: -0.02 },
        meesho: { rating: 3.9, deliveryCharges: basePrice > 299 ? 0 : 49, priceFactor: -0.08 }
      };

      for (const [storeName, config] of Object.entries(defaultStoreConfigs)) {
        const hasMappedUrl = storeUrls && storeUrls.urls && storeUrls.urls[storeName];
        if ((matchedProduct && matchedProduct.store === storeName) || hasMappedUrl) {
          let storePrice;
          if (matchedProduct && matchedProduct.store === storeName) {
            storePrice = basePrice;
          } else if (storeUrls && storeUrls.prices && storeUrls.prices[storeName]) {
            storePrice = storeUrls.prices[storeName];
          } else {
            storePrice = Math.round(basePrice * (1 + config.priceFactor));
          }

          storesToInclude.push({
            storeName,
            price: storePrice,
            url: (matchedProduct && matchedProduct.store === storeName) ? matchedProduct.originalUrl : storeUrls.urls[storeName],
            deliveryCharges: config.deliveryCharges,
            rating: config.rating,
            availability: true
          });
        }
      }

      if (storesToInclude.length === 0) {
        if (matchedProduct) {
          storesToInclude.push({
            storeName: matchedProduct.store,
            price: basePrice,
            url: matchedProduct.originalUrl,
            deliveryCharges: basePrice > 499 ? 0 : 40,
            rating: 4.2,
            availability: true
          });
        } else {
          for (const [storeName, config] of Object.entries(defaultStoreConfigs)) {
            storesToInclude.push({
              storeName,
              price: Math.round(basePrice * (1 + config.priceFactor)),
              url: storeName === 'amazon' ? `https://www.amazon.in/s?k=${encodeURIComponent(cleanTitle)}`
                 : storeName === 'flipkart' ? `https://www.flipkart.com/search?q=${encodeURIComponent(cleanTitle)}`
                 : storeName === 'myntra' ? `https://www.myntra.com/search?q=${encodeURIComponent(cleanTitle)}`
                 : storeName === 'ajio' ? `https://www.ajio.com/search/?text=${encodeURIComponent(cleanTitle)}`
                 : `https://www.meesho.com/search?q=${encodeURIComponent(cleanTitle)}`,
              deliveryCharges: config.deliveryCharges,
              rating: config.rating,
              availability: true
            });
          }
        }
      }

      comparison = await Comparison.create({
        title: cleanTitle,
        category: category || (matchedProduct ? matchedProduct.category : 'General'),
        stores: storesToInclude
      });
    } else {
      // If comparison was found, find the corresponding product context in our DB
      const Product = require('../models/Product');
      matchedProduct = await Product.findOne({ title: comparison.title });
    }

    res.json({
      success: true,
      comparison: {
        ...comparison.toObject(),
        productId: matchedProduct ? matchedProduct._id : comparison._id
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
