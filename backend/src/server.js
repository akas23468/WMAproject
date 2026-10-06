const express = require('express');
const cors = require('cors');
require('dotenv').config();

const itemRoutes = require('./routes/itemRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'Campus Lost & Found API is healthy and operational',
    timestamp: new Date().toISOString()
  });
});

// Item routes
app.use('/api/items', itemRoutes);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Campus Lost & Found REST API',
    healthCheck: '/api/health',
    itemsEndpoint: '/api/items'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found.`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Campus Lost & Found Backend Server`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Listening on port: ${PORT}`);
  console.log(` Health URL: http://localhost:${PORT}/api/health`);
  console.log(` Items URL:  http://localhost:${PORT}/api/items`);
  console.log(`==================================================`);
});
