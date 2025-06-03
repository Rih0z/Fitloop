import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProfileService } from '../../../src/services/ProfileService'
import type { UserProfile } from '../../../src/models/user'
import type { StorageManager } from '../../../src/lib/db'

// Mock StorageManager
const mockStorageManager = {
  getProfile: vi.fn(),
  saveProfile: vi.fn()
} as unknown as StorageManager

describe('ProfileService', () => {
  let profileService: ProfileService

  beforeEach(() => {
    profileService = new ProfileService(mockStorageManager)
    vi.clearAllMocks()
  })

  const mockProfile: UserProfile = {
    name: 'Test User',
    goals: 'Get fit and healthy',
    environment: 'Home gym',
    preferences: {
      intensity: 'medium',
      frequency: 3,
      timeAvailable: 60
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }

  describe('getProfile', () => {
    it('should return profile when it exists', async () => {
      mockStorageManager.getProfile = vi.fn().mockResolvedValue(mockProfile)

      const result = await profileService.getProfile()

      expect(result).toEqual(mockProfile)
      expect(mockStorageManager.getProfile).toHaveBeenCalledTimes(1)
    })

    it('should return null when profile does not exist', async () => {
      mockStorageManager.getProfile = vi.fn().mockResolvedValue(undefined)

      const result = await profileService.getProfile()

      expect(result).toBeNull()
      expect(mockStorageManager.getProfile).toHaveBeenCalledTimes(1)
    })

    it('should handle storage errors', async () => {
      const error = new Error('Storage error')
      mockStorageManager.getProfile = vi.fn().mockRejectedValue(error)

      await expect(profileService.getProfile()).rejects.toThrow('Storage error')
    })
  })

  describe('saveProfile', () => {
    beforeEach(() => {
      mockStorageManager.saveProfile = vi.fn().mockResolvedValue(undefined)
    })

    it('should save valid profile with sanitization', async () => {
      const profileWithUnsafeInput: UserProfile = {
        ...mockProfile,
        name: 'User<script>alert("xss")</script>',
        goals: 'Get fit & be healthy',
        environment: 'Home gym with <equipment>'
      }

      await profileService.saveProfile(profileWithUnsafeInput)

      expect(mockStorageManager.saveProfile).toHaveBeenCalledTimes(1)
      
      const savedProfile = (mockStorageManager.saveProfile as any).mock.calls[0][0]
      // Check that script tags are removed/sanitized
      expect(savedProfile.name).toBe('Userscriptalert("xss")/script')  // Angle brackets removed
      expect(savedProfile.goals).toBe('Get fit & be healthy')
      expect(savedProfile.environment).toBe('Home gym with equipment')  // Only angle brackets removed
      expect(savedProfile.updatedAt).toBeInstanceOf(Date)
    })

    it('should update the updatedAt timestamp', async () => {
      const originalDate = mockProfile.updatedAt
      
      await profileService.saveProfile(mockProfile)

      const savedProfile = (mockStorageManager.saveProfile as any).mock.calls[0][0]
      expect(savedProfile.updatedAt.getTime()).toBeGreaterThanOrEqual(originalDate.getTime())
    })

    it('should throw error for invalid profile', async () => {
      const invalidProfile: UserProfile = {
        ...mockProfile,
        name: '', // Invalid - empty name
        preferences: {
          intensity: 'invalid' as any, // Invalid intensity
          frequency: -1, // Invalid frequency
          timeAvailable: 0 // Invalid time
        }
      }

      await expect(profileService.saveProfile(invalidProfile)).rejects.toThrow(/Profile validation failed/)
    })

    it('should handle storage save errors', async () => {
      const error = new Error('Save error')
      mockStorageManager.saveProfile = vi.fn().mockRejectedValue(error)

      await expect(profileService.saveProfile(mockProfile)).rejects.toThrow('Save error')
    })
  })

  describe('validate', () => {
    it('should return valid for correct profile', () => {
      const result = profileService.validate(mockProfile)

      expect(result.valid).toBe(true)
      expect(result.errors).toBeUndefined()
    })

    it('should return invalid for profile with empty name', () => {
      const invalidProfile: UserProfile = {
        ...mockProfile,
        name: ''
      }

      const result = profileService.validate(invalidProfile)

      expect(result.valid).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors![0]).toBe('Name is required')
    })

    it('should return invalid for profile with invalid intensity', () => {
      const invalidProfile: UserProfile = {
        ...mockProfile,
        preferences: {
          ...mockProfile.preferences,
          intensity: 'invalid' as any
        }
      }

      const result = profileService.validate(invalidProfile)

      expect(result.valid).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should return invalid for profile with negative frequency', () => {
      const invalidProfile: UserProfile = {
        ...mockProfile,
        preferences: {
          ...mockProfile.preferences,
          frequency: -1
        }
      }

      const result = profileService.validate(invalidProfile)

      expect(result.valid).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should return invalid for profile with negative time available', () => {
      const invalidProfile: UserProfile = {
        ...mockProfile,
        preferences: {
          ...mockProfile.preferences,
          timeAvailable: -10
        }
      }

      const result = profileService.validate(invalidProfile)

      expect(result.valid).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should handle validation errors', () => {
      // Create a profile that will cause validation to fail
      const invalidProfile = { invalid: 'profile' } as any

      const result = profileService.validate(invalidProfile)

      expect(result.valid).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors![0]).toBe('Name is required')
    })
  })
})