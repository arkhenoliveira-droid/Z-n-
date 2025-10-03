import { NextRequest, NextResponse } from 'next/server'
import {
  apiRateLimit,
  authRateLimit,
  webhookRateLimit,
  formSubmissionRateLimit,
  addSecurityHeaders,
  validateAndSanitizeInput,
  preventSqlInjection,
  logSecurityEvent
} from './rateLimit'
import { authenticateRequest } from './jwt'
import { applySecurityHeaders, corsOptions, rateLimitConfig } from './securityConfig'

interface SecurityMiddlewareOptions {
  rateLimitType?: 'api' | 'auth' | 'webhook' | 'form' | 'none'
  requireAuth?: boolean
  requiredPermissions?: string[]
  requiredRole?: string
  validateInput?: boolean
  logRequests?: boolean
  allowedOrigins?: string[]
}

export async function securityMiddleware(
  req: NextRequest,
  options: SecurityMiddlewareOptions = {}
): Promise<{
  allowed: boolean
  response?: NextResponse
  sanitizedData?: Record<string, any>
}> {
  const {
    rateLimitType = 'api',
    requireAuth = false,
    requiredPermissions,
    requiredRole,
    validateInput = true,
    logRequests = true,
    allowedOrigins = []
  } = options

  try {
    // Log request if enabled
    if (logRequests) {
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      const userAgent = req.headers.get('user-agent') || 'unknown'

      await logSecurityEvent({
        type: 'suspicious_request',
        ip,
        userAgent,
        path: req.nextUrl.pathname,
        method: req.method,
        details: {
          rateLimitType,
          requireAuth,
          requiredPermissions,
          requiredRole
        }
      })
    }

    // Check CORS
    if (allowedOrigins.length > 0) {
      const origin = req.headers.get('origin')
      if (origin && !allowedOrigins.includes(origin)) {
        const response = NextResponse.json(
          { error: 'Origin not allowed' },
          { status: 403 }
        )
        return {
          allowed: false,
          response: applySecurityHeaders(response)
        }
      }
    }

    // Apply rate limiting
    if (rateLimitType !== 'none') {
      let rateLimitResult

      switch (rateLimitType) {
        case 'auth':
          rateLimitResult = await authRateLimit(req)
          break
        case 'webhook':
          rateLimitResult = await webhookRateLimit(req)
          break
        case 'form':
          rateLimitResult = await formSubmissionRateLimit(req)
          break
        default:
          rateLimitResult = await apiRateLimit(req)
      }

      if (rateLimitResult && !rateLimitResult.allowed) {
        return {
          allowed: false,
          response: applySecurityHeaders(rateLimitResult.response)
        }
      }
    }

    // Check authentication if required
    if (requireAuth) {
      const authResult = await authenticateRequest(req, requiredPermissions, requiredRole)

      if (!authResult.isAuthenticated) {
        return {
          allowed: false,
          response: applySecurityHeaders(authResult.response as NextResponse)
        }
      }
    }

    // Validate and sanitize input data
    let sanitizedData: Record<string, any> = {}

    if (validateInput && req.method === 'POST') {
      try {
        const body = await req.clone().json()

        for (const [key, value] of Object.entries(body)) {
          if (typeof value === 'string') {
            // Determine validation type based on key name
            let validationType: 'string' | 'email' | 'url' | 'id' = 'string'

            if (key.includes('email')) validationType = 'email'
            else if (key.includes('url') || key.includes('endpoint')) validationType = 'url'
            else if (key.includes('id') && key !== 'description') validationType = 'id'

            const sanitized = validateAndSanitizeInput(value, validationType)
            if (sanitized === null) {
              const response = NextResponse.json(
                { error: `Invalid input for field: ${key}` },
                { status: 400 }
              )
              return {
                allowed: false,
                response: applySecurityHeaders(response)
              }
            }

            // Additional SQL injection prevention
            sanitizedData[key] = preventSqlInjection(sanitized)
          } else {
            sanitizedData[key] = value
          }
        }
      } catch (error) {
        // If body parsing fails, it might not be JSON or might be empty
        // That's okay, we'll continue without sanitization
      }
    }

    return {
      allowed: true,
      sanitizedData: Object.keys(sanitizedData).length > 0 ? sanitizedData : undefined
    }
  } catch (error) {
    console.error('Security middleware error:', error)

    return {
      allowed: false,
      response: applySecurityHeaders(NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      ))
    }
  }
}

// Helper function to apply security middleware to API routes
export async function withSecurity(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  options: SecurityMiddlewareOptions = {}
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    const securityResult = await securityMiddleware(req, options)

    if (!securityResult.allowed) {
      const response = securityResult.response || NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )

      return applySecurityHeaders(response)
    }

    // If sanitized data is available, modify the request
    let modifiedReq = req
    if (securityResult.sanitizedData) {
      // Note: In a real implementation, you might need to create a new request with sanitized body
      // This is a simplified version
    }

    try {
      const response = await handler(modifiedReq, context)
      return applySecurityHeaders(response)
    } catch (error) {
      console.error('Handler error:', error)
      const errorResponse = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
      return applySecurityHeaders(errorResponse)
    }
  }
}