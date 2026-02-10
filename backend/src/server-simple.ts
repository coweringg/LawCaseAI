import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

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
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
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
app.use(morgan('dev'))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: 'development'
  })
})

// API routes
app.use('/api/auth', (req, res) => {
  res.json({ success: false, message: 'Auth endpoint - coming soon' })
})

app.use('/api/user', (req, res) => {
  res.json({ success: false, message: 'User endpoint - coming soon' })
})

app.use('/api/cases', (req, res) => {
  res.json({ success: false, message: 'Cases endpoint - coming soon' })
})

app.use('/api/files', (req, res) => {
  res.json({ success: false, message: 'Files endpoint - coming soon' })
})

app.use('/api/chat', (req, res) => {
  res.json({ success: false, message: 'Chat endpoint - coming soon' })
})

app.use('/api/admin', (req, res) => {
  res.json({ success: false, message: 'Admin endpoint - coming soon' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error)
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error'
  })
})

// Start server
const PORT = 5000

app.listen(PORT, () => {
  console.log(`🚀 LawCaseAI Server running on port ${PORT}`)
  console.log(`📝 Environment: development`)
  console.log(`🌐 CORS Origin: http://localhost:3000`)
})

export default app
