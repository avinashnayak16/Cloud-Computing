const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use(cors());
app.use(express.json());
app.use(limiter);

// Service URLs
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  user: process.env.USER_SERVICE_URL || 'http://localhost:3002'
};

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check for gateway
app.get('/health', (req, res) => {
  res.json({ 
    service: 'api-gateway', 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: services
  });
});

// Combined health check for all services
app.get('/health/all', async (req, res) => {
  const axios = require('axios');
  const healthChecks = {};
  
  for (const [name, url] of Object.entries(services)) {
    try {
      const response = await axios.get(`${url}/health`, { timeout: 5000 });
      healthChecks[name] = { status: 'healthy', ...response.data };
    } catch (error) {
      healthChecks[name] = { status: 'unhealthy', error: error.message };
    }
  }
  
  res.json({
    gateway: { status: 'healthy', timestamp: new Date().toISOString() },
    services: healthChecks
  });
});

// Proxy configuration for Auth Service
app.use('/api/auth', createProxyMiddleware({
  target: services.auth,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '', // remove /api/auth from the path
  },
  onError: (err, req, res) => {
    console.error('Auth Service Proxy Error:', err.message);
    res.status(503).json({ error: 'Auth service unavailable' });
  }
}));

// Proxy configuration for User Service
app.use('/api/users', createProxyMiddleware({
  target: services.user,
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/users', // rewrite path
  },
  onError: (err, req, res) => {
    console.error('User Service Proxy Error:', err.message);
    res.status(503).json({ error: 'User service unavailable' });
  }
}));

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Gateway Error:', err);
  res.status(500).json({ error: 'Internal gateway error' });
});

app.listen(PORT, () => {
  console.log(`🌐 API Gateway running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- POST /api/auth/login');
  console.log('- POST /api/auth/validate');
  console.log('- GET /api/users');
  console.log('- GET /health');
  console.log('- GET /health/all');
});