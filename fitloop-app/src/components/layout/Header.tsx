import React from 'react'
import { Globe, Moon, Sun } from 'lucide-react'
import { TrainingIcon, AIAssistantIcon } from '../icons/CustomIcons'
import { useTranslation } from '../../hooks/useTranslation'
import { useTheme } from '../../hooks/useTheme'

export const Header: React.FC = () => {
  const { t, language, toggleLanguage } = useTranslation()
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <header className={`${darkMode ? 'nav-modern' : 'glass-modern'} sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 energy-gradient rounded-2xl flex items-center justify-center floating-modern micro-bounce">
              <TrainingIcon size={28} color="white" />
            </div>
            <h1 className="text-display font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              {t('appName')}
            </h1>
            <div className="premium-indicator">
              <AIAssistantIcon size={16} className="mr-1" />
              {t('aiSupported')}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleLanguage}
              className={`flex items-center space-x-2 p-3 rounded-2xl transition-all duration-300 ${ 
                darkMode 
                  ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' 
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
              } hover:scale-110 micro-bounce`}
              title={`Current: ${language === 'ja' ? '日本語' : 'English'}`}
            >
              <Globe size={20} />
              <span className="text-sm font-bold">
                {language === 'ja' ? '日本語' : 'EN'}
              </span>
            </button>
            <button
              onClick={toggleDarkMode}
              className={`p-3 rounded-2xl transition-all duration-300 ${
                darkMode 
                  ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400' 
                  : 'bg-gray-800/10 hover:bg-gray-800/20 text-gray-700'
              } hover:scale-110 micro-bounce`}
            >
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-indigo-600" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}