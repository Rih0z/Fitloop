import type {
  IDynamicPromptGenerator,
  PromptGenerationRequest,
  GeneratedPrompt,
  TemplateSearchCriteria,
  EffectivenessMetrics
} from '../interfaces/IFitLoopOrchestrator'
import type { UserContext, PromptTemplate, TemplateVariable } from '../types/OrchestrationTypes'

export class DynamicPromptGenerator implements IDynamicPromptGenerator {
  private templates: Map<string, PromptTemplate> = new Map()
  private effectivenessData: Map<string, EffectivenessMetrics[]> = new Map()
  private personalizedTemplates: Map<string, PromptTemplate[]> = new Map() // userId -> templates

  constructor() {
    this.initializeDefaultTemplates()
  }

  async generatePrompt(request: PromptGenerationRequest): Promise<GeneratedPrompt> {
    // 1. コンテキスト分析によるテンプレート選択
    const selectedTemplate = await this.selectOptimalTemplate(request)
    
    // 2. ユーザーコンテキストに基づく動的変数生成
    const contextVariables = this.generateContextVariables(request.context)
    
    // 3. 感情状態とエネルギーレベルに基づくトーン調整
    const emotionalAdjustments = this.generateEmotionalAdjustments(request.context)
    
    // 4. 環境制約に基づく実用的調整
    const environmentalAdjustments = this.generateEnvironmentalAdjustments(request.context)
    
    // 5. プロンプト生成とパーソナライゼーション
    const personalizedContent = await this.personalizeTemplate(
      selectedTemplate,
      {
        ...contextVariables,
        ...emotionalAdjustments,
        ...environmentalAdjustments,
        ...request.parameters
      },
      request.context
    )

    // 6. 品質保証とA/Bテスト対応
    const optimizedContent = await this.optimizeForTarget(
      personalizedContent,
      request.context.preferences.expertiseLevel,
      request.constraints?.targetAI
    )

    const generatedPrompt: GeneratedPrompt = {
      id: this.generatePromptId(),
      content: optimizedContent,
      metadata: {
        templateId: selectedTemplate.id,
        variables: contextVariables,
        generatedAt: new Date(),
        targetAI: request.constraints?.targetAI || 'claude',
        complexity: this.determineComplexity(request.context)
      },
      effectiveness: await this.predictEffectiveness(selectedTemplate.id, request.context)
    }

    // 学習データ収集
    this.collectGenerationData(generatedPrompt, request)

    return generatedPrompt
  }

  async generatePersonalizedPrompt(userId: string, type: string, parameters?: any): Promise<GeneratedPrompt> {
    // ユーザー固有のテンプレートと学習データを活用
    const userTemplates = this.personalizedTemplates.get(userId) || []
    const relevantTemplate = userTemplates.find(t => t.category === type) || 
                            await this.getTemplate(this.getDefaultTemplateId(type))

    if (!relevantTemplate) {
      throw new Error(`No template found for type: ${type}`)
    }

    // 基本的なコンテキストを構築（実際の実装では外部から取得）
    const mockContext: UserContext = this.createMockUserContext(userId)

    return this.generatePrompt({
      type,
      context: mockContext,
      parameters,
      constraints: {
        maxLength: 2000,
        targetAI: 'claude',
        complexity: 'detailed'
      }
    })
  }

  async registerTemplate(template: PromptTemplate): Promise<void> {
    this.validateTemplate(template)
    this.templates.set(template.id, template)
  }

  async updateTemplate(templateId: string, updates: Partial<PromptTemplate>): Promise<void> {
    const existing = this.templates.get(templateId)
    if (!existing) {
      throw new Error(`Template not found: ${templateId}`)
    }

    const updated = { ...existing, ...updates }
    this.validateTemplate(updated)
    this.templates.set(templateId, updated)
  }

  async getTemplate(templateId: string): Promise<PromptTemplate | null> {
    return this.templates.get(templateId) || null
  }

  async searchTemplates(criteria: TemplateSearchCriteria): Promise<PromptTemplate[]> {
    const templates = Array.from(this.templates.values())

    return templates.filter(template => {
      if (criteria.category && template.category !== criteria.category) return false
      if (criteria.complexity && template.complexity !== criteria.complexity) return false
      if (criteria.targetAI && !criteria.targetAI.some(ai => template.targetAI.includes(ai))) return false
      if (criteria.effectiveness && (template.effectiveness || 0) < criteria.effectiveness) return false
      if (criteria.tags && !criteria.tags.some(tag => template.name.toLowerCase().includes(tag.toLowerCase()))) return false
      
      return true
    }).sort((a, b) => (b.effectiveness || 0) - (a.effectiveness || 0))
  }

