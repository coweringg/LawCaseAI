import { Router } from 'express'
import { body, param } from 'express-validator'
import { 
  createCheckoutSession, 
  getTransactionHistory, 
  getOrganizationDetails, 
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
  body('planId')
    .notEmpty().withMessage('Plan ID is required')
    .isIn(['basic', 'professional', 'elite', 'enterprise']).withMessage('Invalid plan'),
  body('interval')
    .optional()
    .isIn(['monthly', 'annual']).withMessage('Billing interval must be monthly or annual'),
  handleValidationErrors
], createCheckoutSession)

router.get('/members', getOrganizationMembers)

router.delete('/members/:memberId', [
  param('memberId').isMongoId().withMessage('Invalid member ID'),
  handleValidationErrors
], removeMember)

export default router
