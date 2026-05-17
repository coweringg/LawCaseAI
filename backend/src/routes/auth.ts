import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import {
  login,
  loginWithSavedToken,
  logout,
  refreshToken,
  register,
  registerAdmin
} from '../controllers/authController'
import { authenticate } from '../middleware/auth'
import { checkAndResetQuotas } from '../middleware/quotaResetMiddleware'
import { validateZod } from '../middleware/validateZod'
import { loginSchema, registerAdminSchema, registerSchema, savedLoginSchema } from '../schemas'

const router = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
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
