import React from 'react'
import { Dumbbell, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

export const Header: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <header className={`h-14 ${darkMode ? 'bg-dark-secondary' : 'bg-white'} shadow-sm sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
        {/* Left side - Logo, App Name, Version Badge */}
        <div className="flex items-center">
          {/* Logo Icon */}
          <div className="w-8 h-8 bg-gradient-blue-purple rounded-lg flex items-center justify-center">
            <Dumbbell size={20} className="text-white" />
          </div>
          
          {/* App Name */}
          <h1 className={`ml-2 text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            FitLoop
          </h1>
          
          {/* Version Badge */}
          <span className={`ml-2 px-2 py-0.5 ${darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'} text-xs rounded-full`}>
            v1.0
          </span>
        </div>
        
        {/* Right side - Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-105 ${
            darkMode 
              ? 'bg-gray-700 hover:bg-gray-600' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <Sun size={20} className="text-gray-400" />
          ) : (
            <Moon size={20} className="text-gray-500" />
          )}
        </button>
      </div>
    </header>
  )
}