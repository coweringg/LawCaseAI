import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import {
  register,
  registerAdmin,
  login,
  loginWithSavedToken,
  refreshToken,
  logout
} from '../controllers/authController'
import { authenticate } from '../middleware/auth'
import { checkAndResetQuotas } from '../middleware/quotaResetMiddleware'
import { validateZod } from '../middleware/validateZod'
import { registerSchema, registerAdminSchema, loginSchema, savedLoginSchema } from '../schemas'

const router = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many login attempts from your IP. For your security, access has been temporarily locked. Please wait 15 minutes before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

router.post('/register', authLimiter,
  validateZod({ body: registerSchema }),
  register
)

router.post('/register-admin',
  validateZod({ body: registerAdminSchema }),
  registerAdmin
)

router.post('/login', authLimiter,
  validateZod({ body: loginSchema }),
  login
)

router.post('/saved-login', authLimiter,
  validateZod({ body: savedLoginSchema }),
  loginWithSavedToken
)

router.post('/refresh', authenticate, checkAndResetQuotas, refreshToken)
router.post('/logout', authenticate, checkAndResetQuotas, logout)

export default router
