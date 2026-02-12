import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3'
import axios from 'axios'
import { connectDatabase } from './config/database'
import config from './config'
import { IApiResponse } from './types'

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

// Compression
app.use(compression())

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  } as IApiResponse)
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/cases', caseRoutes)
app.use('/api/files', fileRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/admin', adminRoutes)

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  } as IApiResponse)
})

// Global error handler
app.use((error: unknown, req: express.Request, res: express.Response, _next: express.NextFunction): void => {
  // Express requires _next parameter for error middleware signature
  void _next;
  console.error('Global error handler:', error)

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

// Connection verification functions
const checkMongoDBConnection = async (): Promise<{ connected: boolean; message: string }> => {
  try {
    if (mongoose.connection.readyState === 1) {
      return { connected: true, message: 'MongoDB Atlas connected' }
    }

    if (mongoose.connection.readyState === 2) {
      return { connected: false, message: 'MongoDB Atlas connecting...' }
    }

    return {
      connected: false,
      message: 'MongoDB Atlas not connected'
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      connected: false,
      message: `MongoDB Atlas status check failed: ${errorMessage}`
    }
  }
}


const checkCloudflareR2Connection = async (): Promise<{ connected: boolean; message: string }> => {
  try {
    if (process.env.CLOUDFLARE_R2_ACCESS_KEY_ID && 
        process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY && 
        process.env.CLOUDFLARE_R2_ENDPOINT) {
      
      const s3Client = new S3Client({
        region: 'auto',
        endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
        credentials: {
          accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
        },
      })

      // Try to list buckets to verify connection
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
    if (process.env.FREELLm_API_KEY && process.env.FREELLm_BASE_URL) {
      const response = await axios.get(`${process.env.FREELLm_BASE_URL}/models`, {
        headers: {
          'Authorization': `Bearer ${process.env.FREELLm_API_KEY}`,
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
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      // For now, just check if configuration exists
      // In a real implementation, you could test SMTP connection
      return { connected: true, message: 'SMTP configured' }
    } else {
      return { connected: false, message: 'SMTP not configured' }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { connected: false, message: `SMTP configuration error: ${errorMessage}` }
  }
}

// Start server
const PORT = config.port

const startServer = async () => {
  try {
    await connectDatabase()
    
    app.listen(PORT, async () => {
      console.log(`🚀 LawCaseAI Server running on port ${PORT}`)
      console.log(`📝 Environment: ${config.nodeEnv}`)
      console.log(`🌐 CORS Origin: ${config.cors.origin}`)
      
      console.log('\n🔍 Checking service connections...')
      
      // Check all connections
      const mongoStatus = await checkMongoDBConnection()
      const r2Status = await checkCloudflareR2Connection()
      const llmStatus = await checkFreeLLMConnection()
      const smtpStatus = await checkSMTPConnection()
      
      // Display connection status
      console.log('\n📡 Service Connection Status:')
      console.log(`🗄️  MongoDB Atlas: ${mongoStatus.connected ? '✅' : '❌'} ${mongoStatus.message}`)
      console.log(`☁️  Cloudflare R2: ${r2Status.connected ? '✅' : '❌'} ${r2Status.message}`)
      console.log(`🤖 FreeLLM API: ${llmStatus.connected ? '✅' : '❌'} ${llmStatus.message}`)
      console.log(`📧 SMTP Email: ${smtpStatus.connected ? '✅' : '❌'} ${smtpStatus.message}`)
      
      console.log('\n✨ Server ready to accept connections!')
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received. Shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received. Shutting down gracefully...')
  process.exit(0)
})

startServer()

export default app
