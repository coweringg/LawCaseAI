import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { 
  getProfile, 
  updateProfile, 
  changePassword, 
  updateNotifications, 
  getBillingInfo 
} from '../controllers/userController'

const router = Router()

// All user routes require authentication
router.use(authenticate)

router.get('/profile', getProfile)

router.put('/profile', updateProfile)

router.put('/password', changePassword)

router.put('/notifications', updateNotifications)

router.get('/billing', getBillingInfo)

export default router
