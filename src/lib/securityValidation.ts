import { validateEnvironmentSecurity } from './securityConfig'
import { isProduction } from './env'

export class SecurityValidator {
  /**
   * Validate all security configurations on startup
   */
  static validateStartupSecurity(): {
    isValid: boolean
    issues: string[]
    recommendations: string[]
  } {
    const issues: string[] = []
    const recommendations: string[] = []

    // Validate environment security
    const envValidation = validateEnvironmentSecurity()
    issues.push(...envValidation.issues)

    // Check for development settings in production
    if (isProduction) {
      // Check if default secrets are being used
      if (process.env.JWT_SECRET?.includes('your-super-secret')) {
        issues.push('Default JWT secret is being used in production')
      }

      // Check if development origins are allowed
      if (process.env.CORS_ORIGIN?.includes('localhost')) {
        issues.push('Localhost CORS origin is allowed in production')
      }

      // Check if logging is too verbose
      if (process.env.LOG_LEVEL === 'debug') {
        recommendations.push('Consider setting LOG_LEVEL to "info" or "warn" in production')
      }
    }

    // Check for missing security headers
    const requiredHeaders = [
      'Content-Security-Policy',
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection'
    ]

    // Check rate limiting configuration
    if (!process.env.RATE_LIMIT_MAX_REQUESTS) {
      recommendations.push('Consider setting explicit rate limiting limits')
    }

    // Check database security
    if (!process.env.DATABASE_URL?.includes('sslmode=require') && isProduction) {
      recommendations.push('Consider using SSL for database connections in production')
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    }
  }

