// Core orchestration types
export interface UserContext {
  userId: string
  sessionId: string
  timestamp: Date
  
  // Emotional State
  emotionalState: {
    mood: 'excellent' | 'good' | 'neutral' | 'low' | 'poor'
    energy: 'high' | 'medium' | 'low'
    confidence: 'very_high' | 'high' | 'medium' | 'low' | 'very_low'
    motivation: 'peak' | 'high' | 'medium' | 'low' | 'struggling'
    stress: 'none' | 'low' | 'medium' | 'high' | 'overwhelming'
  }
  
  // Environmental Context
  environment: {
    location: 'home' | 'gym' | 'outdoor' | 'office' | 'travel'
    equipment: string[]
    spaceConstraints: 'unlimited' | 'limited' | 'very_limited'
    timeAvailable: number // minutes
    noise_level: 'silent' | 'quiet' | 'moderate' | 'loud'
  }
  
  // User Preferences
  preferences: {
    communicationStyle: 'formal' | 'casual' | 'motivational' | 'technical' | 'encouraging'
    expertiseLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    languagePreference: 'ja' | 'en'
    promptComplexity: 'simple' | 'detailed' | 'comprehensive'
  }
}

export interface ProgressMetrics {
  goalId: string
  goalType: 'strength' | 'endurance' | 'weight_loss' | 'muscle_gain' | 'general_fitness'
  currentValue: number
  targetValue: number
  unit: string
  progressRate: number // % per week
  confidenceScore: number // 0-1
  lastUpdated: Date
  milestones: Milestone[]
}

export interface Milestone {
  id: string
  description: string
  targetDate: Date
  isCompleted: boolean
  completedDate?: Date
  value: number
  unit: string
}

export interface AIServiceConfig {
  name: 'claude' | 'chatgpt' | 'gemini' | 'custom'
  endpoint?: string
  apiKey?: string
  model?: string
  maxTokens?: number
  temperature?: number
  capabilities: AICapability[]
  costPerToken?: number
  reliability?: number // 0-1
}

export interface AICapability {
  type: 'text_generation' | 'image_analysis' | 'data_extraction' | 'reasoning' | 'creativity'
  level: 'basic' | 'intermediate' | 'advanced' | 'expert'
}

export interface PromptTemplate {
  id: string
  name: string
  category: 'workout' | 'nutrition' | 'motivation' | 'analysis' | 'planning'
  template: string
  variables: TemplateVariable[]
  targetAI: string[]
  complexity: 'simple' | 'medium' | 'complex'
  effectiveness?: number // 0-1
}

export interface TemplateVariable {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  required: boolean
  defaultValue?: any
  description: string
}

export interface OrchestrationRequest {
  id: string
  type: 'workout_plan' | 'progress_analysis' | 'motivation' | 'data_extraction' | 'custom'
  context: UserContext
  priority: 'low' | 'medium' | 'high' | 'urgent'
  inputData?: any
  constraints?: RequestConstraints
  metadata?: Record<string, any>
}

export interface RequestConstraints {
  maxExecutionTime?: number // milliseconds
  preferredAI?: string[]
  excludeAI?: string[]
  requireRealTime?: boolean
  maxCost?: number
}

export interface OrchestrationResponse {
  requestId: string
  success: boolean
  data?: any
  error?: OrchestrationError
  metadata: ResponseMetadata
  performanceMetrics: PerformanceMetrics
}

export interface OrchestrationError {
  code: string
  message: string
  type: 'validation' | 'ai_service' | 'timeout' | 'rate_limit' | 'system'
  details?: any
  retryable: boolean
}

export interface ResponseMetadata {
  aiService: string
  model: string
  promptUsed: string
  tokensUsed?: number
  cost?: number
  confidence: number // 0-1
  executionTime: number // milliseconds
}

export interface PerformanceMetrics {
  responseTime: number
  cpuUsage?: number
  memoryUsage?: number
  cacheHit?: boolean
  accuracy?: number
  userSatisfaction?: number
}

export interface LearningData {
  requestId: string
  userFeedback?: 'positive' | 'neutral' | 'negative'
  effectivenessScore?: number // 0-1
  usagePatterns: UsagePattern[]
  outcomes: LearningOutcome[]
}

export interface UsagePattern {
  pattern: string
  frequency: number
  context: Partial<UserContext>
  effectiveness: number
}

export interface LearningOutcome {
  type: 'goal_achieved' | 'behavior_change' | 'engagement_increase' | 'satisfaction_increase'
  value: number
  confidence: number
  attribution: string[] // which factors contributed
}

export interface DataExtractionRequest {
  id: string
  type: 'image' | 'text' | 'audio' | 'video'
  data: string | Blob
  extractionTargets: ExtractionTarget[]
  options?: ExtractionOptions
}

export interface ExtractionTarget {
  name: string
  type: 'workout_data' | 'nutrition_info' | 'body_measurements' | 'progress_photo' | 'custom'
  format: 'number' | 'string' | 'date' | 'object' | 'array'
  validation?: ValidationRule[]
}

export interface ValidationRule {
  type: 'range' | 'pattern' | 'required' | 'custom'
  value: any
  message: string
}

export interface ExtractionOptions {
  ocrProvider?: 'tesseract' | 'google_vision' | 'azure' | 'aws'
  imagePreprocessing?: boolean
  multiLanguage?: boolean
  structureOutput?: boolean
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical'
  components: ComponentHealth[]
  lastChecked: Date
  uptime: number
  resourceUsage: ResourceUsage
}

export interface ComponentHealth {
  name: string
  status: 'up' | 'down' | 'degraded'
  responseTime?: number
  errorRate?: number
  lastError?: string
}

export interface ResourceUsage {
  cpu: number // 0-100
  memory: number // 0-100
  disk: number // 0-100
  network: number // bytes/second
}