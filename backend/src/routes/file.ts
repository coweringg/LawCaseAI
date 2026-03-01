import { Router } from 'express'
import { param } from 'express-validator'
import { uploadFile, getCaseFiles, commitFile, renameFile, deleteFile, createFileFromText, deleteMultipleFiles, toggleStarFile } from '../controllers/fileController'
import { authenticate } from '../middleware/auth'
import { checkAndResetQuotas } from '../middleware/quotaResetMiddleware'
import { uploadSingle } from '../utils/fileUpload'
import { handleValidationErrors } from '../middleware/validation'

const router = Router()

// POST /api/files/upload
router.post('/upload', authenticate as any, checkAndResetQuotas as any, uploadSingle, uploadFile as any)

// POST /api/files/commit
router.post('/commit', authenticate as any, checkAndResetQuotas as any, commitFile as any)

// PATCH /api/files/:fileId/star
router.patch('/:fileId/star', authenticate as any, checkAndResetQuotas as any, toggleStarFile as any)

// PUT /api/files/:fileId
router.put('/:fileId', authenticate as any, checkAndResetQuotas as any, renameFile as any)

// DELETE /api/files/:fileId
router.delete('/:fileId', authenticate as any, checkAndResetQuotas as any, deleteFile as any)

// POST /api/files/bulk-delete
router.post('/bulk-delete', authenticate as any, checkAndResetQuotas as any, deleteMultipleFiles as any)

// GET /api/files/case/:caseId
router.get('/case/:caseId', [
  param('caseId').isMongoId().withMessage('Invalid case ID'),
  handleValidationErrors
], authenticate as any, checkAndResetQuotas as any, getCaseFiles as any)

// POST /api/files/create-from-text
router.post('/create-from-text', authenticate as any, checkAndResetQuotas as any, createFileFromText as any)

export default router
