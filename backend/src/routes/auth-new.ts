import { Router } from 'express'
import { body } from 'express-validator'
import { handleValidationErrors } from '../middleware/validation'
import { authenticate } from '../middleware/auth'
import { register, login, refreshToken, logout } from '../controllers/authController'

const router = Router()

// Validation rules
const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('lawFirm').trim().isLength({ min: 2, max: 200 }).withMessage('Law firm name must be between 2 and 200 characters')
]

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
]

// Routes
router.post('/register', registerValidation, handleValidationErrors, register)
router.post('/login', loginValidation, handleValidationErrors, login)
router.post('/refresh', authenticate, refreshToken)
router.post('/logout', authenticate, logout)

export default router
