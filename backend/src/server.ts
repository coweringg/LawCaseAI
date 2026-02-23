import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3'
import axios from 'axios'
import mongoSanitize from 'express-mongo-sanitize'
import { connectDatabase } from './config/database'
import config from './config'
import { IApiResponse } from './types'
import logger, { httpLogger } from './utils/logger'

// Load environment variables
import 'dotenv/config'

// Local error type definitions
interface MongooseValidationFieldError {
  path: string
  message: string
}

interface MongooseValidationError extends Error {
  name: 'ValidationError'
  errors: Record<string, MongooseValidationFieldError>
}

interface MulterError extends Error {
  code: 'LIMIT_FILE_SIZE' | 'LIMIT_FILE_COUNT'
}

interface CustomError extends Error {
  statusCode?: number
}

// Import routes
import authRoutes from './routes/auth'
import userRoutes from './routes/user'
import caseRoutes from './routes/case'
import fileRoutes from './routes/file'
import chatRoutes from './routes/chat'
import adminRoutes from './routes/admin'
import paymentRoutes from './routes/payment'
import aiRoutes from './routes/ai'
import dashboardRoutes from './routes/dashboard'
import eventRoutes from './routes/event'
import systemRoutes from './routes/system'
import { planRateLimiter } from './middleware/rateLimiter'

const app = express()

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

app.use(cookieParser())

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  } as IApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api', limiter)

// Apply more granular plan-aware rate limiting to core API routes
// This runs after the global limiter but uses the authenticated user context
app.use('/api', planRateLimiter)

// Compression
app.use(compression())

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  type: ['application/json', 'text/plain']
}))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// NoSQL injection protection
app.use(mongoSanitize())

// Global Maintenance Mode Check
import { checkMaintenanceMode } from './middleware/maintenance'
app.use(checkMaintenanceMode)

// Structured HTTP logging (replaces Morgan)
app.use(httpLogger)

// ─── Health check endpoint (enhanced) ─────────────────────────────────────────
app.get('/health', async (req: express.Request, res: express.Response) => {
  const checks = await Promise.all([
    checkMongoDBConnection(),
    checkCloudflareR2Connection(),
    checkFreeLLMConnection(),
    checkSMTPConnection(),
  ])

  const [mongo, r2, llm, smtp] = checks
  const allConnected = checks.every(c => c.connected)
  const anyConnected = checks.some(c => c.connected)

  const overallStatus = allConnected ? 'healthy' : anyConnected ? 'degraded' : 'unhealthy'
  const httpStatus = mongo.connected ? 200 : 503 // DB is the critical dependency

  res.status(httpStatus).json({
    success: mongo.connected,
    message: `Server is ${overallStatus}`,
    data: {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      uptime: process.uptime(),
      services: {
        mongodb: mongo,
        cloudflareR2: r2,
        freeLLM: llm,
        smtp,
      },
    },
  } as IApiResponse)
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/cases', caseRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/files', fileRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/user', userRoutes)
app.use('/api/system', systemRoutes)

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  } as IApiResponse)
})

// Global error handler
app.use((error: unknown, req: express.Request, res: express.Response, _next: express.NextFunction): void => {
  void _next

  logger.error({ err: error, method: req.method, url: req.url }, 'Unhandled error')

  // Mongoose validation error
  if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
    const validationError = error as MongooseValidationError
    const errors = Object.values(validationError.errors).map((err: MongooseValidationFieldError) => ({
      field: err.path,
      message: err.message
    }))

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors
    } as IApiResponse)
    return
  }

  // JWT error
  if (error && typeof error === 'object' && 'name' in error && error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    } as IApiResponse)
    return
  }

  // Multer error
  if (error && typeof error === 'object' && 'code' in error) {
    const multerError = error as MulterError
    if (multerError.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB'
      } as IApiResponse)
      return
    }

    if (multerError.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        message: 'Too many files'
      } as IApiResponse)
      return
    }
  }

  // Default error
  const customError = error as CustomError
  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  const statusCode = customError.statusCode || 500

  res.status(statusCode).json({
    success: false,
    message: errorMessage
  } as IApiResponse)
})

// ─── Connection verification functions ────────────────────────────────────────

