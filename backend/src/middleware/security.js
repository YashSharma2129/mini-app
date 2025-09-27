const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');

// Enhanced rate limiting for different endpoints
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: message || 'Too many requests, please try again later',
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });
};

// Different rate limits for different operations
const authRateLimit = createRateLimit(15 * 60 * 1000, 5, 'Too many authentication attempts, please try again in 15 minutes');
const apiRateLimit = createRateLimit(15 * 60 * 1000, 100, 'API rate limit exceeded');
const tradingRateLimit = createRateLimit(60 * 1000, 10, 'Too many trading requests, please slow down');
const adminRateLimit = createRateLimit(15 * 60 * 1000, 50, 'Admin rate limit exceeded');

// Enhanced security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/[<>]/g, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          obj[key] = sanitize(obj[key]);
        }
      }
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
};

// Enhanced validation middleware
const validateRequest = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      });
    }
    next();
  };
};

// SQL injection prevention
const preventSQLInjection = (req, res, next) => {
  const sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\s+['"]\s*=\s*['"])/i,
    /(\b(OR|AND)\s+['"]\s*LIKE\s*['"])/i,
    /(\b(OR|AND)\s+['"]\s*IN\s*\([^)]*\))/i,
    /(\b(OR|AND)\s+['"]\s*BETWEEN\s+)/i,
    /(\b(OR|AND)\s+['"]\s*IS\s+NULL)/i,
    /(\b(OR|AND)\s+['"]\s*IS\s+NOT\s+NULL)/i,
    /(\b(OR|AND)\s+['"]\s*EXISTS\s*\()/i,
    /(\b(OR|AND)\s+['"]\s*NOT\s+EXISTS\s*\()/i
  ];

  const checkForSQLInjection = (obj) => {
    if (typeof obj === 'string') {
      return sqlInjectionPatterns.some(pattern => pattern.test(obj));
    }
    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(value => checkForSQLInjection(value));
    }
    return false;
  };

  if (checkForSQLInjection(req.body) || checkForSQLInjection(req.query) || checkForSQLInjection(req.params)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected'
    });
  }

  next();
};

// XSS prevention
const preventXSS = (req, res, next) => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
    /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi
  ];

  const checkForXSS = (obj) => {
    if (typeof obj === 'string') {
      return xssPatterns.some(pattern => pattern.test(obj));
    }
    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(value => checkForXSS(value));
    }
    return false;
  };

  if (checkForXSS(req.body) || checkForXSS(req.query) || checkForXSS(req.params)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected'
    });
  }

  next();
};

// Session security
const sessionSecurity = (req, res, next) => {
  // Remove sensitive headers
  delete req.headers['x-forwarded-for'];
  delete req.headers['x-real-ip'];
  
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

// Audit logging middleware
const auditLog = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log sensitive operations
    if (req.method !== 'GET' && req.path.includes('/api/')) {
      console.log(`[AUDIT] ${new Date().toISOString()} - ${req.method} ${req.path} - User: ${req.user?.id || 'anonymous'} - IP: ${req.ip} - Status: ${res.statusCode}`);
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// File upload security
const fileUploadSecurity = (req, res, next) => {
  if (req.file || req.files) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    const files = req.files || [req.file];
    
    for (const file of files) {
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type'
        });
      }
      
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: 'File too large'
        });
      }
    }
  }
  
  next();
};

module.exports = {
  authRateLimit,
  apiRateLimit,
  tradingRateLimit,
  adminRateLimit,
  securityHeaders,
  sanitizeInput,
  validateRequest,
  preventSQLInjection,
  preventXSS,
  sessionSecurity,
  auditLog,
  fileUploadSecurity
};