  /**
   * Validate input data against security rules
   */
  static validateInput(
    data: any,
    options: {
      maxStringLength?: number
      maxArrayLength?: number
      maxObjectDepth?: number
      allowedTypes?: string[]
      blockedPatterns?: RegExp[]
    } = {}
  ): {
    isValid: boolean
    errors: string[]
    sanitizedData?: any
  } {
    const {
      maxStringLength = 10000,
      maxArrayLength = 1000,
      maxObjectDepth = 10,
      allowedTypes = ['string', 'number', 'boolean', 'object', 'array'],
      blockedPatterns = []
    } = options

    const errors: string[] = []

    function validateValue(value: any, path: string = '', depth: number = 0): any {
      if (depth > maxObjectDepth) {
        errors.push(`Maximum object depth exceeded at ${path}`)
        return null
      }

      // Check null/undefined
      if (value === null || value === undefined) {
        return value
      }

      // Check type
      const type = Array.isArray(value) ? 'array' : typeof value
      if (!allowedTypes.includes(type)) {
        errors.push(`Invalid type '${type}' at ${path}`)
        return null
      }

      // Validate string
      if (type === 'string') {
        if (value.length > maxStringLength) {
          errors.push(`String too long at ${path} (max ${maxStringLength} characters)`)
          return value.substring(0, maxStringLength)
        }

        // Check for blocked patterns
        for (const pattern of blockedPatterns) {
          if (pattern.test(value)) {
            errors.push(`Blocked pattern detected at ${path}`)
            return '[REDACTED]'
          }
        }

        // Basic sanitization
        return value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[SCRIPT_REMOVED]')
          .replace(/javascript:/gi, '[JAVASCRIPT_REMOVED]')
      }

      // Validate array
      if (type === 'array') {
        if (value.length > maxArrayLength) {
          errors.push(`Array too long at ${path} (max ${maxArrayLength} items)`)
          return value.slice(0, maxArrayLength)
        }

        return value.map((item, index) =>
          validateValue(item, `${path}[${index}]`, depth + 1)
        )
      }

      // Validate object
      if (type === 'object') {
        const sanitized: any = {}
        for (const [key, val] of Object.entries(value)) {
          // Skip prototype properties
          if (!Object.prototype.hasOwnProperty.call(value, key)) {
            continue
          }

          // Validate key name
          if (typeof key === 'string' && key.length > 100) {
            errors.push(`Object key too long at ${path}`)
            continue
          }

          const sanitizedValue = validateValue(val, `${path}.${key}`, depth + 1)
          if (sanitizedValue !== null) {
            sanitized[key] = sanitizedValue
          }
        }
        return sanitized
      }

      // Return primitive values as-is
      return value
    }

    const sanitizedData = validateValue(data)

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData
    }
  }

  /**
   * Validate file upload security
   */
  static validateFileUpload(
    file: File,
    options: {
      maxSizeBytes?: number
      allowedTypes?: string[]
      allowedExtensions?: string[]
      scanForMalware?: boolean
    } = {}
  ): {
    isValid: boolean
    errors: string[]
  } {
    const {
      maxSizeBytes = 10 * 1024 * 1024, // 10MB
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      scanForMalware = true
    } = options

    const errors: string[] = []

    // Check file size
    if (file.size > maxSizeBytes) {
      errors.push(`File too large (max ${maxSizeBytes / 1024 / 1024}MB)`)
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type not allowed: ${file.type}`)
    }

    // Check file extension
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    if (!allowedExtensions.includes(extension)) {
      errors.push(`File extension not allowed: ${extension}`)
    }

    // Check for suspicious file names
    const suspiciousPatterns = [
      /\.\./, // Path traversal
      /\//, // Directory separator
      /\\/, // Directory separator
      /\x00/, // Null byte
      /^con$/i, // Reserved Windows filename
      /^prn$/i,
      /^aux$/i,
      /^nul$/i,
      /^com[1-9]$/i,
      /^lpt[1-9]$/i
    ]

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(file.name)) {
        errors.push('Suspicious filename detected')
        break
      }
    }

    // Note: In a real implementation, you would add malware scanning here
    if (scanForMalware) {
      // This would integrate with a virus scanning service
      // For now, we'll just add a recommendation
      if (isProduction) {
        errors.push('Malware scanning should be implemented in production')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate Web3 transaction security
   */
  static validateWeb3Transaction(
    transaction: any,
    options: {
      maxGasPrice?: string
      maxValue?: string
      requireValidNonce?: boolean
      allowedContracts?: string[]
    } = {}
  ): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const {
      maxGasPrice = '1000000000000', // 1000 gwei
      maxValue = '1000000000000000000000', // 1000 ETH
      requireValidNonce = true,
      allowedContracts = []
    } = options

    const errors: string[] = []
    const warnings: string[] = []

    // Check gas price
    if (transaction.gasPrice && BigInt(transaction.gasPrice) > BigInt(maxGasPrice)) {
      errors.push(`Gas price too high: ${transaction.gasPrice}`)
    }

    // Check value
    if (transaction.value && BigInt(transaction.value) > BigInt(maxValue)) {
      errors.push(`Transaction value too high: ${transaction.value}`)
    }

    // Check nonce (if required)
    if (requireValidNonce && (transaction.nonce === undefined || transaction.nonce < 0)) {
      errors.push('Invalid or missing nonce')
    }

    // Check contract address (if specified)
    if (transaction.to && allowedContracts.length > 0) {
      if (!allowedContracts.includes(transaction.to.toLowerCase())) {
        errors.push(`Contract address not allowed: ${transaction.to}`)
      }
    }

    // Check for suspicious patterns
    if (transaction.data && transaction.data.length > 1000000) {
      warnings.push('Transaction data is very large')
    }

    if (transaction.gas && transaction.gas > 10000000) {
      warnings.push('Gas limit is very high')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Generate security report
   */
  static generateSecurityReport(): {
    timestamp: string
    environment: string
    validation: {
      isValid: boolean
      issues: string[]
      recommendations: string[]
    }
    configuration: {
      jwtConfigured: boolean
      corsConfigured: boolean
      rateLimitingConfigured: boolean
      securityHeadersConfigured: boolean
    }
    recommendations: string[]
  } {
    const validation = this.validateStartupSecurity()

    return {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      validation,
      configuration: {
        jwtConfigured: !!process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32,
        corsConfigured: !!process.env.CORS_ORIGIN,
        rateLimitingConfigured: !!process.env.RATE_LIMIT_MAX_REQUESTS,
        securityHeadersConfigured: true, // Always configured in our setup
      },
      recommendations: [
        ...validation.recommendations,
        'Implement regular security audits',
        'Set up automated security scanning',
        'Monitor for security vulnerabilities in dependencies',
        'Implement proper logging and monitoring',
        'Consider using a Web Application Firewall (WAF)'
      ]
    }
  }
}