  async optimizePrompt(prompt: string, targetAI: string, context: UserContext): Promise<string> {
    // AI サービス固有の最適化
    let optimized = prompt

    switch (targetAI) {
      case 'claude':
        optimized = this.optimizeForClaude(prompt, context)
        break
      case 'chatgpt':
        optimized = this.optimizeForChatGPT(prompt, context)
        break
      case 'gemini':
        optimized = this.optimizeForGemini(prompt, context)
        break
    }

    // コンテキスト基づく調整
    optimized = this.applyContextualOptimizations(optimized, context)

    return optimized
  }

  async testPromptEffectiveness(prompt: string, metrics: EffectivenessMetrics): Promise<number> {
    // 効果測定アルゴリズム
    const weights = {
      userEngagement: 0.3,
      goalProgress: 0.4,
      satisfactionScore: 0.2,
      completionRate: 0.1
    }

    const effectiveness = 
      metrics.userEngagement * weights.userEngagement +
      metrics.goalProgress * weights.goalProgress +
      metrics.satisfactionScore * weights.satisfactionScore +
      metrics.completionRate * weights.completionRate

    return Math.min(effectiveness, 1.0)
  }

  // Private implementation methods
  private async selectOptimalTemplate(request: PromptGenerationRequest): Promise<PromptTemplate> {
    const candidates = await this.searchTemplates({
      category: this.mapRequestTypeToCategory(request.type),
      complexity: request.context.preferences.promptComplexity,
      targetAI: request.constraints?.targetAI ? [request.constraints.targetAI] : undefined
    })

    if (candidates.length === 0) {
      throw new Error(`No templates found for request type: ${request.type}`)
    }

    // コンテキストに基づく最適選択
    return this.selectBestTemplateForContext(candidates, request.context)
  }

  private generateContextVariables(context: UserContext): Record<string, any> {
    return {
      // 感情状態
      currentMood: context.emotionalState.mood,
      energyLevel: context.emotionalState.energy,
      motivationLevel: context.emotionalState.motivation,
      stressLevel: context.emotionalState.stress,
      confidenceLevel: context.emotionalState.confidence,

      // 環境
      location: context.environment.location,
      timeAvailable: context.environment.timeAvailable,
      equipment: context.environment.equipment.join(', '),
      spaceConstraints: context.environment.spaceConstraints,

      // 個人設定
      expertiseLevel: context.preferences.expertiseLevel,
      communicationStyle: context.preferences.communicationStyle,
      language: context.preferences.languagePreference,

      // 時間的コンテキスト
      timeOfDay: this.getTimeOfDay(),
      dayOfWeek: this.getDayOfWeek(),
      season: this.getSeason()
    }
  }

  private generateEmotionalAdjustments(context: UserContext): Record<string, any> {
    const adjustments: Record<string, any> = {}

    // モチベーション調整
    switch (context.emotionalState.motivation) {
      case 'struggling':
        adjustments.motivationalTone = 'highly_encouraging'
        adjustments.challengeLevel = 'gentle'
        adjustments.successEmphasis = 'high'
        break
      case 'low':
        adjustments.motivationalTone = 'supportive'
        adjustments.challengeLevel = 'moderate'
        adjustments.positiveFraming = 'emphasized'
        break
      case 'peak':
        adjustments.motivationalTone = 'challenging'
        adjustments.challengeLevel = 'high'
        adjustments.ambitionLevel = 'maximized'
        break
    }

    // エネルギーレベル調整
    switch (context.emotionalState.energy) {
      case 'low':
        adjustments.intensityRecommendation = 'light_to_moderate'
        adjustments.durationSuggestion = 'shorter'
        adjustments.recoveryEmphasis = 'high'
        break
      case 'high':
        adjustments.intensityRecommendation = 'moderate_to_high'
        adjustments.durationSuggestion = 'standard_to_extended'
        adjustments.challengeReadiness = 'high'
        break
    }

    // ストレス調整
    if (context.emotionalState.stress === 'high' || context.emotionalState.stress === 'overwhelming') {
      adjustments.stressReliefFocus = 'prioritized'
      adjustments.mindfulnessInclusion = 'emphasized'
      adjustments.gentleApproach = 'activated'
    }

    return adjustments
  }

