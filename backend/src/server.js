const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3')
const axios = require('axios')

// Load environment variables
require('dotenv').config()

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

// Mock database (in production, use real MongoDB)
const users = []
const cases = []
const files = []
const chatMessages = []

// JWT Secret
const JWT_SECRET = 'lawcaseai-super-secret-jwt-key-for-development-change-in-production'

// Helper functions
const generateToken = (userId, email, role) => {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' })
}

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = users.find(u => u.id === decoded.userId)
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    })
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: 'development'
  })
})

// AUTH ROUTES
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, lawFirm } = req.body

    // Check if user already exists by email
    const existingUser = users.find(u => u.email === email)
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      })
    }

    // Check if name is already taken
    const existingName = users.find(u => u.name === name)
    if (existingName) {
      return res.status(400).json({
        success: false,
        message: 'Name is already in use by another user'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      lawFirm,
      role: 'lawyer',
      plan: 'basic',
      planLimit: 5,
      currentCases: 0,
      status: 'active',
      createdAt: new Date(),
      lastLogin: new Date()
    }

    users.push(user)

    // Generate token
    const token = generateToken(user.id, user.email, user.role)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          lawFirm: user.lawFirm,
          role: user.role,
          plan: user.plan,
          planLimit: user.planLimit,
          currentCases: user.currentCases,
          createdAt: user.createdAt
        },
        token
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = users.find(u => u.email === email)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Update last login
    user.lastLogin = new Date()

    // Generate token
    const token = generateToken(user.id, user.email, user.role)

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          lawFirm: user.lawFirm,
          role: user.role,
          plan: user.plan,
          planLimit: user.planLimit,
          currentCases: user.currentCases,
          lastLogin: user.lastLogin
        },
        token
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
    })
  }
})

// USER ROUTES
app.get('/api/user/profile', authenticate, (req, res) => {
  const user = req.user
  
  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      lawFirm: user.lawFirm,
      role: user.role,
      plan: user.plan,
      planLimit: user.planLimit,
      currentCases: user.currentCases,
      status: user.status,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }
  })
})

app.put('/api/user/profile', authenticate, (req, res) => {
  const user = req.user
  const { name, email, lawFirm } = req.body

  // Check if name is being changed and if it's already taken
  if (name && name !== user.name) {
    const existingUser = users.find(u => u.name === name && u.id !== user.id)
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Name is already in use by another user'
      })
    }
  }

  // Check if email is being changed and if it's already taken
  if (email && email !== user.email) {
    const existingUser = users.find(u => u.email === email.toLowerCase() && u.id !== user.id)
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email address is already in use'
      })
    }
  }

  // Update user
  user.name = name || user.name
  user.email = email ? email.toLowerCase() : user.email
  user.lawFirm = lawFirm || user.lawFirm

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      lawFirm: user.lawFirm,
      role: user.role,
      plan: user.plan,
      planLimit: user.planLimit,
      currentCases: user.currentCases,
      status: user.status,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }
  })
})

app.put('/api/user/password', authenticate, async (req, res) => {
  const user = req.user
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password and new password are required'
    })
  }

  try {
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      })
    }

    // Check if new password is the same as current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from your current password'
      })
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12)
    user.password = hashedNewPassword

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    })
  } catch (error) {
    console.error('Password update error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update password'
    })
  }
})

app.put('/api/user/notifications', authenticate, (req, res) => {
  const user = req.user
  const notifications = req.body

  user.notifications = notifications

  res.status(200).json({
    success: true,
    message: 'Notification preferences updated successfully'
  })
})

app.post('/api/user/upgrade', authenticate, (req, res) => {
  const user = req.user
  const { plan } = req.body

  if (!plan || !['basic', 'professional', 'enterprise'].includes(plan)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid plan selected'
    })
  }

  const planLimits = { basic: 5, professional: 25, enterprise: 100 }
  
  user.plan = plan
  user.planLimit = planLimits[plan]

  res.status(200).json({
    success: true,
    message: 'Plan upgraded successfully',
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      lawFirm: user.lawFirm,
      role: user.role,
      plan: user.plan,
      planLimit: user.planLimit,
      currentCases: user.currentCases,
      status: user.status,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }
  })
})

// CASE ROUTES
app.get('/api/cases', authenticate, (req, res) => {
  const user = req.user
  const { status, search, page = 1, limit = 10 } = req.query

  // Filter cases by user
  let userCases = cases.filter(c => c.userId === user.id)

  // Filter by status
  if (status) {
    userCases = userCases.filter(c => c.status === status)
  }

  // Search
  if (search) {
    const searchTerm = search.toLowerCase()
    userCases = userCases.filter(c => 
      c.name.toLowerCase().includes(searchTerm) ||
      c.client.toLowerCase().includes(searchTerm) ||
      c.description.toLowerCase().includes(searchTerm)
    )
  }

  // Pagination
  const startIndex = (Number(page) - 1) * Number(limit)
  const endIndex = startIndex + Number(limit)
  const paginatedCases = userCases.slice(startIndex, endIndex)

  res.status(200).json({
    success: true,
    message: 'Cases retrieved successfully',
    data: {
      cases: paginatedCases,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: userCases.length,
        pages: Math.ceil(userCases.length / Number(limit))
      }
    }
  })
})

