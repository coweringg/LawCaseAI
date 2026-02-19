import { Router } from 'express'
import { createCase, getCases, getCaseStats, getCaseById, updateCase, deleteCase } from '../controllers/caseController'
import { authenticate } from '../middleware/auth'

const router = Router()

// All case routes require authentication (proper typing)
router.use(authenticate)

router.get('/', getCases)
router.post('/', createCase)
router.get('/stats', getCaseStats)
router.get('/:id', getCaseById)
router.put('/:id', updateCase)
router.delete('/:id', deleteCase)

export default router
