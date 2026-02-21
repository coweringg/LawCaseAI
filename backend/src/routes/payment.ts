import { Router } from 'express'
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

const router = Router()

// All payment routes require authentication (proper typing)
router.use(authenticate)

router.get('/history', getTransactionHistory)
router.get('/organization', getOrganizationDetails)
router.post('/checkout', createCheckoutSession)
router.post('/confirm', confirmPayment)
router.post('/confirm-purchase', confirmPurchase)
router.post('/purchase-business', purchaseBusinessPlan)
router.post('/increase-seats', increaseSeats) // Added
router.get('/members', getOrganizationMembers) // Added
router.delete('/members/:memberId', removeMember) // Added

export default router
