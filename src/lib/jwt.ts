import jwt from 'jsonwebtoken'
import { Web3Identity } from '@/app/api/auth/route'
import { securityConfig } from './env'

export interface JWTPayload {
  userId: string
  address: string
  username: string
  role: string
  permissions: string[]
  iat?: number
  exp?: number
}

export interface JWTOptions {
  expiresIn?: string | number
  issuer?: string
  audience?: string
}

export class JWTManager {
  private static readonly DEFAULT_OPTIONS: JWTOptions = {
    expiresIn: securityConfig.jwt.accessTokenExpiry,
    issuer: 'web3-linux-os',
    audience: 'web3-linux-os-clients'
  }

  /**
   * Generate a JWT token for a user
   */
  static async generateToken(
    identity: Web3Identity,
    options: JWTOptions = {}
  ): Promise<string> {
    const jwtSecret = securityConfig.jwt.secret
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not configured')
    }

    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options }
    const payload: JWTPayload = {
      userId: identity.id,
      address: identity.address,
      username: identity.username,
      role: identity.role,
      permissions: identity.permissions
    }

    return jwt.sign(payload, jwtSecret, mergedOptions)
  }

  /**
   * Generate a refresh token
   */
  static async generateRefreshToken(
    userId: string,
    options: JWTOptions = {}
  ): Promise<string> {
    const jwtSecret = securityConfig.jwt.refreshSecret
    if (!jwtSecret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is not configured')
    }

    const mergedOptions = {
      ...this.DEFAULT_OPTIONS,
      ...options,
      expiresIn: securityConfig.jwt.refreshTokenExpiry
    }

    const payload = {
      userId,
      type: 'refresh'
    }

    return jwt.sign(payload, jwtSecret, mergedOptions)
  }

  /**
   * Verify and decode a JWT token
   */
  static async verifyToken(token: string): Promise<JWTPayload> {
    const jwtSecret = securityConfig.jwt.secret
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not configured')
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as JWTPayload
      return decoded
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error(`Invalid token: ${error.message}`)
      } else if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired')
      } else {
        throw new Error('Token verification failed')
      }
    }
  }

  /**
   * Verify a refresh token
   */
  static async verifyRefreshToken(token: string): Promise<{ userId: string }> {
    const jwtSecret = securityConfig.jwt.refreshSecret
    if (!jwtSecret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is not configured')
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as any
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token')
      }
      return { userId: decoded.userId }
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error(`Invalid refresh token: ${error.message}`)
      } else if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token has expired')
      } else {
        throw new Error('Refresh token verification failed')
      }
    }
  }

  /**
   * Extract token from authorization header
   */
  static extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    return authHeader.substring(7)
  }

  /**
   * Check if user has required permissions
   */
  static hasPermission(payload: JWTPayload, requiredPermissions: string[]): boolean {
    return requiredPermissions.every(permission =>
      payload.permissions.includes(permission) || payload.role === 'admin'
    )
  }

  /**
   * Check if user has required role
   */
  static hasRole(payload: JWTPayload, requiredRole: string): boolean {
    return payload.role === requiredRole || payload.role === 'admin'
  }
}

/**
 * Middleware to validate JWT token in requests
 */
export async function validateJwtToken(token: string): Promise<{
  isValid: boolean
  payload?: JWTPayload
  error?: string
}> {
  try {
    const payload = await JWTManager.verifyToken(token)
    return {
      isValid: true,
      payload
    }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Token validation failed'
    }
  }
}

/**
 * Authentication middleware for API routes
 */
export async function authenticateRequest(
  req: NextRequest,
  requiredPermissions?: string[],
  requiredRole?: string
): Promise<{
  isAuthenticated: boolean
  payload?: JWTPayload
  response?: Response
}> {
  try {
    const authHeader = req.headers.get('authorization')
    const token = JWTManager.extractTokenFromHeader(authHeader)

    if (!token) {
      return {
        isAuthenticated: false,
        response: new Response(
          JSON.stringify({ error: 'Authorization token is required' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }

    const validation = await validateJwtToken(token)

    if (!validation.isValid) {
      return {
        isAuthenticated: false,
        response: new Response(
          JSON.stringify({ error: validation.error || 'Invalid token' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }

    const payload = validation.payload!

    // Check role requirements
    if (requiredRole && !JWTManager.hasRole(payload, requiredRole)) {
      return {
        isAuthenticated: false,
        response: new Response(
          JSON.stringify({ error: 'Insufficient permissions' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // Check permission requirements
    if (requiredPermissions && !JWTManager.hasPermission(payload, requiredPermissions)) {
      return {
        isAuthenticated: false,
        response: new Response(
          JSON.stringify({ error: 'Insufficient permissions' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }

    return {
      isAuthenticated: true,
      payload
    }
  } catch (error) {
    return {
      isAuthenticated: false,
      response: new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
}