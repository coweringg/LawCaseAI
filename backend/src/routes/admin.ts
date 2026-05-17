import { Router } from 'express'
import {
  clearAuditLogs,
  clearSupportRequests,
  deleteAuditLog,
  deleteSupportRequest,
  deleteUser,
  getAuditLogs,
  getStats,
  getSupportRequests,
  getUserHistory,
  getUsers,
  logoutUser,
  updateOrganizationCode,
  updateSupportRequestStatus,
  updateUser,
  updateUserPlan,
  updateUserStatus
} from '../controllers/adminController'
import {
  getUsersWithQuotas,
  resetUserQuotas,
  updateUserQuotas
} from '../controllers/quotaController'
import { authenticate, authorize } from '../middleware/auth'
import { checkAndResetQuotas } from '../middleware/quotaResetMiddleware'
import { validateZod } from '../middleware/validateZod'
import {
  adminUpdatePlanSchema,
  adminUpdateStatusSchema,
  adminUpdateUserSchema,
  adminUserParamsSchema,
  extendOrgPlanSchema,
  globalAlertSchema,
  maintenanceSchema,
  mongoIdParamSchema,
  toggleOrgStatusSchema,
  updateOrgCodeSchema,
  updateSupportStatusSchema
} from '../schemas'
import { UserRole } from '../types'

import {
  extendOrganizationPlan,
  getAllOrganizations,
  getOrganizationDetails,
  toggleOrganizationStatus
} from '../controllers/adminOrgController'
import {
  getAiHealthMetrics,
  resolveAiError
} from '../controllers/aiHealthController'
import {
  getAiStats
} from '../controllers/analyticsController'
import {
  deleteKnowledgeDocument,
  getKnowledgeDocuments,
  incrementDocumentAccess,
  uploadKnowledgeDocument
} from '../controllers/knowledgeBaseController'
import {
  bulkResolveKnowledgeRequests,
  clearAllKnowledgeRequests,
  deleteKnowledgeRequest,
  getAdminKnowledgeRequests,
  updateKnowledgeRequestStatus
} from '../controllers/knowledgeRequestController'
import {
  getSystemHealth,
  getSystemStatus,
  toggleMaintenance,
  updateGlobalAlert
} from '../controllers/systemController'
import {
  exportTreasuryCSV,
  getTreasuryStats
} from '../controllers/treasuryController'
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
