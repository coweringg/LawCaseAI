import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

// ─── Env schema ───────────────────────────────────────────────────────────────
// Validates ALL environment variables at startup.
// Required vars in production will cause a fail-fast error if missing.

const isProduction = process.env.NODE_ENV === 'production'

const envSchema = z.object({
  // Server
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.string().default('info'),

  // Database (required always)
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  MONGODB_TEST_URI: z.string().default('mongodb://localhost:27017/lawcaseai_test'),

  // JWT (required in production, has dev fallback)
  JWT_SECRET: isProduction
    ? z.string().min(32, 'JWT_SECRET must be at least 32 characters in production')
    : z.string().default('dev-only-secret-do-not-use-in-production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ADMIN_CREATION_KEY: isProduction
    ? z.string().min(1, 'ADMIN_CREATION_KEY is required in production')
    : z.string().default('dev-admin-key'),

  // Cloudflare R2 (optional in development)
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().default(''),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().default(''),
  CLOUDFLARE_R2_BUCKET_NAME: z.string().default('lawcaseai-files'),
  CLOUDFLARE_R2_ENDPOINT: z.string().default(''),
  CLOUDFLARE_R2_PUBLIC_URL: z.string().default(''),

  // FreeLLM API (optional in development)
  FREELLm_API_KEY: z.string().default(''),
  FREELLm_BASE_URL: z.string().default('https://api.freellm.ai/v1'),

  // Email (optional)
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().default('587'),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('3000'),

  // CORS
  FRONTEND_URL: z.string().default('http://localhost:3000'),
})

// Parse and validate — fail-fast on invalid config
const parseResult = envSchema.safeParse(process.env)

if (!parseResult.success) {
  const formatted = parseResult.error.format()
  console.error('❌ Invalid environment variables:')
  console.error(JSON.stringify(formatted, null, 2))
  process.exit(1)
}

const env = parseResult.data

// ─── Config object ────────────────────────────────────────────────────────────

export const config = {
  port: parseInt(env.PORT),
  nodeEnv: env.NODE_ENV,
  logLevel: env.LOG_LEVEL,

  // Database
  mongodb: {
    uri: env.MONGODB_URI,
    testUri: env.MONGODB_TEST_URI,
  },

  // JWT
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  adminCreationKey: env.ADMIN_CREATION_KEY,

  // Cloudflare R2
  r2: {
    accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    bucketName: env.CLOUDFLARE_R2_BUCKET_NAME,
    endpoint: env.CLOUDFLARE_R2_ENDPOINT,
    publicUrl: env.CLOUDFLARE_R2_PUBLIC_URL,
  },

  // FreeLLM API
  freellm: {
    apiKey: env.FREELLm_API_KEY,
    baseUrl: env.FREELLm_BASE_URL,
  },

  // Email
  email: {
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT),
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS),
    maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS),
  },

  // CORS
  cors: {
    origin: env.FRONTEND_URL,
    credentials: true as const,
  },

  // File Upload
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ],
  },

  // Plan Limits
  planLimits: {
    none: 0,
    basic: 8,
    professional: 18,
    elite: 100000,
    enterprise: 100000,
  },
}

export default config
