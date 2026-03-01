import { Router } from 'express'
import { body, param } from 'express-validator'
import { createCase, getCases, getCaseStats, getCaseById, updateCase, deleteCase, reactivateCase } from '../controllers/caseController'
import { authenticate } from '../middleware/auth'
import { checkAndResetQuotas } from '../middleware/quotaResetMiddleware'
import { handleValidationErrors } from '../middleware/validation'

const router = Router()

// All case routes require authentication
router.use(authenticate)
router.use(checkAndResetQuotas)

// GET /api/cases
router.get('/', getCases)

// GET /api/cases/stats
router.get('/stats', getCaseStats)

// POST /api/cases
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

// GET /api/cases/:id
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid case ID'),
  handleValidationErrors
], getCaseById)

// PUT /api/cases/:id
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

// PUT /api/cases/:id/reactivate
router.put('/:id/reactivate', [
  param('id').isMongoId().withMessage('Invalid case ID'),
  handleValidationErrors
], reactivateCase)

// DELETE /api/cases/:id
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid case ID'),
  handleValidationErrors
], deleteCase)

export default router
