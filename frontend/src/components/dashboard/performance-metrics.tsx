"use client"

import { formatPercentage } from '@/lib/utils'
import { TrendingUp, TrendingDown, Shield, Target, Zap, BarChart3 } from 'lucide-react'

interface PerformanceMetrics {
  totalReturn: number
  annualizedReturn: number
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
  beta: number
  alpha: number
  informationRatio: number
}

interface PerformanceMetricsProps {
  metrics: PerformanceMetrics
}

const metricConfigs = [
  {
    key: 'totalReturn' as keyof PerformanceMetrics,
    label: 'Total Return',
    icon: TrendingUp,
    format: (value: number) => formatPercentage(value),
    color: 'text-profit',
    description: 'Total return since inception'
  },
  {
    key: 'annualizedReturn' as keyof PerformanceMetrics,
    label: 'Annualized Return',
    icon: TrendingUp,
    format: (value: number) => formatPercentage(value),
    color: 'text-profit',
    description: 'Average annual return'
  },
  {
    key: 'volatility' as keyof PerformanceMetrics,
    label: 'Volatility',
    icon: BarChart3,
    format: (value: number) => formatPercentage(value),
    color: 'text-neutral',
    description: 'Standard deviation of returns'
  },
  {
    key: 'sharpeRatio' as keyof PerformanceMetrics,
    label: 'Sharpe Ratio',
    icon: Target,
    format: (value: number) => value.toFixed(2),
    color: value => value > 1 ? 'text-profit' : value > 0.5 ? 'text-neutral' : 'text-loss',
    description: 'Risk-adjusted return measure'
  },
  {
    key: 'maxDrawdown' as keyof PerformanceMetrics,
    label: 'Max Drawdown',
    icon: TrendingDown,
    format: (value: number) => formatPercentage(value),
    color: 'text-loss',
    description: 'Maximum peak-to-trough decline'
  },
  {
    key: 'beta' as keyof PerformanceMetrics,
    label: 'Beta',
    icon: Shield,
    format: (value: number) => value.toFixed(2),
    color: value => value > 1.2 ? 'text-loss' : value > 0.8 ? 'text-neutral' : 'text-profit',
    description: 'Sensitivity to market movements'
  },
  {
    key: 'alpha' as keyof PerformanceMetrics,
    label: 'Alpha',
    icon: Zap,
    format: (value: number) => formatPercentage(value),
    color: value => value > 0 ? 'text-profit' : 'text-loss',
    description: 'Excess return vs benchmark'
  },
  {
    key: 'informationRatio' as keyof PerformanceMetrics,
    label: 'Information Ratio',
    icon: Target,
    format: (value: number) => value.toFixed(2),
    color: value => value > 0.5 ? 'text-profit' : value > 0 ? 'text-neutral' : 'text-loss',
    description: 'Consistency of excess returns'
  }
]

export function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricConfigs.map((config) => {
        const Icon = config.icon
        const value = metrics[config.key]
        const colorClass = typeof config.color === 'function' ? config.color(value) : config.color
        
        return (
          <div
            key={config.key}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {config.label}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {config.description}
                </p>
              </div>
            </div>
            <div className={`text-2xl font-bold ${colorClass}`}>
              {config.format(value)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
