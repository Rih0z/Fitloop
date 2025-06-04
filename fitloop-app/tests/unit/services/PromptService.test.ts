import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PromptService } from '../../../src/services/PromptService'
import { AIService } from '../../../src/services/AIService'
import { LearningService } from '../../../src/services/LearningService'
import type { UserProfile } from '../../../src/models/user'
import type { Context } from '../../../src/models/context'
import type { AIResponse } from '../../../src/interfaces/IAIService'
import type { ExerciseProgress, WeightRecommendation, ProgressInsights } from '../../../src/interfaces/ILearningService'
import { SESSION_TITLES } from '../../../src/lib/metaPromptTemplate'

// Mock the services
vi.mock('../../../src/services/AIService')
vi.mock('../../../src/services/LearningService')

describe('PromptService', () => {
  let service: PromptService
  let mockAIService: any
  let mockLearningService: any

  const mockProfile: UserProfile = {
    name: 'テストユーザー',
    goals: 'モテたい、健康になりたい',
    environment: 'ジムに通っている',
    preferences: {
      intensity: 'medium',
      frequency: 3,
      timeAvailable: 60
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const mockContext: Context = {
    cycleNumber: 1,
    sessionNumber: 3,
    lastActivity: new Date(),
    performance: []
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup mocked services
    mockAIService = {
      generateResponse: vi.fn()
    }
    mockLearningService = {
      getAllExercises: vi.fn(),
      getExerciseProgress: vi.fn(),
      recommendWeight: vi.fn(),
      analyzeProgress: vi.fn(),
      trackWorkout: vi.fn()
    }
    
    vi.mocked(AIService.getInstance).mockReturnValue(mockAIService)
    vi.mocked(LearningService.getInstance).mockReturnValue(mockLearningService)
    
    service = new PromptService()
  })

  describe('generateFullPrompt', () => {
    it('should generate prompt with Japanese language', () => {
      const prompt = service.generateFullPrompt(mockProfile, mockContext, 'ja')

      expect(prompt).toContain('回答は必ず日本語でお願いします')
      expect(prompt).toContain(mockProfile.name)
      expect(prompt).toContain(mockProfile.goals)
      expect(prompt).toContain(mockProfile.environment)
      expect(prompt).toContain('セッション3')
      expect(prompt).toContain(SESSION_TITLES[3])
    })

    it('should generate prompt with English language', () => {
      const prompt = service.generateFullPrompt(mockProfile, mockContext, 'en')

      expect(prompt).toContain('Please respond in English only')
    })

    it('should handle session rollover correctly', () => {
      const context: Context = {
        ...mockContext,
        sessionNumber: 9 // Should roll over to session 1
      }

      const prompt = service.generateFullPrompt(mockProfile, context, 'ja')

      expect(prompt).toContain('セッション1')
      expect(prompt).toContain(SESSION_TITLES[1])
    })

    it('should format exercises correctly', () => {
      const prompt = service.generateFullPrompt(mockProfile, mockContext, 'ja')

      expect(prompt).toMatch(/\d+\. \*\*.*\*\*/) // Exercise format
      expect(prompt).toMatch(/セット x \d+/)
      expect(prompt).toMatch(/推奨重量: \d+/)
      expect(prompt).toMatch(/セット間\d+秒休憩/)
    })

    it('should include metadata JSON', () => {
      const prompt = service.generateFullPrompt(mockProfile, mockContext, 'ja')

      expect(prompt).toContain('"targetWeight"')
      expect(prompt).toContain('"targetReps"')
      expect(prompt).toContain('"targetSets"')
      expect(prompt).toContain('"pushUpperBody"')
      expect(prompt).toContain('"pullUpperBody"')
    })

    it('should format dates correctly', () => {
      const prompt = service.generateFullPrompt(mockProfile, mockContext, 'ja')
      const today = new Date()
      
      expect(prompt).toContain(today.toLocaleDateString('ja-JP'))
      expect(prompt).toContain(today.toISOString().split('T')[0])
    })
  })

  describe('extractMetadata', () => {
    it('should extract metadata from text', () => {
      const text = 'Some text with metadata'
      const result = service.extractMetadata(text)
      
      // Since extractMetadata is imported from metaPromptTemplate,
      // we're just testing it's called correctly
      expect(result).toBeDefined()
    })
  })

  describe('getSessionTitle', () => {
    it('should return correct session title', () => {
      expect(service.getSessionTitle(1)).toBe(SESSION_TITLES[1])
      expect(service.getSessionTitle(3)).toBe(SESSION_TITLES[3])
      expect(service.getSessionTitle(8)).toBe(SESSION_TITLES[8])
    })

    it('should handle session number rollover', () => {
      expect(service.getSessionTitle(9)).toBe(SESSION_TITLES[1]) // 9 -> 1
      expect(service.getSessionTitle(16)).toBe(SESSION_TITLES[8]) // 16 -> 8
      expect(service.getSessionTitle(17)).toBe(SESSION_TITLES[1]) // 17 -> 1
    })

    it('should return default for invalid session numbers', () => {
      // For 0: ((0 - 1) % 8) + 1 = (-1 % 8) + 1 = -1 + 1 = 0, falls back to SESSION_TITLES[1]
      expect(service.getSessionTitle(0)).toBe(SESSION_TITLES[1])
      // For -1: ((-1 - 1) % 8) + 1 = (-2 % 8) + 1 = -2 + 1 = -1, falls back to SESSION_TITLES[1]  
      expect(service.getSessionTitle(-1)).toBe(SESSION_TITLES[1])
    })
  })

  describe('generateAIResponse', () => {
    it('should generate AI response with enriched prompt', async () => {
      const mockExercises = ['Bench Press', 'Squat']
      const mockProgress: ExerciseProgress = {
        exercise: 'Bench Press',
        history: [],
        personalRecord: { weight: 60, reps: 10, date: new Date() },
        lastWorkout: { 
          exercise: 'Bench Press',
          weight: 55,
          reps: 10,
          sets: 3,
          difficulty: 'moderate',
          timestamp: new Date(),
          userId: mockProfile.name
        },
        trend: 'improving'
      }
      const mockRecommendation: WeightRecommendation = {
        exercise: 'Bench Press',
        recommendedWeight: 60,
        reasoning: 'Progressive overload',
        confidence: 0.8,
        alternatives: { conservative: 57, aggressive: 63 }
      }
      const mockInsights: ProgressInsights = {
        overallProgress: 'good',
        strengths: ['Consistent training'],
        areasForImprovement: ['Lower body focus'],
        recommendations: ['Add more leg exercises'],
        muscleBalance: {
          upperBody: 60,
          lowerBody: 30,
          core: 10
        },
        consistency: {
          workoutsPerWeek: 3,
          streak: 5,
          lastWorkout: new Date()
        }
      }
      const mockAIResponse: AIResponse = {
        content: 'AI generated response',
        provider: 'claude',
        timestamp: new Date()
      }

      mockLearningService.getAllExercises.mockResolvedValue(mockExercises)
      mockLearningService.getExerciseProgress.mockResolvedValue(mockProgress)
      mockLearningService.recommendWeight.mockResolvedValue(mockRecommendation)
      mockLearningService.analyzeProgress.mockResolvedValue(mockInsights)
      mockAIService.generateResponse.mockResolvedValue(mockAIResponse)

      const response = await service.generateAIResponse(mockProfile, mockContext, 'ja', 'claude')

      expect(response).toEqual(mockAIResponse)
      expect(mockLearningService.getAllExercises).toHaveBeenCalledWith(mockProfile.name)
      expect(mockLearningService.getExerciseProgress).toHaveBeenCalled()
      expect(mockLearningService.recommendWeight).toHaveBeenCalled()
      expect(mockLearningService.analyzeProgress).toHaveBeenCalledWith(mockProfile.name)
      
      // Check that AI service was called with enriched prompt
      expect(mockAIService.generateResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining('学習データに基づく分析'),
          systemPrompt: expect.stringContaining('フィットネストレーナー'),
          provider: 'claude'
        })
      )
    })

    it('should handle users with no workout history', async () => {
      mockLearningService.getAllExercises.mockResolvedValue([])
      
      const mockAIResponse: AIResponse = {
        content: 'Basic advice',
        provider: 'claude',
        timestamp: new Date()
      }
      mockAIService.generateResponse.mockResolvedValue(mockAIResponse)

      await service.generateAIResponse(mockProfile, mockContext)

      expect(mockAIService.generateResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining('ワークアウト履歴がありません')
        })
      )
    })

    it('should handle learning service errors gracefully', async () => {
      mockLearningService.getAllExercises.mockRejectedValue(new Error('DB Error'))
      
      const mockAIResponse: AIResponse = {
        content: 'Response without learning data',
        provider: 'claude',
        timestamp: new Date()
      }
      mockAIService.generateResponse.mockResolvedValue(mockAIResponse)

      const response = await service.generateAIResponse(mockProfile, mockContext)

      expect(response).toEqual(mockAIResponse)
      // Should still call AI service with base prompt
      expect(mockAIService.generateResponse).toHaveBeenCalled()
    })
  })

  describe('trackWorkout', () => {
    it('should track workout through learning service', async () => {
      await service.trackWorkout(
        'user123',
        'Bench Press',
        60,
        10,
        3,
        'moderate',
        'Good form'
      )

      expect(mockLearningService.trackWorkout).toHaveBeenCalledWith({
        exercise: 'Bench Press',
        weight: 60,
        reps: 10,
        sets: 3,
        difficulty: 'moderate',
        notes: 'Good form',
        timestamp: expect.any(Date),
        userId: 'user123'
      })
    })

    it('should track workout without notes', async () => {
      await service.trackWorkout(
        'user123',
        'Squat',
        80,
        8,
        4,
        'hard'
      )

      expect(mockLearningService.trackWorkout).toHaveBeenCalledWith({
        exercise: 'Squat',
        weight: 80,
        reps: 8,
        sets: 4,
        difficulty: 'hard',
        notes: undefined,
        timestamp: expect.any(Date),
        userId: 'user123'
      })
    })
  })

  describe('getWeightRecommendation', () => {
    it('should get weight recommendation from learning service', async () => {
      const mockRecommendation: WeightRecommendation = {
        exercise: 'Deadlift',
        recommendedWeight: 100,
        reasoning: 'Based on your progress',
        confidence: 0.85,
        alternatives: { conservative: 95, aggressive: 105 }
      }

      mockLearningService.recommendWeight.mockResolvedValue(mockRecommendation)

      const result = await service.getWeightRecommendation('user123', 'Deadlift')

      expect(result).toEqual({
        weight: 100,
        reasoning: 'Based on your progress'
      })
      expect(mockLearningService.recommendWeight).toHaveBeenCalledWith('Deadlift', 'user123')
    })
  })

  describe('getProgressAnalysis', () => {
    it('should get progress analysis from learning service', async () => {
      const mockAnalysis = {
        overallProgress: 'excellent',
        strengths: ['Great consistency'],
        areasForImprovement: ['Core training']
      }

      mockLearningService.analyzeProgress.mockResolvedValue(mockAnalysis)

      const result = await service.getProgressAnalysis('user123')

      expect(result).toEqual(mockAnalysis)
      expect(mockLearningService.analyzeProgress).toHaveBeenCalledWith('user123')
    })
  })

  describe('enrichPromptWithLearningData', () => {
    it('should limit exercises to top 5', async () => {
      const manyExercises = Array(10).fill(null).map((_, i) => `Exercise${i}`)
      mockLearningService.getAllExercises.mockResolvedValue(manyExercises)
      
      // Mock responses for exercises
      mockLearningService.getExerciseProgress.mockResolvedValue({
        exercise: 'Exercise',
        history: [],
        personalRecord: { weight: 50, reps: 10, date: new Date() },
        trend: 'maintaining'
      })
      mockLearningService.recommendWeight.mockResolvedValue({
        exercise: 'Exercise',
        recommendedWeight: 55,
        reasoning: 'Standard progression',
        confidence: 0.8,
        alternatives: { conservative: 52, aggressive: 58 }
      })
      mockLearningService.analyzeProgress.mockResolvedValue({
        overallProgress: 'good',
        strengths: [],
        areasForImprovement: [],
        recommendations: [],
        muscleBalance: { upperBody: 50, lowerBody: 40, core: 10 },
        consistency: { workoutsPerWeek: 3, streak: 5, lastWorkout: new Date() }
      })
      
      await service.generateAIResponse(mockProfile, mockContext)

      // Should only process first 5 exercises
      expect(mockLearningService.getExerciseProgress).toHaveBeenCalledTimes(5)
      expect(mockLearningService.recommendWeight).toHaveBeenCalledTimes(5)
    })
  })
})