import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ThemeService } from '../../../src/services/ThemeService'

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

describe('ThemeService', () => {
  let themeService: ThemeService

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Clean up any listeners
    themeService = null as any
  })

  describe('constructor', () => {
    it('should initialize with dark mode when no saved preference', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      themeService = new ThemeService()
      
      expect(themeService.isDarkMode()).toBe(true)
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('darkMode')
    })

    it('should initialize with saved dark mode preference (true)', () => {
      mockLocalStorage.getItem.mockReturnValue('true')
      
      themeService = new ThemeService()
      
      expect(themeService.isDarkMode()).toBe(true)
    })

    it('should initialize with saved dark mode preference (false)', () => {
      mockLocalStorage.getItem.mockReturnValue('false')
      
      themeService = new ThemeService()
      
      expect(themeService.isDarkMode()).toBe(false)
    })
  })

  describe('isDarkMode', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue(null)
      themeService = new ThemeService()
    })

    it('should return current dark mode state', () => {
      expect(themeService.isDarkMode()).toBe(true)
    })
  })

  describe('setDarkMode', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue(null)
      themeService = new ThemeService()
    })

    it('should set dark mode to true', () => {
      themeService.setDarkMode(true)
      
      expect(themeService.isDarkMode()).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('darkMode', 'true')
    })

    it('should set dark mode to false', () => {
      themeService.setDarkMode(false)
      
      expect(themeService.isDarkMode()).toBe(false)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('darkMode', 'false')
    })

    it('should notify listeners when mode changes', () => {
      const listener = vi.fn()
      themeService.subscribe(listener)
      
      themeService.setDarkMode(false)
      
      expect(listener).toHaveBeenCalledTimes(1)
    })
  })

  describe('toggle', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue('true')
      themeService = new ThemeService()
    })

    it('should toggle from dark to light mode', () => {
      expect(themeService.isDarkMode()).toBe(true)
      
      themeService.toggle()
      
      expect(themeService.isDarkMode()).toBe(false)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('darkMode', 'false')
    })

    it('should toggle from light to dark mode', () => {
      themeService.setDarkMode(false)
      vi.clearAllMocks()
      
      themeService.toggle()
      
      expect(themeService.isDarkMode()).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('darkMode', 'true')
    })

    it('should notify listeners when toggling', () => {
      const listener = vi.fn()
      themeService.subscribe(listener)
      
      themeService.toggle()
      
      expect(listener).toHaveBeenCalledTimes(1)
    })
  })

  describe('subscribe', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue(null)
      themeService = new ThemeService()
    })

    it('should add listener and return unsubscribe function', () => {
      const listener = vi.fn()
      
      const unsubscribe = themeService.subscribe(listener)
      
      expect(typeof unsubscribe).toBe('function')
      
      // Trigger a change to test listener
      themeService.setDarkMode(false)
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should remove listener when unsubscribe is called', () => {
      const listener = vi.fn()
      const unsubscribe = themeService.subscribe(listener)
      
      // Verify listener is called
      themeService.setDarkMode(false)
      expect(listener).toHaveBeenCalledTimes(1)
      
      // Unsubscribe and verify listener is not called again
      unsubscribe()
      vi.clearAllMocks()
      
      themeService.setDarkMode(true)
      expect(listener).not.toHaveBeenCalled()
    })

    it('should support multiple listeners', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      
      themeService.subscribe(listener1)
      themeService.subscribe(listener2)
      
      themeService.setDarkMode(false)
      
      expect(listener1).toHaveBeenCalledTimes(1)
      expect(listener2).toHaveBeenCalledTimes(1)
    })

    it('should only remove the correct listener', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      
      const unsubscribe1 = themeService.subscribe(listener1)
      themeService.subscribe(listener2)
      
      // Remove first listener
      unsubscribe1()
      
      themeService.setDarkMode(false)
      
      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).toHaveBeenCalledTimes(1)
    })
  })
})