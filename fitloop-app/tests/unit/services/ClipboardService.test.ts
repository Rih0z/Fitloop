import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ClipboardService } from '../../../src/services/ClipboardService'

// Mock navigator.clipboard
const mockClipboard = {
  writeText: vi.fn(),
  readText: vi.fn()
}

describe('ClipboardService', () => {
  let clipboardService: ClipboardService
  let originalClipboard: any

  beforeEach(() => {
    // Store original clipboard
    originalClipboard = navigator.clipboard
    
    // Set up mock clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true
    })
    
    clipboardService = new ClipboardService()
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Restore original clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true
    })
  })

  describe('copy', () => {
    it('should copy text to clipboard', async () => {
      const testText = 'Test content to copy'
      mockClipboard.writeText.mockResolvedValue(undefined)

      await clipboardService.copy(testText)

      expect(mockClipboard.writeText).toHaveBeenCalledWith(testText)
      expect(mockClipboard.writeText).toHaveBeenCalledTimes(1)
    })

    it('should throw error when clipboard API is not available', async () => {
      // Mock clipboard as undefined
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true
      })

      await expect(clipboardService.copy('test')).rejects.toThrow('Clipboard API not available')
      
      // Restore mock clipboard for other tests
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true,
        configurable: true
      })
    })

    it('should handle clipboard write errors', async () => {
      const error = new Error('Clipboard write failed')
      mockClipboard.writeText.mockRejectedValue(error)

      await expect(clipboardService.copy('test')).rejects.toThrow('Clipboard write failed')
    })
  })

  describe('paste', () => {
    it('should read text from clipboard', async () => {
      const testText = 'Pasted content'
      mockClipboard.readText.mockResolvedValue(testText)

      const result = await clipboardService.paste()

      expect(result).toBe(testText)
      expect(mockClipboard.readText).toHaveBeenCalledTimes(1)
    })

    it('should throw error when clipboard API is not available', async () => {
      // Mock clipboard as undefined
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true
      })

      await expect(clipboardService.paste()).rejects.toThrow('Clipboard API not available')
      
      // Restore mock clipboard for other tests
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true,
        configurable: true
      })
    })

    it('should handle clipboard read errors', async () => {
      const error = new Error('Clipboard read failed')
      mockClipboard.readText.mockRejectedValue(error)

      await expect(clipboardService.paste()).rejects.toThrow('Clipboard read failed')
    })

    it('should return empty string when clipboard is empty', async () => {
      mockClipboard.readText.mockResolvedValue('')

      const result = await clipboardService.paste()

      expect(result).toBe('')
    })
  })
})