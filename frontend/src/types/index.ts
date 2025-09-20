// User and Authentication Types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
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
  timeHorizon: number // in years
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

// Form Types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface StockSearchForm {
  query: string
  sector?: string
  marketCap?: string
  priceRange?: [number, number]
}

// UI State Types
export interface LoadingState {
  isLoading: boolean
  message?: string
}

export interface ErrorState {
  hasError: boolean
  message?: string
  code?: string
}

export interface NotificationState {
  id: string
  type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Theme Types
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system'
  primaryColor: string
  accentColor: string
}

// Settings Types
export interface UserSettings {
  theme: ThemeConfig
  notifications: NotificationSettings
  privacy: PrivacySettings
  trading: TradingSettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  priceAlerts: boolean
  newsAlerts: boolean
  portfolioUpdates: boolean
}

export interface PrivacySettings {
  profileVisibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS'
  portfolioSharing: boolean
  dataSharing: boolean
}

export interface TradingSettings {
  defaultOrderType: 'MARKET' | 'LIMIT' | 'STOP'
  defaultQuantity: number
  confirmOrders: boolean
  autoRebalance: boolean
}
