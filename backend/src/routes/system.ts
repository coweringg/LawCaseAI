import { Router } from 'express'
import { getSystemStatus } from '../controllers/systemController'

const router = Router()

// Public route for system status (used by frontend polling)
router.get('/status', getSystemStatus)

export default router
