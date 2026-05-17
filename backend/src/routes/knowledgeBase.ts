import { Router } from 'express'
import {
  getUserLibrary,
  incrementDocumentAccess
} from '../controllers/knowledgeBaseController'
import { createKnowledgeRequest } from '../controllers/knowledgeRequestController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(authenticate)

router.get('/library', getUserLibrary)
router.post('/documents/:id/access', incrementDocumentAccess)
router.post('/requests', createKnowledgeRequest)

export default router
