import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

// ─── Env schema ───────────────────────────────────────────────────────────────
// Validates ALL environment variables at startup.
// Required vars in production will cause a fail-fast error if missing.

const isProduction = process.env.NODE_ENV === "production";

const envSchema = z.object({
  // Server
  PORT: z.string().default("5000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z.string().default("info"),

  // Database (required always)
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  MONGODB_TEST_URI: z
    .string()
    .default("mongodb://localhost:27017/lawcaseai_test"),

  // JWT (required in production, has dev fallback)
  JWT_SECRET: isProduction
    ? z
        .string()
        .min(32, "JWT_SECRET must be at least 32 characters in production")
    : z.string().default("dev-only-secret-do-not-use-in-production"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  ADMIN_CREATION_KEY: isProduction
    ? z.string().min(1, "ADMIN_CREATION_KEY is required in production")
    : z.string().default("dev-admin-key"),

  // Cloudflare R2 (optional in development)
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().default(""),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().default(""),
  CLOUDFLARE_R2_BUCKET_NAME: z.string().default("lawcaseai-files"),
  CLOUDFLARE_R2_ENDPOINT: z.string().default(""),
  CLOUDFLARE_R2_PUBLIC_URL: z.string().default(""),

  // OpenAI API
  OPENAI_API_KEY: z
    .string()
    .min(1, "OPENAI_API_KEY is required in production")
    .default(""),
  OPENAI_MODEL_PRIMARY: z.string().default("gpt-4o-mini"),
  OPENAI_MODEL_ELITE: z.string().default("gpt-4o"),
  // OpenRouter API
  OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY is required"),
  OPENROUTER_MODEL: z.string().default('google/gemini-2.0-flash-001'),

  // Email (optional)
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.string().default("587"),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default("900000"),
  RATE_LIMIT_MAX_REQUESTS: z.string().default("3000"),

  // CORS
  FRONTEND_URL: z.string().default("http://localhost:3000"),
});

// Parse and validate — fail-fast on invalid config
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  const formatted = parseResult.error.format();
  console.error("❌ Invalid environment variables:");
  console.error(JSON.stringify(formatted, null, 2));
  process.exit(1);
}

const env = parseResult.data;

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

  // OpenAI API
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
    primaryModel: process.env.OPENAI_MODEL_PRIMARY || "gpt-4o-mini",
    eliteModel: process.env.OPENAI_MODEL_ELITE || "gpt-4o",
  },
  // AI Services (OpenRouter)
  ai: {
    apiKey: env.OPENROUTER_API_KEY,
    model: env.OPENROUTER_MODEL,
    baseURL: "https://openrouter.ai/api/v1",
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
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ],
  },

  // Plan Limits (Per User/Case)
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
        maxTotalStorage: 50 * 1024 * 1024, // 50MB
        maxTokens: 2000000 
    },
    professional: {
      maxCases: 18,
      maxFilesPerCase: 50,
      maxFileSize: 25 * 1024 * 1024,
      maxTotalStorage: 500 * 1024 * 1024, // 500MB
      maxTokens: 10000000
    },
    elite: {
      maxCases: 100000,
      maxFilesPerCase: 100000,
      maxFileSize: 50 * 1024 * 1024,
      maxTotalStorage: 50 * 1024 * 1024 * 1024, // 50GB
      maxTokens: 1000000000
    },
    enterprise: {
      maxCases: 100000,
      maxFilesPerCase: 100000,
      maxFileSize: 50 * 1024 * 1024,
      maxTotalStorage: 50 * 1024 * 1024 * 1024, // 50GB
      maxTokens: 1000000000
    },
  },
};

export default config;