  private generateEnvironmentalAdjustments(context: UserContext): Record<string, any> {
    const adjustments: Record<string, any> = {}

    // 時間制約調整
    if (context.environment.timeAvailable < 20) {
      adjustments.workoutFormat = 'express'
      adjustments.setupTime = 'minimal'
      adjustments.exerciseSelection = 'compound_movements'
    } else if (context.environment.timeAvailable > 60) {
      adjustments.workoutFormat = 'comprehensive'
      adjustments.detailLevel = 'extensive'
      adjustments.cooldownInclusion = 'full'
    }

    // スペース制約調整
    switch (context.environment.spaceConstraints) {
      case 'very_limited':
        adjustments.exerciseTypes = 'stationary_only'
        adjustments.equipmentRequirement = 'bodyweight_preferred'
        break
      case 'unlimited':
        adjustments.exerciseTypes = 'full_range'
        adjustments.movementVariety = 'maximized'
        break
    }

    // 場所特有の調整
    switch (context.environment.location) {
      case 'gym':
        adjustments.equipmentAvailability = 'full'
        adjustments.socialConsideration = 'gym_etiquette'
        break
      case 'home':
        adjustments.noiseConsideration = 'important'
        adjustments.familyFriendly = context.environment.noise_level === 'quiet'
        break
      case 'outdoor':
        adjustments.weatherAdaptation = 'required'
        adjustments.naturalMovements = 'emphasized'
        break
    }

    return adjustments
  }

  private async personalizeTemplate(
    template: PromptTemplate,
    variables: Record<string, any>,
    context: UserContext
  ): Promise<string> {
    let content = template.template

    // 変数置換
    template.variables.forEach(variable => {
      const value = variables[variable.name] || variable.defaultValue || ''
      const placeholder = new RegExp(`{{${variable.name}}}`, 'g')
      content = content.replace(placeholder, String(value))
    })

    // コンテキスト駆動の動的セクション
    content = this.addDynamicSections(content, context)

    // パーソナライゼーション
    content = this.applyPersonalization(content, context)

    return content
  }

  private addDynamicSections(content: string, context: UserContext): string {
    let enhanced = content

    // 状況に応じたセクション追加
    if (context.emotionalState.stress === 'high') {
      enhanced += '\n\n## 🧘 ストレス軽減フォーカス\n今日は心と体の両方をケアしましょう。'
    }

    if (context.environment.timeAvailable < 30) {
      enhanced += '\n\n## ⚡ 時短効率化\n限られた時間で最大の効果を得る方法に集中します。'
    }

    if (context.emotionalState.motivation === 'struggling') {
      enhanced += '\n\n## 💪 モチベーション回復\n小さな成功を積み重ねて自信を取り戻しましょう。'
    }

    return enhanced
  }

  private applyPersonalization(content: string, context: UserContext): string {
    // コミュニケーションスタイル調整
    switch (context.preferences.communicationStyle) {
      case 'motivational':
        content = this.addMotivationalElements(content)
        break
      case 'technical':
        content = this.addTechnicalDetails(content)
        break
      case 'encouraging':
        content = this.addEncouragingTone(content)
        break
    }

    // 専門レベル調整
    switch (context.preferences.expertiseLevel) {
      case 'beginner':
        content = this.simplifyForBeginner(content)
        break
      case 'advanced':
        content = this.enhanceForAdvanced(content)
        break
    }

    return content
  }

  private async optimizeForTarget(
    content: string,
    expertiseLevel: string,
    targetAI?: string
  ): Promise<string> {
    let optimized = content

    if (targetAI) {
      optimized = await this.optimizePrompt(content, targetAI, this.createMockUserContext(''))
    }

    // 専門レベルに基づく最終調整
    if (expertiseLevel === 'expert') {
      optimized = this.addExpertLevel(optimized)
    }

    return optimized
  }

  private optimizeForClaude(prompt: string, context: UserContext): string {
    // Claude 特有の最適化
    let optimized = prompt

    // Claude は構造化された指示を好む
    optimized = this.addStructuredInstructions(optimized)
    
    // 明確な例やフォーマットを追加
    optimized = this.addExamplesAndFormats(optimized)

    return optimized
  }

