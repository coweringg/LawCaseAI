import { Router } from 'express'
import * as notificationController from '../controllers/notificationController'
import { authenticate } from '../middleware/auth'
import { validateZod } from '../middleware/validateZod'
import { mongoIdParamSchema } from '../schemas'

const router = Router()

router.use(authenticate)

router.get('/', notificationController.getNotifications)
router.patch('/mark-all-read', notificationController.markAllAsRead)
router.patch('/:id/read',
  validateZod({ params: mongoIdParamSchema }),
  notificationController.markAsRead
)
router.delete('/clear-all', notificationController.deleteAllNotifications)
router.delete('/:id',
  validateZod({ params: mongoIdParamSchema }),
  notificationController.deleteNotification
)

export default router
