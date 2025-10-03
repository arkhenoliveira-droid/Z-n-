import { z } from 'zod'

const envSchema = z.object({
  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters').optional(),

  // Database Configuration
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // NextAuth Configuration
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters').optional(),

  // Security Configuration
  CORS_ORIGIN: z.string().url().optional(),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // Blockchain Configuration
  WEB3_NETWORK: z.string().default('ethereum'),
  WEB3_RPC_URL: z.string().url().optional(),
  WEB3_CONTRACT_ADDRESS: z.string().optional(),

  // Monitoring and Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  ENABLE_REQUEST_LOGGING: z.string().transform(val => val === 'true').default('true'),
  ENABLE_SECURITY_LOGGING: z.string().transform(val => val === 'true').default('true'),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

type Env = z.infer<typeof envSchema>

// Validate environment variables
function validateEnv(): Env {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:')
      error.errors.forEach(err => {
        console.error(`  ${err.path.join('.')}: ${err.message}`)
      })
      process.exit(1)
    }
    throw error
  }
}

// Export validated environment variables
export const env = validateEnv()

// Export utility functions
export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'

// Security configuration
export const securityConfig = {
  jwt: {
    secret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET || env.JWT_SECRET,
    accessTokenExpiry: '24h',
    refreshTokenExpiry: '7d',
  },
  cors: {
    origin: env.CORS_ORIGIN || (isDevelopment ? 'http://localhost:3000' : ''),
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  logging: {
    level: env.LOG_LEVEL,
    enableRequestLogging: env.ENABLE_REQUEST_LOGGING,
    enableSecurityLogging: env.ENABLE_SECURITY_LOGGING,
  },
}

// Database configuration
export const databaseConfig = {
  url: env.DATABASE_URL,
}

// Blockchain configuration
export const blockchainConfig = {
  network: env.WEB3_NETWORK,
  rpcUrl: env.WEB3_RPC_URL,
  contractAddress: env.WEB3_CONTRACT_ADDRESS,
}