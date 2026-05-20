import { Router } from 'express'
import { getCaseTrashItems, permanentDelete, restoreItem } from '../controllers/trashController'
import { authenticate } from '../middleware/auth'
import { checkAndResetQuotas } from '../middleware/quotaResetMiddleware'

const router = Router()

router.use(authenticate as any)
router.use(checkAndResetQuotas as any)

router.get('/case/:caseId', getCaseTrashItems as any)
router.post('/restore/:type/:id', restoreItem as any)
router.delete('/permanent/:type/:id', permanentDelete as any)

export default router
