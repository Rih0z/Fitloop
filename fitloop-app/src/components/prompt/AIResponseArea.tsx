import React from 'react'
import { ClipboardPaste } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import { useTheme } from '../../hooks/useTheme'

interface AIResponseAreaProps {
  response: string
  onResponseChange: (response: string) => void
  onPaste: () => void
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

  return (
    <div className={`${darkMode ? 'card-modern-dark' : 'card-modern'} p-8 reveal-animation`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-headline ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            {t('aiResponse')}
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('aiResponseDescription')}
          </p>
        </div>
        <button
          onClick={onPaste}
          disabled={loading}
          className={`btn-uber micro-bounce ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ClipboardPaste className="inline w-4 h-4 mr-2" />
          {t('paste')}
        </button>
      </div>
      
      <div className="modern-input">
        <textarea
          value={response}
          onChange={(e) => onResponseChange(e.target.value)}
          placeholder={t('responsePlaceholder')}
          disabled={loading}
          className={`w-full h-[600px] text-lg leading-relaxed resize-none ${
            darkMode ? 'input-modern-dark' : 'input-modern'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      </div>
    </div>
  )
}