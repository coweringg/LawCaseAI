import { Router } from 'express'
import { body, param } from 'express-validator'
import * as eventController from '../controllers/eventController'
import { authenticate } from '../middleware/auth'
import { handleValidationErrors } from '../middleware/validation'

const router = Router()

// All routes require authentication
router.use(authenticate)

// GET /api/events
router.get('/', eventController.getEvents)

// POST /api/events
router.post('/', [
  body('title')
    .trim()
    .notEmpty().withMessage('Event title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('start')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  body('end')
    .optional()
    .isISO8601().withMessage('End date must be a valid ISO 8601 date'),
  body('type')
    .optional()
    .isIn(['deadline', 'hearing', 'meeting', 'review', 'consultation', 'other']).withMessage('Invalid event type'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority level'),
  body('caseId')
    .optional({ values: 'falsy' })
    .isMongoId().withMessage('Invalid case ID'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Location cannot exceed 300 characters'),
  body('isAllDay')
    .optional()
    .isBoolean().withMessage('isAllDay must be a boolean'),
  handleValidationErrors
], eventController.createEvent)

// PUT /api/events/:id
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid event ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('start')
    .optional()
    .isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  body('end')
    .optional()
    .isISO8601().withMessage('End date must be a valid ISO 8601 date'),
  body('type')
    .optional()
    .isIn(['deadline', 'hearing', 'meeting', 'review', 'consultation', 'other']).withMessage('Invalid event type'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority level'),
  body('status')
    .optional()
    .isIn(['active', 'closed']).withMessage('Invalid event status'),
  handleValidationErrors
], eventController.updateEvent)

// DELETE /api/events/:id
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid event ID'),
  handleValidationErrors
], eventController.deleteEvent)

export default router
