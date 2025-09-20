"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { formatCurrency } from '@/lib/utils'

// Mock data for portfolio performance
const mockData = [
  { date: '2023-01', value: 100000, benchmark: 100000 },
  { date: '2023-02', value: 102500, benchmark: 101200 },
  { date: '2023-03', value: 98500, benchmark: 99500 },
  { date: '2023-04', value: 105000, benchmark: 103800 },
  { date: '2023-05', value: 108500, benchmark: 106500 },
  { date: '2023-06', value: 112000, benchmark: 109200 },
  { date: '2023-07', value: 109500, benchmark: 107800 },
  { date: '2023-08', value: 115000, benchmark: 111500 },
  { date: '2023-09', value: 118500, benchmark: 114200 },
  { date: '2023-10', value: 120000, benchmark: 116800 },
  { date: '2023-11', value: 123500, benchmark: 119500 },
  { date: '2023-12', value: 125430, benchmark: 121200 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{`Date: ${label}`}</p>
        <p className="text-sm text-blue-600">
          Portfolio: {formatCurrency(payload[0].value)}
        </p>
        <p className="text-sm text-gray-600">
          Benchmark: {formatCurrency(payload[1].value)}
        </p>
      </div>
    )
  }
  return null
}

export function PortfolioChart() {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={mockData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6b7280" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#portfolioGradient)"
            name="Portfolio"
          />
          <Area
            type="monotone"
            dataKey="benchmark"
            stroke="#6b7280"
            strokeWidth={2}
            fill="url(#benchmarkGradient)"
            name="Benchmark"
            strokeDasharray="5 5"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
