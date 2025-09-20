import { Router } from 'express'
import { 
  getRecommendations, 
  getRecommendation, 
  createRecommendation,
  updateRecommendation,
  deleteRecommendation,
  getPortfolioOptimization,
  generateRecommendations
} from '@/controllers/recommendationController'
import { authenticate } from '@/middleware/auth'
import { body, query } from 'express-validator'
import { validateRequest } from '@/middleware/validateRequest'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Validation rules
const recommendationValidation = [
  body('symbol').trim().isLength({ min: 1, max: 10 }).withMessage('Symbol is required'),
  body('action').isIn(['BUY', 'SELL', 'HOLD']).withMessage('Action must be BUY, SELL, or HOLD'),
  body('confidence').isFloat({ min: 0, max: 100 }).withMessage('Confidence must be between 0 and 100'),
  body('reasoning').trim().isLength({ min: 10 }).withMessage('Reasoning must be at least 10 characters'),
  body('timeHorizon').trim().isLength({ min: 1 }).withMessage('Time horizon is required'),
  body('riskLevel').isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Risk level must be LOW, MEDIUM, or HIGH'),
  body('targetPrice').optional().isFloat({ min: 0 }).withMessage('Target price must be positive'),
  body('stopLoss').optional().isFloat({ min: 0 }).withMessage('Stop loss must be positive')
]

const queryValidation = [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
  query('action').optional().isIn(['BUY', 'SELL', 'HOLD']).withMessage('Invalid action filter'),
  query('riskLevel').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Invalid risk level filter')
]

// Routes
router.get('/', queryValidation, validateRequest, getRecommendations)
router.get('/generate', generateRecommendations)
router.get('/portfolio-optimization', getPortfolioOptimization)
router.get('/:id', getRecommendation)
router.post('/', recommendationValidation, validateRequest, createRecommendation)
router.put('/:id', recommendationValidation, validateRequest, updateRecommendation)
router.delete('/:id', deleteRecommendation)

export default router
