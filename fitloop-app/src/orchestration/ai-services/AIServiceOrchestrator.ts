import type {
  IAIServiceOrchestrator,
  AIRequest,
  AIResponse,
  ServiceSelectionCriteria,
  ServiceHealth,
  ServiceMetrics,
  TimeRange
} from '../interfaces/IFitLoopOrchestrator'
import type { AIServiceConfig, UserContext } from '../types/OrchestrationTypes'

export class AIServiceOrchestrator implements IAIServiceOrchestrator {
  private services: Map<string, AIServiceAdapter> = new Map()
  private healthMonitor: ServiceHealthMonitor
  private loadBalancer: LoadBalancer
  private costOptimizer: CostOptimizer
  private responseCache: Map<string, CachedResponse> = new Map()

  constructor() {
    this.healthMonitor = new ServiceHealthMonitor()
    this.loadBalancer = new LoadBalancer()
    this.costOptimizer = new CostOptimizer()
    this.initializeDefaultServices()
  }

  async registerAIService(config: AIServiceConfig): Promise<void> {
    // Validate configuration
    if (!config.name || config.name.trim() === '') {
      throw new Error('Service name is required and cannot be empty')
    }
    
    if (!config.capabilities || config.capabilities.length === 0) {
      throw new Error('Service must have at least one capability')
    }
    
    const adapter = this.createServiceAdapter(config)
    await adapter.initialize()
    
    this.services.set(config.name, adapter)
    this.healthMonitor.addService(config.name)
    
    console.log(`🤖 AI Service registered: ${config.name}`)
  }

  async removeAIService(serviceName: string): Promise<void> {
    const adapter = this.services.get(serviceName)
    if (adapter) {
      await adapter.shutdown()
      this.services.delete(serviceName)
      this.healthMonitor.removeService(serviceName)
    }
  }

  async updateServiceConfig(serviceName: string, config: Partial<AIServiceConfig>): Promise<void> {
    const adapter = this.services.get(serviceName)
    if (!adapter) {
      throw new Error(`Service not found: ${serviceName}`)
    }
    
    await adapter.updateConfig(config)
  }

  async routeRequest(request: AIRequest): Promise<AIResponse> {
    // 1. 最適サービス選択
    const optimalService = await this.selectOptimalServiceForRequest(request)
    
    // 2. キャッシュチェック
    const cacheKey = this.generateCacheKey(request)
    const cachedResponse = this.getCachedResponse(cacheKey)
    if (cachedResponse && this.isCacheValid(cachedResponse)) {
      return this.createResponseFromCache(cachedResponse, request.id)
    }
    
    // 3. リクエスト実行
    try {
      const response = await this.executeRequest(request, optimalService)
      
      // 4. レスポンスキャッシュ
      this.cacheResponse(cacheKey, response)
      
      // 5. 学習データ収集
      this.collectPerformanceData(request, response, optimalService)
      
      return response
    } catch (error) {
      // フォールバック戦略
      return await this.handleRequestError(request, error, optimalService)
    }
  }

  async selectOptimalService(criteria: ServiceSelectionCriteria): Promise<string> {
    const availableServices = Array.from(this.services.keys())
    const healthyServices = await this.filterHealthyServices(availableServices)
    
    if (healthyServices.length === 0) {
      throw new Error('No healthy AI services available')
    }

    // 複数の要因を考慮したスコアリング
    const scores = await Promise.all(
      healthyServices.map(async (serviceName) => {
        const score = await this.calculateServiceScore(serviceName, criteria)
        return { serviceName, score }
      })
    )

    // 最高スコアのサービスを選択
    const bestService = scores.reduce((best, current) => 
      current.score > best.score ? current : best
    )

    return bestService.serviceName
  }

  async executeParallel(requests: AIRequest[]): Promise<AIResponse[]> {
    // 並列実行で複数のAIサービスから結果を取得
    const executionPromises = requests.map(async (request) => {
      try {
        return await this.routeRequest(request)
      } catch (error) {
        return this.createErrorResponse(request.id, error)
      }
    })

    return await Promise.all(executionPromises)
  }

