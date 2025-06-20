import React from 'react'
import { Dumbbell, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

// 新デザインシステム完全準拠 - AppHeader 実装

export const Header: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <header className="app-header">
      <div className="flex items-center justify-between px-4 h-full">
        {/* Left: Logo + App Name + Version Badge */}
        <div className="flex items-center gap-2">
          {/* Logo Icon */}
          <div className="w-8 h-8 bg-gradient-logo rounded-lg flex items-center justify-center">
            <Dumbbell size={20} className="text-white" />
          </div>
          
          {/* App Name */}
          <h1 className="heading-2 text-primary ml-2">
            FitLoop
          </h1>
          
          {/* Version Badge */}
          <span className="ml-2 inline-block px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
            v1.0
          </span>
        </div>

        {/* Right: Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="btn-icon"
          aria-label={darkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  )
}