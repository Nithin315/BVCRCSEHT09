"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Globe, DollarSign } from 'lucide-react'
import { formatCurrency, formatPercentage, getChangeColor } from '@/lib/utils'
import { MarketChart } from './market-chart'
import { TopMovers } from './top-movers'

// Mock market data
const mockIndices = [
  { symbol: 'SPY', name: 'S&P 500', value: 4567.89, change: 23.45, changePercent: 0.52 },
  { symbol: 'QQQ', name: 'NASDAQ', value: 3891.23, change: -12.34, changePercent: -0.32 },
  { symbol: 'DIA', name: 'Dow Jones', value: 34567.89, change: 123.45, changePercent: 0.36 },
  { symbol: 'IWM', name: 'Russell 2000', value: 1987.65, change: -5.67, changePercent: -0.28 },
]

const mockTopMovers = [
  { symbol: 'NVDA', name: 'NVIDIA Corp', price: 485.50, change: 25.75, changePercent: 5.6, volume: '45.2M' },
  { symbol: 'TSLA', name: 'Tesla Inc', price: 250.75, change: -15.25, changePercent: -5.7, volume: '32.1M' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', price: 125.30, change: 8.45, changePercent: 7.2, volume: '28.7M' },
  { symbol: 'META', name: 'Meta Platforms', price: 345.80, change: -12.20, changePercent: -3.4, volume: '22.3M' },
  { symbol: 'GOOGL', name: 'Alphabet Inc', price: 142.15, change: 6.85, changePercent: 5.1, volume: '18.9M' },
]

export function MarketOverview() {
  return (
    <div className="space-y-6">
      {/* Market Indices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockIndices.map((index) => (
          <Card key={index.symbol}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{index.name}</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(index.value)}</div>
              <div className={`text-sm flex items-center ${getChangeColor(index.changePercent)}`}>
                {index.change >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {formatPercentage(index.changePercent)} ({formatCurrency(index.change)})
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Market Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Market Performance</CardTitle>
          <CardDescription>
            S&P 500 performance over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MarketChart />
        </CardContent>
      </Card>

      {/* Top Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-profit" />
              <span>Top Gainers</span>
            </CardTitle>
            <CardDescription>
              Stocks with the highest percentage gains today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TopMovers movers={mockTopMovers.filter(m => m.changePercent > 0)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-loss" />
              <span>Top Losers</span>
            </CardTitle>
            <CardDescription>
              Stocks with the highest percentage losses today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TopMovers movers={mockTopMovers.filter(m => m.changePercent < 0)} />
          </CardContent>
        </Card>
      </div>

      {/* Market Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Market Summary</CardTitle>
          <CardDescription>
            Key market indicators and sentiment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-profit mb-2">Bullish</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Market Sentiment</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral mb-2">$2.1T</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Market Cap</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-profit mb-2">1,247</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Advancing Stocks</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
