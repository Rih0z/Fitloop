import type { IPromptService } from '../interfaces/IPromptService'
import type { UserProfile } from '../models/user'
import type { Context } from '../models/context'
import type { AIRequest, AIResponse } from '../interfaces/IAIService'
import type { WorkoutMetrics } from '../interfaces/ILearningService'
import { 
  META_PROMPT_TEMPLATE, 
  META_PROMPT_EXERCISES, 
  SESSION_TITLES, 
  extractMetadata 
} from '../lib/metaPromptTemplate'
import { AIService } from './AIService'
import { LearningService } from './LearningService'

export class PromptService implements IPromptService {
  private aiService: AIService
  private learningService: LearningService
  
  constructor() {
    this.aiService = AIService.getInstance()
    this.learningService = LearningService.getInstance()
  }
  generateFullPrompt(profile: UserProfile, context: Context, language: string): string {
    const sessionNumber = context.sessionNumber
    const sessionTitle = SESSION_TITLES[sessionNumber as keyof typeof SESSION_TITLES] || SESSION_TITLES[1]
    const exercises = META_PROMPT_EXERCISES[sessionNumber as keyof typeof META_PROMPT_EXERCISES] || META_PROMPT_EXERCISES[1]
    const lastSession = context.sessionNumber > 1 ? context.sessionNumber - 1 : 8
    const lastSessionTitle = SESSION_TITLES[lastSession as keyof typeof SESSION_TITLES]
    const lastDate = new Date().toLocaleDateString('ja-JP')
    
    // Format exercises for the template
    const exercisesText = exercises.map((ex: any, i: number) => 
      `${i + 1}. **${ex.name}**\n   - ${ex.sets}セット x ${ex.targetReps}\n   - 推奨重量: ${ex.weight}${ex.unit}\n   - セット間${ex.rest}秒休憩`
    ).join('\n\n')
    
    // Prepare JSON data for metadata
    const exercisesJSON = JSON.stringify(exercises.map((ex: any) => ({
      name: ex.name,
      targetWeight: ex.weight,
      targetReps: ex.targetReps,
      targetSets: ex.sets,
      lastPerformance: null
    })), null, 2)
    
    const muscleBalanceJSON = JSON.stringify({
      pushUpperBody: "normal",
      pullUpperBody: "normal",
      lowerBodyFront: "normal",
      lowerBodyBack: "normal",
      core: "normal"
    }, null, 2)
    
    const recommendationsJSON = JSON.stringify([
      "基礎筋力の構築に焦点を当てる",
      "正しいフォームの習得を優先"
    ], null, 2)
    
    // Include user info at the beginning
    const userInfoSection = `## ユーザー情報
- 名前: ${profile.name}
- 目標: ${profile.goals}
- 環境: ${profile.environment}

`
    
    // Get language instruction
    const languageInstruction = this.getLanguageInstruction(language)
    
    // Replace placeholders in template
    let prompt = META_PROMPT_TEMPLATE
      .replace(/{{languageInstruction}}/g, languageInstruction)
      .replace(/{{lastSession}}/g, `セッション${lastSession}（${lastSessionTitle}） - ${lastDate}実施`)
      .replace(/{{nextSession}}/g, `セッション${sessionNumber}（${sessionTitle}）`)
      .replace(/{{currentSession}}/g, `セッション${sessionNumber}: ${sessionTitle}`)
      .replace(/{{exercises}}/g, exercisesText)
      .replace(/{{sessionNumber}}/g, sessionNumber.toString())
      .replace(/{{sessionName}}/g, sessionTitle)
      .replace(/{{date}}/g, new Date().toISOString().split('T')[0])
      .replace(/{{exercisesJSON}}/g, exercisesJSON)
      .replace(/{{muscleBalanceJSON}}/g, muscleBalanceJSON)
      .replace(/{{recommendationsJSON}}/g, recommendationsJSON)
      .replace(/{{nextSessionNumber}}/g, (sessionNumber % 8 + 1).toString())
      .replace(/{{cycleProgress}}/g, `${sessionNumber}/8`)
      .replace(/{{pushUpperBodyStatus}}/g, '標準')
      .replace(/{{pullUpperBodyStatus}}/g, '標準')
      .replace(/{{lowerBodyFrontStatus}}/g, '標準')
      .replace(/{{lowerBodyBackStatus}}/g, '標準')
      .replace(/{{coreStatus}}/g, '標準')
    
    // Insert user info after the main title
    const titleEnd = prompt.indexOf('\n\n## 🔄')
    prompt = prompt.slice(0, titleEnd + 2) + userInfoSection + prompt.slice(titleEnd + 2)
    
    return prompt
  }

