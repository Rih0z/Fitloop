import React from 'react'
import { Copy, Check } from 'lucide-react'
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
    <div className={`${darkMode ? 'card-modern-dark' : 'card-modern'} p-8 reveal-animation`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-headline ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            {t('aiPrompt')}
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('promptDescription')}
          </p>
        </div>
        <button
          onClick={onCopy}
          disabled={!prompt || loading}
          className={`btn-energy-modern ${
            copied ? 'animate-pulse' : ''
          } ${(!prompt || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {copied ? (
            <>
              <Check className="inline w-4 h-4 mr-2" />
              {t('copied')}
            </>
          ) : (
            <>
              <Copy className="inline w-4 h-4 mr-2" />
              {t('copy')}
            </>
          )}
        </button>
      </div>
      
      <div className={`rounded-2xl p-6 ${
        darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50/50 border border-gray-200'
      } h-[600px] overflow-auto backdrop-blur-sm`}>
        <pre className={`whitespace-pre-wrap text-lg leading-relaxed font-mono ${
          darkMode ? 'text-gray-100' : 'text-gray-800'
        }`}>
          {prompt || (
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} italic`}>
              {t('promptPlaceholder')}
            </span>
          )}
        </pre>
      </div>
    </div>
  )
}