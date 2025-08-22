const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const assetRoutes = require('./routes/assets');
const transferRoutes = require('./routes/transfers');
const purchaseRoutes = require('./routes/purchases');
const assignmentRoutes = require('./routes/assignments');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');
const settingsRoutes = require('./routes/settings');
const expenditureRoutes = require('./routes/expenditures');

// Add missing routes
const baseRoutes = require('./routes/bases'); // You need to create this
const assetTypeRoutes = require('./routes/assetTypes'); // You need to create this

// Import database connection
const connectDB = require('./config/database');

// Import logger
const logger = require('./utils/logger');

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS middleware - Configure before other middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'development' 
    ? ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173']
    : process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting - More generous for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // More requests in dev
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests to reduce rate limit impact
  skip: (req, res) => res.statusCode < 400,
});
app.use('/api/', limiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/transfers', transferRoutes);
app.use('/api/v1/purchases', purchaseRoutes);
app.use('/api/v1/assignments', assignmentRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/expenditures', expenditureRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/bases', baseRoutes); 
app.use('/api/v1/asset-types', assetTypeRoutes);
app.use('/api/v1/settings', settingsRoutes);
// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Debug endpoint for development
if (process.env.NODE_ENV === 'development') {
  app.get('/api/v1/debug', (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Debug endpoint',
      headers: req.headers,
      method: req.method,
      url: req.url
    });
  });
}

// Handle undefined routes
app.all('*', (req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  logger.error(`Stack trace: ${err.stack}`);
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'Something went wrong!';
    
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  logger.info(`CORS enabled for: ${JSON.stringify(corsOptions.origin)}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Unhandled Promise Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error(`Stack trace: ${err.stack}`);
  process.exit(1);
});

module.exports = app;