  private optimizeForChatGPT(prompt: string, context: UserContext): string {
    // ChatGPT 特有の最適化
    let optimized = prompt

    // ChatGPT は対話的なアプローチを好む
    optimized = this.addConversationalElements(optimized)

    return optimized
  }

  private optimizeForGemini(prompt: string, context: UserContext): string {
    // Gemini 特有の最適化
    let optimized = prompt

    // Gemini は多様な入力形式に対応
    optimized = this.addMultiModalInstructions(optimized)

    return optimized
  }

  // Helper methods for optimization
  private addStructuredInstructions(content: string): string {
    if (!content.includes('## 指示')) {
      content = '## 指示\n' + content
    }
    return content
  }

  private addExamplesAndFormats(content: string): string {
    if (!content.includes('### 例：')) {
      content += '\n\n### 例：\n[具体例をここに含める]'
    }
    return content
  }

  private addConversationalElements(content: string): string {
    return content.replace(/。/g, '。一緒に頑張りましょう！')
  }

  private addMultiModalInstructions(content: string): string {
    content += '\n\n### 📸 画像分析対応\n必要に応じて画像の説明や分析も含めてください。'
    return content
  }

  private addMotivationalElements(content: string): string {
    return '🔥 ' + content + '\n\n**あなたならできる！今日も最高の一日にしましょう！**'
  }

  private addTechnicalDetails(content: string): string {
    return content + '\n\n### 技術的詳細\n- 筋活動パターン\n- 代謝要求\n- 生理学的反応'
  }

  private addEncouragingTone(content: string): string {
    return content.replace(/する/g, 'していきましょう').replace(/です/g, 'ですね')
  }

  private simplifyForBeginner(content: string): string {
    return content
      .replace(/高強度/g, '少し強め')
      .replace(/複合運動/g, '全身を使う運動')
      .replace(/筋肥大/g, '筋肉を大きくする')
  }

  private enhanceForAdvanced(content: string): string {
    return content + '\n\n### 上級者向け調整\n- ピリオダイゼーション考慮\n- 神経系適応最適化'
  }

  private addExpertLevel(content: string): string {
    return content + '\n\n### エキスパート分析\n- バイオメカニクス最適化\n- 競技特異性考慮'
  }

