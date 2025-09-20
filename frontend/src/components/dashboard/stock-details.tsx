"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Star, Plus, Minus, BarChart3, DollarSign, Clock } from 'lucide-react'
import { formatCurrency, formatPercentage, getChangeColor } from '@/lib/utils'

interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: string
  marketCap: string
  pe: number
  sector: string
  description: string
  logo: string
}

interface StockDetailsProps {
  stock: Stock
}

export function StockDetails({ stock }: StockDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{stock.logo}</div>
            <div>
              <CardTitle className="text-xl">{stock.symbol}</CardTitle>
              <CardDescription>{stock.name}</CardDescription>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price and Change */}
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {formatCurrency(stock.price)}
          </div>
          <div className={`text-lg flex items-center justify-center ${getChangeColor(stock.changePercent)}`}>
            {stock.change >= 0 ? (
              <TrendingUp className="h-5 w-5 mr-2" />
            ) : (
              <TrendingDown className="h-5 w-5 mr-2" />
            )}
            {formatPercentage(stock.changePercent)} ({formatCurrency(stock.change)})
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Market Cap</span>
            </div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {stock.marketCap}
            </div>
          </div>
          <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <BarChart3 className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">P/E Ratio</span>
            </div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {stock.pe}
            </div>
          </div>
          <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Volume</span>
            </div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {stock.volume}
            </div>
          </div>
          <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Sector</span>
            </div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {stock.sector}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">About</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {stock.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button className="flex-1 bg-profit hover:bg-profit/90">
            <Plus className="h-4 w-4 mr-2" />
            Buy
          </Button>
          <Button variant="outline" className="flex-1">
            <Minus className="h-4 w-4 mr-2" />
            Sell
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
