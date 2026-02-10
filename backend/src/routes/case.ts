import { Router } from 'express'
const router = Router()

// Placeholder routes - will be implemented
router.get('/', (req, res) => {
  res.json({ success: false, message: 'Get cases endpoint - coming soon' })
})

router.post('/', (req, res) => {
  res.json({ success: false, message: 'Create case endpoint - coming soon' })
})

router.get('/:id', (req, res) => {
  res.json({ success: false, message: 'Get case endpoint - coming soon' })
})

router.put('/:id', (req, res) => {
  res.json({ success: false, message: 'Update case endpoint - coming soon' })
})

router.delete('/:id', (req, res) => {
  res.json({ success: false, message: 'Delete case endpoint - coming soon' })
})

export default router
