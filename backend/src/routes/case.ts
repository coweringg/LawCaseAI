import { Router } from 'express'
import { body, param } from 'express-validator'
import { createCase, getCases, getCaseStats, getCaseById, updateCase, deleteCase, reactivateCase } from '../controllers/caseController'
import { authenticate } from '../middleware/auth'
import { checkAndResetQuotas } from '../middleware/quotaResetMiddleware'
import { handleValidationErrors } from '../middleware/validation'

const router = Router()

router.use(authenticate)
router.use(checkAndResetQuotas)

router.get('/', getCases)

router.get('/stats', getCaseStats)

router.post('/', [
  body('name')
    .trim()
    .notEmpty().withMessage('Case name is required')
    .isLength({ max: 200 }).withMessage('Case name cannot exceed 200 characters'),
  body('client')
    .trim()
    .notEmpty().withMessage('Client name is required')
    .isLength({ max: 200 }).withMessage('Client name cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  body('practiceArea')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Practice area cannot exceed 100 characters'),
  handleValidationErrors
], createCase)

router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid case ID'),
  handleValidationErrors
], getCaseById)

router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid case ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Case name cannot exceed 200 characters'),
  body('client')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Client name cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  body('status')
    .optional()
    .isIn(['active', 'closed', 'archived']).withMessage('Invalid case status'),
  handleValidationErrors
], updateCase)

router.put('/:id/reactivate', [
  param('id').isMongoId().withMessage('Invalid case ID'),
  handleValidationErrors
], reactivateCase)

router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid case ID'),
  handleValidationErrors
], deleteCase)

export default router