  // Utility methods
  private generatePromptId(): string {
    return `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private mapRequestTypeToCategory(type: string): string {
    const mapping: Record<string, string> = {
      'workout_plan': 'workout',
      'nutrition_advice': 'nutrition',
      'motivation_boost': 'motivation',
      'progress_analysis': 'analysis'
    }
    return mapping[type] || 'workout'
  }

  private selectBestTemplateForContext(candidates: PromptTemplate[], context: UserContext): PromptTemplate {
    // 複雑な選択ロジック - 実際の実装では機械学習を使用可能
    return candidates.reduce((best, current) => {
      const bestScore = this.calculateTemplateScore(best, context)
      const currentScore = this.calculateTemplateScore(current, context)
      return currentScore > bestScore ? current : best
    })
  }

  private calculateTemplateScore(template: PromptTemplate, context: UserContext): number {
    let score = template.effectiveness || 0.5

    // コンテキスト適合性スコア
    if (template.complexity === context.preferences.promptComplexity) score += 0.2
    if (template.targetAI.includes(context.preferences.languagePreference)) score += 0.1

    return Math.min(score, 1.0)
  }

  private async predictEffectiveness(templateId: string, context: UserContext): Promise<number> {
    const historicalData = this.effectivenessData.get(templateId) || []
    
    if (historicalData.length === 0) {
      return 0.5 // デフォルト値
    }

    // 履歴データに基づく予測
    const avgEffectiveness = historicalData.reduce((sum, data) => 
      sum + this.testPromptEffectiveness('', data), 0) / historicalData.length

    return avgEffectiveness
  }

  private collectGenerationData(prompt: GeneratedPrompt, request: PromptGenerationRequest): void {
    // 学習のためのデータ収集
    console.log('Collecting generation data for learning:', {
      promptId: prompt.id,
      requestType: request.type,
      context: request.context,
      effectiveness: prompt.effectiveness
    })
  }

  private validateTemplate(template: PromptTemplate): void {
    if (!template.id || !template.name || !template.template) {
      throw new Error('Template must have id, name, and template content')
    }

    if (!['workout', 'nutrition', 'motivation', 'analysis', 'planning'].includes(template.category)) {
      throw new Error('Invalid template category')
    }
  }

  private createMockUserContext(userId: string): UserContext {
    // 実際の実装では外部サービスから取得
    return {
      userId,
      sessionId: `session_${Date.now()}`,
      timestamp: new Date(),
      emotionalState: {
        mood: 'good',
        energy: 'medium',
        confidence: 'medium',
        motivation: 'medium',
        stress: 'low'
      },
      environment: {
        location: 'home',
        equipment: ['dumbbells'],
        spaceConstraints: 'limited',
        timeAvailable: 45,
        noise_level: 'quiet'
      },
      preferences: {
        communicationStyle: 'encouraging',
        expertiseLevel: 'intermediate',
        languagePreference: 'ja',
        promptComplexity: 'detailed'
      }
    }
  }

  private getDefaultTemplateId(type: string): string {
    const defaults: Record<string, string> = {
      'workout': 'default_workout_template',
      'nutrition': 'default_nutrition_template',
      'motivation': 'default_motivation_template'
    }
    return defaults[type] || 'default_workout_template'
  }

  private initializeDefaultTemplates(): void {
    // デフォルトテンプレートの初期化
    const defaultTemplates: PromptTemplate[] = [
      {
        id: 'context_aware_workout',
        name: 'コンテキスト対応ワークアウト',
        category: 'workout',
        template: `# パーソナライズド・ワークアウトプラン

## 現在の状況
- 気分: {{currentMood}}
- エネルギー: {{energyLevel}}
- 利用可能時間: {{timeAvailable}}分
- 場所: {{location}}
- 器具: {{equipment}}

## 今日のおすすめ
{{#if motivationalTone}}
今日のあなたには{{motivationalTone}}なアプローチが最適です。
{{/if}}

{{#if timeAvailable < 30}}
### ⚡ 高効率ショートワークアウト
限られた時間で最大の効果を狙います：
{{else}}
### 🎯 バランス重視ワークアウト
じっくりと体作りに取り組みましょう：
{{/if}}

1. **ウォームアップ** ({{timeAvailable > 45 ? '10' : '5'}}分)
2. **メインエクササイズ** ({{timeAvailable - 15}}分)
3. **クールダウン** (5分)

{{#if stressReliefFocus}}
### 🧘 ストレス軽減要素
- 深呼吸を意識
- ゆったりとした動作
- マインドフルネス重視
{{/if}}`,
        variables: [
          { name: 'currentMood', type: 'string', required: true, description: '現在の気分' },
          { name: 'energyLevel', type: 'string', required: true, description: 'エネルギーレベル' },
          { name: 'timeAvailable', type: 'number', required: true, description: '利用可能時間（分）' },
          { name: 'location', type: 'string', required: true, description: '運動場所' },
          { name: 'equipment', type: 'string', required: false, description: '利用可能器具' }
        ],
        targetAI: ['claude', 'chatgpt', 'gemini'],
        complexity: 'medium',
        effectiveness: 0.85
      }
    ]

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template)
    })
  }

  private applyContextualOptimizations(content: string, context: UserContext): string {
    // 最終的なコンテキスト最適化
    let optimized = content

    // 時間帯に基づく調整
    const hour = new Date().getHours()
    if (hour < 10) {
      optimized += '\n\n### 🌅 朝のエネルギー活用\n一日のスタートを最高にしましょう！'
    } else if (hour > 18) {
      optimized += '\n\n### 🌙 夜のリラックス重視\n一日の疲れを癒しながら体を動かしましょう。'
    }

    return optimized
  }

  private determineComplexity(context: UserContext): string {
    if (context.preferences.expertiseLevel === 'beginner') return 'simple'
    if (context.preferences.expertiseLevel === 'expert') return 'complex'
    return 'medium'
  }

  // Time-based utilities
  private getTimeOfDay(): string {
    const hour = new Date().getHours()
    if (hour < 6) return 'early_morning'
    if (hour < 12) return 'morning'
    if (hour < 18) return 'afternoon'
    return 'evening'
  }

  private getDayOfWeek(): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[new Date().getDay()]
  }

  private getSeason(): string {
    const month = new Date().getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'autumn'
    return 'winter'
  }
}