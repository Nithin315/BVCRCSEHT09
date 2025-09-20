"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, TrendingUp, TrendingDown, Target, Clock, Star, Plus, Minus } from 'lucide-react'
import { formatCurrency, formatPercentage, getChangeColor } from '@/lib/utils'

interface Recommendation {
  id: string
  symbol: string
  name: string
  action: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  reasoning: string
  targetPrice?: number
  currentPrice: number
  timeHorizon: string
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  sector: string
  logo: string
}

// Mock recommendations data
const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    action: 'BUY',
    confidence: 85,
    reasoning: 'Strong AI market growth and robust earnings outlook. Recent partnerships with major cloud providers position the company well for continued expansion.',
    targetPrice: 520.00,
    currentPrice: 485.50,
    timeHorizon: '6-12 months',
    riskLevel: 'MEDIUM',
    sector: 'Technology',
    logo: '🎮'
  },
  {
    id: '2',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    action: 'HOLD',
    confidence: 65,
    reasoning: 'Mixed signals with strong EV adoption but increasing competition. Wait for clearer direction on autonomous driving progress.',
    currentPrice: 250.75,
    timeHorizon: '3-6 months',
    riskLevel: 'HIGH',
    sector: 'Automotive',
    logo: '⚡'
  },
  {
    id: '3',
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    action: 'BUY',
    confidence: 78,
    reasoning: 'Benefiting from rising interest rates and strong loan growth. Solid dividend yield and reasonable valuation.',
    targetPrice: 185.00,
    currentPrice: 168.25,
    timeHorizon: '12-18 months',
    riskLevel: 'LOW',
    sector: 'Financial Services',
    logo: '🏦'
  },
  {
    id: '4',
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    action: 'SELL',
    confidence: 72,
    reasoning: 'Concerns about metaverse investments and regulatory headwinds. Consider reducing position size.',
    currentPrice: 345.80,
    timeHorizon: '1-3 months',
    riskLevel: 'HIGH',
    sector: 'Technology',
    logo: '📱'
  }
]

export function Recommendations() {
  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY':
        return 'bg-profit text-white'
      case 'SELL':
        return 'bg-loss text-white'
      case 'HOLD':
        return 'bg-neutral text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'HIGH':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5" />
            <span>AI-Powered Investment Recommendations</span>
          </CardTitle>
          <CardDescription>
            Personalized recommendations based on your risk profile and market analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-profit">4</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Recommendations</div>
            </div>
            <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-neutral">75%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Confidence</div>
            </div>
            <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">2</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Buy Signals</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations List */}
      <div className="space-y-4">
        {mockRecommendations.map((recommendation) => (
          <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{recommendation.logo}</div>
                  <div>
                    <CardTitle className="text-lg">{recommendation.symbol}</CardTitle>
                    <CardDescription>{recommendation.name}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getActionColor(recommendation.action)}>
                    {recommendation.action}
                  </Badge>
                  <Badge variant="outline" className={getRiskColor(recommendation.riskLevel)}>
                    {recommendation.riskLevel} Risk
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Current Price</div>
                  <div className="font-semibold">{formatCurrency(recommendation.currentPrice)}</div>
                </div>
                {recommendation.targetPrice && (
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Target Price</div>
                    <div className="font-semibold text-profit">
                      {formatCurrency(recommendation.targetPrice)}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Confidence</div>
                  <div className={`font-semibold ${getConfidenceColor(recommendation.confidence)}`}>
                    {recommendation.confidence}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Time Horizon</div>
                  <div className="font-semibold">{recommendation.timeHorizon}</div>
                </div>
              </div>

              {/* Reasoning */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Analysis</span>
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {recommendation.reasoning}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                {recommendation.action === 'BUY' && (
                  <Button className="flex-1 bg-profit hover:bg-profit/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Buy {recommendation.symbol}
                  </Button>
                )}
                {recommendation.action === 'SELL' && (
                  <Button variant="destructive" className="flex-1">
                    <Minus className="h-4 w-4 mr-2" />
                    Sell {recommendation.symbol}
                  </Button>
                )}
                {recommendation.action === 'HOLD' && (
                  <Button variant="outline" className="flex-1">
                    <Clock className="h-4 w-4 mr-2" />
                    Hold Position
                  </Button>
                )}
                <Button variant="outline" size="icon">
                  <Star className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Disclaimer */}
      <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="p-1 bg-yellow-100 dark:bg-yellow-900/40 rounded-full">
              <Lightbulb className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                Investment Disclaimer
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                These recommendations are generated by AI algorithms and should not be considered as financial advice. 
                Always conduct your own research and consider consulting with a financial advisor before making investment decisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
