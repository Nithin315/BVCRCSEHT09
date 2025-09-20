"use client"

import { useState } from 'react'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { PortfolioOverview } from './portfolio-overview'
import { MarketOverview } from './market-overview'
import { StockSearch } from './stock-search'
import { RiskAssessment } from './risk-assessment'
import { Recommendations } from './recommendations'
import { NewsFeed } from './news-feed'
import { cn } from '@/lib/utils'

type DashboardTab = 'portfolio' | 'market' | 'search' | 'risk' | 'recommendations' | 'news'

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('portfolio')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case 'portfolio':
        return <PortfolioOverview />
      case 'market':
        return <MarketOverview />
      case 'search':
        return <StockSearch />
      case 'risk':
        return <RiskAssessment />
      case 'recommendations':
        return <Recommendations />
      case 'news':
        return <NewsFeed />
      default:
        return <PortfolioOverview />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <main className={cn(
          "flex-1 transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-0"
        )}>
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
