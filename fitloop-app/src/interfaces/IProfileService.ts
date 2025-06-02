import type { UserProfile } from '../models/user'

export interface IProfileReader {
  getProfile(): Promise<UserProfile | null>
}

export interface IProfileWriter {
  saveProfile(profile: UserProfile): Promise<void>
}

export interface IProfileValidator {
  validate(profile: UserProfile): { valid: boolean; errors?: string[] }
}

export interface IProfileService extends IProfileReader, IProfileWriter, IProfileValidator {}