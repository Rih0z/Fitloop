/**
 * AI Service Orchestration System Interface
 * Manages multiple AI services with intelligent routing, fallback, and optimization
 */

export interface AIServiceConfig {
  serviceId: string;
  name: 'claude' | 'chatgpt' | 'gemini' | 'custom';
  endpoint: string;
  apiKey: string;
  version: string;
  region?: string;
  capabilities: {
    maxTokens: number;
    maxRequestsPerMinute: number;
    maxTokensPerMinute: number;
    supportsImages: boolean;
    supportsStreaming: boolean;
    supportsFunctionCalling: boolean;
    supportsSystemMessages: boolean;
    supportedLanguages: string[];
    specializations: ('text_generation' | 'code_generation' | 'analysis' | 'conversation' | 'reasoning')[];
  };
  pricing: {
    inputTokenCost: number; // cost per 1000 tokens
    outputTokenCost: number;
    currency: string;
  };
  performance: {
    averageLatency: number; // milliseconds
    reliability: number; // 0-1 score
    accuracy: number; // 0-1 score for specific tasks
  };
  status: 'active' | 'inactive' | 'maintenance' | 'degraded';
  lastHealthCheck: Date;
}

export interface AIRequest {
  requestId: string;
  userId: string;
  prompt: string;
  systemMessage?: string;
  requestType: 'training' | 'analysis' | 'planning' | 'troubleshooting' | 'motivation' | 'education';
  priority: 'low' | 'medium' | 'high' | 'critical';
  requirements: {
    maxResponseTime?: number; // milliseconds
    maxCost?: number; // in specified currency
    minAccuracy?: number; // 0-1 score
    preferredLanguage?: string;
    requiresImages?: boolean;
    requiresStreaming?: boolean;
    requiresFunctionCalling?: boolean;
  };
  context: {
    userProfile: any;
    sessionHistory: any[];
    currentState: any;
  };
  fallbackStrategy: 'none' | 'service_fallback' | 'simplified_prompt' | 'cached_response';
  retryPolicy: {
    maxRetries: number;
    retryDelay: number; // milliseconds
    exponentialBackoff: boolean;
  };
  metadata: {
    source: string;
    timestamp: Date;
    correlationId?: string;
  };
}

export interface AIResponse {
  responseId: string;
  requestId: string;
  serviceId: string;
  content: string;
  confidence: number; // 0-1 score
  reasoning?: string;
  metadata: {
    tokensUsed: {
      input: number;
      output: number;
      total: number;
    };
    processingTime: number;
    cost: number;
    model: string;
    finishReason: 'completed' | 'length_limit' | 'content_filter' | 'error';
  };
  structuredData?: any; // Parsed JSON if response contains structured data
  alternatives?: {
    content: string;
    confidence: number;
  }[];
  followUpSuggestions?: string[];
  status: 'success' | 'partial_success' | 'failure';
  error?: {
    type: string;
    message: string;
    code: string;
    retryable: boolean;
  };
  timestamp: Date;
}

export interface ServiceSelection {
  selectedService: AIServiceConfig;
  reasons: string[];
  alternatives: {
    service: AIServiceConfig;
    score: number;
    reasoning: string;
  }[];
  selectionScore: number;
  estimatedCost: number;
  estimatedTime: number;
}

export interface CrossPlatformState {
  userId: string;
  activeConversations: {
    [serviceId: string]: {
      conversationId: string;
      messageHistory: any[];
      context: any;
      lastActivity: Date;
    };
  };
  sharedContext: {
    userPreferences: any;
    learningProgress: any;
    currentGoals: any;
    recentInteractions: any[];
  };
  serviceStates: {
    [serviceId: string]: {
      usage: {
        requestsToday: number;
        tokensUsedToday: number;
        costToday: number;
      };
      performance: {
        averageResponseTime: number;
        successRate: number;
        userSatisfaction: number;
      };
      lastUsed: Date;
    };
  };
  synchronizationStatus: {
    lastSync: Date;
    pendingUpdates: string[];
    conflicts: any[];
  };
}

export interface ResponseProcessor {
  processResponse(response: AIResponse, request: AIRequest): Promise<{
    processedContent: string;
    extractedData: any;
    actionItems: string[];
    confidence: number;
    requiresFollowUp: boolean;
  }>;
}