  async executeWithFallback(request: AIRequest, fallbackServices: string[]): Promise<AIResponse> {
    const primaryService = await this.selectOptimalServiceForRequest(request)
    const servicesToTry = [primaryService, ...fallbackServices]

    for (const serviceName of servicesToTry) {
      try {
        const adapter = this.services.get(serviceName)
        if (!adapter || !await this.isServiceHealthy(serviceName)) {
          continue
        }

        const response = await this.executeRequestOnService(request, adapter)
        if (response.success) {
          return response
        }
      } catch (error) {
        console.warn(`Service ${serviceName} failed:`, error)
        continue
      }
    }

    throw new Error('All AI services failed for request')
  }

  async getServiceHealth(serviceName?: string): Promise<ServiceHealth[]> {
    if (serviceName) {
      const health = await this.healthMonitor.getServiceHealth(serviceName)
      return health ? [health] : []
    }
    
    return await this.healthMonitor.getAllServiceHealth()
  }

  async getServiceMetrics(serviceName: string, timeRange?: TimeRange): Promise<ServiceMetrics> {
    return await this.healthMonitor.getServiceMetrics(serviceName, timeRange)
  }

  // Private implementation methods

  private async selectOptimalServiceForRequest(request: AIRequest): Promise<string> {
    // リクエストの特性に基づいてサービスを選択
    const criteria: ServiceSelectionCriteria = {
      capabilities: this.extractRequiredCapabilities(request),
      maxResponseTime: this.getMaxResponseTime(request),
      maxCost: this.getMaxCost(request),
      minReliability: 0.95
    }

    return await this.selectOptimalService(criteria)
  }

  private extractRequiredCapabilities(request: AIRequest): string[] {
    const capabilities = ['text_generation']
    
    // プロンプトの内容から必要な機能を推測
    if (request.prompt.includes('画像') || request.prompt.includes('写真')) {
      capabilities.push('image_analysis')
    }
    
    if (request.prompt.includes('データ') || request.prompt.includes('分析')) {
      capabilities.push('data_extraction')
    }
    
    if (request.context?.preferences?.expertiseLevel === 'expert') {
      capabilities.push('reasoning')
    }

    return capabilities
  }

  private getMaxResponseTime(request: AIRequest): number {
    // 緊急度に基づく最大応答時間
    const priority = request.context?.environment?.timeAvailable || 60
    
    if (priority < 15) return 5000  // 5秒
    if (priority < 30) return 10000 // 10秒
    return 30000 // 30秒
  }

  private getMaxCost(request: AIRequest): number {
    // コスト制約（実際の実装では課金プランに基づく）
    return 0.01 // $0.01 per request
  }

  private async filterHealthyServices(services: string[]): Promise<string[]> {
    const healthChecks = await Promise.all(
      services.map(async (serviceName) => ({
        serviceName,
        isHealthy: await this.isServiceHealthy(serviceName)
      }))
    )

    return healthChecks
      .filter(check => check.isHealthy)
      .map(check => check.serviceName)
  }

  private async calculateServiceScore(serviceName: string, criteria: ServiceSelectionCriteria): Promise<number> {
    const adapter = this.services.get(serviceName)
    if (!adapter) return 0

    const config = adapter.getConfig()
    const metrics = await this.getServiceMetrics(serviceName)
    
    let score = 0

    // 機能適合性 (40%)
    const capabilityScore = this.calculateCapabilityScore(config.capabilities, criteria.capabilities)
    score += capabilityScore * 0.4

    // パフォーマンス (30%)
    const performanceScore = this.calculatePerformanceScore(metrics, criteria)
    score += performanceScore * 0.3

    // コスト効率性 (20%)
    const costScore = this.calculateCostScore(config, criteria)
    score += costScore * 0.2

    // 信頼性 (10%)
    const reliabilityScore = config.reliability || 0.5
    score += reliabilityScore * 0.1

    return Math.min(score, 1.0)
  }

  private calculateCapabilityScore(serviceCapabilities: any[], requiredCapabilities: string[]): number {
    if (requiredCapabilities.length === 0) return 1.0

    const matchingCapabilities = requiredCapabilities.filter(required =>
      serviceCapabilities.some(service => service.type === required)
    )

    return matchingCapabilities.length / requiredCapabilities.length
  }

  private calculatePerformanceScore(metrics: ServiceMetrics, criteria: ServiceSelectionCriteria): number {
    let score = 1.0

    if (criteria.maxResponseTime && metrics.avgResponseTime > criteria.maxResponseTime) {
      score *= 0.5 // ペナルティ
    }

    // エラー率によるペナルティ
    score *= (1 - metrics.errorRate)

    return Math.max(score, 0)
  }

