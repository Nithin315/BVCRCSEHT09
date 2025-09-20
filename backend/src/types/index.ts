// User and Authentication Types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthRequest extends Request {
  user?: User
}

// Stock and Market Data Types
export interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  pe: number
  eps: number
  dividend: number
  yield: number
  high52Week: number
  low52Week: number
  sector: string
  industry: string
  description: string
  logo?: string
}

export interface StockQuote {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: Date
}

export interface MarketData {
  stocks: Stock[]
  indices: MarketIndex[]
  news: NewsItem[]
  lastUpdated: Date
}

export interface MarketIndex {
  symbol: string
  name: string
  value: number
  change: number
  changePercent: number
}

// Portfolio Types
export interface Portfolio {
  id: string
  userId: string
  name: string
  totalValue: number
  totalCost: number
  totalGain: number
  totalGainPercent: number
  positions: Position[]
  createdAt: Date
  updatedAt: Date
}

export interface Position {
  id: string
  portfolioId: string
  symbol: string
  shares: number
  averagePrice: number
  currentPrice: number
  marketValue: number
  costBasis: number
  gain: number
  gainPercent: number
  weight: number
  lastUpdated: Date
}

export interface Transaction {
  id: string
  portfolioId: string
  symbol: string
  type: 'BUY' | 'SELL'
  shares: number
  price: number
  total: number
  fees: number
  date: Date
  notes?: string
}

// Risk Assessment Types
export interface RiskProfile {
  id: string
  userId: string
  riskTolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE'
  riskScore: number
  timeHorizon: number
  investmentGoals: InvestmentGoal[]
  answers: RiskQuestionAnswer[]
  createdAt: Date
  updatedAt: Date
}

export interface RiskQuestion {
  id: string
  question: string
  type: 'MULTIPLE_CHOICE' | 'SCALE' | 'TEXT'
  options?: string[]
  weight: number
  category: string
}

export interface RiskQuestionAnswer {
  questionId: string
  answer: string | number
  score: number
}

export interface InvestmentGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: Date
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  type: 'RETIREMENT' | 'EDUCATION' | 'HOUSE' | 'TRAVEL' | 'OTHER'
}

// Recommendation Types
export interface Recommendation {
  id: string
  userId: string
  symbol: string
  action: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  reasoning: string
  targetPrice?: number
  stopLoss?: number
  timeHorizon: string
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  createdAt: Date
}

export interface PortfolioOptimization {
  id: string
  userId: string
  currentAllocation: AssetAllocation[]
  recommendedAllocation: AssetAllocation[]
  expectedReturn: number
  expectedRisk: number
  sharpeRatio: number
  rebalancingNeeded: boolean
  createdAt: Date
}

export interface AssetAllocation {
  symbol: string
  name: string
  currentWeight: number
  recommendedWeight: number
  expectedReturn: number
  risk: number
}

// News and Market Sentiment Types
export interface NewsItem {
  id: string
  title: string
  summary: string
  content: string
  url: string
  source: string
  publishedAt: Date
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  sentimentScore: number
  symbols: string[]
  category: string
}

export interface MarketSentiment {
  overall: number
  bySector: Record<string, number>
  bySymbol: Record<string, number>
  lastUpdated: Date
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Chart and Analytics Types
export interface ChartData {
  date: string
  value: number
  volume?: number
}

export interface PerformanceMetrics {
  totalReturn: number
  annualizedReturn: number
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
  beta: number
  alpha: number
  informationRatio: number
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'STOCK_UPDATE' | 'PORTFOLIO_UPDATE' | 'NEWS_UPDATE' | 'ERROR'
  data: any
  timestamp: Date
}

// External API Types
export interface AlphaVantageResponse {
  'Meta Data': {
    '1. Information': string
    '2. Symbol': string
    '3. Last Refreshed': string
    '4. Interval': string
    '5. Output Size': string
    '6. Time Zone': string
  }
  'Time Series (Daily)': Record<string, {
    '1. open': string
    '2. high': string
    '3. low': string
    '4. close': string
    '5. volume': string
  }>
}

export interface FinnhubQuote {
  c: number  // current price
  d: number  // change
  dp: number // percent change
  h: number  // high price of the day
  l: number  // low price of the day
  o: number  // open price of the day
  pc: number // previous close price
  t: number  // timestamp
}

// ML and Analytics Types
export interface MLRecommendation {
  symbol: string
  action: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  reasoning: string
  factors: {
    technical: number
    fundamental: number
    sentiment: number
    momentum: number
  }
  targetPrice?: number
  stopLoss?: number
  timeHorizon: string
}

export interface RiskMetrics {
  valueAtRisk: number
  expectedShortfall: number
  sharpeRatio: number
  sortinoRatio: number
  maxDrawdown: number
  volatility: number
  beta: number
  alpha: number
}

// Database Types
export interface DatabaseConfig {
  host: string
  port: number
  database: string
  username: string
  password: string
  ssl?: boolean
}

export interface RedisConfig {
  host: string
  port: number
  password?: string
  db?: number
}

// Configuration Types
export interface AppConfig {
  port: number
  nodeEnv: string
  jwtSecret: string
  jwtExpiresIn: string
  refreshTokenExpiresIn: string
  bcryptRounds: number
  rateLimitWindowMs: number
  rateLimitMax: number
  corsOrigin: string
  database: DatabaseConfig
  redis: RedisConfig
  externalApis: {
    alphaVantage: {
      apiKey: string
      baseUrl: string
    }
    finnhub: {
      apiKey: string
      baseUrl: string
    }
    newsApi: {
      apiKey: string
      baseUrl: string
    }
  }
  stripe: {
    secretKey: string
    publishableKey: string
    webhookSecret: string
  }
}
