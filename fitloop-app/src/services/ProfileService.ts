import type { IProfileService } from '../interfaces/IProfileService'
import type { UserProfile } from '../models/user'
import { validateUserProfile } from '../models/user'
import { sanitizeInput } from '../utils/sanitize'
import { StorageManager } from '../lib/db'

export class ProfileService implements IProfileService {
  private storage: StorageManager
  
  constructor(storage: StorageManager) {
    this.storage = storage
  }

  async getProfile(): Promise<UserProfile | null> {
    const profile = await this.storage.getProfile()
    return profile || null
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    // Sanitize all string inputs
    const sanitizedProfile: UserProfile = {
      ...profile,
      name: sanitizeInput(profile.name),
      goals: sanitizeInput(profile.goals),
      environment: sanitizeInput(profile.environment),
      updatedAt: new Date()
    }

    // Validate before saving
    const validation = this.validate(sanitizedProfile)
    if (!validation.valid) {
      throw new Error(`Profile validation failed: ${validation.errors?.join(', ')}`)
    }

    await this.storage.saveProfile(sanitizedProfile)
  }

  validate(profile: UserProfile): { valid: boolean; errors?: string[] } {
    try {
      validateUserProfile(profile)
      return { valid: true }
    } catch (error) {
      return { 
        valid: false, 
        errors: [error instanceof Error ? error.message : 'Unknown validation error']
      }
    }
  }
}