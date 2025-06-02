import React from 'react'
import { User, BookOpen, Settings, Home } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import { useTheme } from '../../hooks/useTheme'
import type { TabType, TabItem } from '../../types/app.types'

interface TabBarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

interface ExtendedTabItem extends TabItem {
  gradient: string
}

const tabs: ExtendedTabItem[] = [
  { id: 'prompt', icon: Home, labelKey: 'promptTab', gradient: 'from-purple-500 to-pink-500' },
  { id: 'profile', icon: User, labelKey: 'profileTab', gradient: 'from-blue-500 to-cyan-500' },
  { id: 'library', icon: BookOpen, labelKey: 'libraryTab', gradient: 'from-green-500 to-emerald-500' },
  { id: 'settings', icon: Settings, labelKey: 'settingsTab', gradient: 'from-orange-500 to-red-500' }
]

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation()
  const { darkMode } = useTheme()

  return (
    <nav className={`fixed bottom-0 left-0 right-0 ${
      darkMode ? 'bg-gray-900/95' : 'bg-white/95'
    } backdrop-blur-xl border-t ${
      darkMode ? 'border-gray-800' : 'border-gray-200'
    } z-50 safe-area-bottom`}>
      <div className="px-4 pb-2 pt-1">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative flex flex-col items-center py-2 px-3 w-20 transition-all duration-300 group"
              >
                {/* Active background */}
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${tab.gradient} opacity-10 rounded-2xl transition-all duration-500 scale-110`} />
                )}
                
                {/* Icon container */}
                <div className={`relative mb-1 p-2.5 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? `bg-gradient-to-br ${tab.gradient} shadow-lg transform scale-110`
                    : darkMode
                    ? 'bg-gray-800 group-hover:bg-gray-700'
                    : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  <Icon
                    size={20}
                  />
                  
                  {/* Notification dot (example for profile) */}
                  {tab.id === 'profile' && !isActive && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
                
                {/* Label */}
                <span className={`text-xs font-medium transition-all duration-300 ${
                  isActive
                    ? darkMode 
                      ? 'text-white' 
                      : 'text-gray-900'
                    : darkMode
                    ? 'text-gray-500 group-hover:text-gray-400'
                    : 'text-gray-500 group-hover:text-gray-600'
                }`}>
                  {t(tab.labelKey)}
                </span>
                
                {/* Active indicator line */}
                {isActive && (
                  <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r ${tab.gradient} rounded-full`} />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}