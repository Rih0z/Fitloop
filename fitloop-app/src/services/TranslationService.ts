import type { ITranslationService } from '../interfaces/ITranslationService'
import { translations, type Language } from '../constants/translations'

export class TranslationService implements ITranslationService {
  private currentLanguage: Language
  private listeners: Set<() => void> = new Set()

  constructor() {
    // Initialize language from localStorage or browser settings
    const stored = localStorage.getItem('language')
    const browserLang = navigator.language.split('-')[0]
    this.currentLanguage = (stored || (browserLang === 'en' ? 'en' : 'ja')) as Language
  }

  getCurrentLanguage(): string {
    return this.currentLanguage
  }

  setLanguage(language: string): void {
    if (language === 'ja' || language === 'en') {
      this.currentLanguage = language
      localStorage.setItem('language', language)
      this.notifyListeners()
    }
  }

  translate(key: string): any {
    const keys = key.split('.')
    let value: any = translations[this.currentLanguage]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }

  t(key: string): string {
    return this.translate(key)
  }

  getAvailableLanguages(): string[] {
    return Object.keys(translations)
  }

  // Allow components to subscribe to language changes
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener())
  }
}