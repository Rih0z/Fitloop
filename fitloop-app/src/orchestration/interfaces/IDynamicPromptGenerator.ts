/**
 * Dynamic Prompt Generation System Interface
 * Provides intelligent, context-aware prompt generation for multiple AI services
 */

export interface AIService {
  name: 'claude' | 'chatgpt' | 'gemini' | 'custom';
  version?: string;
  capabilities: {
    maxTokens: number;
    supportsImages: boolean;
    supportsStreaming: boolean;
    supportsFunctionCalling: boolean;
    preferredLanguages: string[];
    specializations: string[];
  };
  promptConstraints: {
    maxPromptLength: number;
    preferredFormat: 'markdown' | 'json' | 'plain_text';
    systemMessageSupport: boolean;
    contextWindowSize: number;
  };
  rateLimits: {
    requestsPerMinute: number;
    tokensPerMinute: number;
    dailyLimit?: number;
  };
}

export interface PromptPersonalization {
  userExpertiseLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  communicationStyle: 'encouraging' | 'direct' | 'technical' | 'casual' | 'motivational';
  preferredDetailLevel: 'minimal' | 'moderate' | 'detailed' | 'comprehensive';
  languagePreference: string;
  culturalContext?: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  attentionSpan: 'short' | 'medium' | 'long';
  motivationalTriggers: string[];
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: 'training' | 'analysis' | 'motivation' | 'education' | 'planning' | 'troubleshooting';
  baseTemplate: string;
  variables: {
    name: string;
    type: 'string' | 'number' | 'array' | 'object' | 'boolean';
    required: boolean;
    defaultValue?: any;
    validation?: {
      pattern?: string;
      minLength?: number;
      maxLength?: number;
      min?: number;
      max?: number;
    };
  }[];
  aiServiceCompatibility: {
    [serviceName: string]: {
      compatible: boolean;
      adaptations?: string[];
      preferredVersion?: string;
    };
  };
  complexityLevels: {
    beginner: string;
    intermediate: string;
    advanced: string;
    expert: string;
  };
  contextRequirements: string[];
  expectedOutputFormat: string;
  version: string;
  lastUpdated: Date;
}

export interface PromptChain {
  chainId: string;
  name: string;
  description: string;
  steps: {
    stepId: string;
    templateId: string;
    dependsOn: string[];
    conditions?: {
      field: string;
      operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'exists';
      value: any;
    }[];
    transformations?: {
      type: 'extract' | 'summarize' | 'validate' | 'enrich';
      config: any;
    }[];
    failureHandling: {
      strategy: 'retry' | 'skip' | 'fallback' | 'abort';
      maxRetries?: number;
      fallbackTemplateId?: string;
    };
  }[];
  parallelExecution: boolean;
  timeoutMs: number;
  version: string;
}

export interface PromptGenerationRequest {
  userId: string;
  requestType: string;
  templateId?: string;
  chainId?: string;
  targetAIService: AIService;
  personalization: PromptPersonalization;
  contextData: any;
  variables?: Record<string, any>;
  adaptiveParameters: {
    urgency: 'low' | 'medium' | 'high';
    complexity: 'auto' | 'simple' | 'moderate' | 'complex';
    length: 'auto' | 'short' | 'medium' | 'long';
    focus: string[];
  };
  constraints?: {
    maxLength?: number;
    format?: string;
    language?: string;
    tone?: string;
  };
}

export interface GeneratedPrompt {
  promptId: string;
  content: string;
  metadata: {
    templateId: string;
    aiService: AIService;
    personalizationApplied: PromptPersonalization;
    generationTimestamp: Date;
    estimatedTokens: number;
    complexity: string;
    contextUsed: string[];
    adaptations: string[];
  };
  systemMessage?: string;
  expectedResponseFormat: string;
  followUpPrompts?: {
    condition: string;
    promptId: string;
  }[];
  qualityMetrics: {
    relevanceScore: number;
    personalizedScore: number;
    clarityScore: number;
    completenessScore: number;
  };
  version: string;
}

export interface PromptOptimization {
  originalPrompt: string;
  optimizedPrompt: string;
  optimizations: {
    type: 'length_reduction' | 'clarity_improvement' | 'personalization' | 'service_adaptation';
    description: string;
    impact: 'low' | 'medium' | 'high';
  }[];
  performanceImprovement: {
    tokenReduction: number;
    clarityIncrease: number;
    relevanceIncrease: number;
  };
  timestamp: Date;
}

export interface IDynamicPromptGenerator {
  /**
   * Generate a personalized prompt based on user context and AI service
   */
  generatePrompt(request: PromptGenerationRequest): Promise<GeneratedPrompt>;

  /**
   * Execute a prompt chain for complex workflows
   */
  executePromptChain(chainId: string, request: PromptGenerationRequest): Promise<{
    results: GeneratedPrompt[];
    executionOrder: string[];
    totalExecutionTime: number;
    success: boolean;
    errors?: string[];
  }>;

  /**
   * Adapt prompt for specific AI service
   */
  adaptPromptForService(prompt: GeneratedPrompt, targetService: AIService): Promise<GeneratedPrompt>;

  /**
   * Optimize prompt for better performance
   */
  optimizePrompt(prompt: string, criteria: {
    maxTokens?: number;
    targetAudience?: string;
    optimizationGoals: ('clarity' | 'brevity' | 'engagement' | 'accuracy')[];
  }): Promise<PromptOptimization>;

  /**
   * Register new prompt template
   */
  registerTemplate(template: PromptTemplate): Promise<void>;

  /**
   * Update existing prompt template
   */
  updateTemplate(templateId: string, updates: Partial<PromptTemplate>): Promise<void>;

  /**
   * Create prompt chain for complex workflows
   */
  createPromptChain(chain: PromptChain): Promise<void>;

  /**
   * Get available templates by category
   */
  getTemplatesByCategory(category: string): Promise<PromptTemplate[]>;

  /**
   * Validate prompt against AI service constraints
   */
  validatePrompt(prompt: string, service: AIService): Promise<{
    valid: boolean;
    issues: string[];
    suggestions: string[];
  }>;

  /**
   * Get personalization recommendations for user
   */
  getPersonalizationRecommendations(userId: string): Promise<PromptPersonalization>;

  /**
   * A/B test different prompt variations
   */
  createPromptVariations(basePrompt: string, variationCount: number): Promise<{
    variations: GeneratedPrompt[];
    testingStrategy: string;
  }>;

  /**
   * Analyze prompt effectiveness
   */
  analyzePromptEffectiveness(promptId: string, userFeedback: any): Promise<{
    effectivenessScore: number;
    improvements: string[];
    shouldRetire: boolean;
  }>;
}