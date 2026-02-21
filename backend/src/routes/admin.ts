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
  logoutUser,
  getSupportRequests,
  updateSupportRequestStatus,
  deleteSupportRequest,
  clearSupportRequests,
  updateOrganizationCode
} from '../controllers/adminController'
import { authenticate, authorize } from '../middleware/auth'
import { UserRole } from '../types'

import { 
  getAiStats 
} from '../controllers/analyticsController'
import { 
  getTreasuryStats 
} from '../controllers/treasuryController'
import { 
  getSystemStatus, 
  toggleMaintenance, 
  updateGlobalAlert 
} from '../controllers/systemController'

const router = Router()

// Protect all admin routes
router.use(authenticate)
router.use(authorize(UserRole.ADMIN))

// --- Existing User Management ---
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

// --- NEW MODULES ---

// 1. AI Analytics
router.get('/analytics/ai', getAiStats)

// 2. Financial Treasury
router.get('/treasury', getTreasuryStats)

// 3. System Command Center
router.get('/system/status', getSystemStatus)
router.post('/system/maintenance', toggleMaintenance)
router.post('/system/alert', updateGlobalAlert)
router.put('/organizations/:id/code', updateOrganizationCode)

// 4. Support Notifications
router.get('/support', getSupportRequests)
router.put('/support/:id/status', updateSupportRequestStatus)
router.delete('/support/:id', deleteSupportRequest)
router.delete('/support', clearSupportRequests)

export default router
