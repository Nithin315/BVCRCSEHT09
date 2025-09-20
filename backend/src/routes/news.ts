import { Router } from 'express'
import { 
  getNews, 
  getNewsItem, 
  getNewsBySymbol,
  getMarketSentiment,
  searchNews
} from '@/controllers/newsController'
import { authenticate, optionalAuth } from '@/middleware/auth'
import { query } from 'express-validator'
import { validateRequest } from '@/middleware/validateRequest'

const router = Router()

// Validation rules
const newsQueryValidation = [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
  query('category').optional().trim().isLength({ min: 1 }).withMessage('Category must not be empty'),
  query('sentiment').optional().isIn(['POSITIVE', 'NEGATIVE', 'NEUTRAL']).withMessage('Invalid sentiment filter'),
  query('dateFrom').optional().isISO8601().withMessage('Invalid date format'),
  query('dateTo').optional().isISO8601().withMessage('Invalid date format')
]

const searchValidation = [
  query('q').trim().isLength({ min: 1 }).withMessage('Search query is required'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
]

// Public routes (with optional auth for rate limiting)
router.get('/', newsQueryValidation, validateRequest, optionalAuth, getNews)
router.get('/search', searchValidation, validateRequest, optionalAuth, searchNews)
router.get('/sentiment', optionalAuth, getMarketSentiment)
router.get('/symbol/:symbol', optionalAuth, getNewsBySymbol)

// Protected routes
router.get('/:id', authenticate, getNewsItem)

export default router
