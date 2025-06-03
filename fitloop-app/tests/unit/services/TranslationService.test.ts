import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TranslationService } from '../../../src/services/TranslationService'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
})

// Mock navigator.language
Object.defineProperty(navigator, 'language', {
  writable: true,
  value: 'en-US'
})

describe('TranslationService', () => {
  let translationService: TranslationService

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    translationService = null as any
  })

  describe('constructor', () => {
    it('should initialize with stored language', () => {
      mockLocalStorage.getItem.mockReturnValue('en')
      
      translationService = new TranslationService()
      
      expect(translationService.getCurrentLanguage()).toBe('en')
    })

    it('should initialize with browser language when English', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      Object.defineProperty(navigator, 'language', { value: 'en-US', writable: true })
      
      translationService = new TranslationService()
      
      expect(translationService.getCurrentLanguage()).toBe('en')
    })

    it('should initialize with Japanese for non-English browser language', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      Object.defineProperty(navigator, 'language', { value: 'ja-JP', writable: true })
      
      translationService = new TranslationService()
      
      expect(translationService.getCurrentLanguage()).toBe('ja')
    })

    it('should default to Japanese for unsupported browser language', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      Object.defineProperty(navigator, 'language', { value: 'fr-FR', writable: true })
      
      translationService = new TranslationService()
      
      expect(translationService.getCurrentLanguage()).toBe('ja')
    })
  })

  describe('getCurrentLanguage', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue('en')
      translationService = new TranslationService()
    })

    it('should return current language', () => {
      expect(translationService.getCurrentLanguage()).toBe('en')
    })
  })

  describe('setLanguage', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue('en')
      translationService = new TranslationService()
    })

    it('should set language to Japanese', () => {
      translationService.setLanguage('ja')
      
      expect(translationService.getCurrentLanguage()).toBe('ja')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('language', 'ja')
    })

    it('should set language to English', () => {
      translationService.setLanguage('en')
      
      expect(translationService.getCurrentLanguage()).toBe('en')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('language', 'en')
    })

    it('should ignore unsupported languages', () => {
      const originalLang = translationService.getCurrentLanguage()
      
      translationService.setLanguage('fr')
      
      expect(translationService.getCurrentLanguage()).toBe(originalLang)
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })

    it('should notify listeners when language changes', () => {
      const listener = vi.fn()
      translationService.subscribe(listener)
      
      translationService.setLanguage('ja')
      
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should not notify listeners for invalid language', () => {
      const listener = vi.fn()
      translationService.subscribe(listener)
      
      translationService.setLanguage('invalid')
      
      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('translate', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue('en')
      translationService = new TranslationService()
    })

    it('should translate simple key', () => {
      const result = translationService.translate('appName')
      expect(typeof result).toBe('string')
      expect(result).toBeTruthy()
      expect(result).toBe('FitLoop') // Both languages have same value for this key
    })

    it('should return key when translation not found', () => {
      const result = translationService.translate('nonexistent.key')
      expect(result).toBe('nonexistent.key')
    })

    it('should handle nested translation keys', () => {
      const result = translationService.translate('copy')
      expect(typeof result).toBe('string')
      expect(result).toBeTruthy()
    })

    it('should handle empty or invalid keys', () => {
      expect(translationService.translate('')).toBe('')
      expect(translationService.translate('.')).toBe('.')
    })

    it('should work with different languages', () => {
      const enResult = translationService.translate('copy')
      
      translationService.setLanguage('ja')
      const jaResult = translationService.translate('copy')
      
      expect(enResult).not.toBe(jaResult)
      expect(typeof enResult).toBe('string')
      expect(typeof jaResult).toBe('string')
      expect(enResult).toBe('Copy')
      expect(jaResult).toBe('コピー')
    })
  })

  describe('t (alias for translate)', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue('en')
      translationService = new TranslationService()
    })

    it('should work the same as translate', () => {
      const translateResult = translationService.translate('appName')
      const tResult = translationService.t('appName')
      
      expect(tResult).toBe(translateResult)
    })
  })

  describe('getAvailableLanguages', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue('en')
      translationService = new TranslationService()
    })

    it('should return available languages', () => {
      const languages = translationService.getAvailableLanguages()
      
      expect(Array.isArray(languages)).toBe(true)
      expect(languages).toContain('en')
      expect(languages).toContain('ja')
      expect(languages.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('subscribe', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue('en')
      translationService = new TranslationService()
    })

    it('should add listener and return unsubscribe function', () => {
      const listener = vi.fn()
      
      const unsubscribe = translationService.subscribe(listener)
      
      expect(typeof unsubscribe).toBe('function')
      
      // Trigger a change to test listener
      translationService.setLanguage('ja')
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should remove listener when unsubscribe is called', () => {
      const listener = vi.fn()
      const unsubscribe = translationService.subscribe(listener)
      
      // Verify listener is called
      translationService.setLanguage('ja')
      expect(listener).toHaveBeenCalledTimes(1)
      
      // Unsubscribe and verify listener is not called again
      unsubscribe()
      vi.clearAllMocks()
      
      translationService.setLanguage('en')
      expect(listener).not.toHaveBeenCalled()
    })

    it('should support multiple listeners', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      
      translationService.subscribe(listener1)
      translationService.subscribe(listener2)
      
      translationService.setLanguage('ja')
      
      expect(listener1).toHaveBeenCalledTimes(1)
      expect(listener2).toHaveBeenCalledTimes(1)
    })
  })
})