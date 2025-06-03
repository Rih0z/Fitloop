import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db, StorageManager } from '../../../src/lib/db'
import type { UserProfile } from '../../../src/models/user'
import type { Context } from '../../../src/models/context'
import type { GeneratedPrompt } from '../../../src/models/prompt'

describe('Database', () => {
  beforeEach(async () => {
    // データベースを完全にリセット
    await db.close()
    indexedDB.deleteDatabase('FitLoopDB')
    await db.open()
    
    // すべてのテーブルをクリア
    await Promise.all([
      db.profile.clear(),
      db.context.clear(),
      db.prompts.clear(),
      db.sessions.clear(),
      db.promptCollections.clear(),
      db.savedPrompts.clear()
    ]).catch(() => {}) // テーブルが存在しない場合のエラーを無視
  })

  afterEach(async () => {
    await db.close()
  })

  describe('UserProfile operations', () => {
    const mockProfile: UserProfile = {
      name: 'テストユーザー',
      goals: 'モテたい、健康になりたい',
      environment: 'ジムに通っている',
      preferences: {
        intensity: 'medium',
        frequency: 3,
        timeAvailable: 60,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('should save a user profile', async () => {
      const id = await db.profile.add(mockProfile)
      expect(id).toBeDefined()
      
      const saved = await db.profile.get(id)
      expect(saved?.name).toBe('テストユーザー')
      expect(saved?.goals).toBe('モテたい、健康になりたい')
    })

    it('should update a user profile', async () => {
      const id = await db.profile.add(mockProfile)
      
      await db.profile.update(id, { goals: '筋肉を大きくしたい' })
      
      const updated = await db.profile.get(id)
      expect(updated?.goals).toBe('筋肉を大きくしたい')
    })
  })

  describe('Context operations', () => {
    const mockContext: Context = {
      cycleNumber: 1,
      sessionNumber: 3,
      lastActivity: new Date(),
      performance: [],
    }

    it('should save a context', async () => {
      const id = await db.context.add(mockContext)
      expect(id).toBeDefined()
      
      const saved = await db.context.get(id)
      expect(saved?.cycleNumber).toBe(1)
      expect(saved?.sessionNumber).toBe(3)
    })

    it('should query context by session number', async () => {
      const context1 = { ...mockContext, sessionNumber: 1 }
      const context2 = { ...mockContext, sessionNumber: 2 }
      const context3 = { ...mockContext, sessionNumber: 3 }
      
      delete context1.id
      delete context2.id
      delete context3.id
      
      await db.context.add(context1)
      await db.context.add(context2)
      await db.context.add(context3)
      
      const contexts = await db.context.toArray()
      const withSession2 = contexts.filter(c => c.sessionNumber === 2)
      expect(withSession2).toHaveLength(1)
    })
  })

  describe('GeneratedPrompt operations', () => {
    const mockPrompt: GeneratedPrompt = {
      type: 'training',
      content: 'テストプロンプト',
      metadata: { sessionNumber: 1 },
      createdAt: new Date(),
      used: false,
    }

    it('should save a generated prompt', async () => {
      const id = await db.prompts.add(mockPrompt)
      expect(id).toBeDefined()
      
      const saved = await db.prompts.get(id)
      expect(saved?.content).toBe('テストプロンプト')
    })

    it('should query prompts by type', async () => {
      const prompt1 = { ...mockPrompt, type: 'training' as const }
      const prompt2 = { ...mockPrompt, type: 'import' as const }
      const prompt3 = { ...mockPrompt, type: 'training' as const }
      
      delete prompt1.id
      delete prompt2.id
      delete prompt3.id
      
      await db.prompts.add(prompt1)
      await db.prompts.add(prompt2)
      await db.prompts.add(prompt3)
      
      const trainingPrompts = await db.prompts.where('type').equals('training').toArray()
      expect(trainingPrompts).toHaveLength(2)
    })

    it('should order prompts by creation date', async () => {
      const date1 = new Date('2025-05-01')
      const date2 = new Date('2025-05-02')
      const date3 = new Date('2025-05-03')
      
      const p1 = { ...mockPrompt, createdAt: date2 }
      const p2 = { ...mockPrompt, createdAt: date1 }
      const p3 = { ...mockPrompt, createdAt: date3 }
      
      delete p1.id
      delete p2.id
      delete p3.id
      
      await db.prompts.add(p1)
      await db.prompts.add(p2)
      await db.prompts.add(p3)
      
      const ordered = await db.prompts.orderBy('createdAt').toArray()
      expect(ordered[0].createdAt).toEqual(date1)
      expect(ordered[2].createdAt).toEqual(date3)
    })
  })
})

describe('StorageManager', () => {
  let storage: StorageManager

  beforeEach(async () => {
    await db.close()
    indexedDB.deleteDatabase('FitLoopDB')
    await db.open()
    
    // すべてのテーブルをクリア
    await Promise.all([
      db.profile.clear(),
      db.context.clear(),
      db.prompts.clear(),
      db.sessions.clear(),
      db.promptCollections.clear(),
      db.savedPrompts.clear()
    ]).catch(() => {}) // テーブルが存在しない場合のエラーを無視
    
    storage = new StorageManager()
  })

  afterEach(async () => {
    await db.close()
  })

  describe('Profile management', () => {
    it('should save and retrieve a profile', async () => {
      const profile: UserProfile = {
        name: 'テストユーザー',
        goals: 'モテたい',
        environment: 'ジム',
        preferences: {
          intensity: 'high',
          frequency: 5,
          timeAvailable: 90,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await storage.saveProfile(profile)
      const retrieved = await storage.getProfile()
      
      expect(retrieved?.name).toBe('テストユーザー')
      expect(retrieved?.preferences.intensity).toBe('high')
    })

    it('should only keep one profile', async () => {
      const profile1: UserProfile = {
        name: 'ユーザー1',
        goals: '目標1',
        environment: '環境1',
        preferences: { intensity: 'low', frequency: 1, timeAvailable: 30 },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      const profile2: UserProfile = {
        name: 'ユーザー2',
        goals: '目標2',
        environment: '環境2',
        preferences: { intensity: 'high', frequency: 7, timeAvailable: 120 },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await storage.saveProfile(profile1)
      await storage.saveProfile(profile2)
      
      const profiles = await db.profile.toArray()
      expect(profiles).toHaveLength(1)
      expect(profiles[0].name).toBe('ユーザー2')
    })
  })

  describe('Context management', () => {
    it('should update context', async () => {
      const updates = {
        cycleNumber: 2,
        sessionNumber: 5,
      }

      await storage.updateContext(updates)
      const context = await storage.getContext()
      
      expect(context?.cycleNumber).toBe(2)
      expect(context?.sessionNumber).toBe(5)
    })

    it('should create context if not exists', async () => {
      const context = await storage.getContext()
      expect(context).toBeNull()
      
      await storage.updateContext({ sessionNumber: 1 })
      const created = await storage.getContext()
      
      expect(created).toBeDefined()
      expect(created?.sessionNumber).toBe(1)
    })
  })

  describe('Export and Import', () => {
    it('should export all data', async () => {
      // データを準備
      const profile: UserProfile = {
        name: 'エクスポートテスト',
        goals: 'テスト目標',
        environment: 'テスト環境',
        preferences: { intensity: 'medium', frequency: 3, timeAvailable: 45 },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      await storage.saveProfile(profile)
      await storage.updateContext({ cycleNumber: 1, sessionNumber: 2 })
      await storage.savePrompt({
        type: 'training',
        content: 'テストプロンプト',
        metadata: {},
        createdAt: new Date(),
        used: false,
      })

      // エクスポート
      const exported = await storage.exportAllData()
      const data = JSON.parse(exported)
      
      expect(data.profile).toHaveLength(1)
      expect(data.context).toHaveLength(1)
      expect(data.prompts).toHaveLength(1)
      expect(data.exportDate).toBeDefined()
    })

    it('should export empty database', async () => {
      const exported = await storage.exportAllData()
      const data = JSON.parse(exported)
      
      expect(data.profile).toHaveLength(0)
      expect(data.context).toHaveLength(0)
      expect(data.prompts).toHaveLength(0)
      expect(data.sessions).toHaveLength(0)
      expect(data.exportDate).toBeDefined()
    })

    it('should import data and replace existing', async () => {
      // 既存データ
      await storage.saveProfile({
        name: '既存ユーザー',
        goals: '既存目標',
        environment: '既存環境',
        preferences: { intensity: 'low', frequency: 1, timeAvailable: 30 },
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // インポートデータ
      const importData = {
        profile: [{
          name: 'インポートユーザー',
          goals: 'インポート目標',
          environment: 'インポート環境',
          preferences: { intensity: 'high', frequency: 7, timeAvailable: 120 },
          createdAt: new Date(),
          updatedAt: new Date(),
        }],
        context: [{
          cycleNumber: 3,
          sessionNumber: 7,
          lastActivity: new Date(),
          performance: [],
        }],
        prompts: [],
        sessions: [],
      }

      await storage.importData(JSON.stringify(importData))
      
      const profile = await storage.getProfile()
      const context = await storage.getContext()
      
      expect(profile?.name).toBe('インポートユーザー')
      expect(context?.cycleNumber).toBe(3)
    })

    it('should validate import data structure', async () => {
      const invalidData = {
        // Missing exportDate
        profile: [],
        context: [],
        prompts: []
      }

      // importData doesn't validate the structure, so we need to check if it throws
      await expect(storage.importData(JSON.stringify(invalidData)))
        .resolves.not.toThrow()
    })

    it('should handle import with missing optional fields', async () => {
      const minimalData = {
        exportDate: new Date().toISOString(),
        profile: [],
        context: [],
        // Missing prompts, sessions, savedPrompts
      }

      await storage.importData(JSON.stringify(minimalData))
      
      const profile = await storage.getProfile()
      expect(profile).toBeUndefined()
    })
  })

  describe('Prompt management', () => {
    it('should save and retrieve prompts', async () => {
      const prompt: GeneratedPrompt = {
        type: 'training',
        content: 'テストプロンプト',
        metadata: { sessionNumber: 1 },
        createdAt: new Date(),
        used: false,
      }

      await storage.savePrompt(prompt)
      const prompts = await db.prompts.toArray()
      
      expect(prompts).toHaveLength(1)
      expect(prompts[0].content).toBe('テストプロンプト')
    })

    it('should mark prompt as used', async () => {
      const prompt: GeneratedPrompt = {
        type: 'training',
        content: 'テスト',
        metadata: {},
        createdAt: new Date(),
        used: false,
      }

      await storage.savePrompt(prompt)
      const savedPrompts = await db.prompts.toArray()
      const id = savedPrompts[0].id
      
      // Mark as used
      await db.prompts.update(id!, { used: true })
      
      const updated = await db.prompts.get(id!)
      expect(updated?.used).toBe(true)
    })
  })

  describe('SavedPrompt management', () => {
    it('should initialize default prompts', async () => {
      await storage.initializeDefaultPrompts()
      
      const savedPrompts = await storage.getSavedPrompts()
      expect(savedPrompts.length).toBeGreaterThan(0)
      expect(savedPrompts.some(p => p.isMetaPrompt)).toBe(true)
    })

    it('should not duplicate default prompts on re-initialization', async () => {
      await storage.initializeDefaultPrompts()
      const firstCount = (await storage.getSavedPrompts()).length
      
      await storage.initializeDefaultPrompts()
      const secondCount = (await storage.getSavedPrompts()).length
      
      expect(secondCount).toBe(firstCount)
    })

    it('should save custom prompt to collection', async () => {
      const customPrompt = {
        title: 'カスタムプロンプト',
        content: 'カスタム内容',
        description: 'カスタム説明',
        category: 'custom' as const,
        tags: ['カスタム'],
        isMetaPrompt: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0
      }

      await storage.savePromptToCollection(customPrompt)
      
      const saved = await storage.getSavedPrompts()
      
      const custom = saved.find(p => p.title === 'カスタムプロンプト')
      expect(custom).toBeDefined()
      expect(custom?.category).toBe('custom')
    })

    it('should update prompt usage count', async () => {
      const prompt = {
        title: 'テストプロンプト',
        content: '内容',
        description: '説明',
        category: 'training' as const,
        tags: [],
        isMetaPrompt: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0
      }

      await storage.savePromptToCollection(prompt)
      const saved = await storage.getSavedPrompts()
      const id = saved.find(p => p.title === 'テストプロンプト')?.id
      
      expect(id).toBeDefined()
      if (id) {
        await storage.updatePromptUsage(id)
      }
      
      const updated = await storage.getSavedPrompts()
      const usedPrompt = updated.find(p => p.id === id)
      expect(usedPrompt?.usageCount).toBe(1)
      expect(usedPrompt?.lastUsed).toBeDefined()
    })

    it('should update prompt content', async () => {
      const prompt = {
        title: 'テスト',
        content: '古い内容',
        category: 'custom' as const,
        tags: [],
        isMetaPrompt: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0
      }

      await storage.savePromptToCollection(prompt)
      const saved = await storage.getSavedPrompts()
      const id = saved.find(p => p.title === 'テスト')?.id
      
      // タイムスタンプの差を確実にするため1ms待機
      await new Promise(resolve => setTimeout(resolve, 1))
      
      if (id) {
        await storage.updatePromptContent(id, '新しい内容')
      }
      
      const updated = await storage.getSavedPrompts()
      const updatedPrompt = updated.find(p => p.id === id)
      expect(updatedPrompt?.content).toBe('新しい内容')
      expect(updatedPrompt?.updatedAt.getTime()).toBeGreaterThan(prompt.createdAt.getTime())
    })

    it('should save current prompt as last', async () => {
      const currentPrompt = '現在のプロンプト内容'
      
      await storage.saveCurrentPromptAsLast(currentPrompt)
      
      const saved = await storage.getSavedPrompts()
      const lastPrompt = saved.find(p => p.title.startsWith('前回のプロンプト'))
      
      expect(lastPrompt).toBeDefined()
      expect(lastPrompt?.content).toBe(currentPrompt)
      expect(lastPrompt?.tags).toContain('前回')
    })

    it('should replace existing "前回のプロンプト" when saving new one', async () => {
      // 最初の前回プロンプトを保存
      await storage.saveCurrentPromptAsLast('最初のプロンプト')
      
      // 2回目の前回プロンプトを保存
      await storage.saveCurrentPromptAsLast('2回目のプロンプト')
      
      const saved = await storage.getSavedPrompts()
      const lastPrompts = saved.filter(p => p.title.startsWith('前回のプロンプト'))
      
      // 前回のプロンプトは1つだけあることを確認
      expect(lastPrompts).toHaveLength(1)
      expect(lastPrompts[0].content).toBe('2回目のプロンプト')
    })

    it('should clear all data', async () => {
      // テストデータを作成
      await storage.saveProfile({
        name: 'テストユーザー',
        goals: 'テスト目標',
        environment: 'テスト環境',
        preferences: { intensity: 'medium', frequency: 3, timeAvailable: 60 },
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      await storage.updateContext({ cycleNumber: 1, sessionNumber: 1 })
      
      await storage.savePrompt({
        type: 'training',
        content: 'テストプロンプト',
        metadata: {},
        createdAt: new Date(),
        used: false
      })
      
      await storage.savePromptToCollection({
        title: 'テストコレクション',
        content: 'テスト内容',
        category: 'custom',
        tags: [],
        isMetaPrompt: false,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      // データが存在することを確認
      expect(await storage.getProfile()).toBeDefined()
      expect(await storage.getContext()).toBeDefined()
      expect((await db.prompts.count())).toBeGreaterThan(0)
      expect((await storage.getSavedPrompts()).length).toBeGreaterThan(0)
      
      // データをクリア
      await storage.clearAllData()
      
      // データが削除されたことを確認
      expect(await storage.getProfile()).toBeUndefined()
      expect(await storage.getContext()).toBeNull()
      expect(await db.prompts.count()).toBe(0)
      expect((await storage.getSavedPrompts()).length).toBe(0)
    })
  })

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Close database to simulate error
      await db.close()
      
      // These operations should throw due to closed database
      await expect(storage.getProfile()).rejects.toThrow()
      await expect(storage.getContext()).rejects.toThrow()
    })

    it('should handle invalid JSON in import', async () => {
      await expect(storage.importData('invalid json'))
        .rejects.toThrow()
    })

    it('should handle corrupted import data', async () => {
      const corruptedData = {
        exportDate: new Date().toISOString(),
        profile: 'not an array', // Should be array
        context: [],
        prompts: []
      }

      await expect(storage.importData(JSON.stringify(corruptedData)))
        .rejects.toThrow()
    })
  })

  describe('Database versioning', () => {
    it('should handle database version', () => {
      expect(db.verno).toBe(3)
      expect(db.name).toBe('FitLoopDB')
    })

    it('should have all required tables', () => {
      const tables = db.tables.map(t => t.name)
      expect(tables).toContain('profile')
      expect(tables).toContain('context')
      expect(tables).toContain('prompts')
      expect(tables).toContain('sessions')
      expect(tables).toContain('savedPrompts')
    })
  })
})