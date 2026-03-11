import { Router } from 'express'
import { param } from 'express-validator'
import { getChatHistory, clearChatHistory } from '../controllers/chatController'
import { authenticate } from '../middleware/auth'
import { checkAndResetQuotas } from '../middleware/quotaResetMiddleware'
import { handleValidationErrors } from '../middleware/validation'
import { checkTrialStatus } from '../middleware/trialMiddleware'

const router = Router()

router.use(authenticate)
router.use(checkAndResetQuotas)
router.use(checkTrialStatus)

router.get('/case/:caseId', [
  param('caseId').isMongoId().withMessage('Invalid case ID'),
  handleValidationErrors
], getChatHistory)

router.delete('/case/:caseId', [
  param('caseId').isMongoId().withMessage('Invalid case ID'),
  handleValidationErrors
], clearChatHistory)

export default router
