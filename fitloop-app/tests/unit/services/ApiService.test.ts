import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiService } from '../../../src/services/ApiService'
import type { AuthResponse, UserProfile, Prompt, WorkoutSession } from '../../../src/services/ApiService'

// Mock fetch globally
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('ApiService', () => {
  const mockBaseURL = 'https://fitloop-backend.riho-dare.workers.dev/api'
  const mockToken = 'test-auth-token'

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    vi.mocked(global.fetch).mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    describe('signup', () => {
      it('should sign up successfully', async () => {
        const mockResponse: AuthResponse = {
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          token: mockToken,
          message: 'Signup successful'
        }

        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse
        } as Response)

        const result = await apiService.signup('test@example.com', 'password123', 'Test User')

        expect(global.fetch).toHaveBeenCalledWith(
          `${mockBaseURL}/auth/signup`,
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'password123', name: 'Test User' })
          })
        )

        expect(result.status).toBe(200)
        expect(result.data).toEqual(mockResponse)
        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', mockToken)
      })

      it('should handle signup errors', async () => {
        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ error: 'Email already exists' })
        } as Response)

        const result = await apiService.signup('test@example.com', 'password123', 'Test User')

        expect(result.status).toBe(400)
        expect(result.error).toBe('Email already exists')
        expect(result.data).toBeUndefined()
      })
    })

    describe('signin', () => {
      it('should sign in successfully', async () => {
        const mockResponse: AuthResponse = {
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          token: mockToken,
          message: 'Signin successful'
        }

        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse
        } as Response)

        const result = await apiService.signin('test@example.com', 'password123')

        expect(result.status).toBe(200)
        expect(result.data).toEqual(mockResponse)
        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', mockToken)
      })
    })

    describe('signout', () => {
      it('should sign out successfully', async () => {
        // Set initial token
        apiService.setToken(mockToken)

        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ message: 'Signout successful' })
        } as Response)

        const result = await apiService.signout()

        expect(global.fetch).toHaveBeenCalledWith(
          `${mockBaseURL}/auth/signout`,
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Authorization': `Bearer ${mockToken}`
            })
          })
        )

        expect(result.status).toBe(200)
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
        expect(apiService.getToken()).toBeNull()
      })
    })

    describe('refreshToken', () => {
      it('should refresh token successfully', async () => {
        const mockResponse: AuthResponse = {
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          token: 'new-token',
          message: 'Token refreshed'
        }

        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse
        } as Response)

        const result = await apiService.refreshToken('refresh-token')

        expect(result.status).toBe(200)
        expect(result.data).toEqual(mockResponse)
        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'new-token')
      })
    })
  })

  describe('Profile methods', () => {
    beforeEach(() => {
      apiService.setToken(mockToken)
    })

    describe('getProfile', () => {
      it('should get profile successfully', async () => {
        const mockProfile: UserProfile = {
          name: 'Test User',
          experience: 'intermediate',
          goals: 'Get fit',
          environment: 'Gym'
        }

        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockProfile
        } as Response)

        const result = await apiService.getProfile()

        expect(global.fetch).toHaveBeenCalledWith(
          `${mockBaseURL}/profile`,
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': `Bearer ${mockToken}`
            })
          })
        )

        expect(result.status).toBe(200)
        expect(result.data).toEqual(mockProfile)
      })
    })

    describe('saveProfile', () => {
      it('should save profile successfully', async () => {
        const profile: Partial<UserProfile> = {
          name: 'Test User',
          goals: 'Build muscle'
        }

        const mockResponse = {
          profile: { ...profile, id: '1' },
          message: 'Profile saved'
        }

        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse
        } as Response)

        const result = await apiService.saveProfile(profile)

        expect(global.fetch).toHaveBeenCalledWith(
          `${mockBaseURL}/profile`,
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(profile)
          })
        )

        expect(result.status).toBe(200)
        expect(result.data).toEqual(mockResponse)
      })
    })

    describe('updateProfile', () => {
      it('should update profile successfully', async () => {
        const updates = { goals: 'Lose weight' }
        const mockResponse = {
          profile: { name: 'Test User', goals: 'Lose weight' },
          message: 'Profile updated'
        }

        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse
        } as Response)

        const result = await apiService.updateProfile(updates)

        expect(global.fetch).toHaveBeenCalledWith(
          `${mockBaseURL}/profile`,
          expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify(updates)
          })
        )

        expect(result.status).toBe(200)
      })
    })

    describe('deleteProfile', () => {
      it('should delete profile successfully', async () => {
        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ message: 'Profile deleted' })
        } as Response)

        const result = await apiService.deleteProfile()

        expect(global.fetch).toHaveBeenCalledWith(
          `${mockBaseURL}/profile`,
          expect.objectContaining({
            method: 'DELETE'
          })
        )

        expect(result.status).toBe(200)
      })
    })
  })

  describe('Prompt methods', () => {
    beforeEach(() => {
      apiService.setToken(mockToken)
    })

    describe('getPrompts', () => {
      it('should get prompts with filters', async () => {
        const mockPrompts: Prompt[] = [{
          id: '1',
          user_id: '1',
          type: 'training',
          title: 'Test Prompt',
          content: 'Content',
          used: false,
          created_at: '2025-06-01',
          updated_at: '2025-06-01'
        }]

        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockPrompts
        } as Response)

        const result = await apiService.getPrompts('training', 'profile', 10, 0)

        expect(global.fetch).toHaveBeenCalledWith(
          `${mockBaseURL}/prompts?type=training&source=profile&limit=10&offset=0`,
          expect.any(Object)
        )

        expect(result.data).toEqual(mockPrompts)
      })
    })

    describe('createPrompt', () => {
      it('should create prompt successfully', async () => {
        const newPrompt = {
          type: 'training' as const,
          title: 'New Prompt',
          content: 'Content',
          used: false
        }

        const mockResponse = {
          prompt: { ...newPrompt, id: '1', user_id: '1' },
          message: 'Prompt created'
        }

        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => mockResponse
        } as Response)

        const result = await apiService.createPrompt(newPrompt)

        expect(result.status).toBe(201)
        expect(result.data).toEqual(mockResponse)
      })
    })

    describe('generatePromptFromProfile', () => {
      it('should generate prompt from profile', async () => {
        const mockResponse = {
          prompt: {
            id: '1',
            type: 'training',
            title: 'Generated Prompt',
            content: 'Generated content'
          },
          message: 'Prompt generated'
        }

        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse
        } as Response)

        const result = await apiService.generatePromptFromProfile()

        expect(global.fetch).toHaveBeenCalledWith(
          `${mockBaseURL}/prompts/generate`,
          expect.objectContaining({
            method: 'POST'
          })
        )

        expect(result.data).toEqual(mockResponse)
      })
    })

    describe('markPromptAsUsed', () => {
      it('should mark prompt as used', async () => {
        const promptId = '1'
        const mockResponse = {
          prompt: { id: promptId, used: true },
          message: 'Prompt marked as used'
        }

        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse
        } as Response)

        const result = await apiService.markPromptAsUsed(promptId)

        expect(global.fetch).toHaveBeenCalledWith(
          `${mockBaseURL}/prompts/${promptId}/use`,
          expect.objectContaining({
            method: 'PATCH'
          })
        )

        expect(result.data).toEqual(mockResponse)
      })
    })
  })

  describe('Workout methods', () => {
    beforeEach(() => {
      apiService.setToken(mockToken)
    })

    describe('getWorkouts', () => {
      it('should get workouts with date range', async () => {
        const mockWorkouts: WorkoutSession[] = [{
          id: '1',
          workout_date: '2025-06-01',
          exercises: []
        }]

        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockWorkouts
        } as Response)

        const result = await apiService.getWorkouts(10, 0, '2025-06-01', '2025-06-30')

        expect(global.fetch).toHaveBeenCalledWith(
          `${mockBaseURL}/workouts?limit=10&offset=0&date_from=2025-06-01&date_to=2025-06-30`,
          expect.any(Object)
        )

        expect(result.data).toEqual(mockWorkouts)
      })
    })

    describe('createWorkout', () => {
      it('should create workout successfully', async () => {
        const newWorkout = {
          workout_date: '2025-06-01',
          exercises: [{
            name: 'Bench Press',
            sets: 3,
            reps: 10,
            weight: 60
          }]
        }

        const mockResponse = {
          workout: { ...newWorkout, id: '1' },
          message: 'Workout created'
        }

        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => mockResponse
        } as Response)

        const result = await apiService.createWorkout(newWorkout)

        expect(result.status).toBe(201)
        expect(result.data).toEqual(mockResponse)
      })
    })

    describe('getWorkoutStats', () => {
      it('should get workout statistics', async () => {
        const mockStats = {
          period: 30,
          statistics: {
            totalWorkouts: 10,
            totalExercises: 50,
            totalDuration: 600,
            averageRating: 4.5,
            averageDuration: 60
          },
          workouts: []
        }

        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockStats
        } as Response)

        const result = await apiService.getWorkoutStats(30)

        expect(global.fetch).toHaveBeenCalledWith(
          `${mockBaseURL}/workouts/stats/summary?period=30`,
          expect.any(Object)
        )

        expect(result.data).toEqual(mockStats)
      })
    })
  })

  describe('Token management', () => {
    it('should set and get token', () => {
      apiService.setToken(mockToken)
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', mockToken)
      expect(apiService.getToken()).toBe(mockToken)
      expect(apiService.isAuthenticated()).toBe(true)
    })

    it('should clear token', () => {
      apiService.setToken(mockToken)
      apiService.clearToken()
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
      expect(apiService.getToken()).toBeNull()
      expect(apiService.isAuthenticated()).toBe(false)
    })
  })

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))

      const result = await apiService.getProfile()

      expect(result.status).toBe(0)
      expect(result.error).toBe('Network error')
      expect(result.data).toBeUndefined()
    })

    it('should handle non-Error throws', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce('String error')

      const result = await apiService.getProfile()

      expect(result.status).toBe(0)
      expect(result.error).toBe('Network error')
    })

    it('should handle API error responses', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' })
      } as Response)

      const result = await apiService.getProfile()

      expect(result.status).toBe(401)
      expect(result.error).toBe('Unauthorized')
      expect(result.data).toBeUndefined()
    })
  })
})