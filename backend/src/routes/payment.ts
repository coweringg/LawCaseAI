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
import { checkAndResetQuotas } from '../middleware/quotaResetMiddleware'
import { handleValidationErrors } from '../middleware/validation'

const router = Router()

router.use(authenticate)
router.use(checkAndResetQuotas)

router.get('/history', getTransactionHistory)

router.get('/organization', getOrganizationDetails)

router.post('/checkout', [
  body('plan')
    .notEmpty().withMessage('Plan is required')
    .isIn(['basic', 'professional', 'elite', 'enterprise']).withMessage('Invalid plan'),
  body('billingInterval')
    .optional()
    .isIn(['monthly', 'annual']).withMessage('Billing interval must be monthly or annual'),
  handleValidationErrors
], createCheckoutSession)

router.post('/confirm', [
  body('paymentId')
    .optional()
    .isString().withMessage('Payment ID must be a string'),
  handleValidationErrors
], confirmPayment)

router.post('/confirm-purchase', [
  body('plan')
    .notEmpty().withMessage('Plan is required')
    .isIn(['basic', 'professional', 'elite', 'enterprise']).withMessage('Invalid plan'),
  handleValidationErrors
], confirmPurchase)

router.post('/purchase-business', [
  body('seats')
    .optional()
    .isInt({ min: 1, max: 1000 }).withMessage('Seats must be between 1 and 1000'),
  handleValidationErrors
], purchaseBusinessPlan)

router.post('/increase-seats', [
  body('additionalSeats')
    .notEmpty().withMessage('Additional seats is required')
    .isInt({ min: 1, max: 100 }).withMessage('Additional seats must be between 1 and 100'),
  handleValidationErrors
], increaseSeats)

router.get('/members', getOrganizationMembers)

router.delete('/members/:memberId', [
  param('memberId').isMongoId().withMessage('Invalid member ID'),
  handleValidationErrors
], removeMember)

export default router
