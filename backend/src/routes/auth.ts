import { Router } from 'express'
import { body } from 'express-validator'
import rateLimit from 'express-rate-limit'
import {
  register,
  registerAdmin,
  login,
  refreshToken,
  logout
} from '../controllers/authController'
import { authenticate } from '../middleware/auth'
import { handleValidationErrors, validateRequest } from '../middleware/validation'

const router = Router()

// Stricter rate limiting for auth endpoints (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    success: false,
    message: 'Too many login attempts from your IP. For your security, access has been temporarily locked. Please wait 15 minutes before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Registration validation
router.post('/register', authLimiter, [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  body('lawFirm')
    .trim()
    .notEmpty().withMessage('Law firm name is required')
    .isLength({ max: 200 }).withMessage('Law firm name cannot exceed 200 characters'),
  handleValidationErrors
], register)

// Secure Admin Registration (Requires X-Admin-Key header)
router.post('/register-admin', [
  validateRequest,
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('lawFirm').trim().notEmpty().withMessage('Law firm name is required'),
  handleValidationErrors
], registerAdmin)

// Login validation
router.post('/login', authLimiter, [
  body('email')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
], login)

router.post('/refresh', authenticate, refreshToken)
router.post('/logout', authenticate, logout)

export default router
