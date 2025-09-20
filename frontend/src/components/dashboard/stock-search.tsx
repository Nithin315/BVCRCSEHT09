"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Filter, TrendingUp, TrendingDown, Star, Plus } from 'lucide-react'
import { formatCurrency, formatPercentage, getChangeColor } from '@/lib/utils'
import { StockDetails } from './stock-details'
import { StockChart } from './stock-chart'

// Mock stock data
const mockStocks = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 175.25,
    change: 2.15,
    changePercent: 1.24,
    volume: '45.2M',
    marketCap: '2.7T',
    pe: 28.5,
    sector: 'Technology',
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
    logo: '🍎'
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.15,
    change: -1.25,
    changePercent: -0.87,
    volume: '32.1M',
    marketCap: '1.8T',
    pe: 24.2,
    sector: 'Technology',
    description: 'Alphabet Inc. provides online advertising services in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.',
    logo: '🔍'
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 250.75,
    change: 15.25,
    changePercent: 6.47,
    volume: '78.5M',
    marketCap: '800B',
    pe: 65.3,
    sector: 'Automotive',
    description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.',
    logo: '⚡'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 385.50,
    change: -5.75,
    changePercent: -1.47,
    volume: '28.7M',
    marketCap: '2.9T',
    pe: 32.1,
    sector: 'Technology',
    description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
    logo: '🪟'
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 155.80,
    change: 3.20,
    changePercent: 2.10,
    volume: '35.2M',
    marketCap: '1.6T',
    pe: 45.8,
    sector: 'Consumer Discretionary',
    description: 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally.',
    logo: '📦'
  }
]

export function StockSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const [filteredStocks, setFilteredStocks] = useState(mockStocks)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === '') {
      setFilteredStocks(mockStocks)
    } else {
      const filtered = mockStocks.filter(stock =>
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase()) ||
        stock.sector.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredStocks(filtered)
    }
  }

  const selectedStockData = selectedStock ? mockStocks.find(s => s.symbol === selectedStock) : null

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Search & Analysis</CardTitle>
          <CardDescription>
            Search for stocks, analyze performance, and get detailed insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by symbol, company name, or sector..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock List */}
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              {filteredStocks.length} stocks found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredStocks.map((stock) => (
                <div
                  key={stock.symbol}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedStock === stock.symbol
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedStock(stock.symbol)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{stock.logo}</div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {stock.symbol}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {stock.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {stock.sector}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(stock.price)}
                      </div>
                      <div className={`text-sm flex items-center justify-end ${getChangeColor(stock.changePercent)}`}>
                        {stock.change >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {formatPercentage(stock.changePercent)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        Vol: {stock.volume}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stock Details */}
        <div className="space-y-6">
          {selectedStockData ? (
            <>
              <StockDetails stock={selectedStockData} />
              <StockChart symbol={selectedStockData.symbol} />
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Select a Stock
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose a stock from the search results to view detailed analysis
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
