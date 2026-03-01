import { Router } from 'express'
import { getDashboardStats, searchGlobal } from '../controllers/dashboardController'
import { authenticate } from '../middleware/auth'
import { checkAndResetQuotas } from '../middleware/quotaResetMiddleware'

const router = Router()

router.get('/stats', authenticate as any, checkAndResetQuotas as any, getDashboardStats as any)
router.get('/search', authenticate as any, checkAndResetQuotas as any, searchGlobal as any)

export default router
