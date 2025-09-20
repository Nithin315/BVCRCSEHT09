"use client"

import { formatCurrency, formatPercentage, getChangeColor } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface TopMover {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: string
}

interface TopMoversProps {
  movers: TopMover[]
}

export function TopMovers({ movers }: TopMoversProps) {
  return (
    <div className="space-y-3">
      {movers.map((mover, index) => (
        <div
          key={mover.symbol}
          className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-semibold">
              {index + 1}
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {mover.symbol}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {mover.name}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(mover.price)}
            </div>
            <div className={`text-sm flex items-center justify-end ${getChangeColor(mover.changePercent)}`}>
              {mover.change >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {formatPercentage(mover.changePercent)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Vol: {mover.volume}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
