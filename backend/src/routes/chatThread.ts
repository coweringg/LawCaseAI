import { Router } from 'express'
import { getThreads, createThread, renameThread, deleteThread, getThreadMessages } from '../controllers/chatThreadController'
import { authenticate } from '../middleware/auth'
import { checkAndResetQuotas } from '../middleware/quotaResetMiddleware'
import { checkTrialStatus } from '../middleware/trialMiddleware'

const router = Router()

router.use(authenticate)
router.use(checkAndResetQuotas)
router.use(checkTrialStatus)

// Get all threads for a case
router.get('/case/:caseId', getThreads)

// Create a new thread in a case
router.post('/case/:caseId', createThread)

// Rename a thread
router.patch('/:threadId', renameThread)

// Delete a thread
router.delete('/:threadId', deleteThread)

// Get messages for a specific thread
router.get('/:threadId/messages', getThreadMessages)

export default router
