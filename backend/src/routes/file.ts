import { Router } from 'express'
import { param } from 'express-validator'
import { uploadFile, getCaseFiles, commitFile, renameFile, deleteFile, createFileFromText, deleteMultipleFiles, toggleStarFile } from '../controllers/fileController'
import { authenticate } from '../middleware/auth'
import { checkAndResetQuotas } from '../middleware/quotaResetMiddleware'
import { uploadSingle } from '../utils/fileUpload'
import { handleValidationErrors } from '../middleware/validation'
import { checkTrialStatus } from '../middleware/trialMiddleware'

const router = Router()

router.post('/upload', authenticate as any, checkAndResetQuotas as any, checkTrialStatus as any, uploadSingle, uploadFile as any)

router.post('/commit', authenticate as any, checkAndResetQuotas as any, checkTrialStatus as any, commitFile as any)

router.patch('/:fileId/star', authenticate as any, checkAndResetQuotas as any, toggleStarFile as any)

router.put('/:fileId', authenticate as any, checkAndResetQuotas as any, renameFile as any)

router.delete('/:fileId', authenticate as any, checkAndResetQuotas as any, deleteFile as any)

router.post('/bulk-delete', authenticate as any, checkAndResetQuotas as any, deleteMultipleFiles as any)

router.get('/case/:caseId', [
  param('caseId').isMongoId().withMessage('Invalid case ID'),
  handleValidationErrors
], authenticate as any, checkAndResetQuotas as any, getCaseFiles as any)

router.post('/create-from-text', authenticate as any, checkAndResetQuotas as any, checkTrialStatus as any, createFileFromText as any)

export default router
