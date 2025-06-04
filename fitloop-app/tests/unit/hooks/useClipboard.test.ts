import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock ClipboardService before importing anything that uses it
vi.mock('../../../src/services/ClipboardService', () => {
  const mockCopy = vi.fn()
  const mockPaste = vi.fn()
  
  return {
    ClipboardService: vi.fn().mockImplementation(() => ({
      copy: mockCopy,
      paste: mockPaste
    })),
    _mockCopy: mockCopy,
    _mockPaste: mockPaste
  }
})

// Now import after mocking
import { useClipboard } from '../../../src/hooks/useClipboard'
// Get the mocked functions
const { _mockCopy: mockCopy, _mockPaste: mockPaste } = await import('../../../src/services/ClipboardService')

// Mock setTimeout and clearTimeout for testing
vi.useFakeTimers()

// Mock window.alert for error handling
global.alert = vi.fn()

describe('useClipboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(global.alert).mockClear()
    vi.mocked(mockCopy).mockReset()
    vi.mocked(mockPaste).mockReset()
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
      vi.mocked(mockCopy).mockResolvedValue(undefined)
      const { result } = renderHook(() => useClipboard())

      await act(async () => {
        await result.current.copy('test text')
      })

      expect(mockCopy).toHaveBeenCalledWith('test text')
      expect(result.current.copied).toBe(true)
      expect(result.current.error).toBe(null)
    })

    it('should reset copied state after 2 seconds', async () => {
      vi.mocked(mockCopy).mockResolvedValue(undefined)
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
      vi.mocked(mockCopy).mockRejectedValue(error)
      const { result } = renderHook(() => useClipboard())

      await act(async () => {
        await result.current.copy('test text')
      })

      expect(result.current.copied).toBe(false)
      expect(result.current.error).toBe('Copy failed')
      expect(global.alert).toHaveBeenCalledWith('クリップボードへのコピーに失敗しました。手動でテキストを選択してコピーしてください。')
    })

    it('should clear previous errors on successful copy', async () => {
      // First call fails
      vi.mocked(mockCopy).mockRejectedValueOnce(new Error('First error'))
      const { result } = renderHook(() => useClipboard())

      await act(async () => {
        await result.current.copy('test text')
      })

      expect(result.current.error).toBe('First error')

      // Second call succeeds
      vi.mocked(mockCopy).mockResolvedValue(undefined)

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
      vi.mocked(mockPaste).mockResolvedValue(pastedText)
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
      vi.mocked(mockPaste).mockRejectedValue(error)
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
      vi.mocked(mockPaste).mockRejectedValueOnce(new Error('First error'))
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
      vi.mocked(mockPaste).mockResolvedValue('success')

      await act(async () => {
        await result.current.paste()
      })

      expect(result.current.error).toBe(null)
    })

    it('should return empty string when pasting empty clipboard', async () => {
      vi.mocked(mockPaste).mockResolvedValue('')
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
      vi.mocked(mockCopy).mockResolvedValue(undefined)
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