import type { IThemeService } from '../interfaces/IThemeService'

export class ThemeService implements IThemeService {
  private darkMode: boolean
  private listeners: Set<() => void> = new Set()

  constructor() {
    // Initialize from localStorage
    const savedDarkMode = localStorage.getItem('darkMode')
    this.darkMode = savedDarkMode !== null ? savedDarkMode === 'true' : true
  }

  isDarkMode(): boolean {
    return this.darkMode
  }

  setDarkMode(enabled: boolean): void {
    this.darkMode = enabled
    localStorage.setItem('darkMode', String(enabled))
    this.notifyListeners()
  }

  toggle(): void {
    this.setDarkMode(!this.darkMode)
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener())
  }
}