import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'

// Import routes
import authRoutes from '@/routes/auth'
import userRoutes from '@/routes/users'
import portfolioRoutes from '@/routes/portfolios'
import stockRoutes from '@/routes/stocks'
import recommendationRoutes from '@/routes/recommendations'
import newsRoutes from '@/routes/news'

// Import middleware
import { errorHandler } from '@/middleware/errorHandler'
import { notFound } from '@/middleware/notFound'

// Import services
import { WebSocketService } from '@/services/websocket'
import { MarketDataService } from '@/services/marketData'

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)
const PORT = process.env.PORT || 8000

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(compression())
app.use(morgan('combined'))
app.use(limiter)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/portfolios', portfolioRoutes)
app.use('/api/stocks', stockRoutes)
app.use('/api/recommendations', recommendationRoutes)
app.use('/api/news', newsRoutes)

// WebSocket setup
const wss = new WebSocketServer({ server })
const wsService = new WebSocketService(wss)

// Initialize services
const marketDataService = new MarketDataService()

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
  
  // Start market data updates
  marketDataService.startRealTimeUpdates()
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
    process.exit(0)
  })
})

export default app