const checkMongoDBConnection = async (): Promise<{ connected: boolean; message: string }> => {
  try {
    if (mongoose.connection.readyState === 1) {
      return { connected: true, message: 'MongoDB Atlas connected' }
    }
    if (mongoose.connection.readyState === 2) {
      return { connected: false, message: 'MongoDB Atlas connecting...' }
    }
    return { connected: false, message: 'MongoDB Atlas not connected' }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { connected: false, message: `MongoDB Atlas status check failed: ${errorMessage}` }
  }
}

const checkCloudflareR2Connection = async (): Promise<{ connected: boolean; message: string }> => {
  try {
    if (config.r2.accessKeyId && config.r2.secretAccessKey && config.r2.endpoint) {
      const s3Client = new S3Client({
        region: 'auto',
        endpoint: config.r2.endpoint,
        credentials: {
          accessKeyId: config.r2.accessKeyId,
          secretAccessKey: config.r2.secretAccessKey,
        },
      })
      await s3Client.send(new ListBucketsCommand({}))
      return { connected: true, message: 'Cloudflare R2 connected' }
    } else {
      return { connected: false, message: 'Cloudflare R2 not configured' }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { connected: false, message: `Cloudflare R2 connection failed: ${errorMessage}` }
  }
}

const checkFreeLLMConnection = async (): Promise<{ connected: boolean; message: string }> => {
  try {
    if (config.freellm.apiKey && config.freellm.baseUrl) {
      const response = await axios.get(`${config.freellm.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${config.freellm.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      })
      if (response.status === 200) {
        return { connected: true, message: 'FreeLLM API connected' }
      } else {
        return { connected: false, message: `FreeLLM API returned status: ${response.status}` }
      }
    } else {
      return { connected: false, message: 'FreeLLM API not configured' }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { connected: false, message: `FreeLLM API connection failed: ${errorMessage}` }
  }
}

const checkSMTPConnection = async (): Promise<{ connected: boolean; message: string }> => {
  try {
    if (config.email.host && config.email.user && config.email.pass) {
      return { connected: true, message: 'SMTP configured' }
    } else {
      return { connected: false, message: 'SMTP not configured' }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { connected: false, message: `SMTP configuration error: ${errorMessage}` }
  }
}

// ─── Server startup ───────────────────────────────────────────────────────────

const PORT = config.port
let server: ReturnType<typeof app.listen> | null = null

const startServer = async () => {
  try {
    await connectDatabase()

    server = app.listen(PORT, async () => {
      logger.info({ port: PORT, env: config.nodeEnv }, '🚀 LawCaseAI Server running')
      logger.info({ cors: config.cors.origin }, '🌐 CORS configured')

      logger.info('🔍 Checking service connections...')

      const [mongoStatus, r2Status, llmStatus, smtpStatus] = await Promise.all([
        checkMongoDBConnection(),
        checkCloudflareR2Connection(),
        checkFreeLLMConnection(),
        checkSMTPConnection(),
      ])

      logger.info({ ...mongoStatus }, `🗄️  MongoDB Atlas`)
      logger.info({ ...r2Status }, `☁️  Cloudflare R2`)
      logger.info({ ...llmStatus }, `🤖 FreeLLM API`)
      logger.info({ ...smtpStatus }, `📧 SMTP Email`)

      logger.info('✨ Server ready to accept connections!')
    })
  } catch (error) {
    logger.fatal({ err: error }, '❌ Failed to start server')
    process.exit(1)
  }
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────

const SHUTDOWN_TIMEOUT_MS = 10_000

const gracefulShutdown = async (signal: string) => {
  logger.info({ signal }, `🔄 ${signal} received. Starting graceful shutdown...`)

  // Force exit after timeout
  const forceExitTimer = setTimeout(() => {
    logger.error('⚠️ Shutdown timeout reached. Forcing exit.')
    process.exit(1)
  }, SHUTDOWN_TIMEOUT_MS)
  forceExitTimer.unref()

  try {
    // 1. Stop accepting new connections
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server!.close((err) => {
          if (err) reject(err)
          else resolve()
        })
      })
      logger.info('✅ HTTP server closed (no new connections)')
    }

    // 2. Close MongoDB connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close()
      logger.info('✅ MongoDB connection closed')
    }

    logger.info('👋 Graceful shutdown complete')
    process.exit(0)
  } catch (error) {
    logger.error({ err: error }, '❌ Error during graceful shutdown')
    process.exit(1)
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error({ reason, promise: String(promise) }, 'Unhandled Rejection')
})

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.fatal({ err: error }, 'Uncaught Exception — shutting down')
  process.exit(1)
})

// Graceful shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

startServer()

export default app
