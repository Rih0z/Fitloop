import React, { useState } from 'react'
import { Sparkles, ChevronUp, ChevronDown, Brain, ClipboardPaste } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import { useTheme } from '../../hooks/useTheme'
import type { AIResponse } from '../../interfaces/IAIService'

interface AIResponseAreaProps {
  response: string
  onResponseChange: (response: string) => void
  onPaste: () => void
  aiResponse?: AIResponse | null
  learningData?: any
  loading?: boolean
}

export const AIResponseArea: React.FC<AIResponseAreaProps> = ({ 
  response, 
  onResponseChange, 
  onPaste, 
  loading = false 
}) => {
  const { t } = useTranslation()
  const { darkMode } = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={`${darkMode ? 'bg-dark-secondary' : 'bg-white'} rounded-xl shadow-sm overflow-hidden animate-fadeIn`}>
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full p-4 flex items-center justify-between transition-colors duration-200 ${
          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-purple-500" />
          <h2 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('aiResponse')}
          </h2>
        </div>
        <div className="transition-transform duration-200">
          {isExpanded ? (
            <ChevronUp size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
          ) : (
            <ChevronDown size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
          )}
        </div>
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="px-4 pb-4 animate-slideDown">
          {/* Info Box */}
          <div className={`flex items-start gap-2 p-3 rounded-lg mb-3 ${
            darkMode ? 'bg-gray-700' : 'bg-yellow-50'
          }`}>
            <Brain size={16} className={darkMode ? 'text-yellow-400 mt-0.5' : 'text-yellow-600 mt-0.5'} />
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('aiResponseDescription')}
            </p>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              value={response}
              onChange={(e) => onResponseChange(e.target.value)}
              placeholder={t('responsePlaceholder')}
              className={`w-full h-32 p-3 rounded-lg resize-none transition-colors duration-200 ${
                darkMode 
                  ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500' 
                  : 'bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500'
              } focus:outline-none`}
            />
            
            {/* Paste Button */}
            <button
              onClick={onPaste}
              disabled={loading}
              className={`absolute bottom-3 right-3 px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium transition-all duration-200 ${
                darkMode
                  ? 'bg-gray-600 hover:bg-gray-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ClipboardPaste size={16} />
              {t('paste')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}