app.post('/api/cases', authenticate, (req, res) => {
  const user = req.user
  const { name, client, description } = req.body

  // Check plan limit
  if (user.currentCases >= user.planLimit) {
    return res.status(403).json({
      success: false,
      message: 'Plan limit reached. Please upgrade your plan to create more cases.',
      data: {
        current: user.currentCases,
        limit: user.planLimit,
        plan: user.plan
      }
    })
  }

  // Create case
  const case_ = {
    id: Date.now().toString(),
    name,
    client,
    description,
    userId: user.id,
    status: 'active',
    fileCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  cases.push(case_)
  user.currentCases += 1

  res.status(201).json({
    success: true,
    message: 'Case created successfully',
    data: case_
  })
})

app.get('/api/cases/:id', authenticate, (req, res) => {
  const user = req.user
  const { id } = req.params

  const case_ = cases.find(c => c.id === id && c.userId === user.id)

  if (!case_) {
    return res.status(404).json({
      success: false,
      message: 'Case not found'
    })
  }

  res.status(200).json({
    success: true,
    message: 'Case retrieved successfully',
    data: case_
  })
})

app.put('/api/cases/:id', authenticate, (req, res) => {
  const user = req.user
  const { id } = req.params
  const updates = req.body

  const caseIndex = cases.findIndex(c => c.id === id && c.userId === user.id)

  if (caseIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Case not found'
    })
  }

  // Update case
  cases[caseIndex] = { ...cases[caseIndex], ...updates, updatedAt: new Date() }

  res.status(200).json({
    success: true,
    message: 'Case updated successfully',
    data: cases[caseIndex]
  })
})

app.delete('/api/cases/:id', authenticate, (req, res) => {
  const user = req.user
  const { id } = req.params

  const caseIndex = cases.findIndex(c => c.id === id && c.userId === user.id)

  if (caseIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Case not found'
    })
  }

  // Delete case
  const deletedCase = cases.splice(caseIndex, 1)[0]
  user.currentCases -= 1

  res.status(200).json({
    success: true,
    message: 'Case deleted successfully'
  })
})

// FILE ROUTES
app.post('/api/files/upload', authenticate, (req, res) => {
  const user = req.user
  const { caseId, name, size, type } = req.body

  // Check if case belongs to user
  const case_ = cases.find(c => c.id === caseId && c.userId === user.id)
  if (!case_) {
    return res.status(404).json({
      success: false,
      message: 'Case not found'
    })
  }

  // Create file
  const fileId = Date.now().toString()
  const file = {
    id: fileId,
    name,
    size,
    type,
    caseId,
    userId: user.id,
    url: `https://example.com/files/${fileId}`,
    uploadedAt: new Date()
  }

  files.push(file)
  case_.fileCount += 1

  res.status(201).json({
    success: true,
    message: 'File uploaded successfully',
    data: file
  })
})

app.get('/api/files/case/:caseId', authenticate, (req, res) => {
  const user = req.user
  const { caseId } = req.params

  // Check if case belongs to user
  const case_ = cases.find(c => c.id === caseId && c.userId === user.id)
  if (!case_) {
    return res.status(404).json({
      success: false,
      message: 'Case not found'
    })
  }

  const caseFiles = files.filter(f => f.caseId === caseId)

  res.status(200).json({
    success: true,
    message: 'Files retrieved successfully',
    data: caseFiles
  })
})

app.delete('/api/files/:id', authenticate, (req, res) => {
  const user = req.user
  const { id } = req.params

  const fileIndex = files.findIndex(f => f.id === id && f.userId === user.id)

  if (fileIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    })
  }

  const deletedFile = files.splice(fileIndex, 1)[0]

  // Update case file count
  const case_ = cases.find(c => c.id === deletedFile.caseId)
  if (case_) {
    case_.fileCount -= 1
  }

  res.status(200).json({
    success: true,
    message: 'File deleted successfully'
  })
})

// CHAT ROUTES
app.get('/api/chat/case/:caseId', authenticate, (req, res) => {
  const user = req.user
  const { caseId } = req.params

  // Check if case belongs to user
  const case_ = cases.find(c => c.id === caseId && c.userId === user.id)
  if (!case_) {
    return res.status(404).json({
      success: false,
      message: 'Case not found'
    })
  }

  const messages = chatMessages.filter(m => m.caseId === caseId)

  res.status(200).json({
    success: true,
    message: 'Chat messages retrieved successfully',
    data: messages
  })
})

