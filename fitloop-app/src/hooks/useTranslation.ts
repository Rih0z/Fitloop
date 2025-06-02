import { useEffect, useState, useCallback } from 'react'
import { TranslationService } from '../services/TranslationService'

// Singleton instance
const translationService = new TranslationService()

export function useTranslation() {
  const [language, setLanguage] = useState(translationService.getCurrentLanguage())

  useEffect(() => {
    // Subscribe to language changes
    const unsubscribe = translationService.subscribe(() => {
      setLanguage(translationService.getCurrentLanguage())
    })

    return unsubscribe
  }, [])

  const t = useCallback((key: string): any => {
    return translationService.translate(key)
  }, [language]) // Re-create when language changes

  const setLanguageAndUpdate = useCallback((newLanguage: string) => {
    translationService.setLanguage(newLanguage)
  }, [])

  const getLanguageInstruction = useCallback((lang: string) => {
    return lang === 'en' ? 'Please respond in English only.' : '回答は必ず日本語でお願いします。'
  }, [])

  const toggleLanguage = useCallback(() => {
    const newLang = language === 'ja' ? 'en' : 'ja'
    setLanguageAndUpdate(newLang)
  }, [language, setLanguageAndUpdate])

  return {
    t,
    language,
    setLanguage: setLanguageAndUpdate,
    toggleLanguage,
    getLanguageInstruction
  }
}