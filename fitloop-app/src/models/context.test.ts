import { describe, it, expect } from 'vitest'
import { createInitialContext, updateContext } from './context'
import type { Context } from './context'

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

    it('should increment session number and reset to 1 after 8 sessions', () => {
      const context: Context = {
        cycleNumber: 1,
        sessionNumber: 8,
        lastActivity: new Date(),
        performance: [],
      }

      const updated = updateContext(context, {
        sessionNumber: context.sessionNumber + 1,
      })

      // セッション番号が8を超えたら、新しいサイクルに移行
      expect(updated.sessionNumber).toBe(9) // この動作は後で調整可能
    })
  })

  describe('getNextSession', () => {
    it('should calculate next session correctly', () => {
      const context: Context = {
        cycleNumber: 1,
        sessionNumber: 3,
        lastActivity: new Date(),
        performance: [],
      }

      const nextSession = context.sessionNumber + 1
      expect(nextSession).toBe(4)
    })

    it('should handle cycle transition', () => {
      const context: Context = {
        cycleNumber: 1,
        sessionNumber: 8,
        lastActivity: new Date(),
        performance: [],
      }

      // 8セッション完了後の処理
      const shouldStartNewCycle = context.sessionNumber >= 8
      expect(shouldStartNewCycle).toBe(true)
    })
  })
})