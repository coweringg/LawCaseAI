import { Router } from 'express'
import { body, param } from 'express-validator'
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
import { checkAndResetQuotas } from '../middleware/quotaResetMiddleware'
import { UserRole } from '../types'
import { handleValidationErrors } from '../middleware/validation'

import { 
  getAiStats 
} from '../controllers/analyticsController'
import { 
  getTreasuryStats,
  exportTreasuryCSV
} from '../controllers/treasuryController'
import { 
  getSystemStatus, 
  toggleMaintenance, 
  updateGlobalAlert 
} from '../controllers/systemController'

const router = Router()

// Protect all admin routes
router.use(authenticate)
router.use(checkAndResetQuotas)
router.use(authorize(UserRole.ADMIN))

// --- User Management ---
router.get('/stats', getStats)
router.get('/audit-logs', getAuditLogs)
router.get('/users', getUsers)

router.get('/users/:id/history', [
  param('id').isMongoId().withMessage('Invalid user ID'),
  handleValidationErrors
], getUserHistory)

router.put('/users/:id', [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('name').optional().trim().isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email').optional().isEmail().withMessage('Invalid email').normalizeEmail(),
  body('lawFirm').optional().trim().isLength({ max: 200 }).withMessage('Law firm name cannot exceed 200 characters'),
  handleValidationErrors
], updateUser)

router.delete('/users/:id', [
  param('id').isMongoId().withMessage('Invalid user ID'),
  handleValidationErrors
], deleteUser)

router.put('/users/:id/status', [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['active', 'disabled', 'suspended']).withMessage('Invalid status'),
  handleValidationErrors
], updateUserStatus)

router.put('/users/:id/plan', [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('plan')
    .notEmpty().withMessage('Plan is required')
    .isIn(['none', 'basic', 'professional', 'elite', 'enterprise']).withMessage('Invalid plan'),
  handleValidationErrors
], updateUserPlan)

router.post('/users/:id/logout', [
  param('id').isMongoId().withMessage('Invalid user ID'),
  handleValidationErrors
], logoutUser)

// Audit Log Management
router.delete('/audit-logs/:id', [
  param('id').isMongoId().withMessage('Invalid audit log ID'),
  handleValidationErrors
], deleteAuditLog)

router.delete('/audit-logs', clearAuditLogs)

// --- NEW MODULES ---

// 1. AI Analytics
router.get('/analytics/ai', getAiStats)

// 2. Financial Treasury
router.get('/treasury', getTreasuryStats)
router.get('/treasury/export', exportTreasuryCSV)

// 3. System Command Center
router.get('/system/status', getSystemStatus)

router.post('/system/maintenance', [
  body('active').isBoolean().withMessage('Active must be a boolean'),
  body('message').optional().trim().isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters'),
  handleValidationErrors
], toggleMaintenance)

router.post('/system/alert', [
  body('message').optional().trim().isLength({ max: 500 }).withMessage('Alert message cannot exceed 500 characters'),
  body('type').optional().isIn(['info', 'warning', 'error', 'success']).withMessage('Invalid alert type'),
  handleValidationErrors
], updateGlobalAlert)

router.put('/organizations/:id/code', [
  param('id').isMongoId().withMessage('Invalid organization ID'),
  body('firmCode')
    .trim()
    .notEmpty().withMessage('Firm code is required')
    .isLength({ min: 3, max: 20 }).withMessage('Firm code must be 3-20 characters'),
  handleValidationErrors
], updateOrganizationCode)

// 4. Support Notifications
router.get('/support', getSupportRequests)

router.put('/support/:id/status', [
  param('id').isMongoId().withMessage('Invalid support request ID'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'resolved']).withMessage('Invalid status'),
  handleValidationErrors
], updateSupportRequestStatus)

router.delete('/support/:id', [
  param('id').isMongoId().withMessage('Invalid support request ID'),
  handleValidationErrors
], deleteSupportRequest)

router.delete('/support', clearSupportRequests)

export default router
