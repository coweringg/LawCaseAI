import { Router } from 'express'
import { getDashboardStats, searchGlobal } from '../controllers/dashboardController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/stats', authenticate as any, getDashboardStats as any)
router.get('/search', authenticate as any, searchGlobal as any)

export default router
