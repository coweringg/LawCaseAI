import { Router } from 'express'
import { getChatHistory, clearChatHistory } from '../controllers/chatController'
import { authenticate } from '../middleware/auth'
import { checkAndResetQuotas } from '../middleware/quotaResetMiddleware'
import { checkTrialStatus } from '../middleware/trialMiddleware'
import { validateZod } from '../middleware/validateZod'
import { caseIdParamSchema } from '../schemas'

const router = Router()

router.use(authenticate)
router.use(checkAndResetQuotas)
router.use(checkTrialStatus)

router.get('/case/:caseId',
  validateZod({ params: caseIdParamSchema }),
  getChatHistory
)

router.delete('/case/:caseId',
  validateZod({ params: caseIdParamSchema }),
  clearChatHistory
)

export default router
