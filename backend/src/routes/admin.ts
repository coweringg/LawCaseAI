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
import { validateZod } from '../middleware/validateZod'
import { 
  adminUserParamsSchema, 
  adminUpdateUserSchema, 
  adminUpdateStatusSchema, 
  adminUpdatePlanSchema,
  mongoIdParamSchema,
  maintenanceSchema,
  globalAlertSchema,
  updateOrgCodeSchema,
  updateSupportStatusSchema,
  toggleOrgStatusSchema,
  extendOrgPlanSchema
} from '../schemas'

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

router.get('/users/:id/history', 
  validateZod({ params: adminUserParamsSchema }), 
  getUserHistory
)

router.put('/users/:id', 
  validateZod({ params: adminUserParamsSchema, body: adminUpdateUserSchema }), 
  updateUser
)

router.delete('/users/:id', 
  validateZod({ params: adminUserParamsSchema }), 
  deleteUser
)

router.put('/users/:id/status', 
  validateZod({ params: adminUserParamsSchema, body: adminUpdateStatusSchema }), 
  updateUserStatus
)

router.put('/users/:id/plan', 
  validateZod({ params: adminUserParamsSchema, body: adminUpdatePlanSchema }), 
  updateUserPlan
)

router.post('/users/:id/logout', 
  validateZod({ params: adminUserParamsSchema }), 
  logoutUser
)

router.delete('/audit-logs/:id', 
  validateZod({ params: mongoIdParamSchema }), 
  deleteAuditLog
)

router.delete('/audit-logs', clearAuditLogs)

router.get('/analytics/ai', getAiStats)

router.get('/treasury', getTreasuryStats)
router.get('/treasury/export', exportTreasuryCSV)

router.get('/system/status', getSystemStatus)
router.get('/system/health', getSystemHealth)

router.get('/organizations', getAllOrganizations)
router.get('/organizations/:id', getOrganizationDetails)
router.patch('/organizations/:id/status', 
  validateZod({ params: mongoIdParamSchema, body: toggleOrgStatusSchema }),
  toggleOrganizationStatus
)
router.post('/organizations/:id/extend', 
  validateZod({ params: mongoIdParamSchema, body: extendOrgPlanSchema }),
  extendOrganizationPlan
)

router.get('/ai-health', getAiHealthMetrics)
router.patch('/ai-health/logs/:id/resolve', resolveAiError)

router.post('/system/maintenance', 
  validateZod({ body: maintenanceSchema }), 
  toggleMaintenance
)

router.post('/system/alert', 
  validateZod({ body: globalAlertSchema }), 
  updateGlobalAlert
)

router.put('/organizations/:id/code', 
  validateZod({ params: mongoIdParamSchema, body: updateOrgCodeSchema }), 
  updateOrganizationCode
)

router.get('/support', getSupportRequests)

router.put('/support/:id/status', 
  validateZod({ params: mongoIdParamSchema, body: updateSupportStatusSchema }), 
  updateSupportRequestStatus
)

router.delete('/support/:id', 
  validateZod({ params: mongoIdParamSchema }), 
  deleteSupportRequest
)

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