export interface FallbackHandler {
  handleFailure(request: AIRequest, error: any, attemptedServices: string[]): Promise<{
    fallbackStrategy: string;
    fallbackRequest?: AIRequest;
    fallbackService?: string;
    useCache: boolean;
    userNotification?: string;
  }>;
}

export interface IAIServiceOrchestrator {
  /**
   * Process AI request with intelligent service selection
   */
  processRequest(request: AIRequest): Promise<AIResponse>;

  /**
   * Select best AI service for given request
   */
  selectService(request: AIRequest): Promise<ServiceSelection>;

  /**
   * Execute request on specific service
   */
  executeOnService(serviceId: string, request: AIRequest): Promise<AIResponse>;

  /**
   * Execute request on multiple services in parallel for comparison
   */
  executeParallel(request: AIRequest, serviceIds: string[]): Promise<{
    responses: AIResponse[];
    bestResponse: AIResponse;
    comparison: {
      accuracy: number[];
      speed: number[];
      cost: number[];
    };
  }>;

  /**
   * Stream response from AI service
   */
  streamResponse(request: AIRequest): AsyncIterable<{
    chunk: string;
    metadata: any;
    isComplete: boolean;
  }>;

  /**
   * Manage cross-platform state synchronization
   */
  syncStateAcrossServices(userId: string): Promise<void>;

  /**
   * Get current cross-platform state
   */
  getCrossPlatformState(userId: string): Promise<CrossPlatformState>;

  /**
   * Update shared context across all services
   */
  updateSharedContext(userId: string, context: any): Promise<void>;

  /**
   * Optimize prompt for specific service
   */
  optimizePromptForService(prompt: string, serviceId: string): Promise<string>;

  /**
   * Parse and extract structured data from response
   */
  parseResponse(response: AIResponse, expectedFormat?: string): Promise<{
    parsedData: any;
    confidence: number;
    errors: string[];
  }>;

  /**
   * Register new AI service
   */
  registerService(config: AIServiceConfig): Promise<void>;

  /**
   * Update service configuration
   */
  updateServiceConfig(serviceId: string, updates: Partial<AIServiceConfig>): Promise<void>;

  /**
   * Health check for all services
   */
  healthCheck(): Promise<{
    [serviceId: string]: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      latency: number;
      lastCheck: Date;
      issues?: string[];
    };
  }>;

  /**
   * Get service usage analytics
   */
  getUsageAnalytics(userId?: string, timeRange?: { start: Date; end: Date }): Promise<{
    requests: number;
    tokens: number;
    cost: number;
    averageLatency: number;
    successRate: number;
    serviceBreakdown: {
      [serviceId: string]: {
        requests: number;
        tokens: number;
        cost: number;
        successRate: number;
      };
    };
  }>;

  /**
   * Configure fallback strategies
   */
  configureFallback(strategy: {
    primary: string[];
    fallback: string[];
    conditions: any;
  }): Promise<void>;

  /**
   * Test service capabilities
   */
  testServiceCapabilities(serviceId: string): Promise<{
    capabilities: string[];
    performance: {
      latency: number;
      accuracy: number;
      reliability: number;
    };
    limitations: string[];
  }>;

  /**
   * Cache management for responses
   */
  getCachedResponse(requestHash: string): Promise<AIResponse | null>;
  setCachedResponse(requestHash: string, response: AIResponse, ttl?: number): Promise<void>;
  clearCache(pattern?: string): Promise<void>;

  /**
   * Rate limiting and quota management
   */
  checkRateLimit(serviceId: string, userId: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
    quotaExceeded: boolean;
  }>;

  /**
   * Cost optimization
   */
  optimizeCost(request: AIRequest): Promise<{
    recommendedService: string;
    estimatedCost: number;
    costSavings: number;
    qualityImpact: number;
  }>;

  /**
   * A/B testing for service selection
   */
  runABTest(testId: string, request: AIRequest): Promise<{
    selectedVariant: string;
    testGroup: string;
    trackingId: string;
  }>;

  /**
   * Feedback collection and learning
   */
  recordFeedback(responseId: string, feedback: {
    rating: number;
    comments?: string;
    accuracy?: number;
    helpfulness?: number;
  }): Promise<void>;

  /**
   * Service performance monitoring
   */
  getPerformanceMetrics(serviceId: string, timeRange: { start: Date; end: Date }): Promise<{
    latency: {
      p50: number;
      p95: number;
      p99: number;
    };
    reliability: number;
    accuracy: number;
    userSatisfaction: number;
    costEfficiency: number;
  }>;
}