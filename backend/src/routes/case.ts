import { Router } from 'express'
import { createCase, getCases, getCaseStats, getCaseById, updateCase, deleteCase, reactivateCase } from '../controllers/caseController'
import { authenticate } from '../middleware/auth'
import { checkAndResetQuotas } from '../middleware/quotaResetMiddleware'
import { validateZod } from '../middleware/validateZod'
import { createCaseSchema, updateCaseSchema, caseParamsSchema } from '../schemas'

const router = Router()

router.use(authenticate)
router.use(checkAndResetQuotas)

router.get('/', getCases)

router.get('/stats', getCaseStats)

router.post('/',
  validateZod({ body: createCaseSchema }),
  createCase
)

router.get('/:id',
  validateZod({ params: caseParamsSchema }),
  getCaseById
)

router.put('/:id',
  validateZod({ params: caseParamsSchema, body: updateCaseSchema }),
  updateCase
)

router.put('/:id/reactivate',
  validateZod({ params: caseParamsSchema }),
  reactivateCase
)

router.delete('/:id',
  validateZod({ params: caseParamsSchema }),
  deleteCase
)

export default router
