require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const PriceHistory = require('../models/PriceHistory');
const Coupon = require('../models/Coupon');
const Comparison = require('../models/Comparison');
const Alert = require('../models/Alert');
const Store = require('../models/Store');
const Category = require('../models/Category');

const SEED_PRODUCTS = [
  {
    title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    sku: 'AMZ-SONYXM5',
    originalUrl: 'https://www.amazon.in/dp/B09XS7JWHH',
    store: 'amazon',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600',
    currentPrice: 24990,
    originalPrice: 34990,
    discountPercent: 28,
    ratings: 4.6,
    ratingsCount: 1450,
    category: 'Electronics',
    keywords: ['headphones', 'sony', 'audio', 'noise cancelling']
  },
  {
    title: 'OnePlus Nord CE 3 Lite 5G (Chromatic Gray, 128GB)',
    sku: 'AMZ-1PNORD3',
    originalUrl: 'https://www.amazon.in/dp/B0BY8MCQ9S',
    store: 'amazon',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600',
    currentPrice: 17499,
    originalPrice: 19999,
    discountPercent: 12,
    ratings: 4.3,
    ratingsCount: 840,
    category: 'Electronics',
    keywords: ['oneplus', 'nord', 'phone', 'smartphone', 'mobile']
  },
  {
    title: 'OnePlus Bullets Wireless Z2 Earphones (Magico Black)',
    sku: 'AMZ-OPW2',
    originalUrl: 'https://www.amazon.in/dp/B09TVV8428',
    store: 'amazon',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
    currentPrice: 1299,
    originalPrice: 2299,
    discountPercent: 43,
    ratings: 4.2,
    ratingsCount: 2310,
    category: 'Electronics',
    keywords: ['earphones', 'oneplus', 'bullets', 'audio', 'wireless']
  },
  {
    title: 'Noise ColorFit Icon 2 Smartwatch (Bluetooth Calling)',
    sku: 'FPK-NOISE2',
    originalUrl: 'https://www.flipkart.com/noise-colorfit-icon-2-1-8-display-bluetooth-calling-ai-voice-assistant-smartwatch/p/itm5b94e33d0774a',
    store: 'flipkart',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
    currentPrice: 1499,
    originalPrice: 5999,
    discountPercent: 75,
    ratings: 4.3,
    ratingsCount: 1950,
    category: 'Electronics',
    keywords: ['watch', 'smartwatch', 'tracker', 'noise', 'fitness']
  },
  {
    title: 'Apple iPhone 15 (Black, 128GB)',
    sku: 'FPK-IPH15',
    originalUrl: 'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4',
    store: 'flipkart',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=600',
    currentPrice: 59900,
    originalPrice: 69900,
    discountPercent: 14,
    ratings: 4.6,
    ratingsCount: 3120,
    category: 'Electronics',
    keywords: ['iphone', 'apple', 'mobile', 'phone', 'smartphone']
  },
  {
    title: 'Roadster Men Black Solid Round Neck T-shirt',
    sku: 'MYN-ROADSTER',
    originalUrl: 'https://www.myntra.com/roadster-men-tshirts',
    store: 'myntra',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600',
    currentPrice: 399,
    originalPrice: 799,
    discountPercent: 50,
    ratings: 4.1,
    ratingsCount: 180,
    category: 'Apparel',
    keywords: ['shirt', 'tshirt', 'cotton', 'clothing', 'roadster']
  },
  {
    title: 'Puma Men Black Wallet (Sport Edition)',
    sku: 'MYN-PUMAWT',
    originalUrl: 'https://www.myntra.com/puma-wallet',
    store: 'myntra',
    image: 'https://images.unsplash.com/photo-1590564313991-26741b4c4b2b?auto=format&fit=crop&q=80&w=600',
    currentPrice: 799,
    originalPrice: 1499,
    discountPercent: 47,
    ratings: 4.2,
    ratingsCount: 340,
    category: 'Accessories',
    keywords: ['wallet', 'puma', 'accessory', 'leather']
  },
  {
    title: 'boAt Airdopes 131 M Wireless Earbuds',
    sku: 'AJI-BOAT131',
    originalUrl: 'https://www.ajio.com/search/?text=boAt%20Airdopes%20131',
    store: 'ajio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
    currentPrice: 999,
    originalPrice: 2990,
    discountPercent: 67,
    ratings: 4.4,
    ratingsCount: 650,
    category: 'Electronics',
    keywords: ['earbuds', 'boat', 'audio', 'wireless']
  },
  {
    title: 'Nike Air Max SYSTM Lace-Up Sneakers',
    sku: 'AJI-NIKEAM',
    originalUrl: 'https://www.ajio.com/search/?text=Nike%20Air%20Max%20SYSTM',
    store: 'ajio',
    image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=600',
    currentPrice: 7736,
    originalPrice: 8595,
    discountPercent: 10,
    ratings: 4.5,
    ratingsCount: 880,
    category: 'Footwear',
    keywords: ['nike', 'air max', 'sneakers', 'running', 'shoes']
  },
  {
    title: 'Trendz Banarasi Silk Saree (Traditional Edition)',
    sku: 'MSH-SAREE',
    originalUrl: 'https://www.meesho.com/search?q=Trendz%20Banarasi%20Silk%20Saree',
    store: 'meesho',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600',
    currentPrice: 499,
    originalPrice: 1499,
    discountPercent: 67,
    ratings: 4.4,
    ratingsCount: 145,
    category: 'Apparel',
    keywords: ['saree', 'silk', 'apparel', 'traditional', 'women']
  }
];

