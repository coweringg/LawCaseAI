import { Router } from 'express'
const router = Router()

// Placeholder routes - will be implemented
router.get('/case/:caseId', (req, res) => {
  res.json({ success: false, message: 'Get chat messages endpoint - coming soon' })
})

router.post('/case/:caseId', (req, res) => {
  res.json({ success: false, message: 'Send message endpoint - coming soon' })
})

router.delete('/case/:caseId', (req, res) => {
  res.json({ success: false, message: 'Clear chat endpoint - coming soon' })
})

export default router
