import React from 'react'
import { User, Library, HelpCircle, Home } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import { useTheme } from '../../hooks/useTheme'
import type { TabType, TabItem } from '../../types/app.types'

interface TabBarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const tabs: TabItem[] = [
  { id: 'prompt', icon: Home, labelKey: 'promptTab' },
  { id: 'profile', icon: User, labelKey: 'profileTab' },
  { id: 'library', icon: Library, labelKey: 'libraryTab' },
  { id: 'help', icon: HelpCircle, labelKey: 'helpTab' }
]

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation()
  const { darkMode } = useTheme()

  return (
    <nav className={`fixed bottom-0 left-0 right-0 h-16 ${
      darkMode ? 'bg-dark-secondary' : 'bg-white'
    } border-t ${
      darkMode ? 'border-gray-700' : 'border-gray-200'
    } z-50 safe-area-bottom`}>
      <div className="h-full flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center flex-1 h-full py-3 transition-colors duration-300"
            >
              {/* Icon */}
              <Icon
                size={20}
                className={`mb-1 ${
                  isActive
                    ? darkMode ? 'text-blue-400' : 'text-blue-500'
                    : darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              />
              
              {/* Label */}
              <span className={`text-xs ${
                isActive
                  ? darkMode ? 'text-blue-400' : 'text-blue-500'
                  : darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {t(tab.labelKey)}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}