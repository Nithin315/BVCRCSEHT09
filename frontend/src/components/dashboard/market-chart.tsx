"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'

// Mock S&P 500 data for the last 30 days
const mockData = [
  { date: '2024-01-01', value: 4500.00 },
  { date: '2024-01-02', value: 4520.50 },
  { date: '2024-01-03', value: 4480.25 },
  { date: '2024-01-04', value: 4560.75 },
  { date: '2024-01-05', value: 4580.00 },
  { date: '2024-01-08', value: 4620.25 },
  { date: '2024-01-09', value: 4600.50 },
  { date: '2024-01-10', value: 4650.75 },
  { date: '2024-01-11', value: 4630.00 },
  { date: '2024-01-12', value: 4680.25 },
  { date: '2024-01-15', value: 4700.50 },
  { date: '2024-01-16', value: 4720.75 },
  { date: '2024-01-17', value: 4750.00 },
  { date: '2024-01-18', value: 4730.25 },
  { date: '2024-01-19', value: 4780.50 },
  { date: '2024-01-22', value: 4800.75 },
  { date: '2024-01-23', value: 4820.00 },
  { date: '2024-01-24', value: 4850.25 },
  { date: '2024-01-25', value: 4830.50 },
  { date: '2024-01-26', value: 4880.75 },
  { date: '2024-01-29', value: 4900.00 },
  { date: '2024-01-30', value: 4920.25 },
  { date: '2024-01-31', value: 4950.50 },
  { date: '2024-02-01', value: 4930.75 },
  { date: '2024-02-02', value: 4980.00 },
  { date: '2024-02-05', value: 5000.25 },
  { date: '2024-02-06', value: 5020.50 },
  { date: '2024-02-07', value: 5050.75 },
  { date: '2024-02-08', value: 5030.00 },
  { date: '2024-02-09', value: 4567.89 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{`Date: ${label}`}</p>
        <p className="text-sm text-blue-600">
          S&P 500: {formatCurrency(payload[0].value)}
        </p>
      </div>
    )
  }
  return null
}

export function MarketChart() {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value.toFixed(0)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#3b82f6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
