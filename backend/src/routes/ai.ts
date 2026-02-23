import { Router } from 'express'
import { body, param } from 'express-validator'
import { chatWithAI, analyzeCaseFile, getCaseSummary } from '../controllers/aiController'
import { authenticate } from '../middleware/auth'
import { handleValidationErrors } from '../middleware/validation'

const router = Router()

// All AI routes are protected
router.use(authenticate)

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

export default router
