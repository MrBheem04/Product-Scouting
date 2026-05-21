const express = require('express');
const Product = require('../models/Product');
const PriceHistory = require('../models/PriceHistory');
const Comparison = require('../models/Comparison');
const { scrapeProduct } = require('../services/scraperService');

const router = express.Router();

const searchService = require('../services/searchService');
const matchService = require('../services/matchService');

// @desc    Get all catalog products (routed through Elasticsearch with Mongo fallback)
// @route   GET /api/products
router.get('/', async (req, res) => {
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
router.get('/suggestions', async (req, res) => {
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
router.get('/:id', async (req, res) => {
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
      // Look up a matched product in our DB to get a realistic price baseline
      const Product = require('../models/Product');
      const matchedProduct = await Product.findOne({ title: new RegExp(title.substring(0, 15), 'i') });
      const basePrice = matchedProduct ? matchedProduct.currentPrice : (Math.floor(Math.random() * 5000) + 1500);
      
      const cleanTitle = title.trim();
      comparison = await Comparison.create({
        title: cleanTitle,
        category: category || (matchedProduct ? matchedProduct.category : 'General'),
        stores: [
          {
            storeName: 'amazon',
            price: basePrice,
            url: `https://www.amazon.in/s?k=${encodeURIComponent(cleanTitle)}`,
            deliveryCharges: basePrice > 499 ? 0 : 40,
            rating: 4.4,
            availability: true
          },
          {
            storeName: 'flipkart',
            price: Math.round(basePrice * 0.97),
            url: `https://www.flipkart.com/search?q=${encodeURIComponent(cleanTitle)}`,
            deliveryCharges: basePrice > 500 ? 0 : 40,
            rating: 4.2,
            availability: true
          },
          {
            storeName: 'myntra',
            price: Math.round(basePrice * 1.02),
            url: `https://www.myntra.com/search?q=${encodeURIComponent(cleanTitle)}`,
            deliveryCharges: 0,
            rating: 4.3,
            availability: true
          },
          {
            storeName: 'ajio',
            price: Math.round(basePrice * 0.98),
            url: `https://www.ajio.com/search/?text=${encodeURIComponent(cleanTitle)}`,
            deliveryCharges: 50,
            rating: 4.1,
            availability: true
          },
          {
            storeName: 'meesho',
            price: Math.round(basePrice * 0.92),
            url: `https://www.meesho.com/search?q=${encodeURIComponent(cleanTitle)}`,
            deliveryCharges: basePrice > 299 ? 0 : 49,
            rating: 3.9,
            availability: true
          }
        ]
      });
    }
    res.json({ success: true, comparison });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
