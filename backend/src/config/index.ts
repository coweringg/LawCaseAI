import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const envSchema = z.object({
  PORT: z.string().default("5000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z.string().default("info"),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  MONGODB_TEST_URI: z
    .string()
    .default("mongodb://localhost:27017/lawcaseai_test"),

  JWT_SECRET: isProduction
    ? z
        .string()
        .min(32, "JWT_SECRET must be at least 32 characters in production")
    : z.string().default("dev-only-secret-do-not-use-in-production"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  ADMIN_CREATION_KEY: isProduction
    ? z.string().min(1, "ADMIN_CREATION_KEY is required in production")
    : z.string().default("dev-admin-key"),

  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().default(""),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().default(""),
  CLOUDFLARE_R2_BUCKET_NAME: z.string().default("lawcaseai-files"),
  CLOUDFLARE_R2_ENDPOINT: z.string().default(""),
  CLOUDFLARE_R2_PUBLIC_URL: z.string().default(""),
  
  PADDLE_API_KEY: z.string().optional(),
  PADDLE_SANDBOX_API_KEY: z.string().optional(),
  PADDLE_WEBHOOK_SECRET: z.string().optional(),
  PADDLE_SANDBOX_WEBHOOK_SECRET: z.string().optional(),
  PADDLE_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),

  PADDLE_SANDBOX_PRICE_GROWTH_MONTHLY: z.string().optional(),
  PADDLE_SANDBOX_PRICE_GROWTH_ANNUAL: z.string().optional(),
  PADDLE_SANDBOX_PRICE_PROFESSIONAL_MONTHLY: z.string().optional(),
  PADDLE_SANDBOX_PRICE_PROFESSIONAL_ANNUAL: z.string().optional(),
  PADDLE_SANDBOX_PRICE_ELITE_MONTHLY: z.string().optional(),
  PADDLE_SANDBOX_PRICE_ELITE_ANNUAL: z.string().optional(),
  PADDLE_SANDBOX_PRICE_FIRM_MONTHLY: z.string().optional(),
  PADDLE_SANDBOX_PRICE_FIRM_ANNUAL: z.string().optional(),

  PADDLE_PRICE_GROWTH_MONTHLY: z.string().optional(),
  PADDLE_PRICE_GROWTH_ANNUAL: z.string().optional(),
  PADDLE_PRICE_PROFESSIONAL_MONTHLY: z.string().optional(),
  PADDLE_PRICE_PROFESSIONAL_ANNUAL: z.string().optional(),
  PADDLE_PRICE_ELITE_MONTHLY: z.string().optional(),
  PADDLE_PRICE_ELITE_ANNUAL: z.string().optional(),
  PADDLE_PRICE_FIRM_MONTHLY: z.string().optional(),
  PADDLE_PRICE_FIRM_ANNUAL: z.string().optional(),

  OPENAI_API_KEY: z.string().default(""),
  OPENAI_MODEL_PRIMARY: z.string().default("google/gemini-2.0-flash-001"),
  OPENAI_MODEL_ELITE: z.string().default("anthropic/claude-3-opus"),
  OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY is required"),
  OPENROUTER_MODEL: z.string().default('google/gemini-2.0-flash-001'),

  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.string().default("587"),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),

  RATE_LIMIT_WINDOW_MS: z.string().default("300000"),
  RATE_LIMIT_MAX_REQUESTS: z.string().default("1000"),

  FRONTEND_URL: z.string().default("http://localhost:3000"),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  const formatted = parseResult.error.format();
  console.error("❌ Invalid environment variables:");
  console.error(JSON.stringify(formatted, null, 2));
  process.exit(1);
}

const env = parseResult.data;

export const config = {
  port: parseInt(env.PORT),
  nodeEnv: env.NODE_ENV,
  logLevel: env.LOG_LEVEL,

  mongodb: {
    uri: env.MONGODB_URI,
    testUri: env.MONGODB_TEST_URI,
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  paddle: {
    apiKey: env.PADDLE_ENVIRONMENT === 'sandbox' ? env.PADDLE_SANDBOX_API_KEY : env.PADDLE_API_KEY,
    webhookSecret: env.PADDLE_ENVIRONMENT === 'sandbox' ? env.PADDLE_SANDBOX_WEBHOOK_SECRET : env.PADDLE_WEBHOOK_SECRET,
    environment: env.PADDLE_ENVIRONMENT,
    prices: {
      monthly: {
        basic: env.PADDLE_ENVIRONMENT === 'sandbox' ? env.PADDLE_SANDBOX_PRICE_GROWTH_MONTHLY : env.PADDLE_PRICE_GROWTH_MONTHLY,
        professional: env.PADDLE_ENVIRONMENT === 'sandbox' ? env.PADDLE_SANDBOX_PRICE_PROFESSIONAL_MONTHLY : env.PADDLE_PRICE_PROFESSIONAL_MONTHLY,
        elite: env.PADDLE_ENVIRONMENT === 'sandbox' ? env.PADDLE_SANDBOX_PRICE_ELITE_MONTHLY : env.PADDLE_PRICE_ELITE_MONTHLY,
        enterprise: env.PADDLE_ENVIRONMENT === 'sandbox' ? env.PADDLE_SANDBOX_PRICE_FIRM_MONTHLY : env.PADDLE_PRICE_FIRM_MONTHLY
      },
      annual: {
        basic: env.PADDLE_ENVIRONMENT === 'sandbox' ? env.PADDLE_SANDBOX_PRICE_GROWTH_ANNUAL : env.PADDLE_PRICE_GROWTH_ANNUAL,
        professional: env.PADDLE_ENVIRONMENT === 'sandbox' ? env.PADDLE_SANDBOX_PRICE_PROFESSIONAL_ANNUAL : env.PADDLE_PRICE_PROFESSIONAL_ANNUAL,
        elite: env.PADDLE_ENVIRONMENT === 'sandbox' ? env.PADDLE_SANDBOX_PRICE_ELITE_ANNUAL : env.PADDLE_PRICE_ELITE_ANNUAL,
        enterprise: env.PADDLE_ENVIRONMENT === 'sandbox' ? env.PADDLE_SANDBOX_PRICE_FIRM_ANNUAL : env.PADDLE_PRICE_FIRM_ANNUAL
      }
    }
  },
  adminCreationKey: env.ADMIN_CREATION_KEY,

  r2: {
    accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    bucketName: env.CLOUDFLARE_R2_BUCKET_NAME,
    endpoint: env.CLOUDFLARE_R2_ENDPOINT,
    publicUrl: env.CLOUDFLARE_R2_PUBLIC_URL,
  },

  baseAi: {
    apiKey: process.env.OPENAI_API_KEY || "",
    primaryModel: process.env.OPENAI_MODEL_PRIMARY || "google/gemini-2.0-flash-001",
    eliteModel: process.env.OPENAI_MODEL_ELITE || "anthropic/claude-3.5-sonnet",
  },
  ai: {
    apiKey: env.OPENROUTER_API_KEY,
    model: env.OPENROUTER_MODEL,
    baseURL: "https://openrouter.ai/api/v1",
  },

  email: {
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT),
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },

  rateLimit: {
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS),
    maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS),
  },

  cors: {
    origin: env.FRONTEND_URL,
    credentials: true as const,
  },

  upload: {
    maxFileSize: 10 * 1024 * 1024,
    allowedTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ],
  },

  planLimits: {
    none: { 
        maxCases: 0, 
        maxFilesPerCase: 0, 
        maxFileSize: 0, 
        maxTotalStorage: 0, 
        maxTokens: 0 
    },
    basic: { 
        maxCases: 8, 
        maxFilesPerCase: 20, 
        maxFileSize: 15 * 1024 * 1024, 
        maxTotalStorage: 50 * 1024 * 1024,
        maxTokens: 2000000 
    },
    professional: {
      maxCases: 18,
      maxFilesPerCase: 50,
      maxFileSize: 25 * 1024 * 1024,
      maxTotalStorage: 500 * 1024 * 1024,
      maxTokens: 10000000
    },
    elite: {
      maxCases: 100000,
      maxFilesPerCase: 100000,
      maxFileSize: 50 * 1024 * 1024,
      maxTotalStorage: 50 * 1024 * 1024 * 1024,
      maxTokens: 1000000000
    },
    enterprise: {
      maxCases: 100000,
      maxFilesPerCase: 100000,
      maxFileSize: 50 * 1024 * 1024,
      maxTotalStorage: 50 * 1024 * 1024 * 1024,
      maxTokens: 1000000000
    },
    trial: {
      maxCases: 1,
      maxFilesPerCase: 10,
      maxFileSize: 10 * 1024 * 1024,
      maxTotalStorage: 100 * 1024 * 1024,
      maxTokens: 400000
    }
  },
};

export default config;
