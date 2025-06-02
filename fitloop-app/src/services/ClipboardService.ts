import type { IClipboardService } from '../interfaces/IClipboardService'

export class ClipboardService implements IClipboardService {
  async copy(text: string): Promise<void> {
    if (!navigator.clipboard) {
      throw new Error('Clipboard API not available')
    }
    await navigator.clipboard.writeText(text)
  }

  async paste(): Promise<string> {
    if (!navigator.clipboard) {
      throw new Error('Clipboard API not available')
    }
    return await navigator.clipboard.readText()
  }
}