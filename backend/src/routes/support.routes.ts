import { Router } from 'express'
import { submitPublicTicket } from '../controllers/support.controller'
import rateLimit from 'express-rate-limit'

const router = Router()

// Rate limiting for public ticket submissions (e.g. max 5 per hour per IP)
const publicTicketLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Demasiadas solicitudes de soporte. Por favor intente más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Public routes (no auth required)
router.post('/public', publicTicketLimiter, submitPublicTicket)

export default router
