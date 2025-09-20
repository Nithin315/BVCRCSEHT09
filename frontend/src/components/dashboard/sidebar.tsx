"use client"

import { X, TrendingUp, Search, Shield, Lightbulb, Newspaper, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DashboardTab } from './dashboard'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
}

const navigationItems = [
  { id: 'portfolio' as DashboardTab, label: 'Portfolio', icon: TrendingUp },
  { id: 'market' as DashboardTab, label: 'Market Overview', icon: BarChart3 },
  { id: 'search' as DashboardTab, label: 'Stock Search', icon: Search },
  { id: 'risk' as DashboardTab, label: 'Risk Assessment', icon: Shield },
  { id: 'recommendations' as DashboardTab, label: 'Recommendations', icon: Lightbulb },
  { id: 'news' as DashboardTab, label: 'News Feed', icon: Newspaper },
]

export function Sidebar({ isOpen, onClose, activeTab, onTabChange }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                FinTech
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="md:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start space-x-3",
                    activeTab === item.id && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => {
                    onTabChange(item.id)
                    onClose()
                  }}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              © 2024 Team Eagles
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
