import type { UserProfile } from '../models/user'
import type { Context } from '../models/context'

export interface IPromptService {
  generateFullPrompt(profile: UserProfile, context: Context, language: string): string
  extractMetadata(text: string): any
  getSessionTitle(sessionNumber: number): string
}