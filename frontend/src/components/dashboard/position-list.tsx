"use client"

import { formatCurrency, formatPercentage, getChangeColor } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface Position {
  id: string
  symbol: string
  name: string
  shares: number
  averagePrice: number
  currentPrice: number
  marketValue: number
  costBasis: number
  gain: number
  gainPercent: number
  weight: number
}

interface PositionListProps {
  positions: Position[]
}

export function PositionList({ positions }: PositionListProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {positions.map((position) => (
          <div
            key={position.id}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {position.symbol}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {position.name}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">
                  {formatCurrency(position.currentPrice)}
                </div>
                <div className={`text-sm flex items-center ${getChangeColor(position.gainPercent)}`}>
                  {position.gain >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {formatPercentage(position.gainPercent)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Shares</p>
                <p className="font-medium">{position.shares}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Market Value</p>
                <p className="font-medium">{formatCurrency(position.marketValue)}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Cost Basis</p>
                <p className="font-medium">{formatCurrency(position.costBasis)}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Weight</p>
                <p className="font-medium">{formatPercentage(position.weight, 1)}</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Gain/Loss</span>
                <div className={`font-semibold ${getChangeColor(position.gainPercent)}`}>
                  {formatCurrency(position.gain)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
