import { Router } from 'express'
import { body, param } from 'express-validator'
import { chatWithAI, analyzeCaseFile, getCaseSummary, globalAudit } from '../controllers/aiController'
import { authenticate } from '../middleware/auth'
import { checkAndResetQuotas } from '../middleware/quotaResetMiddleware'
import { handleValidationErrors } from '../middleware/validation'

const router = Router()

// All AI routes are protected
router.use(authenticate)
router.use(checkAndResetQuotas)

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with AI about a case
 */
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

/**
 * @route   POST /api/ai/analyze/:fileId
 * @desc    Analyze a specific document
 */
router.post('/analyze/:fileId', [
  param('fileId').isMongoId().withMessage('Invalid file ID'),
  handleValidationErrors
], analyzeCaseFile)

/**
 * @route   GET /api/ai/summary/:caseId
 * @desc    Get overall case summary
 */
router.get('/summary/:caseId', [
  param('caseId').isMongoId().withMessage('Invalid case ID'),
  handleValidationErrors
], getCaseSummary)

/**
 * @route   POST /api/ai/global-audit
 * @desc    Perform global intelligence audit
 */
router.post('/global-audit', globalAudit)

export default router
