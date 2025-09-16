const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { requireAuth } = require('./middleware/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS Configuration for Railway and localhost
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Define allowed origins
    const allowedOrigins = [
      'http://localhost:3000', // Local development frontend
      'http://localhost:3001', // Alternative local port
      'https://localhost:3000', // HTTPS local development
      'https://localhost:3001', // HTTPS alternative local port
    ];

    // Add Railway domains dynamically - this allows any Railway.app domain
    if (origin.includes('.railway.app')) {
      return callback(null, true);
    }

    // Add any custom domains (production)
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }

    // For production environments, be more permissive to avoid issues
    if (process.env.NODE_ENV === 'production') {
      return callback(null, true);
    }

    // Check if origin is allowed for development
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600, // Cache preflight for 10 minutes
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/inventoryapp';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Routes
const leadsRoutes = require('./routes/leads');
const quotationsRoutes = require('./routes/quotations');
const purchaseOrderRoutes = require('./routes/purchaseOrders');
const do1Routes = require('./routes/do1');
const do2Routes = require('./routes/do2');
const inventoryRoutes = require('./routes/inventory');
const tallyRoutes = require('./routes/tally');
const invoiceRoutes = require('./routes/invoice');
const invoicesRoutes = require('./routes/invoices');
const smsRoutes = require('./routes/sms');
const reportsRoutes = require('./routes/reports');

// API routes (temporarily without authentication)
app.use('/api/leads', leadsRoutes);
app.use('/api/quotations', quotationsRoutes);
app.use('/api/pos', purchaseOrderRoutes);
app.use('/api/do1', do1Routes);
app.use('/api/do2', do2Routes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/tally', tallyRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/reports', reportsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Inventory App API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      leads: '/api/leads',
      quotations: '/api/quotations',
      purchaseOrders: '/api/pos',
      do1: '/api/do1',
      do2: '/api/do2',
      inventory: '/api/inventory',
      tally: '/api/tally',
      invoice: '/api/invoice',
      invoices: '/api/invoices',
      sms: '/api/sms',
      reports: '/api/reports',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 Leads API: http://localhost:${PORT}/api/leads`);
  console.log(`📋 Quotations API: http://localhost:${PORT}/api/quotations`);
  console.log(`📄 Purchase Orders API: http://localhost:${PORT}/api/pos`);
  console.log(`🚚 DO1 API: http://localhost:${PORT}/api/do1`);
  console.log(`📋 DO2 API: http://localhost:${PORT}/api/do2`);
  console.log(`📦 Inventory API: http://localhost:${PORT}/api/inventory`);
  console.log(`🧾 Tally API: http://localhost:${PORT}/api/tally`);
  console.log(`📄 Invoice API: http://localhost:${PORT}/api/invoice`);
  console.log(`📋 Invoices API: http://localhost:${PORT}/api/invoices`);
  console.log(`📱 SMS API: http://localhost:${PORT}/api/sms`);
  console.log(`📊 Reports API: http://localhost:${PORT}/api/reports`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});
