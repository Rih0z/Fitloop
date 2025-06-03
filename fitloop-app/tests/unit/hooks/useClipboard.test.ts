import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useClipboard } from '../../../src/hooks/useClipboard'
import { ClipboardService } from '../../../src/services/ClipboardService'

// Mock ClipboardService
vi.mock('../../../src/services/ClipboardService')

// Mock setTimeout and clearTimeout for testing
vi.useFakeTimers()

describe('useClipboard', () => {
  const mockCopy = vi.fn()
  const mockPaste = vi.fn()

  beforeEach(() => {
    // Setup the mock implementation
    vi.mocked(ClipboardService).mockImplementation(() => ({
      copy: mockCopy,
      paste: mockPaste
    }))
    
    vi.clearAllMocks()
    mockCopy.mockReset()
    mockPaste.mockReset()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.useFakeTimers()
  })

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useClipboard())

      expect(result.current.copied).toBe(false)
      expect(result.current.error).toBe(null)
      expect(typeof result.current.copy).toBe('function')
      expect(typeof result.current.paste).toBe('function')
    })
  })

  describe('copy function', () => {
    it('should copy text successfully', async () => {
      mockCopy.mockResolvedValue(undefined)
      const { result } = renderHook(() => useClipboard())

      await act(async () => {
        await result.current.copy('test text')
      })

      expect(mockCopy).toHaveBeenCalledWith('test text')
      expect(result.current.copied).toBe(true)
      expect(result.current.error).toBe(null)
    })

    it('should reset copied state after 2 seconds', async () => {
      mockCopy.mockResolvedValue(undefined)
      const { result } = renderHook(() => useClipboard())

      await act(async () => {
        await result.current.copy('test text')
      })

      expect(result.current.copied).toBe(true)

      // Fast-forward time by 2 seconds
      act(() => {
        vi.advanceTimersByTime(2000)
      })

      expect(result.current.copied).toBe(false)
    })

    it('should handle copy errors', async () => {
      const error = new Error('Copy failed')
      mockCopy.mockRejectedValue(error)
      const { result } = renderHook(() => useClipboard())

      await act(async () => {
        await result.current.copy('test text')
      })

      expect(result.current.copied).toBe(false)
      expect(result.current.error).toBe('Failed to copy to clipboard')
    })

    it('should clear previous errors on successful copy', async () => {
      // First call fails
      mockCopy.mockRejectedValueOnce(new Error('First error'))
      const { result } = renderHook(() => useClipboard())

      await act(async () => {
        await result.current.copy('test text')
      })

      expect(result.current.error).toBe('Failed to copy to clipboard')

      // Second call succeeds
      mockCopy.mockResolvedValue(undefined)

      await act(async () => {
        await result.current.copy('test text')
      })

      expect(result.current.error).toBe(null)
      expect(result.current.copied).toBe(true)
    })
  })

  describe('paste function', () => {
    it('should paste text successfully', async () => {
      const pastedText = 'pasted content'
      mockPaste.mockResolvedValue(pastedText)
      const { result } = renderHook(() => useClipboard())

      let pasteResult: string = ''
      await act(async () => {
        pasteResult = await result.current.paste()
      })

      expect(mockPaste).toHaveBeenCalledTimes(1)
      expect(pasteResult).toBe(pastedText)
      expect(result.current.error).toBe(null)
    })

    it('should handle paste errors', async () => {
      const error = new Error('Paste failed')
      mockPaste.mockRejectedValue(error)
      const { result } = renderHook(() => useClipboard())

      await act(async () => {
        try {
          await result.current.paste()
        } catch (e) {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('Failed to paste from clipboard')
    })

    it('should clear previous errors on successful paste', async () => {
      // First call fails
      mockPaste.mockRejectedValueOnce(new Error('First error'))
      const { result } = renderHook(() => useClipboard())

      await act(async () => {
        try {
          await result.current.paste()
        } catch (e) {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('Failed to paste from clipboard')

      // Second call succeeds
      mockPaste.mockResolvedValue('success')

      await act(async () => {
        await result.current.paste()
      })

      expect(result.current.error).toBe(null)
    })

    it('should return empty string when pasting empty clipboard', async () => {
      mockPaste.mockResolvedValue('')
      const { result } = renderHook(() => useClipboard())

      let pasteResult: string = ''
      await act(async () => {
        pasteResult = await result.current.paste()
      })

      expect(pasteResult).toBe('')
      expect(result.current.error).toBe(null)
    })
  })

  describe('multiple operations', () => {
    it('should handle multiple copy operations', async () => {
      mockCopy.mockResolvedValue(undefined)
      const { result } = renderHook(() => useClipboard())

      // First copy
      await act(async () => {
        await result.current.copy('first text')
      })

      expect(result.current.copied).toBe(true)

      // Second copy before timeout
      await act(async () => {
        await result.current.copy('second text')
      })

      expect(result.current.copied).toBe(true)
      expect(mockCopy).toHaveBeenCalledTimes(2)
      expect(mockCopy).toHaveBeenLastCalledWith('second text')
    })
  })
})