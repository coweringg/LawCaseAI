import { Router } from 'express'
import { body, param } from 'express-validator'
import { chatWithAI, analyzeCaseFile, getCaseSummary, globalAudit } from '../controllers/aiController'
import { authenticate } from '../middleware/auth'
import { checkAndResetQuotas } from '../middleware/quotaResetMiddleware'
import { handleValidationErrors } from '../middleware/validation'
import { checkTrialStatus } from '../middleware/trialMiddleware'

const router = Router()

router.use(authenticate)
router.use(checkAndResetQuotas)
router.use(checkTrialStatus)

router.post('/chat', [
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ max: 5000 }).withMessage('Message cannot exceed 5000 characters'),
  body('caseId')
    .optional()
    .isMongoId().withMessage('Invalid case ID'),
  handleValidationErrors
], chatWithAI)

router.post('/analyze/:fileId', [
  param('fileId').isMongoId().withMessage('Invalid file ID'),
  handleValidationErrors
], analyzeCaseFile)

router.get('/summary/:caseId', [
  param('caseId').isMongoId().withMessage('Invalid case ID'),
  handleValidationErrors
], getCaseSummary)

router.post('/global-audit', globalAudit)

export default router
