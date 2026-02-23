import { Router } from 'express'
import { param } from 'express-validator'
import { uploadFile, getCaseFiles } from '../controllers/fileController'
import { authenticate } from '../middleware/auth'
import { uploadSingle } from '../utils/fileUpload'
import { handleValidationErrors } from '../middleware/validation'

const router = Router()

// POST /api/files/upload
router.post('/upload', authenticate as any, uploadSingle, uploadFile as any)

// GET /api/files/case/:caseId
router.get('/case/:caseId', [
  param('caseId').isMongoId().withMessage('Invalid case ID'),
  handleValidationErrors
], authenticate as any, getCaseFiles as any)

export default router
