import Dexie, { type Table } from 'dexie'
import type { UserProfile } from '../models/user'
import type { Context } from '../models/context'
import type { GeneratedPrompt, TrainingSession } from '../models/prompt'
import type { PromptCollection, SavedPrompt } from '../models/promptCollection'
import type { WorkoutMetrics } from '../interfaces/ILearningService'

interface AIUsageStats {
  id?: number
  provider: 'claude' | 'chatgpt' | 'gemini'
  requests: number
  tokens: number
  lastUsed: Date
}

interface WorkoutHistory extends WorkoutMetrics {
  id?: string
  createdAt: Date
}

export class FitLoopDatabase extends Dexie {
  profile!: Table<UserProfile>
  context!: Table<Context>
  prompts!: Table<GeneratedPrompt>
  sessions!: Table<TrainingSession>
  promptCollections!: Table<PromptCollection>
  savedPrompts!: Table<SavedPrompt>
  aiUsageStats!: Table<AIUsageStats>
  workoutHistory!: Table<WorkoutHistory>

  constructor() {
    super('FitLoopDB')
    this.version(3).stores({
      profile: '++id',
      context: '++id',
      prompts: '++id, type, createdAt',
      sessions: '++id, date',
      promptCollections: '++id, category, createdAt',
      savedPrompts: '++id, category, isMetaPrompt, createdAt, lastUsed',
      aiUsageStats: '++id, provider, lastUsed',
      workoutHistory: '++id, [userId+exercise], userId, exercise, timestamp, createdAt'
    })
  }
}

export const db = new FitLoopDatabase()

export class StorageManager {
  // プロファイル（1つのみ）
  async saveProfile(profile: UserProfile): Promise<void> {
    await db.profile.clear()
    await db.profile.add(profile)
  }

  async getProfile(): Promise<UserProfile | undefined> {
    return await db.profile.toCollection().first()
  }

  // コンテキスト（現在の状態）
  async updateContext(updates: Partial<Context>): Promise<void> {
    const current = await this.getContext()
    if (current) {
      await db.context.update(current.id!, {
        ...updates,
        lastActivity: new Date(),
      })
    } else {
      await db.context.add({
        cycleNumber: 1,
        sessionNumber: 1,
        lastActivity: new Date(),
        performance: [],
        ...updates,
      } as Context)
    }
  }

  async getContext(): Promise<Context | null> {
    const context = await db.context.toCollection().first()
    return context || null
  }

  // プロンプト管理
  async savePrompt(prompt: GeneratedPrompt): Promise<void> {
    await db.prompts.add(prompt)
  }

  async getPromptHistory(limit: number = 10): Promise<GeneratedPrompt[]> {
    return await db.prompts
      .orderBy('createdAt')
      .reverse()
      .limit(limit)
      .toArray()
  }

  async markPromptAsUsed(promptId: number): Promise<void> {
    await db.prompts.update(promptId, { used: true })
  }

  // セッション管理
  async saveSession(session: TrainingSession): Promise<void> {
    await db.sessions.add(session)
  }

  async getSessionHistory(limit: number = 10): Promise<TrainingSession[]> {
    return await db.sessions
      .orderBy('date')
      .reverse()
      .limit(limit)
      .toArray()
  }

  // エクスポート機能
  async exportAllData(): Promise<string> {
    const data = {
      profile: await db.profile.toArray(),
      context: await db.context.toArray(),
      prompts: await db.prompts.toArray(),
      sessions: await db.sessions.toArray(),
      exportDate: new Date().toISOString()
    }
    return JSON.stringify(data, null, 2)
  }

