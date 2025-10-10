/**
 * Rate Limiting Middleware for AEGIS Phase 0
 * 
 * SECURITY PURPOSE: Prevent abuse and brute force attacks on sensitive endpoints.
 * Different endpoints have different risk levels and require different limits.
 */

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for availability check endpoint
 * Moderate limit to prevent enumeration attacks
 */
const availabilityLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 10, // 10 requests per minute
  message: {
    error: 'Too many availability checks. Please try again in a minute.'
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  handler: (req, res) => {
    console.log(`🚨 [Rate Limit] Availability check blocked for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many availability checks. Please try again in a minute.'
    });
  }
});

/**
 * Rate limiter for account creation endpoint
 * Strict limit due to high security importance
 */
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 500, // 5 account creations per hour
  message: {
    error: 'Account creation limit exceeded. Please try again in an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`🚨 [Rate Limit] Account creation blocked for IP: ${req.ip}, Wallet: ${req.body?.walletAddress || 'unknown'}`);
    res.status(429).json({
      error: 'Account creation limit exceeded. Please try again in an hour.'
    });
  },
  // Skip counting for certain conditions (optional)
  skip: (req) => {
    // Skip rate limiting for specific test conditions if needed
    return false;
  }
});

/**
 * Rate limiter for account verification endpoint
 * Moderate limit as this is used for login
 */
const verifyLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 20, // 20 requests per minute
  message: {
    error: 'Too many verification requests. Please try again in a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`🚨 [Rate Limit] Verification blocked for IP: ${req.ip}, Wallet: ${req.body?.walletAddress || 'unknown'}`);
    res.status(429).json({
      error: 'Too many verification requests. Please try again in a minute.'
    });
  }
});

/**
 * Rate limiter for recovery endpoint
 * Very strict limit due to high security risk
 */
const recoveryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // 5 recovery attempts per hour
  message: {
    error: 'Recovery attempt limit exceeded. Please try again in an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`🚨 [Rate Limit] Recovery blocked for IP: ${req.ip}, Wallet: ${req.body?.walletAddress || 'unknown'}`);
    res.status(429).json({
      error: 'Recovery attempt limit exceeded. Please try again in an hour.'
    });
  },
  // More sophisticated key generation for recovery (per wallet + IP)
  keyGenerator: (req) => {
    const walletAddress = req.body?.walletAddress || 'unknown';
    return `recovery_${req.ip}_${walletAddress.toLowerCase()}`;
  }
});

/**
 * Rate limiter for shard update endpoint
 * Moderate limit as this is used after successful recovery
 */
const updateShardsLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minute window
  max: 10, // 10 updates per 10 minutes
  message: {
    error: 'Too many shard update requests. Please try again in 10 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`🚨 [Rate Limit] Shard update blocked for IP: ${req.ip}, Wallet: ${req.body?.walletAddress || 'unknown'}`);
    res.status(429).json({
      error: 'Too many shard update requests. Please try again in 10 minutes.'
    });
  }
});

/**
 * General API rate limiter (fallback for all endpoints)
 * Applied to all API routes as a base protection
 */
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 100, // 100 requests per minute (generous for normal use)
  message: {
    error: 'Too many requests. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`🚨 [Rate Limit] General limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json({
      error: 'Too many requests. Please slow down.'
    });
  }
});

/**
 * Health check rate limiter (very generous)
 * For monitoring and health checks
 */
const healthCheckLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 60, // 60 requests per minute
  message: {
    error: 'Health check rate limit exceeded.'
  },
  standardHeaders: false,
  legacyHeaders: false
});

module.exports = {
  availabilityLimiter,
  createAccountLimiter,
  verifyLimiter,
  recoveryLimiter,
  updateShardsLimiter,
  generalLimiter,
  healthCheckLimiter
};