import { Router } from 'express'
import { chatWithAI, analyzeCaseFile, getCaseSummary } from '../controllers/aiController'
import { authenticate } from '../middleware/auth'

const router = Router()

// All AI routes are protected
router.use(authenticate as any)

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with AI about a case
 */
router.post('/chat', chatWithAI as any)

/**
 * @route   POST /api/ai/analyze/:fileId
 * @desc    Analyze a specific document
 */
router.post('/analyze/:fileId', analyzeCaseFile as any)

/**
 * @route   GET /api/ai/summary/:caseId
 * @desc    Get overall case summary
 */
router.get('/summary/:caseId', getCaseSummary as any)

export default router
