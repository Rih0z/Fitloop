import React from 'react'
import { FileText, User, BookOpen, Settings } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import { useTheme } from '../../hooks/useTheme'
import type { TabType, TabItem } from '../../types/app.types'

interface TabBarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const tabs: TabItem[] = [
  { id: 'prompt', icon: FileText, labelKey: 'promptTab' },
  { id: 'profile', icon: User, labelKey: 'profileTab' },
  { id: 'library', icon: BookOpen, labelKey: 'libraryTab' },
  { id: 'settings', icon: Settings, labelKey: 'settingsTab' }
]

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation()
  const { darkMode } = useTheme()

  return (
    <div className={`${darkMode ? 'tab-bar-modern-dark' : 'tab-bar-modern'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-around relative">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`tab-button-modern flex-1 py-4 flex flex-col items-center gap-2 transition-all micro-bounce ${
                  isActive 
                    ? 'text-orange-500 active' 
                    : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon size={26} />
                <span className="text-sm font-bold">{t(tab.labelKey)}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}