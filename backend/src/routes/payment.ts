import { Router } from 'express'
import { 
  createCheckoutSession, 
  getTransactionHistory, 
  getOrganizationDetails, 
  getOrganizationMembers,
  removeMember,
  cancelSubscription,
  downgradeSeats,
  updateOrganization
} from '../controllers/paymentController'
import { authenticate } from '../middleware/auth'
import { checkAndResetQuotas } from '../middleware/quotaResetMiddleware'
import { validateZod } from '../middleware/validateZod'
import { checkoutSchema, memberIdParamsSchema } from '../schemas'

const router = Router()

router.use(authenticate)
router.use(checkAndResetQuotas)

router.get('/history', getTransactionHistory)

router.get('/organization', getOrganizationDetails)

router.post('/checkout',
  validateZod({ body: checkoutSchema }),
  createCheckoutSession
)

router.get('/members', getOrganizationMembers)

router.delete('/members/:memberId',
  validateZod({ params: memberIdParamsSchema }),
  removeMember
)

router.post('/cancel', cancelSubscription)
router.post('/downgrade', downgradeSeats)
router.patch('/organization', updateOrganization)

export default router
