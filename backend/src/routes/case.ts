import { Router } from 'express'
import { createCase, getCases, getCaseStats, getCaseById, updateCase, deleteCase } from '../controllers/caseController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/', authenticate as any, getCases as any)
router.post('/', authenticate as any, createCase as any)
router.get('/stats', authenticate as any, getCaseStats as any)
router.get('/:id', authenticate as any, getCaseById as any)
router.put('/:id', authenticate as any, updateCase as any)
router.delete('/:id', authenticate as any, deleteCase as any)

export default router
