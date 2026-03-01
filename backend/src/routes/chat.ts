import { Router } from 'express'
import { param } from 'express-validator'
import { getChatHistory, clearChatHistory } from '../controllers/chatController'
import { authenticate } from '../middleware/auth'
import { checkAndResetQuotas } from '../middleware/quotaResetMiddleware'
import { handleValidationErrors } from '../middleware/validation'

const router = Router()

// All chat routes are protected
router.use(authenticate)
router.use(checkAndResetQuotas)

/**
 * @route   GET /api/chat/case/:caseId
 * @desc    Get chat history for a case
 */
router.get('/case/:caseId', [
  param('caseId').isMongoId().withMessage('Invalid case ID'),
  handleValidationErrors
], getChatHistory)

/**
 * @route   DELETE /api/chat/case/:caseId
 * @desc    Clear chat history for a case
 */
router.delete('/case/:caseId', [
  param('caseId').isMongoId().withMessage('Invalid case ID'),
  handleValidationErrors
], clearChatHistory)

export default router
