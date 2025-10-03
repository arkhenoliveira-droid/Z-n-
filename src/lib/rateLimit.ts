import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface RateLimitOptions {
  windowMs?: number // Time window in milliseconds (default: 15 minutes)
  maxRequests?: number // Maximum requests per window (default: 100)
  keyGenerator?: (req: NextRequest) => string // Custom key generator
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
  onLimitReached?: (req: NextRequest, key: string) => void // Callback when limit is reached
}

interface RateLimitInfo {
  remaining: number
  reset: number
  total: number
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, {
  count: number
  resetTime: number
}>()

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

export function createRateLimit(options: RateLimitOptions = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    keyGenerator = (req: NextRequest) => {
      // Default key generator uses IP address
      const forwarded = req.headers.get('x-forwarded-for')
      const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown'
      return ip
    },
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    onLimitReached
  } = options

  return async function rateLimit(req: NextRequest): Promise<{
    allowed: boolean
    limitInfo: RateLimitInfo
    response?: NextResponse
  }> {
    const key = keyGenerator(req)
    const now = Date.now()
    const windowStart = now - windowMs

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key)

    if (!entry || now > entry.resetTime) {
      // Create new entry
      entry = {
        count: 0,
        resetTime: now + windowMs
      }
      rateLimitStore.set(key, entry)
    }

    // Check if limit is exceeded
    if (entry.count >= maxRequests) {
      const limitInfo: RateLimitInfo = {
        remaining: 0,
        reset: entry.resetTime,
        total: maxRequests
      }

      // Call callback if provided
      if (onLimitReached) {
        onLimitReached(req, key)
      }

      // Log rate limit violation
      console.warn(`Rate limit exceeded for ${key}: ${entry.count} requests in ${windowMs}ms`)

      return {
        allowed: false,
        limitInfo,
        response: NextResponse.json(
          {
            error: 'Too many requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: Math.ceil((entry.resetTime - now) / 1000)
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': entry.resetTime.toString(),
              'Retry-After': Math.ceil((entry.resetTime - now) / 1000).toString()
            }
          }
        )
      }
    }

    // Increment counter
    entry.count++

    const remaining = maxRequests - entry.count
    const limitInfo: RateLimitInfo = {
      remaining,
      reset: entry.resetTime,
      total: maxRequests
    }

    // Add rate limit headers to the response
    const addRateLimitHeaders = (response: NextResponse) => {
      response.headers.set('X-RateLimit-Limit', maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', remaining.toString())
      response.headers.set('X-RateLimit-Reset', entry.resetTime.toString())
      return response
    }

    return {
      allowed: true,
      limitInfo
    }
  }
}

// Pre-configured rate limiters for different use cases
export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 1000, // 1000 requests per 15 minutes
  onLimitReached: (req, key) => {
    console.log(`API rate limit reached for ${key}`)
  }
})

export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 authentication attempts per 15 minutes
  onLimitReached: (req, key) => {
    console.log(`Authentication rate limit reached for ${key}`)
  }
})

export const webhookRateLimit = createRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 100, // 100 webhook requests per minute
  keyGenerator: (req) => {
    // For webhooks, use the webhook path as part of the key
    const url = new URL(req.url)
    const path = url.pathname
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    return `${path}:${ip}`
  },
  onLimitReached: (req, key) => {
    console.log(`Webhook rate limit reached for ${key}`)
  }
})

export const formSubmissionRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 form submissions per hour
  onLimitReached: (req, key) => {
    console.log(`Form submission rate limit reached for ${key}`)
  }
})

// Security headers middleware
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Content Security Policy (basic)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss: https:; font-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none';"
  )

  // Remove server information
  response.headers.set('Server', '')

  return response
}

// Input validation and sanitization
export function validateAndSanitizeInput(input: string, type: 'string' | 'email' | 'url' | 'id' = 'string'): string | null {
  if (!input || typeof input !== 'string') {
    return null
  }

  // Trim whitespace
  let sanitized = input.trim()

  switch (type) {
    case 'string':
      // Allow letters, numbers, spaces, and basic punctuation
      if (!/^[a-zA-Z0-9\s\-_.,!?@#$%^&*()+=\[\]{}|\\:;"'<>,/~`]+$/.test(sanitized)) {
        return null
      }
      // Remove potentially dangerous characters
      sanitized = sanitized.replace(/[<>]/g, '')
      break

    case 'email':
      // Basic email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)) {
        return null
      }
      break

    case 'url':
      // Basic URL validation
      try {
        new URL(sanitized)
      } catch {
        return null
      }
      // Only allow http/https URLs
      if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
        return null
      }
      break

    case 'id':
      // Allow only alphanumeric characters and hyphens/underscores
      if (!/^[a-zA-Z0-9\-_]+$/.test(sanitized)) {
        return null
      }
      break
  }

  return sanitized
}

// SQL injection prevention
export function preventSqlInjection(input: string): string {
  // Remove common SQL injection patterns
  const sqlPatterns = [
    /(\s|^)(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)(\s|$)/gi,
    /(\s|^)(UNION|JOIN|WHERE|HAVING|GROUP BY|ORDER BY)(\s|$)/gi,
    /(\s|^)(OR|AND)(\s+\d+\s*=\s*\d+)(\s|$)/gi,
    /['";\\]/g,
    /\/\*|\*\//g,
    /--/g
  ]

  let sanitized = input
  sqlPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '')
  })

  return sanitized
}

// Request logging for security monitoring
export async function logSecurityEvent(event: {
  type: 'rate_limit_exceeded' | 'suspicious_request' | 'auth_failure' | 'validation_error'
  ip: string
  userAgent?: string
  path: string
  method: string
  details?: any
}) {
  try {
    // In production, you might want to store this in a database or send to a security monitoring service
    console.log('Security Event:', {
      timestamp: new Date().toISOString(),
      ...event
    })

    // Here you could also store in database for audit trails
    // await db.securityEvent.create({
    //   data: {
    //     type: event.type,
    //     ip: event.ip,
    //     userAgent: event.userAgent,
    //     path: event.path,
    //     method: event.method,
    //     details: event.details,
    //     timestamp: new Date()
    //   }
    // })
  } catch (error) {
    console.error('Failed to log security event:', error)
  }
}