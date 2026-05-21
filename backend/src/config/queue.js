const { Queue } = require('bullmq');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let scraperQueue = null;

try {
  // BullMQ connection can accept a configuration object or direct redis client
  scraperQueue = new Queue('scraper-queue', {
    connection: {
      url: REDIS_URL,
      maxRetriesPerRequest: null
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      },
      removeOnComplete: true,
      removeOnFail: 1000
    }
  });
  scraperQueue.on('error', (err) => {
    // Silence connection logs after first warn
  });
  console.log('[Queue] BullMQ scraper-queue configured successfully.');
} catch (e) {
  console.warn('[Queue] Redis connection not available. Queue will simulate inline execution.', e.message);
}

module.exports = {
  scraperQueue
};
