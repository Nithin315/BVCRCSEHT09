"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, PieChart, Target, AlertCircle } from 'lucide-react'
import { formatCurrency, formatPercentage, getChangeColor } from '@/lib/utils'
import { PortfolioChart } from './portfolio-chart'
import { PositionList } from './position-list'
import { PerformanceMetrics } from './performance-metrics'

// Mock data - in real app, this would come from API
const mockPortfolio = {
  totalValue: 125430.50,
  totalCost: 100000.00,
  totalGain: 25430.50,
  totalGainPercent: 25.43,
  dayChange: 1250.75,
  dayChangePercent: 1.01,
  positions: [
    {
      id: '1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      shares: 50,
      averagePrice: 150.00,
      currentPrice: 175.25,
      marketValue: 8762.50,
      costBasis: 7500.00,
      gain: 1262.50,
      gainPercent: 16.83,
      weight: 6.99
    },
    {
      id: '2',
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      shares: 25,
      averagePrice: 2800.00,
      currentPrice: 3200.50,
      marketValue: 80012.50,
      costBasis: 70000.00,
      gain: 10012.50,
      gainPercent: 14.30,
      weight: 63.78
    },
    {
      id: '3',
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      shares: 100,
      averagePrice: 200.00,
      currentPrice: 250.75,
      marketValue: 25075.00,
      costBasis: 20000.00,
      gain: 5075.00,
      gainPercent: 25.38,
      weight: 19.99
    },
    {
      id: '4',
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      shares: 30,
      averagePrice: 300.00,
      currentPrice: 285.50,
      marketValue: 8565.00,
      costBasis: 9000.00,
      gain: -435.00,
      gainPercent: -4.83,
      weight: 6.83
    }
  ]
}

const mockMetrics = {
  totalReturn: 25.43,
  annualizedReturn: 12.15,
  volatility: 18.5,
  sharpeRatio: 1.25,
  maxDrawdown: -8.2,
  beta: 1.15,
  alpha: 2.3,
  informationRatio: 0.85
}

export function PortfolioOverview() {
  const { totalValue, totalGain, totalGainPercent, dayChange, dayChangePercent } = mockPortfolio

  return (
    <div className="space-y-6">
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className={`text-xs ${getChangeColor(dayChangePercent)}`}>
              {formatPercentage(dayChangePercent)} ({formatCurrency(dayChange)})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
            {totalGain >= 0 ? (
              <TrendingUp className="h-4 w-4 text-profit" />
            ) : (
              <TrendingDown className="h-4 w-4 text-loss" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getChangeColor(totalGainPercent)}`}>
              {formatCurrency(totalGain)}
            </div>
            <p className={`text-xs ${getChangeColor(totalGainPercent)}`}>
              {formatPercentage(totalGainPercent)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asset Allocation</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4 Assets</div>
            <p className="text-xs text-muted-foreground">
              Diversified portfolio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Moderate</div>
            <p className="text-xs text-muted-foreground">
              Beta: {mockMetrics.beta}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
          <CardDescription>
            Historical performance over the last 12 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PortfolioChart />
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>
            Key performance indicators for your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PerformanceMetrics metrics={mockMetrics} />
        </CardContent>
      </Card>

      {/* Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Current Positions</CardTitle>
          <CardDescription>
            Your current stock holdings and their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PositionList positions={mockPortfolio.positions} />
        </CardContent>
      </Card>
    </div>
  )
}
