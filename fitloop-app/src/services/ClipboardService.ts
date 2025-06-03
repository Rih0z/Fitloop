import type { IClipboardService } from '../interfaces/IClipboardService'

export class ClipboardService implements IClipboardService {
  async copy(text: string): Promise<void> {
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text)
        return
      } catch (err) {
        console.warn('Clipboard API failed, trying fallback', err)
      }
    }
    
    // Fallback method using a temporary textarea
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    textarea.style.top = '0'
    textarea.setAttribute('readonly', '')
    
    document.body.appendChild(textarea)
    
    // For iOS
    if (navigator.userAgent.match(/ipad|iphone/i)) {
      const range = document.createRange()
      range.selectNodeContents(textarea)
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
      }
      textarea.setSelectionRange(0, 999999)
    } else {
      textarea.select()
    }
    
    try {
      const successful = document.execCommand('copy')
      if (!successful) {
        throw new Error('Copy command failed')
      }
    } finally {
      document.body.removeChild(textarea)
    }
  }

  async paste(): Promise<string> {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      throw new Error('Clipboard read not supported in this browser')
    }
    
    try {
      return await navigator.clipboard.readText()
    } catch (err) {
      // Some browsers require user activation
      throw new Error('Clipboard access denied. Please paste manually.')
    }
  }
}