"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Newspaper, TrendingUp, TrendingDown, Clock, ExternalLink, Filter } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  publishedAt: string
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  sentimentScore: number
  symbols: string[]
  category: string
  url: string
}

// Mock news data
const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Federal Reserve Signals Potential Rate Cuts in 2024',
    summary: 'The Federal Reserve indicated a more dovish stance, suggesting potential interest rate cuts could come as early as Q2 2024, boosting market sentiment.',
    source: 'Reuters',
    publishedAt: '2024-01-15T10:30:00Z',
    sentiment: 'POSITIVE',
    sentimentScore: 0.8,
    symbols: ['SPY', 'QQQ', 'DIA'],
    category: 'Monetary Policy',
    url: '#'
  },
  {
    id: '2',
    title: 'NVIDIA Reports Strong Q4 Earnings, AI Demand Surges',
    summary: 'NVIDIA exceeded expectations with record revenue driven by AI chip demand, with data center revenue growing 409% year-over-year.',
    source: 'Bloomberg',
    publishedAt: '2024-01-15T09:15:00Z',
    sentiment: 'POSITIVE',
    sentimentScore: 0.9,
    symbols: ['NVDA', 'AMD', 'INTC'],
    category: 'Earnings',
    url: '#'
  },
  {
    id: '3',
    title: 'Tesla Faces Production Challenges in China',
    summary: 'Tesla reported lower-than-expected deliveries in China due to increased competition and regulatory challenges, raising concerns about growth.',
    source: 'Financial Times',
    publishedAt: '2024-01-15T08:45:00Z',
    sentiment: 'NEGATIVE',
    sentimentScore: -0.6,
    symbols: ['TSLA'],
    category: 'Company News',
    url: '#'
  },
  {
    id: '4',
    title: 'Banking Sector Shows Resilience Amid Economic Uncertainty',
    summary: 'Major banks reported solid earnings despite economic headwinds, with JPMorgan and Bank of America showing strong loan growth.',
    source: 'Wall Street Journal',
    publishedAt: '2024-01-15T07:20:00Z',
    sentiment: 'POSITIVE',
    sentimentScore: 0.7,
    symbols: ['JPM', 'BAC', 'WFC'],
    category: 'Banking',
    url: '#'
  },
  {
    id: '5',
    title: 'Oil Prices Volatile Amid Geopolitical Tensions',
    summary: 'Crude oil prices fluctuated significantly as tensions in the Middle East continue to impact global energy markets.',
    source: 'CNBC',
    publishedAt: '2024-01-15T06:30:00Z',
    sentiment: 'NEUTRAL',
    sentimentScore: 0.1,
    symbols: ['XOM', 'CVX', 'COP'],
    category: 'Energy',
    url: '#'
  }
]

export function NewsFeed() {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'NEGATIVE':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      case 'NEUTRAL':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE':
        return <TrendingUp className="h-3 w-3" />
      case 'NEGATIVE':
        return <TrendingDown className="h-3 w-3" />
      case 'NEUTRAL':
        return <div className="h-3 w-3 bg-gray-400 rounded-full" />
      default:
        return <div className="h-3 w-3 bg-gray-400 rounded-full" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Newspaper className="h-5 w-5" />
                <span>Financial News Feed</span>
              </CardTitle>
              <CardDescription>
                Latest market news and analysis with AI-powered sentiment analysis
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-green-600">3</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Positive News</div>
            </div>
            <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-red-600">1</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Negative News</div>
            </div>
            <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">1</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Neutral News</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Items */}
      <div className="space-y-4">
        {mockNews.map((news) => (
          <Card key={news.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {news.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {news.summary}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-col items-end space-y-2">
                    <Badge className={getSentimentColor(news.sentiment)}>
                      <div className="flex items-center space-x-1">
                        {getSentimentIcon(news.sentiment)}
                        <span>{news.sentiment}</span>
                      </div>
                    </Badge>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.abs(news.sentimentScore * 100).toFixed(0)}% confidence
                    </div>
                  </div>
                </div>

                {/* Meta Information */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(news.publishedAt)}</span>
                    </div>
                    <span>•</span>
                    <span>{news.source}</span>
                    <span>•</span>
                    <span>{news.category}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Read More
                  </Button>
                </div>

                {/* Related Symbols */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Related:</span>
                  <div className="flex space-x-2">
                    {news.symbols.map((symbol) => (
                      <Badge key={symbol} variant="outline" className="text-xs">
                        {symbol}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline">
          Load More News
        </Button>
      </div>
    </div>
  )
}
