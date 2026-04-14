import { Router } from 'express'
import {
  getProfile,
  updateProfile,
  changePassword,
  updateNotifications,
  getBillingInfo,
  submitSupportRequest,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  activateTrial
} from '../controllers/userController'
import { authenticate } from '../middleware/auth'
import { checkAndResetQuotas } from '../middleware/quotaResetMiddleware'
import { validateZod } from '../middleware/validateZod'
import {
  updateProfileSchema,
  changePasswordSchema,
  updateNotificationsSchema,
  addPaymentMethodSchema,
  supportRequestSchema,
  mongoIdParamSchema
} from '../schemas'

const router = Router()

router.use(authenticate)
router.use(checkAndResetQuotas)

router.get('/profile', getProfile)

router.put('/profile',
  validateZod({ body: updateProfileSchema }),
  updateProfile
)

router.put('/password',
  validateZod({ body: changePasswordSchema }),
  changePassword
)

router.put('/notifications',
  validateZod({ body: updateNotificationsSchema }),
  updateNotifications
)

router.get('/billing', getBillingInfo)
router.post('/activate-trial', activateTrial)

router.post('/payment-methods',
  validateZod({ body: addPaymentMethodSchema }),
  addPaymentMethod
)

router.delete('/payment-methods/:id',
  validateZod({ params: mongoIdParamSchema }),
  removePaymentMethod
)

router.patch('/payment-methods/:id/default',
  validateZod({ params: mongoIdParamSchema }),
  setDefaultPaymentMethod
)

router.post('/support',
  validateZod({ body: supportRequestSchema }),
  submitSupportRequest
)

export default router
