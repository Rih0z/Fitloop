import type {
  UserContext,
  OrchestrationRequest,
  OrchestrationResponse,
  SystemHealth,
  LearningData,
  DataExtractionRequest
} from '../types/OrchestrationTypes'

export interface IFitLoopOrchestrator {
  // Core orchestration methods
  processRequest(request: OrchestrationRequest): Promise<OrchestrationResponse>
  
  // Context management
  updateUserContext(userId: string, context: Partial<UserContext>): Promise<void>
  getUserContext(userId: string): Promise<UserContext | null>
  
  // Health monitoring
  getSystemHealth(): Promise<SystemHealth>
  
  // Learning and optimization
  recordLearningData(data: LearningData): Promise<void>
  
  // Data extraction
  extractData(request: DataExtractionRequest): Promise<any>
  
  // Lifecycle management
  initialize(): Promise<void>
  shutdown(): Promise<void>
}

export interface IContextManager {
  // User context operations
  setUserContext(userId: string, context: UserContext): Promise<void>
  getUserContext(userId: string): Promise<UserContext | null>
  updateUserContext(userId: string, updates: Partial<UserContext>): Promise<void>
  deleteUserContext(userId: string): Promise<void>
  
  // Context analysis
  analyzeContextPatterns(userId: string, timeRange?: TimeRange): Promise<ContextAnalysis>
  predictUserNeeds(context: UserContext): Promise<PredictedNeeds>
  
  // Real-time updates
  subscribeToContextChanges(userId: string, callback: ContextChangeCallback): () => void
}

export interface IDynamicPromptGenerator {
  // Prompt generation
  generatePrompt(request: PromptGenerationRequest): Promise<GeneratedPrompt>
  generatePersonalizedPrompt(userId: string, type: string, parameters?: any): Promise<GeneratedPrompt>
  
  // Template management
  registerTemplate(template: PromptTemplate): Promise<void>
  updateTemplate(templateId: string, updates: Partial<PromptTemplate>): Promise<void>
  getTemplate(templateId: string): Promise<PromptTemplate | null>
  searchTemplates(criteria: TemplateSearchCriteria): Promise<PromptTemplate[]>
  
  // Optimization
  optimizePrompt(prompt: string, targetAI: string, context: UserContext): Promise<string>
  testPromptEffectiveness(prompt: string, metrics: EffectivenessMetrics): Promise<number>
}

export interface IAIServiceOrchestrator {
  // Service management
  registerAIService(config: AIServiceConfig): Promise<void>
  removeAIService(serviceName: string): Promise<void>
  updateServiceConfig(serviceName: string, config: Partial<AIServiceConfig>): Promise<void>
  
  // Request routing
  routeRequest(request: AIRequest): Promise<AIResponse>
  selectOptimalService(criteria: ServiceSelectionCriteria): Promise<string>
  
  // Multi-service operations
  executeParallel(requests: AIRequest[]): Promise<AIResponse[]>
  executeWithFallback(request: AIRequest, fallbackServices: string[]): Promise<AIResponse>
  
  // Monitoring
  getServiceHealth(serviceName?: string): Promise<ServiceHealth[]>
  getServiceMetrics(serviceName: string, timeRange?: TimeRange): Promise<ServiceMetrics>
}

export interface IDataPipeline {
  // Data extraction
  extractFromImage(imageData: Blob, targets: ExtractionTarget[]): Promise<ExtractionResult>
  extractFromText(text: string, targets: ExtractionTarget[]): Promise<ExtractionResult>
  
  // Data processing
  processWorkoutData(rawData: any): Promise<ProcessedWorkoutData>
  processNutritionData(rawData: any): Promise<ProcessedNutritionData>
  processProgressData(rawData: any): Promise<ProcessedProgressData>
  
  // Validation and enrichment
  validateData(data: any, schema: ValidationSchema): Promise<ValidationResult>
  enrichData(data: any, context: UserContext): Promise<EnrichedData>
  
  // Storage integration
  saveProcessedData(userId: string, data: any, type: string): Promise<void>
  getHistoricalData(userId: string, type: string, timeRange?: TimeRange): Promise<any[]>
}

export interface ILearningOptimizer {
  // Pattern analysis
  analyzeUsagePatterns(userId: string, timeRange?: TimeRange): Promise<UsageAnalysis>
  detectBehaviorChanges(userId: string): Promise<BehaviorChange[]>
  
  // Effectiveness tracking
  trackPromptEffectiveness(promptId: string, metrics: EffectivenessMetrics): Promise<void>
  getEffectivenessReport(timeRange?: TimeRange): Promise<EffectivenessReport>
  
  // A/B testing
  createABTest(test: ABTestConfig): Promise<string>
  getABTestResults(testId: string): Promise<ABTestResults>
  
  // Optimization
  optimizeUserExperience(userId: string): Promise<OptimizationRecommendations>
  continuousImprovement(): Promise<ImprovementReport>
}

// Supporting types for interfaces
export interface TimeRange {
  start: Date
  end: Date
}

export interface ContextAnalysis {
  patterns: ContextPattern[]
  trends: ContextTrend[]
  anomalies: ContextAnomaly[]
  insights: ContextInsight[]
}

export interface ContextPattern {
  type: string
  frequency: number
  confidence: number
  impact: string
}

export interface ContextTrend {
  metric: string
  direction: 'increasing' | 'decreasing' | 'stable'
  magnitude: number
  significance: number
}

