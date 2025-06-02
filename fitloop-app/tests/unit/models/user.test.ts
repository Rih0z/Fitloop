import { describe, it, expect } from 'vitest'
import { validateUserProfile, createDefaultUserProfile } from '../../../src/models/user'
import type { UserProfile, UserPreferences } from '../../../src/models/user'

describe('UserProfile', () => {
  describe('validateUserProfile', () => {
    it('should validate a valid user profile', () => {
      const validProfile: UserProfile = {
        name: 'テストユーザー',
        goals: 'モテたい、健康になりたい',
        environment: 'ジムに通っている（フリーウェイト・マシン何でも使える）',
        preferences: {
          intensity: 'medium',
          frequency: 3,
          timeAvailable: 60,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => validateUserProfile(validProfile)).not.toThrow()
    })

    it('should throw error for missing required fields', () => {
      const invalidProfile = {
        name: 'テストユーザー',
        // goals is missing
        environment: 'ジム',
      }

      expect(() => validateUserProfile(invalidProfile as any)).toThrow('Goals are required')
    })

    it('should throw error for empty goals', () => {
      const invalidProfile: UserProfile = {
        name: 'テストユーザー',
        goals: '',
        environment: 'ジム',
        preferences: {
          intensity: 'medium',
          frequency: 3,
          timeAvailable: 60,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => validateUserProfile(invalidProfile)).toThrow('Goals must be between 1 and 500 characters')
    })

    it('should throw error for invalid intensity', () => {
      const invalidProfile: UserProfile = {
        name: 'テストユーザー',
        goals: '健康になりたい',
        environment: 'ジム',
        preferences: {
          intensity: 'invalid' as any,
          frequency: 3,
          timeAvailable: 60,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => validateUserProfile(invalidProfile)).toThrow('Invalid intensity level')
    })

    it('should throw error for negative frequency', () => {
      const invalidProfile: UserProfile = {
        name: 'テストユーザー',
        goals: '健康になりたい',
        environment: 'ジム',
        preferences: {
          intensity: 'medium',
          frequency: -1,
          timeAvailable: 60,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => validateUserProfile(invalidProfile)).toThrow('Frequency must be between 1 and 7')
    })

    it('should throw error for frequency greater than 7', () => {
      const invalidProfile: UserProfile = {
        name: 'テストユーザー',
        goals: '健康になりたい',
        environment: 'ジム',
        preferences: {
          intensity: 'medium',
          frequency: 8,
          timeAvailable: 60,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => validateUserProfile(invalidProfile)).toThrow('Frequency must be between 1 and 7')
    })

    it('should throw error for zero frequency', () => {
      const invalidProfile: UserProfile = {
        name: 'テストユーザー',
        goals: '健康になりたい',
        environment: 'ジム',
        preferences: {
          intensity: 'medium',
          frequency: 0,
          timeAvailable: 60,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => validateUserProfile(invalidProfile)).toThrow('Frequency must be between 1 and 7')
    })

    it('should throw error for whitespace-only name', () => {
      const invalidProfile: UserProfile = {
        name: '   ',
        goals: '健康になりたい',
        environment: 'ジム',
        preferences: {
          intensity: 'medium',
          frequency: 3,
          timeAvailable: 60,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => validateUserProfile(invalidProfile)).toThrow('Name must be between 1 and 100 characters')
    })

    it('should throw error for missing name', () => {
      const invalidProfile = {
        goals: '健康になりたい',
        environment: 'ジム',
        preferences: {
          intensity: 'medium',
          frequency: 3,
          timeAvailable: 60,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => validateUserProfile(invalidProfile as any)).toThrow('Name is required')
    })

    it('should throw error for whitespace-only environment', () => {
      const invalidProfile: UserProfile = {
        name: 'テストユーザー',
        goals: '健康になりたい',
        environment: '   ',
        preferences: {
          intensity: 'medium',
          frequency: 3,
          timeAvailable: 60,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => validateUserProfile(invalidProfile)).toThrow('Environment must be between 1 and 500 characters')
    })

    it('should throw error for missing environment', () => {
      const invalidProfile = {
        name: 'テストユーザー',
        goals: '健康になりたい',
        preferences: {
          intensity: 'medium',
          frequency: 3,
          timeAvailable: 60,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => validateUserProfile(invalidProfile as any)).toThrow('Environment is required')
    })

    it('should throw error for negative time available', () => {
      const invalidProfile: UserProfile = {
        name: 'テストユーザー',
        goals: '健康になりたい',
        environment: 'ジム',
        preferences: {
          intensity: 'medium',
          frequency: 3,
          timeAvailable: -1,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => validateUserProfile(invalidProfile)).toThrow('Time available must be between 0 and 300 minutes')
    })

    it('should throw error for time available greater than 300 minutes', () => {
      const invalidProfile: UserProfile = {
        name: 'テストユーザー',
        goals: '健康になりたい',
        environment: 'ジム',
        preferences: {
          intensity: 'medium',
          frequency: 3,
          timeAvailable: 301,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => validateUserProfile(invalidProfile)).toThrow('Time available must be between 0 and 300 minutes')
    })

    it('should throw error for missing preferences', () => {
      const invalidProfile = {
        name: 'テストユーザー',
        goals: '健康になりたい',
        environment: 'ジム',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => validateUserProfile(invalidProfile as any)).toThrow('Preferences are required')
    })

    it('should validate profile with all edge cases', () => {
      const edgeProfile: UserProfile = {
        name: 'a', // minimum length
        goals: 'a', // minimum length
        environment: 'a', // minimum length
        preferences: {
          intensity: 'low',
          frequency: 1, // minimum
          timeAvailable: 1, // minimum
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => validateUserProfile(edgeProfile)).not.toThrow()
    })

    it('should validate profile with maximum values', () => {
      const maxProfile: UserProfile = {
        name: 'Very Long Name That Is Still Valid',
        goals: 'Multiple goals including health, fitness, muscle building, weight loss, and more',
        environment: 'Complete gym with all equipment, outdoor space, pool, and more',
        preferences: {
          intensity: 'high',
          frequency: 7, // maximum
          timeAvailable: 300, // 5 hours (maximum)
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => validateUserProfile(maxProfile)).not.toThrow()
    })

    it('should throw error for name longer than 100 characters', () => {
      const invalidProfile: UserProfile = {
        name: 'a'.repeat(101),
        goals: '健康になりたい',
        environment: 'ジム',
        preferences: {
          intensity: 'medium',
          frequency: 3,
          timeAvailable: 60,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => validateUserProfile(invalidProfile)).toThrow('Name must be between 1 and 100 characters')
    })

    it('should throw error for goals longer than 500 characters', () => {
      const invalidProfile: UserProfile = {
        name: 'テストユーザー',
        goals: 'a'.repeat(501),
        environment: 'ジム',
        preferences: {
          intensity: 'medium',
          frequency: 3,
          timeAvailable: 60,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => validateUserProfile(invalidProfile)).toThrow('Goals must be between 1 and 500 characters')
    })

    it('should throw error for environment longer than 500 characters', () => {
      const invalidProfile: UserProfile = {
        name: 'テストユーザー',
        goals: '健康になりたい',
        environment: 'a'.repeat(501),
        preferences: {
          intensity: 'medium',
          frequency: 3,
          timeAvailable: 60,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => validateUserProfile(invalidProfile)).toThrow('Environment must be between 1 and 500 characters')
    })

    it('should validate profile with zero time available', () => {
      const validProfile: UserProfile = {
        name: 'テストユーザー',
        goals: '健康になりたい',
        environment: 'ジム',
        preferences: {
          intensity: 'medium',
          frequency: 3,
          timeAvailable: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => validateUserProfile(validProfile)).not.toThrow()
    })
  })

  describe('UserPreferences', () => {
    it('should have default values when not specified', () => {
      const preferences: UserPreferences = {
        intensity: 'medium',
        frequency: 3,
        timeAvailable: 45,
      }

      expect(preferences.intensity).toBe('medium')
      expect(preferences.frequency).toBe(3)
      expect(preferences.timeAvailable).toBe(45)
    })

    it('should accept all valid intensity levels', () => {
      const intensityLevels: Array<UserPreferences['intensity']> = ['low', 'medium', 'high']
      
      intensityLevels.forEach(level => {
        const preferences: UserPreferences = {
          intensity: level,
          frequency: 3,
          timeAvailable: 60,
        }
        expect(preferences.intensity).toBe(level)
      })
    })

    it('should accept all valid frequency values', () => {
      for (let i = 1; i <= 7; i++) {
        const preferences: UserPreferences = {
          intensity: 'medium',
          frequency: i,
          timeAvailable: 60,
        }
        expect(preferences.frequency).toBe(i)
      }
    })

    it('should accept various time available values', () => {
      const timeValues = [15, 30, 45, 60, 90, 120, 180]
      
      timeValues.forEach(time => {
        const preferences: UserPreferences = {
          intensity: 'medium',
          frequency: 3,
          timeAvailable: time,
        }
        expect(preferences.timeAvailable).toBe(time)
      })
    })
  })

  describe('createDefaultUserProfile', () => {
    it('should create a default user profile with correct structure', () => {
      const defaultProfile = createDefaultUserProfile()
      
      expect(defaultProfile).toHaveProperty('name')
      expect(defaultProfile).toHaveProperty('goals')
      expect(defaultProfile).toHaveProperty('environment')
      expect(defaultProfile).toHaveProperty('preferences')
      expect(defaultProfile).toHaveProperty('createdAt')
      expect(defaultProfile).toHaveProperty('updatedAt')
    })

    it('should not have an id property', () => {
      const defaultProfile = createDefaultUserProfile()
      expect(defaultProfile).not.toHaveProperty('id')
    })

    it('should have empty strings for name, goals, and environment', () => {
      const defaultProfile = createDefaultUserProfile()
      
      expect(defaultProfile.name).toBe('')
      expect(defaultProfile.goals).toBe('')
      expect(defaultProfile.environment).toBe('')
    })

    it('should have default preferences', () => {
      const defaultProfile = createDefaultUserProfile()
      
      expect(defaultProfile.preferences.intensity).toBe('medium')
      expect(defaultProfile.preferences.frequency).toBe(3)
      expect(defaultProfile.preferences.timeAvailable).toBe(45)
    })

    it('should have valid date objects', () => {
      const before = new Date()
      const defaultProfile = createDefaultUserProfile()
      const after = new Date()
      
      expect(defaultProfile.createdAt).toBeInstanceOf(Date)
      expect(defaultProfile.updatedAt).toBeInstanceOf(Date)
      expect(defaultProfile.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(defaultProfile.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should create unique instances each time', () => {
      const profile1 = createDefaultUserProfile()
      const profile2 = createDefaultUserProfile()
      
      expect(profile1).not.toBe(profile2)
      expect(profile1.preferences).not.toBe(profile2.preferences)
      expect(profile1.createdAt).not.toBe(profile2.createdAt)
    })
  })
})