  extractMetadata(text: string): any {
    return extractMetadata(text)
  }

  getSessionTitle(sessionNumber: number): string {
    const sessionIndex = ((sessionNumber - 1) % 8) + 1
    return SESSION_TITLES[sessionIndex as keyof typeof SESSION_TITLES] || SESSION_TITLES[1]
  }

  private getLanguageInstruction(language: string): string {
    return language === 'en' ? 'Please respond in English only.' : '回答は必ず日本語でお願いします。'
  }

  // AI統合機能
  async generateAIResponse(
    profile: UserProfile, 
    context: Context, 
    language: string = 'ja',
    provider: 'claude' | 'chatgpt' | 'gemini' = 'claude'
  ): Promise<AIResponse> {
    const prompt = this.generateFullPrompt(profile, context, language)
    
    // 学習データを統合
    const enrichedPrompt = await this.enrichPromptWithLearningData(prompt, profile.name, context)
    
    const request: AIRequest = {
      prompt: enrichedPrompt,
      systemPrompt: 'あなたは経験豊富なフィットネストレーナーです。ユーザーのデータを分析し、パーソナライズされた具体的なアドバイスを提供してください。',
      maxTokens: 2000,
      temperature: 0.7,
      provider
    }
    
    return await this.aiService.generateResponse(request)
  }

  // 学習データを使ってプロンプトを強化
  private async enrichPromptWithLearningData(
    basePrompt: string, 
    userId: string, 
    _context: Context
  ): Promise<string> {
    try {
      // 過去のワークアウト履歴を取得
      const exercises = await this.learningService.getAllExercises(userId)
      
      if (exercises.length === 0) {
        return basePrompt + '\n\n注意: このユーザーはまだワークアウト履歴がありません。基本的なアドバイスを提供してください。'
      }
      
      // 各エクササイズの進捗を取得
      const progressData = await Promise.all(
        exercises.slice(0, 5).map(async exercise => {
          const progress = await this.learningService.getExerciseProgress(exercise, userId)
          const recommendation = await this.learningService.recommendWeight(exercise, userId)
          
          return {
            exercise,
            lastWeight: progress.lastWorkout?.weight || 0,
            trend: progress.trend,
            recommendedWeight: recommendation.recommendedWeight,
            reasoning: recommendation.reasoning
          }
        })
      )
      
      // 全体的な進捗分析
      const insights = await this.learningService.analyzeProgress(userId)
      
      // 学習データを追加
      const learningDataSection = `

## 📊 学習データに基づく分析

### エクササイズ進捗
${progressData.map(p => `- **${p.exercise}**: 前回${p.lastWeight}kg → 推奨${p.recommendedWeight}kg (${p.trend})`).join('\n')}

### 全体分析
- 進捗状況: ${insights.overallProgress}
- 週間頻度: ${insights.consistency.workoutsPerWeek}回
- 連続記録: ${insights.consistency.streak}日

### 強み
${insights.strengths.map(s => `- ${s}`).join('\n')}

### 改善点
${insights.areasForImprovement.map(a => `- ${a}`).join('\n')}

### 筋肉バランス
- 上半身: ${Math.round(insights.muscleBalance.upperBody)}%
- 下半身: ${Math.round(insights.muscleBalance.lowerBody)}%
- 体幹: ${Math.round(insights.muscleBalance.core)}%

この分析データを参考に、よりパーソナライズされたアドバイスを提供してください。`
      
      return basePrompt + learningDataSection
      
    } catch (error) {
      console.error('Failed to enrich prompt with learning data:', error)
      return basePrompt
    }
  }

  // ワークアウトデータの記録
  async trackWorkout(
    userId: string,
    exercise: string,
    weight: number,
    reps: number,
    sets: number,
    difficulty: 'easy' | 'moderate' | 'hard',
    notes?: string
  ): Promise<void> {
    const metrics: WorkoutMetrics = {
      exercise,
      weight,
      reps,
      sets,
      difficulty,
      notes,
      timestamp: new Date(),
      userId
    }
    
    await this.learningService.trackWorkout(metrics)
  }

  // エクササイズの重量推奨を取得
  async getWeightRecommendation(
    userId: string,
    exercise: string
  ): Promise<{ weight: number; reasoning: string }> {
    const recommendation = await this.learningService.recommendWeight(exercise, userId)
    
    return {
      weight: recommendation.recommendedWeight,
      reasoning: recommendation.reasoning
    }
  }

  // 進捗分析を取得
  async getProgressAnalysis(userId: string): Promise<any> {
    return await this.learningService.analyzeProgress(userId)
  }
}