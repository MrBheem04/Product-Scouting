require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = async () => {
  try {
    const connect = require('./config/db');
    await connect();
  } catch (e) {
    console.warn('[Server] DB config import failed: ', e.message);
  }
};

const app = express();
const server = http.createServer(app);

// Configure Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Pass socket.io handler to request scope if needed
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Configure Security Middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());

// Prevent browser from caching API responses locally
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Global Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // max 100 requests per IP
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Register REST API Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/affiliate', require('./routes/affiliate'));

// Socket.io real-time connection event
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);
  
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`[Socket.io] User ${userId} joined room`);
  });
  
  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[Error Handler] ${err.stack}`);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

// Connect Database before starting server listener
connectDB().then(() => {
  // Initialize Elasticsearch indexes on startup
  try {
    const searchService = require('./services/searchService');
    searchService.initIndexes().then(() => {
      console.log('[Server] Elasticsearch indexes initialized.');
    }).catch(e => {
      console.warn('[Server] Elasticsearch initialization index error:', e.message);
    });
  } catch (err) {
    console.warn('[Server] Could not load searchService for index startup:', err.message);
  }

  // Load scraper worker background queue listener
  try {
    require('./workers/scraperWorker');
  } catch (err) {
    console.warn('[Server] Could not load scraper worker:', err.message);
  }

  server.listen(PORT, () => {
    console.log(`[Server] ScoutPrice API listening in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});

module.exports = { app, server };
// Nodemon trigger comment to clear in-memory caches.
