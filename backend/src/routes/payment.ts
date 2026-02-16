import { Router } from 'express'
import { createCheckoutSession, confirmPayment } from '../controllers/paymentController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.post('/checkout', authenticate as any, createCheckoutSession)
router.post('/confirm', authenticate as any, confirmPayment)

export default router
