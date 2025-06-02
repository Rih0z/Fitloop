export interface ITranslationService {
  getCurrentLanguage(): string
  setLanguage(language: string): void
  translate(key: string): any
  t(key: string): any // alias for translate
  getAvailableLanguages(): string[]
}