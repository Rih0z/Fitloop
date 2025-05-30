import { describe, it, expect } from 'vitest'
import { validateUserProfile } from './user'
import type { UserProfile, UserPreferences } from './user'

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

      expect(() => validateUserProfile(invalidProfile)).toThrow('Goals cannot be empty')
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
  })
})