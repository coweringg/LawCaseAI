import dotenv from "dotenv";

dotenv.config();

// Fail-fast: require critical env vars
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && process.env.NODE_ENV === "production") {
  throw new Error(
    "FATAL: JWT_SECRET environment variable is required in production",
  );
}

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/lawcaseai",
    testUri:
      process.env.MONGODB_TEST_URI ||
      "mongodb://localhost:27017/lawcaseai_test",
  },

  // JWT
  jwt: {
    secret: jwtSecret || "dev-only-secret-do-not-use-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  adminCreationKey: process.env.ADMIN_CREATION_KEY || "Uwu-Admin-Secret-2026",

  // Cloudflare R2
  r2: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
    bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || "lawcaseai-files",
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || "",
    publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL || "",
  },

  // FreeLLM API
  freellm: {
    apiKey: process.env.FREELLm_API_KEY || "",
    baseUrl: process.env.FREELLm_BASE_URL || "https://api.freellm.ai/v1",
  },

  // Email
  email: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "3000"), // Increased to handle polling
  },

  // CORS
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
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

  // Plan Limits
  planLimits: {
    none: 0,
    basic: 8,
    professional: 18,
    elite: 100000,
    enterprise: 100000,
  },
};

export default config;
