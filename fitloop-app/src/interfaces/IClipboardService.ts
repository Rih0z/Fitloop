export interface IClipboardService {
  copy(text: string): Promise<void>
  paste(): Promise<string>
}