import { Router } from 'express'
import { createCheckoutSession, confirmPayment, getTransactionHistory } from '../controllers/paymentController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/history', authenticate as any, getTransactionHistory)
router.post('/checkout', authenticate as any, createCheckoutSession)
router.post('/confirm', authenticate as any, confirmPayment)

export default router
