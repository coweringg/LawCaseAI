import { Router } from 'express'
import * as eventController from '../controllers/eventController'
import { authenticate } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticate)

router.get('/', eventController.getEvents)
router.post('/', eventController.createEvent)
router.put('/:id', eventController.updateEvent)
router.delete('/:id', eventController.deleteEvent)

export default router
