import { Router } from 'express'
import { getProfile, updateProfile, deleteAccount, getUserSettings, updateUserSettings } from '@/controllers/userController'
import { authenticate } from '@/middleware/auth'
import { body } from 'express-validator'
import { validateRequest } from '@/middleware/validateRequest'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Validation rules
const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email')
]

// Routes
router.get('/profile', getProfile)
router.put('/profile', updateProfileValidation, validateRequest, updateProfile)
router.delete('/account', deleteAccount)
router.get('/settings', getUserSettings)
router.put('/settings', updateUserSettings)

export default router