  // インポート機能
  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData)
    
    await db.transaction('rw', db.profile, db.context, db.prompts, db.sessions, async () => {
      // 既存データをクリア
      await Promise.all([
        db.profile.clear(),
        db.context.clear(),
        db.prompts.clear(),
        db.sessions.clear()
      ])
      
      // 新しいデータを追加
      if (data.profile && data.profile.length > 0) {
        await db.profile.bulkAdd(data.profile)
      }
      if (data.context && data.context.length > 0) {
        await db.context.bulkAdd(data.context)
      }
      if (data.prompts && data.prompts.length > 0) {
        await db.prompts.bulkAdd(data.prompts)
      }
      if (data.sessions && data.sessions.length > 0) {
        await db.sessions.bulkAdd(data.sessions)
      }
    })
  }

  // プロンプトコレクション管理
  async savePromptCollection(collection: PromptCollection): Promise<number> {
    return await db.promptCollections.add(collection)
  }

  async getPromptCollections(): Promise<PromptCollection[]> {
    return await db.promptCollections.orderBy('createdAt').toArray()
  }

  async updatePromptCollection(id: number, updates: Partial<PromptCollection>): Promise<void> {
    await db.promptCollections.update(id, { ...updates, updatedAt: new Date() })
  }

  async deletePromptCollection(id: number): Promise<void> {
    await db.promptCollections.delete(id)
  }

  // 保存されたプロンプト管理
  async savePromptToCollection(prompt: SavedPrompt): Promise<number> {
    return await db.savedPrompts.add(prompt)
  }

  async getSavedPrompts(category?: string): Promise<SavedPrompt[]> {
    let query = db.savedPrompts.orderBy('lastUsed').reverse()
    if (category) {
      query = query.filter(p => p.category === category)
    }
    return await query.toArray()
  }

  async getMetaPrompts(): Promise<SavedPrompt[]> {
    return await db.savedPrompts
      .where('isMetaPrompt')
      .equals(1)
      .toArray()
  }

  async updatePromptUsage(id: number): Promise<void> {
    const prompt = await db.savedPrompts.get(id)
    if (prompt) {
      await db.savedPrompts.update(id, {
        usageCount: prompt.usageCount + 1,
        lastUsed: new Date(),
        updatedAt: new Date()
      })
    }
  }

  async deletePrompt(id: number): Promise<void> {
    await db.savedPrompts.delete(id)
  }
  
  async updatePromptContent(id: number, content: string): Promise<void> {
    await db.savedPrompts.update(id, {
      content,
      updatedAt: new Date()
    })
  }

  // 前回のプロンプトを保存
  async saveCurrentPromptAsLast(content: string, title?: string): Promise<void> {
    const prompt: SavedPrompt = {
      title: title || `前回のプロンプト - ${new Date().toLocaleDateString('ja-JP')}`,
      content,
      description: '自動保存された前回のプロンプト',
      isMetaPrompt: false,
      category: 'custom',
      tags: ['前回', '自動保存'],
      usageCount: 1,
      lastUsed: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // 既存の"前回のプロンプト"を削除
    const existingPrompts = await db.savedPrompts
      .where('title')
      .startsWith('前回のプロンプト')
      .toArray()
    
    if (existingPrompts.length > 0) {
      await db.savedPrompts.bulkDelete(existingPrompts.map(p => p.id!))
    }
    
    await db.savedPrompts.add(prompt)
  }

  // 初期データの設定
  async initializeDefaultPrompts(): Promise<void> {
    const existingCollections = await this.getPromptCollections()
    if (existingCollections.length === 0) {
      // デフォルトのコレクションとプロンプトを作成
      const { DEFAULT_PROMPT_COLLECTIONS, DEFAULT_META_PROMPTS } = await import('../models/promptCollection')
      
      // コレクションを作成
      for (const collection of DEFAULT_PROMPT_COLLECTIONS) {
        await this.savePromptCollection({
          ...collection,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
      
      // デフォルトのメタプロンプトを保存
      for (const prompt of DEFAULT_META_PROMPTS) {
        await this.savePromptToCollection({
          ...prompt,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
    }
  }

  // データクリア
  async clearAllData(): Promise<void> {
    await db.transaction('rw', [db.profile, db.context, db.prompts, db.sessions, db.promptCollections, db.savedPrompts], async () => {
      await Promise.all([
        db.profile.clear(),
        db.context.clear(),
        db.prompts.clear(),
        db.sessions.clear(),
        db.promptCollections.clear(),
        db.savedPrompts.clear()
      ])
    })
  }
}