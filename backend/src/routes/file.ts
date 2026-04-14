import { Router } from 'express'
import { uploadFile, getCaseFiles, commitFile, renameFile, deleteFile, createFileFromText, deleteMultipleFiles, toggleStarFile } from '../controllers/fileController'
import { authenticate } from '../middleware/auth'
import { checkAndResetQuotas } from '../middleware/quotaResetMiddleware'
import { uploadSingle } from '../utils/fileUpload'
import { checkTrialStatus } from '../middleware/trialMiddleware'
import { validateZod } from '../middleware/validateZod'
import { 
  caseIdParamSchema, 
  fileIdParamSchema,
  uploadFileSchema,
  commitFileSchema,
  renameFileSchema,
  bulkDeleteFileSchema,
  createFromTextSchema
} from '../schemas'

const router = Router()

router.post('/upload', 
  authenticate as any, 
  checkAndResetQuotas as any, 
  checkTrialStatus as any, 
  uploadSingle,
  validateZod({ body: uploadFileSchema }),
  uploadFile as any
)

router.post('/commit', 
  validateZod({ body: commitFileSchema }),
  authenticate as any, checkAndResetQuotas as any, checkTrialStatus as any, commitFile as any
)

router.patch('/:fileId/star', 
  validateZod({ params: fileIdParamSchema }),
  authenticate as any, checkAndResetQuotas as any, toggleStarFile as any
)

router.put('/:fileId', 
  validateZod({ params: fileIdParamSchema, body: renameFileSchema }),
  authenticate as any, checkAndResetQuotas as any, renameFile as any
)

router.delete('/:fileId', 
  validateZod({ params: fileIdParamSchema }),
  authenticate as any, checkAndResetQuotas as any, deleteFile as any
)

router.post('/bulk-delete', 
  validateZod({ body: bulkDeleteFileSchema }),
  authenticate as any, checkAndResetQuotas as any, deleteMultipleFiles as any
)

router.get('/case/:caseId',
  validateZod({ params: caseIdParamSchema }),
  authenticate as any, checkAndResetQuotas as any, getCaseFiles as any
)

router.post('/create-from-text', 
  validateZod({ body: createFromTextSchema }),
  authenticate as any, checkAndResetQuotas as any, checkTrialStatus as any, createFileFromText as any
)

export default router
