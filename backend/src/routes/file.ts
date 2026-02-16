import { Router } from 'express'
import { uploadFile, getCaseFiles } from '../controllers/fileController'
import { authenticate } from '../middleware/auth'
import { uploadSingle } from '../utils/fileUpload'

const router = Router()

router.post('/upload', authenticate as any, uploadSingle, uploadFile as any)
router.get('/case/:caseId', authenticate as any, getCaseFiles as any)

// router.get('/:id', authenticate as any, getFile as any)
// router.delete('/:id', authenticate as any, deleteFile as any)

export default router
