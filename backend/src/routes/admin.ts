import { Router } from 'express'
import { 
  getStats, 
  getUsers, 
  updateUser, 
  deleteUser, 
  updateUserStatus, 
  updateUserPlan,
  getAuditLogs,
  getUserHistory,
  deleteAuditLog,
  clearAuditLogs,
  logoutUser
} from '../controllers/adminController'
import { authenticate, authorize } from '../middleware/auth'
import { UserRole } from '../types'

const router = Router()

// Protect all admin routes
router.use(authenticate)
router.use(authorize(UserRole.ADMIN))

router.get('/stats', getStats)
router.get('/audit-logs', getAuditLogs)
router.get('/users', getUsers)
router.get('/users/:id/history', getUserHistory)
router.put('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)
router.put('/users/:id/status', updateUserStatus)
router.put('/users/:id/plan', updateUserPlan)
router.post('/users/:id/logout', logoutUser)

// Audit Log Management
router.delete('/audit-logs/:id', deleteAuditLog)
router.delete('/audit-logs', clearAuditLogs)

export default router
