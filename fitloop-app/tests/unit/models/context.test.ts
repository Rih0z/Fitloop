import { describe, it, expect } from 'vitest'
import { 
  createInitialContext, 
  updateContext, 
  addPerformanceData,
  shouldStartNewCycle,
  getNextSession
} from '../../../src/models/context'
import type { Context, ExercisePerformance, Measurements } from '../../../src/models/context'

describe('Context', () => {
  describe('createInitialContext', () => {
    it('should create a new context with default values', () => {
      const context = createInitialContext()

      expect(context.cycleNumber).toBe(1)
      expect(context.sessionNumber).toBe(1)
      expect(context.lastActivity).toBeInstanceOf(Date)
      expect(context.measurements).toBeUndefined()
      expect(context.performance).toEqual([])
    })
  })

  describe('updateContext', () => {
    it('should update cycle and session numbers', async () => {
      const context = createInitialContext()
      
      // 少し待機して時間差を作る
      await new Promise(resolve => setTimeout(resolve, 10))
      
      const updated = updateContext(context, {
        cycleNumber: 2,
        sessionNumber: 3,
      })

      expect(updated.cycleNumber).toBe(2)
      expect(updated.sessionNumber).toBe(3)
      expect(updated.lastActivity.getTime()).toBeGreaterThan(context.lastActivity.getTime())
    })

    it('should update measurements', () => {
      const context = createInitialContext()
      const measurements = {
        weight: 70,
        bodyFatPercentage: 15,
        muscleMass: 55,
      }

      const updated = updateContext(context, { measurements })

      expect(updated.measurements).toEqual(measurements)
    })

    it('should add performance data', () => {
      const context = createInitialContext()
      const performance = {
        exerciseName: 'ベンチプレス',
        date: new Date(),
        sets: [
          { weight: 60, reps: 10, rpe: 7 },
          { weight: 60, reps: 8, rpe: 8 },
          { weight: 60, reps: 6, rpe: 9 },
        ],
        muscleGroups: ['胸', '三頭筋'],
      }

      const updated = updateContext(context, {
        performance: [performance],
      })

      expect(updated.performance).toHaveLength(1)
      expect(updated.performance[0]).toEqual(performance)
    })

    it('should maintain existing data when partially updating', () => {
      const context: Context = {
        cycleNumber: 1,
        sessionNumber: 5,
        lastActivity: new Date('2025-05-01'),
        measurements: {
          weight: 70,
          bodyFatPercentage: 15,
        },
        performance: [],
      }

      const updated = updateContext(context, {
        sessionNumber: 6,
      })

      expect(updated.cycleNumber).toBe(1) // unchanged
      expect(updated.sessionNumber).toBe(6) // updated
      expect(updated.measurements).toEqual(context.measurements) // unchanged
    })

    it('should handle multiple updates at once', () => {
      const context = createInitialContext()
      const measurements: Measurements = {
        weight: 75,
        bodyFatPercentage: 18,
        muscleMass: 60,
      }
      const performance: ExercisePerformance = {
        exerciseName: 'スクワット',
        date: new Date(),
        sets: [
          { weight: 80, reps: 10, rpe: 7 },
        ],
        muscleGroups: ['脚'],
      }

      const updated = updateContext(context, {
        cycleNumber: 2,
        sessionNumber: 4,
        measurements,
        performance: [performance],
      })

      expect(updated.cycleNumber).toBe(2)
      expect(updated.sessionNumber).toBe(4)
      expect(updated.measurements).toEqual(measurements)
      expect(updated.performance).toHaveLength(1)
    })

    it('should update lastActivity to current time', () => {
      const context = createInitialContext()
      const beforeUpdate = new Date()
      
      const updated = updateContext(context, {
        sessionNumber: 2,
      })
      
      const afterUpdate = new Date()
      
      expect(updated.lastActivity.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime())
      expect(updated.lastActivity.getTime()).toBeLessThanOrEqual(afterUpdate.getTime())
    })
  })

  describe('addPerformanceData', () => {
    it('should add new performance to empty array', async () => {
      const context = createInitialContext()
      const performance: ExercisePerformance = {
        exerciseName: 'デッドリフト',
        date: new Date(),
        sets: [
          { weight: 100, reps: 5, rpe: 8 },
          { weight: 100, reps: 5, rpe: 9 },
        ],
        muscleGroups: ['背中', 'ハムストリングス'],
        notes: 'フォームを意識して実施',
      }

      // 少し待機して時間差を作る
      await new Promise(resolve => setTimeout(resolve, 10))

      const updated = addPerformanceData(context, performance)

      expect(updated.performance).toHaveLength(1)
      expect(updated.performance[0]).toEqual(performance)
      expect(updated.lastActivity.getTime()).toBeGreaterThan(context.lastActivity.getTime())
    })

    it('should append performance to existing array', () => {
      const existingPerformance: ExercisePerformance = {
        exerciseName: 'ベンチプレス',
        date: new Date('2025-01-01'),
        sets: [{ weight: 60, reps: 10 }],
        muscleGroups: ['胸'],
      }
      
      const context: Context = {
        cycleNumber: 1,
        sessionNumber: 2,
        lastActivity: new Date('2025-01-01'),
        performance: [existingPerformance],
      }

      const newPerformance: ExercisePerformance = {
        exerciseName: 'スクワット',
        date: new Date(),
        sets: [{ weight: 80, reps: 10 }],
        muscleGroups: ['脚'],
      }

      const updated = addPerformanceData(context, newPerformance)

      expect(updated.performance).toHaveLength(2)
      expect(updated.performance[0]).toEqual(existingPerformance)
      expect(updated.performance[1]).toEqual(newPerformance)
    })

    it('should handle performance without optional fields', () => {
      const context = createInitialContext()
      const performance: ExercisePerformance = {
        exerciseName: 'プランク',
        date: new Date(),
        sets: [
          { weight: 0, reps: 60 }, // 60秒
        ],
        muscleGroups: ['コア'],
        // notesとrpeは省略
      }

      const updated = addPerformanceData(context, performance)

      expect(updated.performance[0].notes).toBeUndefined()
      expect(updated.performance[0].sets[0].rpe).toBeUndefined()
    })
  })

  describe('shouldStartNewCycle', () => {
    it('should return false for sessions 1-7', () => {
      for (let session = 1; session <= 7; session++) {
        const context: Context = {
          cycleNumber: 1,
          sessionNumber: session,
          lastActivity: new Date(),
          performance: [],
        }
        expect(shouldStartNewCycle(context)).toBe(false)
      }
    })

    it('should return true for session 8', () => {
      const context: Context = {
        cycleNumber: 1,
        sessionNumber: 8,
        lastActivity: new Date(),
        performance: [],
      }
      expect(shouldStartNewCycle(context)).toBe(true)
    })

    it('should return true for sessions greater than 8', () => {
      const context: Context = {
        cycleNumber: 1,
        sessionNumber: 9,
        lastActivity: new Date(),
        performance: [],
      }
      expect(shouldStartNewCycle(context)).toBe(true)
    })
  })

  describe('getNextSession', () => {
    it('should increment session number within same cycle', () => {
      const context: Context = {
        cycleNumber: 1,
        sessionNumber: 3,
        lastActivity: new Date(),
        performance: [],
      }

      const next = getNextSession(context)
      expect(next.cycleNumber).toBe(1)
      expect(next.sessionNumber).toBe(4)
    })

    it('should start new cycle after session 8', () => {
      const context: Context = {
        cycleNumber: 1,
        sessionNumber: 8,
        lastActivity: new Date(),
        performance: [],
      }

      const next = getNextSession(context)
      expect(next.cycleNumber).toBe(2)
      expect(next.sessionNumber).toBe(1)
    })

    it('should handle multiple cycles correctly', () => {
      const context: Context = {
        cycleNumber: 3,
        sessionNumber: 8,
        lastActivity: new Date(),
        performance: [],
      }

      const next = getNextSession(context)
      expect(next.cycleNumber).toBe(4)
      expect(next.sessionNumber).toBe(1)
    })

    it('should handle edge case of session number greater than 8', () => {
      const context: Context = {
        cycleNumber: 2,
        sessionNumber: 10, // エッジケース
        lastActivity: new Date(),
        performance: [],
      }

      const next = getNextSession(context)
      expect(next.cycleNumber).toBe(3)
      expect(next.sessionNumber).toBe(1)
    })

    it('should work correctly for all sessions in a cycle', () => {
      let context: Context = {
        cycleNumber: 1,
        sessionNumber: 1,
        lastActivity: new Date(),
        performance: [],
      }

      // Test progression through entire cycle
      for (let i = 1; i <= 8; i++) {
        context.sessionNumber = i
        const next = getNextSession(context)
        
        if (i < 8) {
          expect(next.cycleNumber).toBe(1)
          expect(next.sessionNumber).toBe(i + 1)
        } else {
          expect(next.cycleNumber).toBe(2)
          expect(next.sessionNumber).toBe(1)
        }
      }
    })
  })

  describe('ExercisePerformance', () => {
    it('should create valid performance data with all fields', () => {
      const performance: ExercisePerformance = {
        exerciseName: 'ラットプルダウン',
        date: new Date('2025-01-01'),
        sets: [
          { weight: 50, reps: 12, rpe: 6 },
          { weight: 55, reps: 10, rpe: 7 },
          { weight: 60, reps: 8, rpe: 8 },
        ],
        muscleGroups: ['背中', '二頭筋'],
        notes: 'フォーム良好、次回は重量アップ',
      }

      expect(performance.exerciseName).toBe('ラットプルダウン')
      expect(performance.sets).toHaveLength(3)
      expect(performance.muscleGroups).toContain('背中')
      expect(performance.notes).toBeDefined()
    })

    it('should handle sets with varying RPE values', () => {
      const sets = [
        { weight: 100, reps: 5, rpe: 10 }, // 最大努力
        { weight: 90, reps: 8, rpe: 5 },   // 軽い
        { weight: 95, reps: 6 },           // RPEなし
      ]

      expect(sets[0].rpe).toBe(10)
      expect(sets[1].rpe).toBe(5)
      expect(sets[2].rpe).toBeUndefined()
    })
  })

  describe('Measurements', () => {
    it('should create valid measurements with all fields', () => {
      const measurements: Measurements = {
        weight: 75.5,
        bodyFatPercentage: 15.2,
        muscleMass: 63.8,
      }

      expect(measurements.weight).toBe(75.5)
      expect(measurements.bodyFatPercentage).toBe(15.2)
      expect(measurements.muscleMass).toBe(63.8)
    })

    it('should allow partial measurements', () => {
      const measurements: Measurements = {
        weight: 70,
        // Other fields are optional
      }

      expect(measurements.weight).toBe(70)
      expect(measurements.bodyFatPercentage).toBeUndefined()
      expect(measurements.muscleMass).toBeUndefined()
    })

    it('should support custom measurement fields', () => {
      const measurements: Measurements = {
        weight: 80,
        armCircumference: 35,
        chestCircumference: 100,
      }

      expect(measurements.weight).toBe(80)
      expect(measurements['armCircumference']).toBe(35)
      expect(measurements['chestCircumference']).toBe(100)
    })
  })
})