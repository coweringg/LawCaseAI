import { Router } from 'express'
import { 
  createCheckoutSession, 
  confirmPayment, 
  getTransactionHistory, 
  purchaseBusinessPlan, 
  getOrganizationDetails, 
  confirmPurchase 
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

export default router