const SEED_COUPONS = [
  {
    code: 'SAVE20',
    store: 'amazon',
    discountAmount: 20,
    discountType: 'percent',
    description: 'Get 20% discount on all checkout baskets using Amazon Pay ICICI cards.',
    upvotes: 42,
    downvotes: 2
  },
  {
    code: 'FKNEW30',
    store: 'flipkart',
    discountAmount: 300,
    discountType: 'flat',
    description: 'Flat ₹300 discount for newly registered users on shopping above ₹2000.',
    upvotes: 89,
    downvotes: 5
  },
  {
    code: 'AJIODEAL15',
    store: 'ajio',
    discountAmount: 15,
    discountType: 'percent',
    description: 'Special 15% discount for selected footwear catalog.',
    upvotes: 19,
    downvotes: 1
  },
  {
    code: 'MYNTRAGLOW',
    store: 'myntra',
    discountAmount: 10,
    discountType: 'percent',
    description: 'Get an additional 10% discount on apparel products during summer catalog runs.',
    upvotes: 54,
    downvotes: 4
  },
  {
    code: 'MEESHOSHIP',
    store: 'meesho',
    discountAmount: 100,
    discountType: 'flat',
    description: 'Flat ₹100 off on cash-on-delivery orders.',
    upvotes: 7,
    downvotes: 0
  }
];

