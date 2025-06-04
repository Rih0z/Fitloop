import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import 'fake-indexeddb/auto'
import { LearningService } from '../../../src/services/LearningService'
import { db } from '../../../src/lib/db'
import type { WorkoutMetrics, ExerciseProgress, WeightRecommendation, ProgressInsights } from '../../../src/interfaces/ILearningService'

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-' + Math.random())
  },
  writable: true,
  configurable: true
})

describe('LearningService', () => {
  let service: LearningService
  const testUserId = 'test-user-id'

  beforeEach(async () => {
    // Clear database
    await db.open()
    await db.workoutHistory.clear()
    
    // Get service instance
    service = LearningService.getInstance()
  })

  afterEach(async () => {
    await db.close()
  })

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const instance1 = LearningService.getInstance()
      const instance2 = LearningService.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('trackWorkout', () => {
    it('should track workout successfully', async () => {
      const metrics: WorkoutMetrics = {
        exercise: 'Bench Press',
        weight: 60,
        reps: 10,
        sets: 3,
        difficulty: 'moderate',
        timestamp: new Date(),
        userId: testUserId
      }

      await service.trackWorkout(metrics)

      const workouts = await db.workoutHistory.toArray()
      expect(workouts).toHaveLength(1)
      expect(workouts[0].exercise).toBe('Bench Press')
      expect(workouts[0].weight).toBe(60)
    })

    it('should handle database errors', async () => {
      vi.spyOn(db.workoutHistory, 'add').mockRejectedValueOnce(new Error('DB Error'))

      const metrics: WorkoutMetrics = {
        exercise: 'Squat',
        weight: 80,
        reps: 8,
        sets: 3,
        difficulty: 'hard',
        timestamp: new Date(),
        userId: testUserId
      }

      await expect(service.trackWorkout(metrics)).rejects.toThrow('DB Error')
    })
  })

  describe('getExerciseProgress', () => {
    it('should return empty progress for new exercise', async () => {
      const progress = await service.getExerciseProgress('Deadlift', testUserId)

      expect(progress.exercise).toBe('Deadlift')
      expect(progress.history).toHaveLength(0)
      expect(progress.personalRecord.weight).toBe(0)
      expect(progress.personalRecord.reps).toBe(0)
      expect(progress.trend).toBe('maintaining')
    })

    it('should calculate progress from history', async () => {
      // Add workout history
      const workouts: WorkoutMetrics[] = [
        {
          exercise: 'Bench Press',
          weight: 50,
          reps: 10,
          sets: 3,
          difficulty: 'moderate',
          timestamp: new Date('2025-06-01'),
          userId: testUserId
        },
        {
          exercise: 'Bench Press',
          weight: 55,
          reps: 8,
          sets: 3,
          difficulty: 'moderate',
          timestamp: new Date('2025-06-05'),
          userId: testUserId
        },
        {
          exercise: 'Bench Press',
          weight: 60,
          reps: 10,
          sets: 3,
          difficulty: 'moderate',
          timestamp: new Date('2025-06-10'),
          userId: testUserId
        }
      ]

      for (const workout of workouts) {
        await db.workoutHistory.add({ ...workout, id: crypto.randomUUID(), createdAt: new Date() })
      }

      const progress = await service.getExerciseProgress('Bench Press', testUserId)

      expect(progress.history).toHaveLength(3)
      expect(progress.personalRecord.weight).toBe(60)
      expect(progress.personalRecord.reps).toBe(10)
      expect(progress.lastWorkout?.weight).toBe(60)
    })

    it('should analyze improving trend', async () => {
      // Add improving workout history
      const timestamps = [
        new Date('2025-06-01'),
        new Date('2025-06-03'),
        new Date('2025-06-05'),
        new Date('2025-06-07'),
        new Date('2025-06-09'),
        new Date('2025-06-11')
      ]

      for (let i = 0; i < 6; i++) {
        await db.workoutHistory.add({
          id: crypto.randomUUID(),
          exercise: 'Squat',
          weight: 50 + (i * 5), // Increasing weight
          reps: 10,
          sets: 3,
          difficulty: 'moderate',
          timestamp: timestamps[i],
          userId: testUserId,
          createdAt: new Date()
        })
      }

      const progress = await service.getExerciseProgress('Squat', testUserId)
      expect(progress.trend).toBe('improving')
    })

    it('should analyze declining trend', async () => {
      // Add declining workout history
      const timestamps = [
        new Date('2025-06-01'),
        new Date('2025-06-03'),
        new Date('2025-06-05'),
        new Date('2025-06-07'),
        new Date('2025-06-09'),
        new Date('2025-06-11')
      ]

      for (let i = 0; i < 6; i++) {
        await db.workoutHistory.add({
          id: crypto.randomUUID(),
          exercise: 'Deadlift',
          weight: 100 - (i * 5), // Decreasing weight
          reps: 8,
          sets: 3,
          difficulty: 'moderate',
          timestamp: timestamps[i],
          userId: testUserId,
          createdAt: new Date()
        })
      }

      const progress = await service.getExerciseProgress('Deadlift', testUserId)
      expect(progress.trend).toBe('declining')
    })

    it('should handle database errors gracefully', async () => {
      vi.spyOn(db.workoutHistory, 'where').mockImplementationOnce(() => {
        throw new Error('DB Error')
      })

      const progress = await service.getExerciseProgress('Bench Press', testUserId)
      
      expect(progress.exercise).toBe('Bench Press')
      expect(progress.history).toHaveLength(0)
      expect(progress.trend).toBe('maintaining')
    })
  })

  describe('recommendWeight', () => {
    it('should recommend default weight for new exercise', async () => {
      const recommendation = await service.recommendWeight('Pull Up', testUserId)

      expect(recommendation.exercise).toBe('Pull Up')
      expect(recommendation.recommendedWeight).toBe(20)
      expect(recommendation.reasoning).toContain('初めてのエクササイズです')
      expect(recommendation.confidence).toBe(0.5)
      expect(recommendation.alternatives.conservative).toBe(15)
      expect(recommendation.alternatives.aggressive).toBe(25)
    })

    it('should increase weight for easy workout', async () => {
      await db.workoutHistory.add({
        id: crypto.randomUUID(),
        exercise: 'Bench Press',
        weight: 50,
        reps: 10,
        sets: 3,
        difficulty: 'easy',
        timestamp: new Date(),
        userId: testUserId,
        createdAt: new Date()
      })

      const recommendation = await service.recommendWeight('Bench Press', testUserId)

      expect(recommendation.recommendedWeight).toBe(53) // 5% increase
      expect(recommendation.reasoning).toContain('5%増量')
      expect(recommendation.confidence).toBe(0.8)
    })

    it('should maintain weight for hard workout', async () => {
      await db.workoutHistory.add({
        id: crypto.randomUUID(),
        exercise: 'Squat',
        weight: 80,
        reps: 8,
        sets: 3,
        difficulty: 'hard',
        timestamp: new Date(),
        userId: testUserId,
        createdAt: new Date()
      })

      const recommendation = await service.recommendWeight('Squat', testUserId)

      expect(recommendation.recommendedWeight).toBe(80)
      expect(recommendation.reasoning).toContain('同じ重量で継続')
      expect(recommendation.confidence).toBe(0.9)
    })

    it('should consider improving trend', async () => {
      // Add improving history with moderate difficulty
      for (let i = 0; i < 6; i++) {
        await db.workoutHistory.add({
          id: crypto.randomUUID(),
          exercise: 'Deadlift',
          weight: 60 + (i * 2),
          reps: 10,
          sets: 3,
          difficulty: 'moderate',
          timestamp: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
          userId: testUserId,
          createdAt: new Date()
        })
      }

      const recommendation = await service.recommendWeight('Deadlift', testUserId)

      expect(recommendation.recommendedWeight).toBe(72) // 2.5% increase from 70
      expect(recommendation.reasoning).toContain('順調に向上している')
    })
  })

  describe('analyzeProgress', () => {
    it('should return default insights for no workouts', async () => {
      const insights = await service.analyzeProgress(testUserId)

      expect(insights.overallProgress).toBe('needs_attention')
      expect(insights.strengths).toHaveLength(0)
      expect(insights.areasForImprovement).toContain('トレーニング履歴がありません')
      expect(insights.recommendations).toContain('定期的なトレーニングを始めましょう')
      expect(insights.consistency.workoutsPerWeek).toBe(0)
    })

    it('should analyze progress with workouts', async () => {
      // Add varied workouts
      const exercises = [
        { name: 'Bench Press', category: 'upper' },
        { name: 'Squat', category: 'lower' },
        { name: 'Shoulder Press', category: 'upper' },
        { name: 'Deadlift', category: 'lower' },
        { name: 'Plank', category: 'core' }
      ]

      for (let i = 0; i < 10; i++) {
        const exercise = exercises[i % exercises.length]
        await db.workoutHistory.add({
          id: crypto.randomUUID(),
          exercise: exercise.name,
          weight: 50 + (i * 2),
          reps: 10,
          sets: 3,
          difficulty: 'moderate',
          timestamp: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000),
          userId: testUserId,
          createdAt: new Date()
        })
      }

      const insights = await service.analyzeProgress(testUserId)

      expect(insights.overallProgress).toBeTruthy()
      expect(insights.muscleBalance.upperBody).toBeGreaterThan(0)
      expect(insights.muscleBalance.lowerBody).toBeGreaterThan(0)
      expect(insights.consistency.workoutsPerWeek).toBeGreaterThan(0)
    })

    it('should analyze with time range', async () => {
      // Add workouts over different time periods
      const oldDate = new Date('2025-01-01')
      const recentDate = new Date('2025-06-01')

      await db.workoutHistory.add({
        id: crypto.randomUUID(),
        exercise: 'Old Exercise',
        weight: 50,
        reps: 10,
        sets: 3,
        difficulty: 'moderate',
        timestamp: oldDate,
        userId: testUserId,
        createdAt: new Date()
      })

      await db.workoutHistory.add({
        id: crypto.randomUUID(),
        exercise: 'Recent Exercise',
        weight: 60,
        reps: 10,
        sets: 3,
        difficulty: 'moderate',
        timestamp: recentDate,
        userId: testUserId,
        createdAt: new Date()
      })

      const timeRange = {
        start: new Date('2025-05-01'),
        end: new Date('2025-07-01')
      }

      const insights = await service.analyzeProgress(testUserId, timeRange)

      // Should only include recent workout
      expect(insights.consistency.lastWorkout.getTime()).toBe(recentDate.getTime())
    })

    it('should identify strengths and weaknesses', async () => {
      // Add frequent upper body workouts
      for (let i = 0; i < 15; i++) {
        await db.workoutHistory.add({
          id: crypto.randomUUID(),
          exercise: 'Bench Press',
          weight: 60,
          reps: 10,
          sets: 3,
          difficulty: 'moderate',
          timestamp: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000),
          userId: testUserId,
          createdAt: new Date()
        })
      }

      // Add only a few lower body workouts
      for (let i = 0; i < 3; i++) {
        await db.workoutHistory.add({
          id: crypto.randomUUID(),
          exercise: 'Squat',
          weight: 80,
          reps: 8,
          sets: 3,
          difficulty: 'moderate',
          timestamp: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
          userId: testUserId,
          createdAt: new Date()
        })
      }

      const insights = await service.analyzeProgress(testUserId)

      expect(insights.areasForImprovement).toContain('筋肉バランスの改善')
      expect(insights.recommendations.some(r => r.includes('下半身'))).toBe(true)
    })
  })

  describe('getAllExercises', () => {
    it('should return empty array for new user', async () => {
      const exercises = await service.getAllExercises(testUserId)
      expect(exercises).toEqual([])
    })

    it('should return unique sorted exercises', async () => {
      const exerciseNames = ['Squat', 'Bench Press', 'Deadlift', 'Bench Press', 'Squat']

      for (const exercise of exerciseNames) {
        await db.workoutHistory.add({
          id: crypto.randomUUID(),
          exercise,
          weight: 50,
          reps: 10,
          sets: 3,
          difficulty: 'moderate',
          timestamp: new Date(),
          userId: testUserId,
          createdAt: new Date()
        })
      }

      const exercises = await service.getAllExercises(testUserId)

      expect(exercises).toEqual(['Bench Press', 'Deadlift', 'Squat'])
    })

    it('should handle database errors', async () => {
      vi.spyOn(db.workoutHistory, 'where').mockImplementationOnce(() => {
        throw new Error('DB Error')
      })

      const exercises = await service.getAllExercises(testUserId)
      expect(exercises).toEqual([])
    })
  })

  describe('edge cases', () => {
    it('should handle undefined database table', async () => {
      // Temporarily remove workoutHistory
      const originalTable = db.workoutHistory
      ;(db as any).workoutHistory = undefined

      const progress = await service.getExerciseProgress('Test', testUserId)
      expect(progress.history).toHaveLength(0)

      const insights = await service.analyzeProgress(testUserId)
      expect(insights.overallProgress).toBe('needs_attention')

      const exercises = await service.getAllExercises(testUserId)
      expect(exercises).toEqual([])

      // Restore
      ;(db as any).workoutHistory = originalTable
    })

    it('should calculate streak correctly', async () => {
      // Add workouts with specific gaps
      const dates = [
        new Date('2025-06-10'),
        new Date('2025-06-09'), // 1 day gap - continues streak
        new Date('2025-06-07'), // 2 day gap - continues streak
        new Date('2025-06-04'), // 3 day gap - breaks streak
      ]

      for (const date of dates) {
        await db.workoutHistory.add({
          id: crypto.randomUUID(),
          exercise: 'Test Exercise',
          weight: 50,
          reps: 10,
          sets: 3,
          difficulty: 'moderate',
          timestamp: date,
          userId: testUserId,
          createdAt: new Date()
        })
      }

      const insights = await service.analyzeProgress(testUserId)
      expect(insights.consistency.streak).toBe(3) // First 3 workouts form a streak
    })
  })
})