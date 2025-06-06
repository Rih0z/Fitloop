import { useState, useCallback } from 'react'
import { ClipboardService } from '../services/ClipboardService'

const clipboardService = new ClipboardService()

export function useClipboard() {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const copy = useCallback(async (text: string) => {
    try {
      await clipboardService.copy(text)
      setCopied(true)
      setError(null)
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Clipboard copy error:', err)
      setError(err instanceof Error ? err.message : 'Failed to copy to clipboard')
      setCopied(false)
      
      // Show alert as fallback
      alert('クリップボードへのコピーに失敗しました。手動でテキストを選択してコピーしてください。')
    }
  }, [])

  const paste = useCallback(async (): Promise<string> => {
    try {
      const text = await clipboardService.paste()
      setError(null)
      return text
    } catch (err) {
      setError('Failed to paste from clipboard')
      throw err
    }
  }, [])

  return {
    copy,
    paste,
    copied,
    error
  }
}