import { describe, it, expect } from 'vitest'
import { PromptGenerator } from './promptGenerator'
import type { UserProfile } from '../models/user'
import type { Context } from '../models/context'

describe('PromptGenerator', () => {
  const mockUserProfile: UserProfile = {
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

  const mockContext: Context = {
    cycleNumber: 1,
    sessionNumber: 3,
    lastActivity: new Date('2025-05-29'),
    performance: [
      {
        exerciseName: 'ベンチプレス',
        date: new Date('2025-05-27'),
        sets: [
          { weight: 60, reps: 10 },
          { weight: 60, reps: 8 },
          { weight: 60, reps: 6 },
        ],
        muscleGroups: ['胸', '三頭筋'],
      },
    ],
  }

  describe('generateTrainingPrompt', () => {
    it('should generate a training prompt with user information', () => {
      const generator = new PromptGenerator()
      const prompt = generator.generateTrainingPrompt(mockContext, mockUserProfile)

      expect(prompt).toContain('テストユーザー')
      expect(prompt).toContain('セッション3')
      expect(prompt).toContain('サイクル: 1/8')
      expect(prompt).toContain('モテたい、健康になりたい')
    })

    it('should include exercise details for the session', () => {
      const generator = new PromptGenerator()
      const prompt = generator.generateTrainingPrompt(mockContext, mockUserProfile)

      // セッション3は肩・前腕の日
      expect(prompt).toContain('肩')
      expect(prompt).toContain('ダンベルショルダープレス')
      expect(prompt).toContain('ラテラルレイズ')
    })

    it('should include previous performance data', () => {
      const generator = new PromptGenerator()
      const prompt = generator.generateTrainingPrompt(mockContext, mockUserProfile)

      expect(prompt).toContain('前回のトレーニング')
      expect(prompt).toContain('2025-05-27') // 最後のパフォーマンスの日付
    })

    it('should provide recording instructions', () => {
      const generator = new PromptGenerator()
      const prompt = generator.generateTrainingPrompt(mockContext, mockUserProfile)

      expect(prompt).toContain('記録してください')
      expect(prompt).toContain('エクササイズ名: 重量 x 回数 x セット数')
    })
  })

  describe('generateImportPrompt', () => {
    it('should generate an import prompt for training data', () => {
      const generator = new PromptGenerator()
      const rawData = `
        ベンチプレス 60kg 10回 3セット
        インクラインダンベルプレス 25kg 12回 3セット
      `
      const prompt = generator.generateImportPrompt('training', rawData)

      expect(prompt).toContain('以下の筋トレ記録をJSON形式に整理してください')
      expect(prompt).toContain(rawData)
      expect(prompt).toContain('"type": "training_session"')
      expect(prompt).toContain('"exercises"')
    })

    it('should generate an import prompt for body measurements', () => {
      const generator = new PromptGenerator()
      const prompt = generator.generateImportPrompt('measurement', 'スクリーンショット画像')

      expect(prompt).toContain('体組成計のスクリーンショット')
      expect(prompt).toContain('"type": "body_measurement"')
      expect(prompt).toContain('"weight"')
      expect(prompt).toContain('"bodyFatPercentage"')
    })
  })

  describe('template rendering', () => {
    it('should replace single variables correctly', () => {
      const generator = new PromptGenerator()
      const template = 'こんにちは、{{name}}さん。今日は{{day}}です。'
      const data = { name: '太郎', day: '月曜日' }
      
      const result = generator['render'](template, data)
      
      expect(result).toBe('こんにちは、太郎さん。今日は月曜日です。')
    })

    it('should handle array iterations', () => {
      const generator = new PromptGenerator()
      const template = `
エクササイズ一覧:
{{#exercises}}
- {{name}}: {{weight}}kg x {{reps}}回
{{/exercises}}
`
      const data = {
        exercises: [
          { name: 'ベンチプレス', weight: 60, reps: 10 },
          { name: 'スクワット', weight: 80, reps: 8 },
        ],
      }

      const result = generator['render'](template, data)

      expect(result).toContain('- ベンチプレス: 60kg x 10回')
      expect(result).toContain('- スクワット: 80kg x 8回')
    })

    it('should handle missing variables gracefully', () => {
      const generator = new PromptGenerator()
      const template = 'Hello {{name}}, your age is {{age}}'
      const data = { name: 'John' }

      const result = generator['render'](template, data)

      expect(result).toContain('Hello John')
      expect(result).toContain('{{age}}') // 未定義の変数はそのまま残る
    })
  })

  describe('getExercisesForSession', () => {
    it('should return correct exercises for each session', () => {
      const generator = new PromptGenerator()
      
      // セッション1: 胸・三頭筋
      const session1 = generator['getExercisesForSession'](1)
      expect(session1[0].name).toContain('ベンチプレス')
      
      // セッション2: 背中・二頭筋
      const session2 = generator['getExercisesForSession'](2)
      expect(session2[0].name).toContain('ロウ')
      
      // セッション3: 肩・前腕
      const session3 = generator['getExercisesForSession'](3)
      expect(session3[0].name).toContain('ショルダープレス')
    })

    it('should cycle back after 8 sessions', () => {
      const generator = new PromptGenerator()
      
      const session9 = generator['getExercisesForSession'](9)
      const session1 = generator['getExercisesForSession'](1)
      
      expect(session9).toEqual(session1)
    })
  })
})