  private calculateCostScore(config: AIServiceConfig, criteria: ServiceSelectionCriteria): number {
    if (!criteria.maxCost || !config.costPerToken) return 1.0

    const estimatedCost = config.costPerToken * 1000 // 1000トークン想定
    
    if (estimatedCost <= criteria.maxCost) {
      return 1.0
    }
    
    // コスト超過時のスコア計算
    return Math.max(criteria.maxCost / estimatedCost, 0.1)
  }

  private async isServiceHealthy(serviceName: string): Promise<boolean> {
    const health = await this.healthMonitor.getServiceHealth(serviceName)
    return health?.status === 'healthy'
  }

  private async executeRequest(request: AIRequest, serviceName: string): Promise<AIResponse> {
    const adapter = this.services.get(serviceName)
    if (!adapter) {
      throw new Error(`Service adapter not found: ${serviceName}`)
    }

    return await this.executeRequestOnService(request, adapter)
  }

  private async executeRequestOnService(request: AIRequest, adapter: AIServiceAdapter): Promise<AIResponse> {
    const startTime = Date.now()
    
    try {
      const result = await adapter.processRequest(request)
      const executionTime = Date.now() - startTime

      return {
        requestId: request.id,
        content: result.content,
        metadata: {
          aiService: adapter.getName(),
          model: adapter.getModel(),
          promptUsed: request.prompt,
          tokensUsed: result.tokensUsed,
          cost: result.cost,
          confidence: result.confidence,
          executionTime
        },
        success: true
      }
    } catch (error) {
      const executionTime = Date.now() - startTime
      
      return {
        requestId: request.id,
        content: '',
        metadata: {
          aiService: adapter.getName(),
          model: adapter.getModel(),
          promptUsed: request.prompt,
          confidence: 0,
          executionTime
        },
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async handleRequestError(request: AIRequest, error: any, failedService: string): Promise<AIResponse> {
    console.error(`AI request failed on ${failedService}:`, error)

    // フォールバック戦略
    const fallbackServices = Array.from(this.services.keys())
      .filter(name => name !== failedService)
    
    if (fallbackServices.length > 0) {
      try {
        return await this.executeWithFallback(request, fallbackServices)
      } catch (fallbackError) {
        console.error('All fallback services failed:', fallbackError)
      }
    }

    // 最終的なエラーレスポンス
    return this.createErrorResponse(request.id, error)
  }

  private createErrorResponse(requestId: string, error: any): AIResponse {
    return {
      requestId,
      content: '',
      metadata: {
        aiService: 'none',
        model: 'none',
        promptUsed: '',
        confidence: 0,
        executionTime: 0
      },
      success: false,
      error: error instanceof Error ? error.message : 'Request failed'
    }
  }

  private generateCacheKey(request: AIRequest): string {
    // プロンプトとコンテキストに基づくキャッシュキー
    const contextHash = this.hashContext(request.context)
    const promptHash = this.hashString(request.prompt)
    return `${promptHash}_${contextHash}`
  }

  private hashString(str: string): string {
    // 簡単なハッシュ関数
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 32bit整数に変換
    }
    return hash.toString(36)
  }

  private hashContext(context: any): string {
    // コンテキストの重要な部分のみをハッシュ化
    const relevantContext = {
      mood: context?.emotionalState?.mood || 'unknown',
      energy: context?.emotionalState?.energy || 'unknown',
      location: context?.environment?.location || 'unknown',
      timeAvailable: context?.environment?.timeAvailable || 0,
      expertiseLevel: context?.preferences?.expertiseLevel || 'beginner'
    }
    return this.hashString(JSON.stringify(relevantContext))
  }

  private getCachedResponse(cacheKey: string): CachedResponse | null {
    return this.responseCache.get(cacheKey) || null
  }

  private isCacheValid(cachedResponse: CachedResponse): boolean {
    const cacheAge = Date.now() - cachedResponse.timestamp
    const maxAge = 5 * 60 * 1000 // 5分間有効
    return cacheAge < maxAge
  }

  private cacheResponse(cacheKey: string, response: AIResponse): void {
    if (response.success) {
      this.responseCache.set(cacheKey, {
        response,
        timestamp: Date.now()
      })

      // キャッシュサイズ制限
      if (this.responseCache.size > 1000) {
        const oldestKey = this.responseCache.keys().next().value
        this.responseCache.delete(oldestKey)
      }
    }
  }

  private createResponseFromCache(cachedResponse: CachedResponse, requestId: string): AIResponse {
    return {
      ...cachedResponse.response,
      requestId,
      metadata: {
        ...cachedResponse.response.metadata,
        cacheHit: true
      }
    }
  }

  private collectPerformanceData(request: AIRequest, response: AIResponse, serviceName: string): void {
    this.healthMonitor.recordMetric(serviceName, {
      responseTime: response.metadata.executionTime,
      success: response.success,
      cost: response.metadata.cost || 0,
      tokensUsed: response.metadata.tokensUsed || 0
    })
  }

  private createServiceAdapter(config: AIServiceConfig): AIServiceAdapter {
    switch (config.name) {
      case 'claude':
        return new ClaudeAdapter(config)
      case 'chatgpt':
        return new ChatGPTAdapter(config)
      case 'gemini':
        return new GeminiAdapter(config)
      default:
        return new GenericAdapter(config)
    }
  }

  private initializeDefaultServices(): void {
    // デフォルトサービスの設定
    const defaultServices: AIServiceConfig[] = [
      {
        name: 'claude',
        capabilities: [
          { type: 'text_generation', level: 'expert' },
          { type: 'reasoning', level: 'expert' },
          { type: 'data_extraction', level: 'advanced' }
        ],
        reliability: 0.95,
        costPerToken: 0.000015
      },
      {
        name: 'chatgpt',
        capabilities: [
          { type: 'text_generation', level: 'expert' },
          { type: 'creativity', level: 'expert' },
          { type: 'reasoning', level: 'advanced' }
        ],
        reliability: 0.92,
        costPerToken: 0.00002
      },
      {
        name: 'gemini',
        capabilities: [
          { type: 'text_generation', level: 'advanced' },
          { type: 'image_analysis', level: 'expert' },
          { type: 'reasoning', level: 'advanced' }
        ],
        reliability: 0.90,
        costPerToken: 0.000012
      }
    ]

    // サービスを非同期で登録
    defaultServices.forEach(config => {
      this.registerAIService(config).catch(error => {
        console.warn(`Failed to register ${config.name}:`, error)
      })
    })
  }
}

// Supporting classes

interface CachedResponse {
  response: AIResponse
  timestamp: number
}

interface ServiceMetric {
  responseTime: number
  success: boolean
  cost: number
  tokensUsed: number
}

abstract class AIServiceAdapter {
  protected config: AIServiceConfig

  constructor(config: AIServiceConfig) {
    this.config = config
  }

  abstract initialize(): Promise<void>
  abstract processRequest(request: AIRequest): Promise<any>
  abstract shutdown(): Promise<void>
  abstract updateConfig(updates: Partial<AIServiceConfig>): Promise<void>

  getName(): string {
    return this.config.name
  }

  getModel(): string {
    return this.config.model || 'default'
  }

  getConfig(): AIServiceConfig {
    return this.config
  }
}

class ClaudeAdapter extends AIServiceAdapter {
  async initialize(): Promise<void> {
    // Claude API初期化
    console.log('🤖 Claude adapter initialized')
  }

  async processRequest(request: AIRequest): Promise<any> {
    // Claude API呼び出しのシミュレーション
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    return {
      content: `Claude response to: ${request.prompt.substring(0, 50)}...`,
      tokensUsed: Math.floor(Math.random() * 1000) + 500,
      cost: 0.015,
      confidence: 0.9 + Math.random() * 0.1
    }
  }

  async shutdown(): Promise<void> {
    console.log('🤖 Claude adapter shutdown')
  }

  async updateConfig(updates: Partial<AIServiceConfig>): Promise<void> {
    this.config = { ...this.config, ...updates }
  }
}

class ChatGPTAdapter extends AIServiceAdapter {
  async initialize(): Promise<void> {
    console.log('🤖 ChatGPT adapter initialized')
  }

  async processRequest(request: AIRequest): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500))
    
