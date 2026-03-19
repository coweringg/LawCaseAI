import { Router } from 'express'
import { param } from 'express-validator'
import * as notificationController from '../controllers/notificationController'
import { authenticate } from '../middleware/auth'
import { handleValidationErrors } from '../middleware/validation'

const router = Router()

router.use(authenticate)

router.get('/', notificationController.getNotifications)
router.patch('/mark-all-read', notificationController.markAllAsRead)
router.patch('/:id/read', [
  param('id').isMongoId().withMessage('Invalid notification ID'),
  handleValidationErrors
], notificationController.markAsRead)
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid notification ID'),
  handleValidationErrors
], notificationController.deleteNotification)
router.delete('/clear-all', notificationController.deleteAllNotifications)

export default router
