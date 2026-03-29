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
  updateOrganizationCode,
  getSupportRequests,
  updateSupportRequestStatus,
  deleteSupportRequest,
  clearSupportRequests
} from '../controllers/adminController'
import {
    getUsersWithQuotas,
    updateUserQuotas,
    resetUserQuotas
} from '../controllers/quotaController'
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
  updateGlobalAlert,
  getSystemHealth
} from '../controllers/systemController'
import {
  getAllOrganizations,
  getOrganizationDetails,
  toggleOrganizationStatus,
  extendOrganizationPlan
} from '../controllers/adminOrgController'
import {
  getAiHealthMetrics,
  resolveAiError
} from '../controllers/aiHealthController'
import {
  getKnowledgeDocuments,
  uploadKnowledgeDocument,
  deleteKnowledgeDocument,
  incrementDocumentAccess
} from '../controllers/knowledgeBaseController'
import {
  getAdminKnowledgeRequests,
  updateKnowledgeRequestStatus,
  deleteKnowledgeRequest,
  bulkResolveKnowledgeRequests,
  clearAllKnowledgeRequests
} from '../controllers/knowledgeRequestController'
import { uploadSingle } from '../utils/fileUpload'

const router = Router()

router.use(authenticate)
router.use(checkAndResetQuotas)
router.use(authorize(UserRole.ADMIN))

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

router.delete('/audit-logs/:id', [
  param('id').isMongoId().withMessage('Invalid audit log ID'),
  handleValidationErrors
], deleteAuditLog)

router.delete('/audit-logs', clearAuditLogs)

router.get('/analytics/ai', getAiStats)

router.get('/treasury', getTreasuryStats)
router.get('/treasury/export', exportTreasuryCSV)

router.get('/system/status', getSystemStatus)
router.get('/system/health', getSystemHealth)

router.get('/organizations', getAllOrganizations)
router.get('/organizations/:id', getOrganizationDetails)
router.patch('/organizations/:id/status', toggleOrganizationStatus)
router.post('/organizations/:id/extend', extendOrganizationPlan)

router.get('/ai-health', getAiHealthMetrics)
router.patch('/ai-health/logs/:id/resolve', resolveAiError)

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

router.get('/knowledge-base', getKnowledgeDocuments)
router.post('/knowledge-base', uploadSingle, uploadKnowledgeDocument)
router.delete('/knowledge-base/:id', deleteKnowledgeDocument)
router.post('/knowledge-base/:id/access', incrementDocumentAccess)

router.get('/knowledge-requests', getAdminKnowledgeRequests)
router.put('/knowledge-requests/:id/status', updateKnowledgeRequestStatus)
router.delete('/knowledge-requests/:id', deleteKnowledgeRequest)
router.post('/knowledge-requests/bulk-resolve', bulkResolveKnowledgeRequests)
router.delete('/knowledge-requests/bulk-clear', clearAllKnowledgeRequests)

router.get('/quotas', getUsersWithQuotas)
router.put('/quotas/:userId', updateUserQuotas)
router.post('/quotas/:userId/reset', resetUserQuotas)

export default router
