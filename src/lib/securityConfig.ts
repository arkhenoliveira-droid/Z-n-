import { securityConfig, isProduction, isDevelopment } from './env'

export const securityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': isProduction
    ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https: wss:; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';"
    : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https: wss:; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';",

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // XSS Protection
  'X-XSS-Protection': '1; mode=block',

  // Referrer Policy
  'Referrer-Policy': isProduction ? 'strict-origin-when-cross-origin' : 'strict-origin-when-cross-origin',

  // Permissions Policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',

  // HSTS (HTTP Strict Transport Security)
  'Strict-Transport-Security': isProduction ? 'max-age=31536000; includeSubDomains; preload' : '',

  // Remove server info
  'X-Powered-By': '',
}

export const corsOptions = {
  origin: isDevelopment
    ? ['http://localhost:3000', 'http://localhost:3001']
    : [securityConfig.cors.origin].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400, // 24 hours
}

export const rateLimitConfig = {
  // General API rate limiting
  api: {
    windowMs: securityConfig.rateLimit.windowMs,
    max: securityConfig.rateLimit.maxRequests,
    message: 'Too many API requests, please try again later.',
  },

  // Authentication rate limiting (more restrictive)
  auth: {
    windowMs: 900000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many authentication attempts, please try again later.',
  },

  // Form submission rate limiting
  form: {
    windowMs: 300000, // 5 minutes
    max: 10, // 10 submissions per window
    message: 'Too many form submissions, please try again later.',
  },

  // Webhook rate limiting
  webhook: {
    windowMs: 60000, // 1 minute
    max: 30, // 30 webhooks per minute
    message: 'Too many webhook requests, please try again later.',
  },
}

export const sessionConfig = {
  // Session security settings
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    maxAge: 86400000, // 24 hours
  },

  // Session validation
  validate: {
    // Check session expiration
    checkExpiration: true,

    // Check IP address binding
    checkIpAddress: isProduction,

    // Check user agent binding
    checkUserAgent: isProduction,

    // Check session activity
    checkActivity: true,
  },
}

export const inputValidationConfig = {
  // Input validation rules
  maxStringLength: 10000,
  maxArrayLength: 1000,
  maxObjectDepth: 10,

  // Allowed HTML tags (for sanitization)
  allowedHtmlTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'strong', 'em', 'i', 'b', 'u',
    'ul', 'ol', 'li',
    'blockquote', 'code', 'pre',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td'
  ],

  // Allowed attributes
  allowedAttributes: {
    a: ['href', 'title', 'target'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    table: ['border', 'cellpadding', 'cellspacing'],
    td: ['colspan', 'rowspan', 'align'],
    th: ['colspan', 'rowspan', 'align'],
  },

  // Blocked patterns (for SQL injection, XSS, etc.)
  blockedPatterns: [
    /<script[^>]*>.*?<\/script>/gi, // Script tags
    /javascript:/gi, // JavaScript protocol
    /on\w+\s*=/gi, // Event handlers
    /eval\s*\(/gi, // eval() function
    /document\./gi, // Document object
    /window\./gi, // Window object
    /union\s+select/gi, // SQL injection
    /drop\s+table/gi, // SQL injection
    /exec\s*\(/gi, // Command execution
  ],
}

export const loggingConfig = {
  // Security event logging
  securityEvents: {
    authenticationFailure: true,
    authorizationFailure: true,
    rateLimitExceeded: true,
    suspiciousInput: true,
    sqlInjectionAttempt: true,
    xssAttempt: true,
    csrfAttempt: true,
  },

  // Request logging
  requests: {
    logAll: securityConfig.logging.enableRequestLogging,
    logSensitive: false, // Don't log sensitive data
    includeHeaders: isDevelopment,
    includeBody: false,
    maxBodyLength: 1000,
  },

  // Error logging
  errors: {
    logAll: true,
    includeStackTrace: isDevelopment,
    includeRequestDetails: isDevelopment,
  },
}

export const blockchainSecurityConfig = {
  // Web3 security settings
  transactionValidation: {
    validateGasPrice: true,
    validateNonce: true,
    validateBalance: true,
    maxGasPrice: '1000000000000', // 1000 gwei
  },

  // Contract interaction security
  contractInteraction: {
    allowedContracts: [], // Whitelist of allowed contract addresses
    maxValue: '1000000000000000000000', // 1000 ETH
    requireConfirmation: true,
  },

  // Wallet security
  walletSecurity: {
    requireSignature: true,
    validateMessageFormat: true,
    expirationTime: 300000, // 5 minutes
  },
}

// Utility function to apply security headers
export function applySecurityHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers)

  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) {
      newHeaders.set(key, value)
    }
  })

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  })
}

// Utility function to validate environment security
export function validateEnvironmentSecurity(): {
  isValid: boolean
  issues: string[]
} {
  const issues: string[] = []

  // Check JWT secrets
  if (!securityConfig.jwt.secret || securityConfig.jwt.secret.length < 32) {
    issues.push('JWT_SECRET must be at least 32 characters long')
  }

  if (!securityConfig.jwt.refreshSecret || securityConfig.jwt.refreshSecret.length < 32) {
    issues.push('JWT_REFRESH_SECRET must be at least 32 characters long')
  }

  // Check CORS origin in production
  if (isProduction && !securityConfig.cors.origin) {
    issues.push('CORS_ORIGIN must be set in production')
  }

  // Check database URL in production
  if (isProduction && securityConfig.jwt.secret === 'your-super-secret-jwt-key-here-minimum-32-characters') {
    issues.push('Default JWT secret is being used in production')
  }

  return {
    isValid: issues.length === 0,
    issues,
  }
}