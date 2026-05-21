const { Worker } = require('bullmq');
const scraperService = require('../services/scraperService');
const Product = require('../models/Product');
const PriceHistory = require('../models/PriceHistory');
const Alert = require('../models/Alert');
const notificationService = require('../services/notificationService');
const searchService = require('../services/searchService');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let worker = null;

try {
  worker = new Worker('scraper-queue', async (job) => {
    const { productId, url, store } = job.data;
    console.log(`[Worker] Processing scraping job ${job.id} for product ${productId} (${store})...`);
    
    // Scrape live price quotes
    const scrapedData = await scraperService.scrapeProduct(url, store);
    
    // Find product in DB
    const product = await Product.findById(productId);
    if (!product) {
      console.warn(`[Worker] Product ${productId} not found in database.`);
      return;
    }

    const previousPrice = product.currentPrice;
    const newPrice = scrapedData.currentPrice;
    
    // Update product pricing details
    product.currentPrice = newPrice;
    product.originalPrice = scrapedData.originalPrice || product.originalPrice;
    product.discountPercent = scrapedData.discountPercent || product.discountPercent;
    product.availability = scrapedData.availability !== undefined ? scrapedData.availability : product.availability;
    product.lastScrapedAt = new Date();
    await product.save();

    // Index update in search engine
    await searchService.indexProduct(product);

    // Save history tick if price changed
    if (previousPrice !== newPrice) {
      console.log(`[Worker] Price change detected for ${product.title}: ₹${previousPrice} -> ₹${newPrice}`);
      await PriceHistory.create({
        product: product._id,
        price: newPrice,
        timestamp: new Date()
      });

      // Check active alerts for price drop
      if (newPrice < previousPrice) {
        const alerts = await Alert.find({ product: product._id, active: true });
        for (const alert of alerts) {
          if (newPrice <= alert.targetPrice) {
            console.log(`[Worker] Alert triggered for user ${alert.user} on product ${product.title}! Target: ₹${alert.targetPrice}, Current: ₹${newPrice}`);
            
            // Dispatch notification
            await notificationService.sendPriceAlert(alert, product, newPrice);
            
            // Mark alert as inactive or trigger count update
            alert.active = false;
            await alert.save();
          }
        }
      }
    }

    return { success: true, updatedPrice: newPrice };
  }, {
    connection: {
      url: REDIS_URL,
      maxRetriesPerRequest: null
    },
    concurrency: 2
  });

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job.id} failed with error:`, err.message);
  });

  worker.on('error', (err) => {
    // Silence connection logs
  });

  console.log('[Worker] BullMQ Scraper Worker started.');
} catch (e) {
  console.warn('[Worker] Could not connect worker to Redis. Running in simulated fallback mode.', e.message);
}

module.exports = worker;
