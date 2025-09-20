import { Router } from 'express'
import { 
  searchStocks, 
  getStock, 
  getStockQuote, 
  getStockHistory,
  getMarketData,
  getTopMovers
} from '@/controllers/stockController'
import { authenticate, optionalAuth } from '@/middleware/auth'
import { query } from 'express-validator'
import { validateRequest } from '@/middleware/validateRequest'

const router = Router()

// Validation rules
const searchValidation = [
  query('q').trim().isLength({ min: 1 }).withMessage('Search query is required'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
]

const historyValidation = [
  query('period').optional().isIn(['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max']).withMessage('Invalid period'),
  query('interval').optional().isIn(['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo']).withMessage('Invalid interval')
]

// Public routes (some require optional auth for rate limiting)
router.get('/search', searchValidation, validateRequest, optionalAuth, searchStocks)
router.get('/market-data', optionalAuth, getMarketData)
router.get('/top-movers', optionalAuth, getTopMovers)

// Protected routes
router.get('/:symbol', authenticate, getStock)
router.get('/:symbol/quote', authenticate, getStockQuote)
router.get('/:symbol/history', historyValidation, validateRequest, authenticate, getStockHistory)

export default router
