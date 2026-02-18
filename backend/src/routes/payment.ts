import { Router } from 'express'
import { createCheckoutSession, confirmPayment, getTransactionHistory } from '../controllers/paymentController'
import { authenticate } from '../middleware/auth'

const router = Router()

// All payment routes require authentication (proper typing)
router.use(authenticate)

router.get('/history', getTransactionHistory)
router.post('/checkout', createCheckoutSession)
router.post('/confirm', confirmPayment)

export default router
