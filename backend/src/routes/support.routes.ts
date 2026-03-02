import { Router } from 'express'
import { submitPublicTicket } from '../controllers/support.controller'
import rateLimit from 'express-rate-limit'

const router = Router()

const publicTicketLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Demasiadas solicitudes de soporte. Por favor intente más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/public', publicTicketLimiter, submitPublicTicket)

export default router
