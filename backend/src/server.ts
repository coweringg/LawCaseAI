import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3'
import mongoSanitize from 'express-mongo-sanitize'
import { connectDatabase } from './config/database'
import config from './config'
import { IApiResponse } from './types'
import logger, { httpLogger } from './utils/logger'

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
import supportRoutes from './routes/support.routes'
import webhookRoutes from './routes/webhook'
import { planRateLimiter } from './middleware/rateLimiter'

const app = express()

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

app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

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

app.use('/api', planRateLimiter)

app.use(compression())

app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes)

app.use(express.json({ 
  limit: '10mb',
  type: ['application/json', 'text/plain']
}))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use(mongoSanitize())

app.use('/uploads', express.static('uploads'))

import { checkMaintenanceMode } from './middleware/maintenance'
app.use(checkMaintenanceMode)

app.use(httpLogger)

app.get('/health', async (req: express.Request, res: express.Response) => {
  const checks = await Promise.all([
    checkMongoDBConnection(),
    checkCloudflareR2Connection(),
    checkOpenAIConnection(),
    checkAIConnection(),
    checkSMTPConnection(),
  ])

  const [mongo, r2, openai, ai, smtp] = checks
  const allConnected = checks.every((c: any) => c.connected)
  const anyConnected = checks.some((c: any) => c.connected)

  const overallStatus = allConnected ? 'healthy' : anyConnected ? 'degraded' : 'unhealthy'
  const httpStatus = mongo.connected ? 200 : 503

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
        openai,
        ai,
        smtp,
      },
    },
  } as IApiResponse)
})

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
app.use('/api/support', supportRoutes)

app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  } as IApiResponse)
})

app.use((error: unknown, req: express.Request, res: express.Response, _next: express.NextFunction): void => {
  void _next
  logger.error({ err: error, method: req.method, url: req.url }, 'Unhandled error')
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

  if (error && typeof error === 'object' && 'name' in error && error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    } as IApiResponse)
    return
  }

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

  const customError = error as CustomError
  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  const statusCode = customError.statusCode || 500

  res.status(statusCode).json({
    success: false,
    message: errorMessage
  } as IApiResponse)
})

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

const checkOpenAIConnection = async (): Promise<{ connected: boolean; message: string }> => {
  try {
    if (config.openai.apiKey) {
      return { connected: true, message: 'OpenAI API configured' }
    } else {
      return { connected: false, message: 'OpenAI API not configured' }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { connected: false, message: `OpenAI API check failed: ${errorMessage}` }
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

const checkAIConnection = async (): Promise<{ connected: boolean; message: string }> => {
  try {
    if (config.ai.apiKey) {
      return { connected: true, message: 'OpenRouter AI configured' }
    } else {
      return { connected: false, message: 'OpenRouter AI not configured' }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { connected: false, message: `AI check failed: ${errorMessage}` }
  }
}

const PORT = config.port
let server: ReturnType<typeof app.listen> | null = null

const startServer = async () => {
  try {
    await connectDatabase()

    server = app.listen(PORT, async () => {
      logger.info({ port: PORT, env: config.nodeEnv }, '🚀 LawCaseAI Server running')
      logger.info({ cors: config.cors.origin }, '🌐 CORS configured')

      logger.info('🔍 Checking service connections...')

      const [mongoStatus, r2Status, openaiStatus, aiStatus, smtpStatus] = await Promise.all([
        checkMongoDBConnection(),
        checkCloudflareR2Connection(),
        checkOpenAIConnection(),
        checkAIConnection(),
        checkSMTPConnection(),
      ])

      logger.info({ ...mongoStatus }, `🗄️  MongoDB Atlas`)
      logger.info({ ...r2Status }, `☁️  Cloudflare R2`)
      logger.info({ ...openaiStatus }, `🤖 OpenAI API`)
      logger.info({ ...aiStatus }, `🤖 OpenRouter AI`)
      logger.info({ ...smtpStatus }, `📧 SMTP Email`)

      logger.info('✨ Server ready to accept connections!')
    })
  } catch (error) {
    logger.fatal({ err: error }, '❌ Failed to start server')
    process.exit(1)
  }
}

const SHUTDOWN_TIMEOUT_MS = 10_000

const gracefulShutdown = async (signal: string) => {
  logger.info({ signal }, `🔄 ${signal} received. Starting graceful shutdown...`)

  const forceExitTimer = setTimeout(() => {
    logger.error('⚠️ Shutdown timeout reached. Forcing exit.')
    process.exit(1)
  }, SHUTDOWN_TIMEOUT_MS)
  forceExitTimer.unref()

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server!.close((err) => {
          if (err) reject(err)
          else resolve()
        })
      })
      logger.info('✅ HTTP server closed (no new connections)')
    }

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

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error({ reason, promise: String(promise) }, 'Unhandled Rejection')
})

process.on('uncaughtException', (error: Error) => {
  logger.fatal({ err: error }, 'Uncaught Exception — shutting down')
  process.exit(1)
})

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

startServer()

export default app
