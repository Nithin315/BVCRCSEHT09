import { Router } from 'express'
import { 
  getPortfolios, 
  getPortfolio, 
  createPortfolio, 
  updatePortfolio, 
  deletePortfolio,
  getPositions,
  addPosition,
  updatePosition,
  removePosition,
  getTransactions,
  addTransaction
} from '@/controllers/portfolioController'
import { authenticate } from '@/middleware/auth'
import { body } from 'express-validator'
import { validateRequest } from '@/middleware/validateRequest'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Validation rules
const portfolioValidation = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Portfolio name is required and must be less than 100 characters')
]

const transactionValidation = [
  body('symbol').trim().isLength({ min: 1, max: 10 }).withMessage('Symbol is required'),
  body('type').isIn(['BUY', 'SELL']).withMessage('Transaction type must be BUY or SELL'),
  body('shares').isFloat({ min: 0.0001 }).withMessage('Shares must be a positive number'),
  body('price').isFloat({ min: 0.01 }).withMessage('Price must be a positive number'),
  body('fees').optional().isFloat({ min: 0 }).withMessage('Fees must be a non-negative number')
]

// Portfolio routes
router.get('/', getPortfolios)
router.get('/:id', getPortfolio)
router.post('/', portfolioValidation, validateRequest, createPortfolio)
router.put('/:id', portfolioValidation, validateRequest, updatePortfolio)
router.delete('/:id', deletePortfolio)

// Position routes
router.get('/:id/positions', getPositions)
router.post('/:id/positions', addPosition)
router.put('/:id/positions/:symbol', updatePosition)
router.delete('/:id/positions/:symbol', removePosition)

// Transaction routes
router.get('/:id/transactions', getTransactions)
router.post('/:id/transactions', transactionValidation, validateRequest, addTransaction)

export default router
