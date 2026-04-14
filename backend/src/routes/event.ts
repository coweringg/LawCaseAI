import { Router } from 'express'
import * as eventController from '../controllers/eventController'
import { authenticate } from '../middleware/auth'
import { checkAndResetQuotas } from '../middleware/quotaResetMiddleware'
import { validateZod } from '../middleware/validateZod'
import { createEventSchema, updateEventSchema, eventParamsSchema } from '../schemas'

const router = Router()

router.use(authenticate)
router.use(checkAndResetQuotas)

router.get('/', eventController.getEvents)

router.post('/',
  validateZod({ body: createEventSchema }),
  eventController.createEvent
)

router.put('/:id',
  validateZod({ params: eventParamsSchema, body: updateEventSchema }),
  eventController.updateEvent
)

router.delete('/:id',
  validateZod({ params: eventParamsSchema }),
  eventController.deleteEvent
)

export default router
