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
  let originalExecCommand: any

  beforeEach(() => {
    // Store original clipboard and execCommand
    originalClipboard = navigator.clipboard
    originalExecCommand = document.execCommand
    
    // Set up mock clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true
    })
    
    // Mock document.execCommand
    document.execCommand = vi.fn().mockReturnValue(true)
    
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
    
    // Restore original execCommand
    document.execCommand = originalExecCommand
  })

  describe('copy', () => {
    it('should copy text to clipboard', async () => {
      const testText = 'Test content to copy'
      mockClipboard.writeText.mockResolvedValue(undefined)

      await clipboardService.copy(testText)

      expect(mockClipboard.writeText).toHaveBeenCalledWith(testText)
      expect(mockClipboard.writeText).toHaveBeenCalledTimes(1)
    })

    it('should fallback to execCommand when clipboard API is not available', async () => {
      // Mock clipboard as undefined
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true
      })

      await clipboardService.copy('test')
      
      expect(document.execCommand).toHaveBeenCalledWith('copy')
      
      // Restore mock clipboard for other tests
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true,
        configurable: true
      })
    })

    it('should handle clipboard write errors by falling back to execCommand', async () => {
      const error = new Error('Clipboard write failed')
      mockClipboard.writeText.mockRejectedValue(error)

      await clipboardService.copy('test')
      
      expect(document.execCommand).toHaveBeenCalledWith('copy')
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

      await expect(clipboardService.paste()).rejects.toThrow('Clipboard read not supported in this browser')
      
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

      await expect(clipboardService.paste()).rejects.toThrow('Clipboard access denied. Please paste manually.')
    })

    it('should return empty string when clipboard is empty', async () => {
      mockClipboard.readText.mockResolvedValue('')

      const result = await clipboardService.paste()

      expect(result).toBe('')
    })
  })
})