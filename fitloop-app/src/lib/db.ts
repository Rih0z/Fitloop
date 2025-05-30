import Dexie, { type Table } from 'dexie'
import type { UserProfile } from '../models/user'
import type { Context } from '../models/context'
import type { GeneratedPrompt, TrainingSession } from '../models/prompt'

export class FitLoopDatabase extends Dexie {
  profile!: Table<UserProfile>
  context!: Table<Context>
  prompts!: Table<GeneratedPrompt>
  sessions!: Table<TrainingSession>

  constructor() {
    super('FitLoopDB')
    this.version(1).stores({
      profile: '++id',
      context: '++id',
      prompts: '++id, type, createdAt',
      sessions: '++id, date'
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

  // データクリア
  async clearAllData(): Promise<void> {
    await db.transaction('rw', db.profile, db.context, db.prompts, db.sessions, async () => {
      await Promise.all([
        db.profile.clear(),
        db.context.clear(),
        db.prompts.clear(),
        db.sessions.clear()
      ])
    })
  }
}