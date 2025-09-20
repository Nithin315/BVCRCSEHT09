"use client"

import { Menu, Bell, Settings, User, TrendingUp, Search, Shield, Lightbulb, Newspaper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DashboardTab } from './dashboard'

interface HeaderProps {
  onMenuClick: () => void
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
}

const tabIcons = {
  portfolio: TrendingUp,
  market: Search,
  search: Search,
  risk: Shield,
  recommendations: Lightbulb,
  news: Newspaper,
}

const tabLabels = {
  portfolio: 'Portfolio',
  market: 'Market',
  search: 'Search',
  risk: 'Risk Assessment',
  recommendations: 'Recommendations',
  news: 'News',
}

export function Header({ onMenuClick, activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Mobile menu button */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              FinTech Platform
            </h1>
          </div>
        </div>

        {/* Desktop navigation tabs */}
        <nav className="hidden md:flex items-center space-x-1">
          {Object.entries(tabLabels).map(([key, label]) => {
            const Icon = tabIcons[key as DashboardTab]
            return (
              <Button
                key={key}
                variant={activeTab === key ? "default" : "ghost"}
                size="sm"
                onClick={() => onTabChange(key as DashboardTab)}
                className={cn(
                  "flex items-center space-x-2",
                  activeTab === key && "bg-primary text-primary-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Button>
            )
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