    return {
      content: `ChatGPT response to: ${request.prompt.substring(0, 50)}...`,
      tokensUsed: Math.floor(Math.random() * 800) + 400,
      cost: 0.02,
      confidence: 0.85 + Math.random() * 0.1
    }
  }

  async shutdown(): Promise<void> {
    console.log('🤖 ChatGPT adapter shutdown')
  }

  async updateConfig(updates: Partial<AIServiceConfig>): Promise<void> {
    this.config = { ...this.config, ...updates }
  }
}

class GeminiAdapter extends AIServiceAdapter {
  async initialize(): Promise<void> {
    console.log('🤖 Gemini adapter initialized')
  }

  async processRequest(request: AIRequest): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 1800))
    
    return {
      content: `Gemini response to: ${request.prompt.substring(0, 50)}...`,
      tokensUsed: Math.floor(Math.random() * 900) + 300,
      cost: 0.012,
      confidence: 0.88 + Math.random() * 0.1
    }
  }

  async shutdown(): Promise<void> {
    console.log('🤖 Gemini adapter shutdown')
  }

  async updateConfig(updates: Partial<AIServiceConfig>): Promise<void> {
    this.config = { ...this.config, ...updates }
  }
}

class GenericAdapter extends AIServiceAdapter {
  async initialize(): Promise<void> {
    console.log(`🤖 Generic adapter initialized for ${this.config.name}`)
  }