const runSeeder = async () => {
  try {
    console.log('[Seeder] Initializing connection to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/scoutprice');
    
    // Clear Collections
    console.log('[Seeder] Cleaning existing collections...');
    await User.deleteMany();
    await Product.deleteMany();
    await PriceHistory.deleteMany();
    await Coupon.deleteMany();
    await Comparison.deleteMany();
    await Alert.deleteMany();
    await Store.deleteMany();
    await Category.deleteMany();
    
    // Create Stores
    console.log('[Seeder] Seeding default stores & categories...');
    await Store.create([
      { name: 'amazon', displayName: 'Amazon', logoUrl: '/stores/amazon.png', affiliateTag: 'scoutprice-21' },
      { name: 'flipkart', displayName: 'Flipkart', logoUrl: '/stores/flipkart.png', affiliateTag: 'scoutprice-aff' },
      { name: 'myntra', displayName: 'Myntra', logoUrl: '/stores/myntra.png', affiliateTag: 'scoutprice-myn' },
      { name: 'ajio', displayName: 'Ajio', logoUrl: '/stores/ajio.png', affiliateTag: 'scoutprice-ajio' },
      { name: 'meesho', displayName: 'Meesho', logoUrl: '/stores/meesho.png', affiliateTag: 'scoutprice-meesho' }
    ]);

    // Create Categories
    await Category.create([
      { name: 'electronics', displayName: 'Electronics' },
      { name: 'apparel', displayName: 'Apparel' },
      { name: 'footwear', displayName: 'Footwear' },
      { name: 'accessories', displayName: 'Accessories' }
    ]);
    
    // Create Users
    console.log('[Seeder] Creating admin & test profiles...');
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@scoutprice.com',
      password: 'adminpassword123',
      role: 'admin',
      referralCode: 'SP-ADMIN',
      cashbackBalance: 250.0
    });
    
    const standardUser = await User.create({
      name: 'John Doe',
      email: 'john@gmail.com',
      password: 'password123',
      role: 'user',
      referralCode: 'SP-JOHNDOE',
      cashbackBalance: 50.0
    });
    
    // Create Products & Historical price records
    console.log('[Seeder] Seeding products & historical pricing ticks (30-day buckets)...');
    
    for (const pData of SEED_PRODUCTS) {
      const product = await Product.create(pData);
      
      // Generate 30 days of pricing ticks
      const ticks = [];
      const basePrice = product.currentPrice;
      const original = product.originalPrice;
      
      for (let day = 30; day >= 0; day--) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        
        // Pricing trend showing fluctuations, hitting a peak, then dropping
        let dailyPrice = basePrice;
        if (day > 20) {
          dailyPrice = Math.round(basePrice * 1.15); // peaked initially
        } else if (day > 10) {
          dailyPrice = Math.round(basePrice * 1.05); // intermediate drop
        } else if (day === 3 || day === 4) {
          dailyPrice = Math.round(basePrice * 0.95); // flash sale lowest
        }
        
        ticks.push({
          product: product._id,
          price: dailyPrice,
          timestamp: date
        });
      }
      
      await PriceHistory.insertMany(ticks);
      
      // Add standard alert for test user on sneakers
      if (product.sku === 'AMZ-ULTRA88') {
        await Alert.create({
          user: standardUser._id,
          product: product._id,
          targetPrice: 5000,
          notificationChannel: 'email'
        });
        
        // Link to user's saved list
        standardUser.savedProducts.push(product._id);
        await standardUser.save();
      }
    }
    
    // Create Coupons
    console.log('[Seeder] Seeding validated store coupons...');
    await Coupon.insertMany(SEED_COUPONS);
    
    // Create Comparisons for all seeded products
    console.log('[Seeder] Seeding comparison tables for all catalog products...');
    const allProducts = await Product.find();
    for (const prod of allProducts) {
      const basePrice = prod.currentPrice;
      const cleanTitle = prod.title;
      
      await Comparison.create({
        title: cleanTitle,
        category: prod.category,
        stores: [
          {
            storeName: 'amazon',
            price: prod.store === 'amazon' ? basePrice : Math.round(basePrice * (1 + (Math.random() * 0.04 - 0.01))),
            url: prod.store === 'amazon' ? prod.originalUrl : `https://www.amazon.in/s?k=${encodeURIComponent(cleanTitle)}`,
            deliveryCharges: basePrice > 499 ? 0 : 40,
            rating: 4.5,
            availability: true
          },
          {
            storeName: 'flipkart',
            price: prod.store === 'flipkart' ? basePrice : Math.round(basePrice * (1 + (Math.random() * 0.04 - 0.03))),
            url: prod.store === 'flipkart' ? prod.originalUrl : `https://www.flipkart.com/search?q=${encodeURIComponent(cleanTitle)}`,
            deliveryCharges: basePrice > 500 ? 0 : 40,
            rating: 4.3,
            availability: true
          },
          {
            storeName: 'myntra',
            price: prod.store === 'myntra' ? basePrice : Math.round(basePrice * (1 + (Math.random() * 0.04 - 0.02))),
            url: prod.store === 'myntra' ? prod.originalUrl : `https://www.myntra.com/search?q=${encodeURIComponent(cleanTitle)}`,
            deliveryCharges: 0,
            rating: 4.2,
            availability: true
          },
          {
            storeName: 'ajio',
            price: prod.store === 'ajio' ? basePrice : Math.round(basePrice * (1 + (Math.random() * 0.04 - 0.02))),
            url: prod.store === 'ajio' ? prod.originalUrl : `https://www.ajio.com/search/?text=${encodeURIComponent(cleanTitle)}`,
            deliveryCharges: 59,
            rating: 4.1,
            availability: true
          },
          {
            storeName: 'meesho',
            price: prod.store === 'meesho' ? basePrice : Math.round(basePrice * (1 + (Math.random() * 0.04 - 0.04))),
            url: prod.store === 'meesho' ? prod.originalUrl : `https://www.meesho.com/search?q=${encodeURIComponent(cleanTitle)}`,
            deliveryCharges: basePrice > 299 ? 0 : 45,
            rating: 3.9,
            availability: true
          }
        ]
      });
    }
    
    console.log('[Seeder] Seeding finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder] Execution failed: ${error.message}`);
    process.exit(1);
  }
};

runSeeder();
