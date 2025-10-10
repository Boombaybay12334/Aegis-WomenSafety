/**
 * AEGIS Phase 0 Backend Server
 * 
 * Anonymous account system with Shamir's Secret Sharing for domestic abuse victims.
 * Implements zero-knowledge architecture where backend cannot decrypt user data.
 * 
 * SECURITY PRINCIPLES:
 * - Backend NEVER receives passphrases or Shard A
 * - Only stores references to externally stored Shard B and C
 * - Signature verification required for sensitive operations
 * - Rate limiting prevents abuse attacks
 * - All sensitive operations are logged for monitoring
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDatabase } = require('./config/database');
const { generalLimiter, healthCheckLimiter } = require('./middleware/rateLimiter');
const accountRoutes = require('./routes/account');
const User = require('./models/User');
const mockKMS = require('./services/mockKMS');
const mockNGO = require('./services/mockNGO');

const app = express();
const PORT = process.env.PORT || 5000;

// Display startup banner
console.log('');
console.log('🛡️  ═══════════════════════════════════════════════════');
console.log('🛡️  AEGIS Phase 0 Backend Server Starting...');
console.log('🛡️  Anonymous Account System with Shamir\'s Secret Sharing');
console.log('🛡️  ═══════════════════════════════════════════════════');
console.log('');

// Security middleware - Applied FIRST for all requests
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration - Allow frontend access
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`📝 [${timestamp}] ${method} ${url} from ${ip}`);
  next();
});

// Global rate limiting
app.use('/api', generalLimiter);

// Health check endpoint (for monitoring)
app.get('/health', healthCheckLimiter, async (req, res) => {
  try {
    // Check database connection
    const dbStatus = await checkDatabaseHealth();
    
    // Check mock services
    const kmsStatus = mockKMS.getStatus();
    const ngoStatus = mockNGO.getStatus();
    
    // Get basic statistics (anonymized)
    const stats = await User.getSecurityStats();
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      database: dbStatus,
      services: {
        kms: {
          enabled: kmsStatus.enabled,
          type: kmsStatus.serviceType,
          totalShards: kmsStatus.totalShards
        },
        ngo: {
          enabled: ngoStatus.enabled,
          type: ngoStatus.serviceType,
          totalShards: ngoStatus.totalShards
        }
      },
      statistics: stats
    };
    
    res.json(healthData);
  } catch (error) {
    console.error('🚨 [Health] Health check failed:', error.message);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable'
    });
  }
});

// API routes
app.use('/api/v1/account', accountRoutes);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AEGIS Phase 0 Backend API',
    version: '1.0.0',
    documentation: '/api/v1/account',
    health: '/health',
    security: 'Zero-knowledge architecture with Shamir\'s Secret Sharing',
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('💥 [Server] Unhandled error:', error.message);
  console.error('📍 [Server] Error stack:', error.stack);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    error: 'Internal server error',
    ...(isDevelopment && { details: error.message })
  });
});

// Helper function to check database health
async function checkDatabaseHealth() {
  try {
    const mongoose = require('mongoose');
    const state = mongoose.connection.readyState;
    
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return {
      status: states[state] || 'unknown',
      readyState: state,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
}

// Start server function
async function startServer() {
  try {
    // Connect to database first
    await connectDatabase();
    
    // Start the server
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 ═══════════════════════════════════════════════════');
      console.log('🚀 AEGIS Backend Server Running Successfully!');
      console.log('🚀 ═══════════════════════════════════════════════════');
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`🗄️  Database: ${process.env.MONGODB_URI}`);
      console.log(`🔐 Mock KMS: ${mockKMS.getStatus().enabled ? 'Enabled' : 'Disabled'}`);
      console.log(`🏥 Mock NGO: ${mockNGO.getStatus().enabled ? 'Enabled' : 'Disabled'}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/health`);
      console.log(`🛡️  Security: Zero-knowledge architecture active`);
      console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('🚀 ═══════════════════════════════════════════════════');
      console.log('');
      console.log('📋 Available Endpoints:');
      console.log('   POST /api/v1/account/check-availability');
      console.log('   POST /api/v1/account/create');
      console.log('   POST /api/v1/account/verify');
      console.log('   POST /api/v1/account/recover-shard');
      console.log('   POST /api/v1/account/update-shards');
      console.log('   GET  /health');
      console.log('');
      console.log('🔒 Security Features Active:');
      console.log('   ✅ Rate limiting on all endpoints');
      console.log('   ✅ Signature verification for recovery');
      console.log('   ✅ Input validation and sanitization');
      console.log('   ✅ Helmet security headers');
      console.log('   ✅ CORS protection');
      console.log('   ✅ Zero-knowledge architecture');
      console.log('');
      console.log('⚠️  IMPORTANT: Backend NEVER receives passphrases or Shard A!');
      console.log('');
    });
  } catch (error) {
    console.error('💥 [Server] Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 [Server] SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 [Server] SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;