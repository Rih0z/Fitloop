export interface IThemeService {
  isDarkMode(): boolean
  setDarkMode(enabled: boolean): void
  toggle(): void
  subscribe(listener: () => void): () => void
}