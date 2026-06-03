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
const { getUrlsForSku } = require('./productUrls');

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
    originalUrl: 'https://www.flipkart.com/noise-colorfit-icon-2-1-8-display-bluetooth-calling-ai-voice-assistance-smartwatch/p/itmfa97e2fcabed9',
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
    originalUrl: 'https://www.myntra.com/tshirts/roadster/the-roadster-lifestyle-co-men-black-typography-printed-pure-cotton-t-shirt/13620730/buy',
    store: 'myntra',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600',
    currentPrice: 251,
    originalPrice: 799,
    discountPercent: 69,
    ratings: 4.1,
    ratingsCount: 180,
    category: 'Apparel',
    keywords: ['shirt', 'tshirt', 'cotton', 'clothing', 'roadster']
  },
  {
    title: 'Puma Men Black Wallet (Sport Edition)',
    sku: 'MYN-PUMAWT',
    originalUrl: 'https://www.myntra.com/wallets/puma/puma-leather-plain-bi-fold-wallet/25815670/buy',
    store: 'myntra',
    image: 'https://images.unsplash.com/photo-1627124709933-f7759b8ebabd?auto=format&fit=crop&q=80&w=600',
    currentPrice: 1399,
    originalPrice: 1999,
    discountPercent: 30,
    ratings: 4.2,
    ratingsCount: 340,
    category: 'Accessories',
    keywords: ['wallet', 'puma', 'accessory', 'leather']
  },
  {
    title: 'boAt Airdopes 131 M Wireless Earbuds',
    sku: 'AMZ-BOAT131',
    originalUrl: 'https://www.amazon.in/Airdopes-131-Technology-Bluetooth-Immersive/dp/B088FKCD4J?th=1',
    store: 'amazon',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
    currentPrice: 899,
    originalPrice: 2990,
    discountPercent: 70,
    ratings: 4.4,
    ratingsCount: 650,
    category: 'Electronics',
    keywords: ['earbuds', 'boat', 'audio', 'wireless']
  },
  {
    title: 'Nike Air Max SYSTM Lace-Up Sneakers',
    sku: 'AJI-NIKEAM',
    originalUrl: 'https://www.ajio.com/nike-sb-heritage-vulc-lace-up-sneakers/p/469812812_gray?',
    store: 'ajio',
    image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=600',
    currentPrice: 2748,
    originalPrice: 8595,
    discountPercent: 68,
    ratings: 4.5,
    ratingsCount: 880,
    category: 'Footwear',
    keywords: ['nike', 'air max', 'sneakers', 'running', 'shoes']
  },
  {
    title: 'Trendz Banarasi Silk Saree (Traditional Edition)',
    sku: 'MSH-SAREE',
    originalUrl: 'https://www.meesho.com/banarasi-silk-saree/p/etrjb2',
    store: 'meesho',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600',
    currentPrice: 400,
    originalPrice: 1499,
    discountPercent: 73,
    ratings: 4.4,
    ratingsCount: 145,
    category: 'Apparel',
    keywords: ['saree', 'silk', 'apparel', 'traditional', 'women']
  },
  {
    title: 'Samsung Galaxy S24 Ultra (Titanium Gray, 256GB)',
    sku: 'AMZ-S24ULTRA',
    originalUrl: 'https://www.amazon.in/Samsung-Galaxy-Smartphone-Titanium-Storage/dp/B0CS5XW6TN',
    store: 'amazon',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=600',
    currentPrice: 129999,
    originalPrice: 134999,
    discountPercent: 3,
    ratings: 4.7,
    ratingsCount: 450,
    category: 'Electronics',
    keywords: ['samsung', 'galaxy', 's24', 'phone', 'smartphone', 'mobile']
  },
  {
    title: 'Apple 2024 MacBook Air M3 Laptop (8GB RAM, 256GB SSD)',
    sku: 'FPK-MBAIRM3',
    originalUrl: 'https://www.flipkart.com/apple-macbook-air-m3-8-gb-256-gb-ssd-macos-sonoma-mryr3hn-a/p/itmab284bf2e06ed',
    store: 'flipkart',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600',
    currentPrice: 131990,
    originalPrice: 139900,
    discountPercent: 6,
    ratings: 4.8,
    ratingsCount: 320,
    category: 'Electronics',
    keywords: ['macbook', 'apple', 'laptop', 'm3', 'notebook']
  },
  {
    title: 'Levi\'s Men\'s 511 Slim Fit Mild Wash Jeans',
    sku: 'MYN-LEVIS511',
    originalUrl: 'https://www.myntra.com/jeans/levis/levis-men-527-slim-bootcut-stretchable-light-fade-jeans/38810791/buy',
    store: 'myntra',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=600',
    currentPrice: 1849,
    originalPrice: 4199,
    discountPercent: 56,
    ratings: 4.2,
    ratingsCount: 920,
    category: 'Apparel',
    keywords: ['jeans', 'levis', 'denim', 'clothing', 'apparel', 'pants']
  },
  {
    title: 'Adidas Originals Men\'s Superstar Sneakers (White/Black)',
    sku: 'AJI-ADISUPER',
    originalUrl: 'https://www.ajio.com/adidas-originals-men-drop-step-low-2-0-lace-up-sneakers/p/469818951_white',
    store: 'ajio',
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=600',
    currentPrice: 8599,
    originalPrice: 9999,
    discountPercent: 14,
    ratings: 4.5,
    ratingsCount: 510,
    category: 'Footwear',
    keywords: ['adidas', 'superstar', 'sneakers', 'shoes', 'footwear']
  },
  {
    title: 'Fastrack Men\'s Polarized Rectangular Sunglasses',
    sku: 'MYN-FSTRKSG',
    originalUrl: 'https://www.myntra.com/sunglasses/fastrack/fastrack-men-uv-protected-lens-rectangle-sunglasses---p448br7v-brown/40469663/buy',
    store: 'myntra',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=600',
    currentPrice: 849,
    originalPrice: 999,
    discountPercent: 15,
    ratings: 4.0,
    ratingsCount: 220,
    category: 'Accessories',
    keywords: ['sunglasses', 'fastrack', 'shades', 'accessories']
  },
  {
    title: 'Kore DM 20kg Combo Home Gym Dumbbell Set',
    sku: 'AMZ-KOREDB',
    originalUrl: 'https://www.amazon.in/gp/aw/d/B0BDS4LHN5/?_encoding=UTF8&pd_rd_plhdr=t&aaxitk=dbd03c42f34f47591826d1e38ffbf7e1&hsa_cr_id=0&qid=1780110011&sr=1-1-e0fa1fdd-d857-4087-adda-5bd576b25987&aref=yrPY8wkiJM&ref_=sbx_s_sparkle_sbtcd_asin_0_img&pd_rd_w=3kKSh&content-id=amzn1.sym.9269eab1-ae85-443b-9ec2-b2fa4ebaad05%3Aamzn1.sym.9269eab1-ae85-443b-9ec2-b2fa4ebaad05&pf_rd_p=9269eab1-ae85-443b-9ec2-b2fa4ebaad05&pf_rd_r=MJ0MR6FVJ3ZQ1PB5D2GA&pd_rd_wg=pGziT&pd_rd_r=91b0a208-dfe2-4352-b0a8-64d874b18e35&th=1',
    store: 'amazon',
    image: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?auto=format&fit=crop&q=80&w=600',
    currentPrice: 1929,
    originalPrice: 2990,
    discountPercent: 35,
    ratings: 4.0,
    ratingsCount: 4320,
    category: 'Fitness',
    keywords: ['dumbbells', 'gym', 'fitness', 'weights', 'kore']
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
      { name: 'accessories', displayName: 'Accessories' },
      { name: 'fitness', displayName: 'Fitness' }
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
      const storeUrls = getUrlsForSku(prod.sku);
      
      const storesToInclude = [];
      const defaultStoreConfigs = {
        amazon: { rating: 4.5, deliveryCharges: basePrice > 499 ? 0 : 40, priceFactor: -0.01 },
        flipkart: { rating: 4.3, deliveryCharges: basePrice > 500 ? 0 : 40, priceFactor: -0.03 },
        myntra: { rating: 4.2, deliveryCharges: 0, priceFactor: -0.02 },
        ajio: { rating: 4.1, deliveryCharges: 59, priceFactor: -0.02 },
        meesho: { rating: 3.9, deliveryCharges: basePrice > 299 ? 0 : 45, priceFactor: -0.04 }
      };

      for (const [storeName, config] of Object.entries(defaultStoreConfigs)) {
        const hasMappedUrl = storeUrls && storeUrls.urls && storeUrls.urls[storeName];
        if (prod.store === storeName || hasMappedUrl) {
          let storePrice;
          if (prod.store === storeName) {
            storePrice = basePrice;
          } else if (storeUrls && storeUrls.prices && storeUrls.prices[storeName]) {
            storePrice = storeUrls.prices[storeName];
          } else {
            storePrice = Math.round(basePrice * (1 + (Math.random() * 0.04 + config.priceFactor)));
          }

          storesToInclude.push({
            storeName,
            price: storePrice,
            url: prod.store === storeName ? prod.originalUrl : storeUrls.urls[storeName],
            deliveryCharges: config.deliveryCharges,
            rating: config.rating,
            availability: true
          });
        }
      }

      await Comparison.create({
        title: cleanTitle,
        category: prod.category,
        stores: storesToInclude
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
