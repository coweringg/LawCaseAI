import { Router } from 'express'
import { handlePaddleWebhook } from '../controllers/webhookController'

const router = Router()

router.post('/paddle', handlePaddleWebhook)

export default router
