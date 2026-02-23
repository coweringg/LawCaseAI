import { Router } from 'express'
import { body, param } from 'express-validator'
import { 
  createCheckoutSession, 
  confirmPayment, 
  getTransactionHistory, 
  purchaseBusinessPlan, 
  getOrganizationDetails, 
  confirmPurchase,
  increaseSeats,
  getOrganizationMembers,
  removeMember
} from '../controllers/paymentController'
import { authenticate } from '../middleware/auth'
import { handleValidationErrors } from '../middleware/validation'

const router = Router()

// All payment routes require authentication
router.use(authenticate)

// GET /api/payments/history
router.get('/history', getTransactionHistory)

// GET /api/payments/organization
router.get('/organization', getOrganizationDetails)

// POST /api/payments/checkout
router.post('/checkout', [
  body('plan')
    .notEmpty().withMessage('Plan is required')
    .isIn(['basic', 'professional', 'elite', 'enterprise']).withMessage('Invalid plan'),
  body('billingInterval')
    .optional()
    .isIn(['monthly', 'annual']).withMessage('Billing interval must be monthly or annual'),
  handleValidationErrors
], createCheckoutSession)

// POST /api/payments/confirm
router.post('/confirm', [
  body('paymentId')
    .optional()
    .isString().withMessage('Payment ID must be a string'),
  handleValidationErrors
], confirmPayment)

// POST /api/payments/confirm-purchase
router.post('/confirm-purchase', [
  body('plan')
    .notEmpty().withMessage('Plan is required')
    .isIn(['basic', 'professional', 'elite', 'enterprise']).withMessage('Invalid plan'),
  handleValidationErrors
], confirmPurchase)

// POST /api/payments/purchase-business
router.post('/purchase-business', [
  body('seats')
    .optional()
    .isInt({ min: 1, max: 1000 }).withMessage('Seats must be between 1 and 1000'),
  handleValidationErrors
], purchaseBusinessPlan)

// POST /api/payments/increase-seats
router.post('/increase-seats', [
  body('additionalSeats')
    .notEmpty().withMessage('Additional seats is required')
    .isInt({ min: 1, max: 100 }).withMessage('Additional seats must be between 1 and 100'),
  handleValidationErrors
], increaseSeats)

// GET /api/payments/members
router.get('/members', getOrganizationMembers)

// DELETE /api/payments/members/:memberId
router.delete('/members/:memberId', [
  param('memberId').isMongoId().withMessage('Invalid member ID'),
  handleValidationErrors
], removeMember)

export default router