export interface ContextAnomaly {
  type: string
  severity: 'low' | 'medium' | 'high'
  description: string
  timestamp: Date
}

export interface ContextInsight {
  type: string
  description: string
  actionable: boolean
  confidence: number
}

export interface PredictedNeeds {
  needs: PredictedNeed[]
  confidence: number
  timeframe: string
}

export interface PredictedNeed {
  type: string
  priority: number
  description: string
  suggestedAction: string
}

export type ContextChangeCallback = (userId: string, changes: Partial<UserContext>) => void

export interface PromptGenerationRequest {
  type: string
  context: UserContext
  parameters?: any
  constraints?: PromptConstraints
}

export interface PromptConstraints {
  maxLength?: number
  minLength?: number
  style?: string
  targetAI?: string
  complexity?: string
}

export interface GeneratedPrompt {
  id: string
  content: string
  metadata: PromptMetadata
  effectiveness?: number
}

export interface PromptMetadata {
  templateId?: string
  variables: Record<string, any>
  generatedAt: Date
  targetAI: string
  complexity: string
}

export interface TemplateSearchCriteria {
  category?: string
  complexity?: string
  targetAI?: string[]
  effectiveness?: number
  tags?: string[]
}

export interface EffectivenessMetrics {
  userEngagement: number
  goalProgress: number
  satisfactionScore: number
  completionRate: number
}

export interface AIRequest {
  id: string
  prompt: string
  context: UserContext
  service?: string
  parameters?: any
}

export interface AIResponse {
  requestId: string
  content: string
  metadata: ResponseMetadata
  success: boolean
  error?: string
}

export interface ServiceSelectionCriteria {
  capabilities: string[]
  maxCost?: number
  maxResponseTime?: number
  minReliability?: number
}

export interface ServiceHealth {
  serviceName: string
  status: 'healthy' | 'degraded' | 'down'
  responseTime: number
  errorRate: number
  lastChecked: Date
}

export interface ServiceMetrics {
  requests: number
  avgResponseTime: number
  errorRate: number
  cost: number
  satisfaction: number
}

export interface ExtractionResult {
  success: boolean
  data: any
  confidence: number
  errors?: string[]
}

export interface ProcessedWorkoutData {
  exercises: Exercise[]
  duration: number
  intensity: string
  calories?: number
  date: Date
}

export interface Exercise {
  name: string
  sets: number
  reps: number[]
  weight?: number[]
  duration?: number
  notes?: string
}

export interface ProcessedNutritionData {
  meals: Meal[]
  totalCalories: number
  macros: Macronutrients
  date: Date
}

export interface Meal {
  name: string
  foods: Food[]
  time: Date
  calories: number
}

export interface Food {
  name: string
  quantity: number
  unit: string
  calories: number
  macros: Macronutrients
}

export interface Macronutrients {
  protein: number
  carbs: number
  fat: number
  fiber?: number
}

export interface ProcessedProgressData {
  measurements: Measurement[]
  goals: GoalProgress[]
  achievements: Achievement[]
  date: Date
}

export interface Measurement {
  type: string
  value: number
  unit: string
  date: Date
}

export interface GoalProgress {
  goalId: string
  progress: number
  trend: string
  projectedCompletion?: Date
}

export interface Achievement {
  type: string
  description: string
  date: Date
  value?: number
}

export interface ValidationSchema {
  fields: FieldValidation[]
  rules: ValidationRule[]
}

export interface FieldValidation {
  name: string
  type: string
  required: boolean
  constraints?: any
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationWarning {
  field: string
  message: string
  severity: string
}

export interface EnrichedData {
  original: any
  enrichments: Enrichment[]
  confidence: number
}

export interface Enrichment {
  type: string
  value: any
  source: string
  confidence: number
}

export interface UsageAnalysis {
  patterns: UsagePattern[]
  trends: UsageTrend[]
  recommendations: UsageRecommendation[]
}

export interface UsageTrend {
  metric: string
  change: number
  period: string
  significance: number
}

export interface UsageRecommendation {
  type: string
  description: string
  impact: string
  effort: string
}

export interface BehaviorChange {
  type: string
  description: string
  confidence: number
  impact: string
  detected: Date
}

export interface EffectivenessReport {
  overall: number
  byCategory: Record<string, number>
  trends: EffectivenessTrend[]
  recommendations: string[]
}

export interface EffectivenessTrend {
  period: string
  change: number
  factors: string[]
}

export interface ABTestConfig {
  name: string
  description: string
  variants: ABTestVariant[]
  targetMetric: string
  duration: number
  sampleSize: number
}

export interface ABTestVariant {
  name: string
  weight: number
  parameters: any
}

export interface ABTestResults {
  testId: string
  status: 'running' | 'completed' | 'stopped'
  results: VariantResult[]
  winner?: string
  confidence: number
}

export interface VariantResult {
  variant: string
  participants: number
  conversionRate: number
  metric: number
  confidence: number
}

export interface OptimizationRecommendations {
  recommendations: Recommendation[]
  priority: string
  expectedImpact: number
}

export interface Recommendation {
  type: string
  description: string
  action: string
  confidence: number
}

export interface ImprovementReport {
  improvements: Improvement[]
  metrics: ImprovementMetric[]
  nextSteps: string[]
}

export interface Improvement {
  area: string
  description: string
  impact: number
  implemented: Date
}

export interface ImprovementMetric {
  name: string
  before: number
  after: number
  improvement: number
}