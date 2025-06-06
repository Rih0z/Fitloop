import React from 'react'
import { Copy, Check, Zap, RefreshCw } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import { useTheme } from '../../hooks/useTheme'

interface PromptDisplayProps {
  prompt: string
  onCopy: () => void
  copied: boolean
  loading?: boolean
}

export const PromptDisplay: React.FC<PromptDisplayProps> = ({ 
  prompt, 
  onCopy, 
  copied, 
  loading = false 
}) => {
  const { t } = useTranslation()
  const { darkMode } = useTheme()

  return (
    <div className={`${darkMode ? 'bg-dark-secondary' : 'bg-white'} rounded-xl shadow-sm p-4 animate-fadeIn`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Zap size={20} className="text-yellow-500" />
        <h2 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          生成されたメタプロンプト
        </h2>
      </div>
      
      {/* Content Area */}
      <div className={`rounded-lg p-4 ${
        darkMode ? 'bg-gray-700' : 'bg-gray-50'
      } max-h-64 overflow-y-auto mb-4`}>
        <pre className={`whitespace-pre-wrap text-sm font-mono leading-6 ${
          darkMode ? 'text-gray-100' : 'text-gray-800'
        }`}>
          {prompt || (
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} italic`}>
              {t('promptPlaceholder')}
            </span>
          )}
        </pre>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCopy}
          disabled={!prompt || loading}
          className={`flex-1 h-12 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${
            copied 
              ? 'bg-status-success text-white'
              : darkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-primary-blue hover:bg-blue-600 text-white'
          } ${(!prompt || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {copied ? (
            <>
              <Check size={20} />
              <span className="font-medium">{t('copied')}</span>
            </>
          ) : (
            <>
              <Copy size={20} />
              <span className="font-medium">{t('copy')}</span>
            </>
          )}
        </button>
        
        <button
          disabled={!prompt || loading}
          className={`h-12 px-6 rounded-lg flex items-center justify-center gap-2 bg-gradient-purple-pink text-white transition-all duration-200 hover:scale-105 ${
            (!prompt || loading) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <RefreshCw size={20} />
          <span className="font-medium">記録</span>
        </button>
      </div>
    </div>
  )
}