app.post('/api/chat/case/:caseId', authenticate, (req, res) => {
  const user = req.user
  const { caseId } = req.params
  const { content } = req.body

  // Check if case belongs to user
  const case_ = cases.find(c => c.id === caseId && c.userId === user.id)
  if (!case_) {
    return res.status(404).json({
      success: false,
      message: 'Case not found'
    })
  }

  // Create user message
  const userMessage = {
    id: Date.now().toString(),
    content,
    sender: 'user',
    caseId,
    userId: user.id,
    timestamp: new Date()
  }

  chatMessages.push(userMessage)

  // Simulate AI response
  setTimeout(() => {
    const aiMessage = {
      id: (Date.now() + 1).toString(),
      content: 'I understand your case. Based on the information provided, I recommend reviewing the relevant statutes and case law. Would you like me to help you draft a motion or prepare for discovery?',
      sender: 'ai',
      caseId,
      userId: user.id,
      timestamp: new Date(),
      metadata: {
        model: 'gpt-3.5-turbo',
        tokens: 150,
        responseTime: 1200
      }
    }
    chatMessages.push(aiMessage)
  }, 1000)

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: userMessage
  })
})

// ADMIN ROUTES
app.get('/api/admin/stats', authenticate, (req, res) => {
  const user = req.user

  if (user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    })
  }

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalCases: cases.length,
    totalFiles: files.length,
    totalRevenue: users.length * 79, // Mock revenue calculation
    monthlyRevenue: Math.floor(users.length * 79 / 12)
  }

  res.status(200).json({
    success: true,
    message: 'Admin stats retrieved successfully',
    data: stats
  })
})

app.get('/api/admin/users', authenticate, (req, res) => {
  const user = req.user

  if (user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    })
  }

  const { search, status, plan, page = 1, limit = 10 } = req.query

  let filteredUsers = users.filter(u => u.role !== 'admin')

  // Apply filters
  if (search) {
    const searchTerm = search.toLowerCase()
    filteredUsers = filteredUsers.filter(u => 
      u.name.toLowerCase().includes(searchTerm) ||
      u.email.toLowerCase().includes(searchTerm) ||
      u.lawFirm.toLowerCase().includes(searchTerm)
    )
  }

  if (status) {
    filteredUsers = filteredUsers.filter(u => u.status === status)
  }

  if (plan) {
    filteredUsers = filteredUsers.filter(u => u.plan === plan)
  }

  // Pagination
  const startIndex = (Number(page) - 1) * Number(limit)
  const endIndex = startIndex + Number(limit)
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: {
      users: paginatedUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        lawFirm: u.lawFirm,
        role: u.role,
        plan: u.plan,
        planLimit: u.planLimit,
        currentCases: u.currentCases,
        status: u.status,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: filteredUsers.length,
        pages: Math.ceil(filteredUsers.length / Number(limit))
      }
    }
  })
})

app.put('/api/admin/users/:id/status', authenticate, (req, res) => {
  const user = req.user

  if (user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    })
  }

  const { id } = req.params
  const { status } = req.body

  const targetUser = users.find(u => u.id === id && u.role !== 'admin')
  if (!targetUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }

  targetUser.status = status

  res.status(200).json({
    success: true,
    message: 'User status updated successfully'
  })
})

app.put('/api/admin/users/:id/plan', authenticate, (req, res) => {
  const user = req.user

  if (user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    })
  }

  const { id } = req.params
  const { plan } = req.body

  const targetUser = users.find(u => u.id === id && u.role !== 'admin')
  if (!targetUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }

  const planLimits = { basic: 5, professional: 25, enterprise: 100 }
  targetUser.plan = plan
  targetUser.planLimit = planLimits[plan]

  res.status(200).json({
    success: true,
    message: 'User plan updated successfully'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error)
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error'
  })
})

// Connection verification functions
const checkMongoDBConnection = async () => {
  try {
    if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'mongodb://localhost:27017/lawcaseai') {
      await mongoose.connect(process.env.MONGODB_URI)
      await mongoose.connection.close()
      return { connected: true, message: 'MongoDB Atlas connected' }
    } else {
      return { connected: false, message: 'MongoDB Atlas not configured (using mock database)' }
    }
  } catch (error) {
    return { connected: false, message: `MongoDB Atlas connection failed: ${error.message}` }
  }
}

const checkCloudflareR2Connection = async () => {
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
  } catch (error) {
    return { connected: false, message: `Cloudflare R2 connection failed: ${error.message}` }
  }
}

const checkFreeLLMConnection = async () => {
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
  } catch (error) {
    return { connected: false, message: `FreeLLM API connection failed: ${error.message}` }
  }
}

const checkSMTPConnection = async () => {
  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      // For now, just check if configuration exists
      // In a real implementation, you could test SMTP connection
      return { connected: true, message: 'SMTP configured' }
    } else {
      return { connected: false, message: 'SMTP not configured' }
    }
  } catch (error) {
    return { connected: false, message: `SMTP configuration error: ${error.message}` }
  }
}

// Start server
const PORT = process.env.PORT || 5000

app.listen(PORT, async () => {
  console.log(`🚀 LawCaseAI Server running on port ${PORT}`)
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 CORS Origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
  console.log(`📊 Mock database initialized`)
  console.log(`👥 Users: ${users.length}`)
  console.log(`📁 Cases: ${cases.length}`)
  
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

module.exports = app