  async processRequest(request: AIRequest): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))
    
    return {
      content: `Generic response from ${this.config.name}`,
      tokensUsed: Math.floor(Math.random() * 600) + 200,
      cost: 0.01,
      confidence: 0.7 + Math.random() * 0.2
    }
  }

  async shutdown(): Promise<void> {
    console.log(`🤖 Generic adapter shutdown for ${this.config.name}`)
  }

  async updateConfig(updates: Partial<AIServiceConfig>): Promise<void> {
    this.config = { ...this.config, ...updates }
  }
}

class ServiceHealthMonitor {
  private metrics: Map<string, ServiceMetric[]> = new Map()
  private healthStatus: Map<string, ServiceHealth> = new Map()

  addService(serviceName: string): void {
    this.metrics.set(serviceName, [])
    this.healthStatus.set(serviceName, {
      serviceName,
      status: 'healthy',
      responseTime: 0,
      errorRate: 0,
      lastChecked: new Date()
    })
  }

  removeService(serviceName: string): void {
    this.metrics.delete(serviceName)
    this.healthStatus.delete(serviceName)
  }

  recordMetric(serviceName: string, metric: ServiceMetric): void {
    const serviceMetrics = this.metrics.get(serviceName) || []
    serviceMetrics.push(metric)
    
    // 最新の100件のみ保持
    if (serviceMetrics.length > 100) {
      serviceMetrics.shift()
    }
    
    this.metrics.set(serviceName, serviceMetrics)
    this.updateHealthStatus(serviceName)
  }

  async getServiceHealth(serviceName: string): Promise<ServiceHealth | null> {
    return this.healthStatus.get(serviceName) || null
  }

  async getAllServiceHealth(): Promise<ServiceHealth[]> {
    return Array.from(this.healthStatus.values())
  }

  async getServiceMetrics(serviceName: string, timeRange?: TimeRange): Promise<ServiceMetrics> {
    const metrics = this.metrics.get(serviceName) || []
    
    const totalRequests = metrics.length
    const successfulRequests = metrics.filter(m => m.success).length
    const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests || 0
    const errorRate = totalRequests > 0 ? (totalRequests - successfulRequests) / totalRequests : 0
    const totalCost = metrics.reduce((sum, m) => sum + m.cost, 0)
    
    return {
      requests: totalRequests,
      avgResponseTime,
      errorRate,
      cost: totalCost,
      satisfaction: 0.85 // プレースホルダー
    }
  }

  private updateHealthStatus(serviceName: string): void {
    const metrics = this.metrics.get(serviceName) || []
    if (metrics.length === 0) return

    const recentMetrics = metrics.slice(-10) // 最新10件
    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length
    const errorRate = recentMetrics.filter(m => !m.success).length / recentMetrics.length

    let status: 'healthy' | 'degraded' | 'down' = 'healthy'
    
    if (errorRate > 0.5) {
      status = 'down'
    } else if (errorRate > 0.2 || avgResponseTime > 10000) {
      status = 'degraded'
    }

    this.healthStatus.set(serviceName, {
      serviceName,
      status,
      responseTime: avgResponseTime,
      errorRate,
      lastChecked: new Date()
    })
  }
}

class LoadBalancer {
  // 将来の実装: 負荷分散ロジック
  selectService(availableServices: string[]): string {
    return availableServices[Math.floor(Math.random() * availableServices.length)]
  }
}

class CostOptimizer {
  // 将来の実装: コスト最適化ロジック
  optimizeForCost(services: string[], budget: number): string[] {
    return services
  }
}