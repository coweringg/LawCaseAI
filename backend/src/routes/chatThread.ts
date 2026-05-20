import { Router } from 'express'
import { createThread, deleteThread, getThreadMessages, getThreads, renameThread } from '../controllers/chatThreadController'
import { authenticate } from '../middleware/auth'
import { checkAndResetQuotas } from '../middleware/quotaResetMiddleware'
import { checkTrialStatus } from '../middleware/trialMiddleware'

const router = Router()

router.use(authenticate)
router.use(checkAndResetQuotas)
router.use(checkTrialStatus)

router.get('/case/:caseId', getThreads)

router.post('/case/:caseId', createThread)

router.patch('/:threadId', renameThread)

router.delete('/:threadId', deleteThread)

router.get('/:threadId/messages', getThreadMessages)

export default router
