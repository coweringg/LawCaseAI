import { Router } from 'express'
import { chatWithAI, analyzeCaseFile, getCaseSummary, globalAudit } from '../controllers/aiController'
import { authenticate } from '../middleware/auth'
import { checkAndResetQuotas } from '../middleware/quotaResetMiddleware'
import { checkTrialStatus } from '../middleware/trialMiddleware'
import { validateZod } from '../middleware/validateZod'
import { chatSchema, analyzeParamsSchema, summaryParamsSchema } from '../schemas'

const router = Router()

router.use(authenticate)
router.use(checkAndResetQuotas)
router.use(checkTrialStatus)

router.post('/chat',
  validateZod({ body: chatSchema }),
  chatWithAI
)

router.post('/analyze/:fileId',
  validateZod({ params: analyzeParamsSchema }),
  analyzeCaseFile
)

router.get('/summary/:caseId',
  validateZod({ params: summaryParamsSchema }),
  getCaseSummary
)

router.post('/global-audit', globalAudit)

export default router
