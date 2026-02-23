import { Router } from 'express'
import { body, param } from 'express-validator'
import {
  getProfile,
  updateProfile,
  changePassword,
  updateNotifications,
  getBillingInfo,
  submitSupportRequest,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod
} from '../controllers/userController'
import { authenticate } from '../middleware/auth'
import { handleValidationErrors } from '../middleware/validation'

const router = Router()

// All user routes require authentication
router.use(authenticate)

// GET /api/user/profile
router.get('/profile', getProfile)

// PUT /api/user/profile
router.put('/profile', [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email')
    .optional()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('lawFirm')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Law firm name cannot exceed 200 characters'),
  handleValidationErrors
], updateProfile)

// PUT /api/user/password
router.put('/password', [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  handleValidationErrors
], changePassword)

// PUT /api/user/notifications
router.put('/notifications', [
  body('emailNotifications').optional().isBoolean().withMessage('Must be a boolean'),
  body('caseUpdates').optional().isBoolean().withMessage('Must be a boolean'),
  body('aiResponses').optional().isBoolean().withMessage('Must be a boolean'),
  body('marketingEmails').optional().isBoolean().withMessage('Must be a boolean'),
  handleValidationErrors
], updateNotifications)

// GET /api/user/billing
router.get('/billing', getBillingInfo)

// POST /api/user/payment-methods
router.post('/payment-methods', [
  body('brand')
    .trim()
    .notEmpty().withMessage('Card brand is required'),
  body('last4')
    .trim()
    .notEmpty().withMessage('Last 4 digits required')
    .isLength({ min: 4, max: 4 }).withMessage('Must be exactly 4 digits')
    .isNumeric().withMessage('Must be numeric'),
  body('expiryMonth')
    .isInt({ min: 1, max: 12 }).withMessage('Expiry month must be between 1 and 12'),
  body('expiryYear')
    .isInt({ min: 2024, max: 2050 }).withMessage('Invalid expiry year'),
  handleValidationErrors
], addPaymentMethod)

// DELETE /api/user/payment-methods/:id
router.delete('/payment-methods/:id', [
  param('id').notEmpty().withMessage('Payment method ID is required'),
  handleValidationErrors
], removePaymentMethod)

// PATCH /api/user/payment-methods/:id/default
router.patch('/payment-methods/:id/default', [
  param('id').notEmpty().withMessage('Payment method ID is required'),
  handleValidationErrors
], setDefaultPaymentMethod)

// POST /api/user/support
router.post('/support', [
  body('type')
    .notEmpty().withMessage('Request type is required')
    .isIn(['system_error', 'feature_uplink']).withMessage('Invalid request type'),
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required')
    .isLength({ max: 200 }).withMessage('Subject cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  handleValidationErrors
], submitSupportRequest)

export default router
