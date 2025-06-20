import React from 'react'
import { Home, User, Library, HelpCircle } from 'lucide-react'

// 新デザインシステム完全準拠 - TabBar (Bottom Navigation) 実装

interface TabBarProps {
  activeTab: 'prompt' | 'profile' | 'library' | 'help'
  onTabChange: (tab: 'prompt' | 'profile' | 'library' | 'help') => void
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'prompt' as const, icon: Home, label: 'プロンプト' },
    { id: 'profile' as const, icon: User, label: 'プロフィール' },
    { id: 'library' as const, icon: Library, label: 'ライブラリ' },
    { id: 'help' as const, icon: HelpCircle, label: '使い方' }
  ]

  return (
    <nav className="app-tab-bar safe-bottom">
      <div className="grid grid-cols-4 h-full">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                h-full flex flex-col items-center justify-center py-3
                transition-colors duration-300 min-w-0
                ${isActive
                  ? 'text-blue-500'
                  : 'text-tertiary'
                }
              `}
              aria-label={`${tab.label}タブ`}
            >
              <Icon size={20} />
              <span className="text-xs mt-1">
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}