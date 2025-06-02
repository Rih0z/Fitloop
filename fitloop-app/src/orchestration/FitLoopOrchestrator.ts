/**
 * FitLoop Prompt Orchestration System - Main Orchestrator
 * Coordinates all subsystems to provide seamless AI-powered fitness coaching
 */

import type { UserProfile } from '../models/user';
import type { Context } from '../models/context';
import type { IContextManager } from './interfaces/IContextManager';
import type { IDynamicPromptGenerator, PromptGenerationRequest, GeneratedPrompt } from './interfaces/IDynamicPromptGenerator';
import type { IAIServiceOrchestrator, AIRequest, AIResponse } from './interfaces/IAIServiceOrchestrator';
import type { IDataPipeline, ImageAnalysisRequest } from './interfaces/IDataPipeline';
import type { ILearningOptimizer } from './interfaces/ILearningOptimizer';

export interface OrchestrationRequest {
  requestId: string;
  userId: string;
  type: 'training_guidance' | 'progress_analysis' | 'motivation' | 'data_import' | 'planning' | 'troubleshooting';
  priority: 'low' | 'medium' | 'high' | 'critical';
  input: {
    text?: string;
    image?: ArrayBuffer;
    context?: any;
    metadata?: any;
  };
  preferences?: {
    aiService?: string;
    responseFormat?: string;
    detailLevel?: 'minimal' | 'moderate' | 'detailed';
    tone?: 'encouraging' | 'direct' | 'technical';
  };
  adaptiveOptions?: {
    enablePersonalization: boolean;
    enableLearning: boolean;
    enableFallback: boolean;
  };
}

export interface OrchestrationResponse {
  responseId: string;
  requestId: string;
  success: boolean;
  content: string;
  structuredData?: any;
  metadata: {
    processingTime: number;
    servicesUsed: string[];
    aiModelsUsed: string[];
    dataExtracted?: any;
    learningInsights?: string[];
    adaptations?: any;
  };
  followUpSuggestions?: string[];
  error?: {
    type: string;
    message: string;
    recoverable: boolean;
  };
  timestamp: Date;
}

export class FitLoopOrchestrator {
  private contextManager: IContextManager;
  private promptGenerator: IDynamicPromptGenerator;
  private aiOrchestrator: IAIServiceOrchestrator;
  private dataPipeline: IDataPipeline;
  private learningOptimizer: ILearningOptimizer;

  constructor(
    contextManager: IContextManager,
    promptGenerator: IDynamicPromptGenerator,
    aiOrchestrator: IAIServiceOrchestrator,
    dataPipeline: IDataPipeline,
    learningOptimizer: ILearningOptimizer
  ) {
    this.contextManager = contextManager;
    this.promptGenerator = promptGenerator;
    this.aiOrchestrator = aiOrchestrator;
    this.dataPipeline = dataPipeline;
    this.learningOptimizer = learningOptimizer;
  }

  /**
   * Main orchestration method - handles all types of user requests
   */
  async processRequest(request: OrchestrationRequest): Promise<OrchestrationResponse> {
    const startTime = Date.now();
    const responseId = `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // 1. Initialize response tracking
      await this.trackRequestStart(request);

      // 2. Get current user context
      const userContext = await this.contextManager.getCurrentContext(request.userId);
      
      // 3. Analyze context for readiness and adaptations needed
      const contextAnalysis = await this.contextManager.analyzeContext(request.userId);

      // 4. Route request based on type and context
      const routingDecision = await this.determineProcessingRoute(request, contextAnalysis);

      let content = '';
      let structuredData: any = undefined;
      const servicesUsed: string[] = [];
      const aiModelsUsed: string[] = [];
      let dataExtracted: any = undefined;

      // 5. Process based on routing decision
      switch (routingDecision.primaryRoute) {
        case 'image_analysis_first':
          const analysisResult = await this.processImageFirst(request);
          content = analysisResult.content;
          structuredData = analysisResult.structuredData;
          dataExtracted = analysisResult.dataExtracted;
          servicesUsed.push(...analysisResult.servicesUsed);
          break;

        case 'ai_generation_first':
          const generationResult = await this.processAIFirst(request, userContext, contextAnalysis);
          content = generationResult.content;
          servicesUsed.push(...generationResult.servicesUsed);
          aiModelsUsed.push(...generationResult.aiModelsUsed);
          break;

        case 'hybrid_processing':
          const hybridResult = await this.processHybrid(request, userContext, contextAnalysis);
          content = hybridResult.content;
          structuredData = hybridResult.structuredData;
          dataExtracted = hybridResult.dataExtracted;
          servicesUsed.push(...hybridResult.servicesUsed);
          aiModelsUsed.push(...hybridResult.aiModelsUsed);
          break;

        case 'context_analysis_only':
          const contextResult = await this.processContextAnalysis(request, userContext, contextAnalysis);
          content = contextResult.content;
          servicesUsed.push('context_manager');
          break;
      }

      // 6. Apply learning and personalization if enabled
      let learningInsights: string[] = [];
      let adaptations: any = {};
      
      if (request.adaptiveOptions?.enableLearning) {
        learningInsights = await this.applyLearning(request, content, userContext);
      }

      if (request.adaptiveOptions?.enablePersonalization) {
        adaptations = await this.applyPersonalization(request, userContext, contextAnalysis);
      }

      // 7. Generate follow-up suggestions
      const followUpSuggestions = await this.generateFollowUpSuggestions(
        request,
        content,
        structuredData,
        userContext
      );

      // 8. Update user context based on interaction
      await this.updateContextPostInteraction(request, content, userContext);

      // 9. Track success metrics
      await this.trackRequestSuccess(request, responseId, {
        processingTime: Date.now() - startTime,
        servicesUsed,
        aiModelsUsed
      });

      return {
        responseId,
        requestId: request.requestId,
        success: true,
        content,
        structuredData,
        metadata: {
          processingTime: Date.now() - startTime,
          servicesUsed,
          aiModelsUsed,
          dataExtracted,
          learningInsights,
          adaptations
        },
        followUpSuggestions,
        timestamp: new Date()
      };

    } catch (error) {
      // Handle errors gracefully
      return await this.handleError(request, responseId, error, Date.now() - startTime);
    }
  }

  /**
   * Initialize new user in the orchestration system
   */
  async initializeUser(userProfile: UserProfile): Promise<{
    initialized: boolean;
    contextId: string;
    recommendations: string[];
  }> {
    try {
      // Initialize context management
      const userContext = await this.contextManager.initializeContext(
        userProfile.id!.toString(),
        userProfile
      );

      // Set up learning baseline
      await this.learningOptimizer.configureLearning({
        patternDetectionSensitivity: 0.7,
        abTestAutoStop: true,
        modelRetrainingThreshold: 0.05,
        insightDeliveryFrequency: 'weekly',
        privacyLevel: 'medium'
      });

      // Generate initial recommendations
      const recommendations = await this.generateInitialRecommendations(userProfile, userContext);

      return {
        initialized: true,
        contextId: userContext.userId,
        recommendations
      };

    } catch (error) {
      throw new Error(`User initialization failed: ${error.message}`);
    }
  }

  /**
   * Get comprehensive user insights and recommendations
   */
  async getUserInsights(userId: string): Promise<{
    contextAnalysis: any;
    usagePatterns: any[];
    personalizedRecommendations: any;
    progressInsights: string[];
    adaptations: any;
  }> {
    const contextAnalysis = await this.contextManager.analyzeContext(userId);
    
    const patternsResult = await this.learningOptimizer.analyzeUsagePatterns(userId, {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date()
    });

    const personalizedRecommendations = await this.learningOptimizer.getPersonalizedRecommendations(
      userId,
      { requestType: 'insights' }
    );

    const progressInsights = await this.generateProgressInsights(userId);
    
    return {
      contextAnalysis,
      usagePatterns: patternsResult.patterns,
      personalizedRecommendations,
      progressInsights,
      adaptations: personalizedRecommendations.adaptations
    };
  }

  /**
   * Process batch requests efficiently
   */
  async processBatchRequests(requests: OrchestrationRequest[]): Promise<OrchestrationResponse[]> {
    // Group requests by type for efficient processing
    const requestGroups = this.groupRequestsByType(requests);
    const results: OrchestrationResponse[] = [];

    // Process similar requests in parallel
    for (const [type, groupRequests] of Object.entries(requestGroups)) {
      const batchResults = await this.processBatchByType(type, groupRequests);
      results.push(...batchResults);
    }

    return results;
  }

  // Private helper methods

  private async trackRequestStart(request: OrchestrationRequest): Promise<void> {
    await this.learningOptimizer.trackEffectiveness([{
      componentType: 'orchestrator',
      componentId: 'main',
      metricType: 'request_started',
      value: 1,
      context: { requestType: request.type, priority: request.priority },
      userId: request.userId
    }]);
  }

  private async determineProcessingRoute(
    request: OrchestrationRequest, 
    contextAnalysis: any
  ): Promise<{ primaryRoute: string; reasoning: string; }> {
    // Decision logic based on request type and context
    if (request.input.image && request.type === 'data_import') {
      return {
        primaryRoute: 'image_analysis_first',
        reasoning: 'Image data requires extraction before AI processing'
      };
    }

    if (request.type === 'training_guidance' && contextAnalysis.readinessScore < 0.3) {
      return {
        primaryRoute: 'context_analysis_only',
        reasoning: 'Low readiness score requires context-based guidance'
      };
    }

    if (request.input.image && request.input.text) {
      return {
        primaryRoute: 'hybrid_processing',
        reasoning: 'Both image and text inputs require combined processing'
      };
    }

    return {
      primaryRoute: 'ai_generation_first',
      reasoning: 'Standard text-based request suitable for direct AI processing'
    };
  }

  private async processImageFirst(request: OrchestrationRequest): Promise<{
    content: string;
    structuredData?: any;
    dataExtracted?: any;
    servicesUsed: string[];
  }> {
    // Process image first, then generate AI response
    const analysisRequest: ImageAnalysisRequest = {
      requestId: `img_${request.requestId}`,
      userId: request.userId,
      imageData: {
        source: 'upload',
        format: 'png', // Would detect actual format
        size: { width: 800, height: 600 },
        data: request.input.image!,
        timestamp: new Date()
      },
      analysisType: this.mapRequestTypeToAnalysisType(request.type),
      priority: request.priority,
      options: {
        performOCR: true,
        extractStructuredData: true,
        requiresValidation: true,
        enhanceImage: true,
        detectLanguage: false
      },
      context: {
        expectedDataTypes: [request.type],
        userPreferences: request.preferences || {},
        sessionContext: request.input.context || {}
      },
      metadata: {}
    };

    const imageResult = await this.dataPipeline.processImage(analysisRequest);
    
    // Generate AI response based on extracted data
    const aiContent = await this.generateAIResponseForData(
      request,
      imageResult.structuredData?.extractedData
    );

    return {
      content: aiContent,
      structuredData: imageResult.structuredData,
      dataExtracted: imageResult.structuredData?.extractedData,
      servicesUsed: ['data_pipeline', 'ai_orchestrator']
    };
  }

  private async processAIFirst(
    request: OrchestrationRequest,
    userContext: any,
    contextAnalysis: any
  ): Promise<{
    content: string;
    servicesUsed: string[];
    aiModelsUsed: string[];
  }> {
    // Generate AI response directly from text input
    const promptRequest = await this.buildPromptRequest(request, userContext, contextAnalysis);
    const generatedPrompt = await this.promptGenerator.generatePrompt(promptRequest);
    
    const aiRequest = await this.buildAIRequest(request, generatedPrompt);
    const aiResponse = await this.aiOrchestrator.processRequest(aiRequest);

    return {
      content: aiResponse.content,
      servicesUsed: ['prompt_generator', 'ai_orchestrator'],
      aiModelsUsed: [aiResponse.metadata.model]
    };
  }

  private async processHybrid(
    request: OrchestrationRequest,
    userContext: any,
    contextAnalysis: any
  ): Promise<{
    content: string;
    structuredData?: any;
    dataExtracted?: any;
    servicesUsed: string[];
    aiModelsUsed: string[];
  }> {
    // Process both image and text inputs
    const imageResult = request.input.image 
      ? await this.processImageFirst(request)
      : { content: '', servicesUsed: [] };

    const textResult = await this.processAIFirst(request, userContext, contextAnalysis);

    // Combine results intelligently
    const combinedContent = await this.combineResults(
      textResult.content,
      imageResult.content,
      imageResult.dataExtracted
    );

    return {
      content: combinedContent,
      structuredData: imageResult.structuredData,
      dataExtracted: imageResult.dataExtracted,
      servicesUsed: [...new Set([...imageResult.servicesUsed, ...textResult.servicesUsed])],
      aiModelsUsed: textResult.aiModelsUsed
    };
  }

  private async processContextAnalysis(
    request: OrchestrationRequest,
    userContext: any,
    contextAnalysis: any
  ): Promise<{ content: string; }> {
    // Generate response based purely on context analysis
    const contextualRecommendations = await this.contextManager.getContextualRecommendations(
      request.userId,
      request.type
    );

    return {
      content: this.formatContextualResponse(contextAnalysis, contextualRecommendations)
    };
  }

  private async applyLearning(
    request: OrchestrationRequest,
    content: string,
    userContext: any
  ): Promise<string[]> {
    // Apply learning insights to improve future responses
    const insights = await this.learningOptimizer.discoverInsights({
      userId: request.userId,
      timeRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      insightTypes: ['user_behavior', 'content_effectiveness']
    });

    return insights.map(insight => insight.insight.title);
  }

  private async applyPersonalization(
    request: OrchestrationRequest,
    userContext: any,
    contextAnalysis: any
  ): Promise<any> {
    // Apply personalization based on user patterns and preferences
    const personalizedRecs = await this.learningOptimizer.getPersonalizedRecommendations(
      request.userId,
      { requestType: request.type, context: userContext }
    );

    return personalizedRecs.adaptations;
  }

  private async generateFollowUpSuggestions(
    request: OrchestrationRequest,
    content: string,
    structuredData: any,
    userContext: any
  ): Promise<string[]> {
    // Generate contextual follow-up suggestions
    const suggestions: string[] = [];

    if (request.type === 'training_guidance') {
      suggestions.push('Log your workout results', 'Set a reminder for next session');
    }

    if (request.type === 'data_import') {
      suggestions.push('View progress chart', 'Set new goals based on data');
    }

    if (structuredData?.extractedData) {
      suggestions.push('Analyze trends', 'Compare with previous data');
    }

    return suggestions;
  }

  private async updateContextPostInteraction(
    request: OrchestrationRequest,
    content: string,
    userContext: any
  ): Promise<void> {
    // Update context based on the interaction
    await this.contextManager.updateSharedContext(request.userId, {
      lastInteraction: {
        type: request.type,
        timestamp: new Date(),
        satisfied: true // Would determine based on feedback
      }
    });
  }

  private async trackRequestSuccess(
    request: OrchestrationRequest,
    responseId: string,
    metadata: any
  ): Promise<void> {
    await this.learningOptimizer.trackEffectiveness([{
      componentType: 'orchestrator',
      componentId: 'main',
      metricType: 'request_completed',
      value: 1,
      context: { ...metadata, requestType: request.type },
      userId: request.userId
    }]);
  }

  private async handleError(
    request: OrchestrationRequest,
    responseId: string,
    error: any,
    processingTime: number
  ): Promise<OrchestrationResponse> {
    // Log error for learning
    await this.learningOptimizer.trackEffectiveness([{
      componentType: 'orchestrator',
      componentId: 'main',
      metricType: 'request_failed',
      value: 0,
      context: { error: error.message, requestType: request.type },
      userId: request.userId
    }]);

    // Provide fallback response
    const fallbackContent = this.generateFallbackResponse(request.type, error);

    return {
      responseId,
      requestId: request.requestId,
      success: false,
      content: fallbackContent,
      metadata: {
        processingTime,
        servicesUsed: ['error_handler'],
        aiModelsUsed: []
      },
      error: {
        type: error.constructor.name,
        message: error.message,
        recoverable: true
      },
      timestamp: new Date()
    };
  }

  private async generateInitialRecommendations(
    userProfile: UserProfile,
    userContext: any
  ): Promise<string[]> {
    return [
      'Complete your first workout assessment',
      'Set up progress tracking',
      'Define your primary fitness goals',
      'Take initial body measurements'
    ];
  }

  private async generateProgressInsights(userId: string): Promise<string[]> {
    // Generate insights about user's progress
    return [
      'Consistent improvement in strength metrics',
      'Workout frequency is optimal for your goals',
      'Consider adding more variety to your routine'
    ];
  }

  private groupRequestsByType(requests: OrchestrationRequest[]): { [type: string]: OrchestrationRequest[] } {
    return requests.reduce((groups, request) => {
      if (!groups[request.type]) {
        groups[request.type] = [];
      }
      groups[request.type].push(request);
      return groups;
    }, {} as { [type: string]: OrchestrationRequest[] });
  }

  private async processBatchByType(type: string, requests: OrchestrationRequest[]): Promise<OrchestrationResponse[]> {
    // Process requests of the same type in parallel
    const batchPromises = requests.map(request => this.processRequest(request));
    return await Promise.all(batchPromises);
  }

  private mapRequestTypeToAnalysisType(requestType: string): any {
    const mapping = {
      'data_import': 'workout_data',
      'progress_analysis': 'body_measurements',
      'training_guidance': 'exercise_form'
    };
    return mapping[requestType] || 'general';
  }

  private async generateAIResponseForData(request: OrchestrationRequest, extractedData: any): Promise<string> {
    // Generate AI response based on extracted structured data
    const prompt = `Based on the following fitness data: ${JSON.stringify(extractedData)}, provide ${request.type} guidance.`;
    
    const aiRequest: AIRequest = {
      requestId: `ai_${request.requestId}`,
      userId: request.userId,
      prompt,
      requestType: 'analysis',
      priority: request.priority,
      requirements: {},
      context: { userProfile: {}, sessionHistory: [], currentState: {} },
      fallbackStrategy: 'simplified_prompt',
      retryPolicy: { maxRetries: 2, retryDelay: 1000, exponentialBackoff: true },
      metadata: { source: 'data_extraction', timestamp: new Date() }
    };

    const response = await this.aiOrchestrator.processRequest(aiRequest);
    return response.content;
  }

  private async buildPromptRequest(
    request: OrchestrationRequest,
    userContext: any,
    contextAnalysis: any
  ): Promise<PromptGenerationRequest> {
    // Build prompt generation request from orchestration request
    return {
      userId: request.userId,
      requestType: request.type,
      targetAIService: { name: 'claude', capabilities: {} } as any, // Would select optimal service
      personalization: {
        userExpertiseLevel: this.determineExpertiseLevel(userContext),
        communicationStyle: request.preferences?.tone || 'encouraging',
        preferredDetailLevel: request.preferences?.detailLevel || 'moderate',
        languagePreference: 'en',
        learningStyle: 'mixed',
        attentionSpan: 'medium',
        motivationalTriggers: []
      },
      contextData: {
        userContext,
        contextAnalysis,
        requestInput: request.input
      },
      adaptiveParameters: {
        urgency: request.priority === 'critical' ? 'high' : 'medium',
        complexity: 'auto',
        length: 'auto',
        focus: [request.type]
      }
    };
  }

  private async buildAIRequest(request: OrchestrationRequest, generatedPrompt: GeneratedPrompt): Promise<AIRequest> {
    return {
      requestId: request.requestId,
      userId: request.userId,
      prompt: generatedPrompt.content,
      systemMessage: generatedPrompt.systemMessage,
      requestType: request.type,
      priority: request.priority,
      requirements: {},
      context: { userProfile: {}, sessionHistory: [], currentState: {} },
      fallbackStrategy: 'service_fallback',
      retryPolicy: { maxRetries: 2, retryDelay: 1000, exponentialBackoff: true },
      metadata: { source: 'orchestrator', timestamp: new Date() }
    };
  }

  private async combineResults(textContent: string, imageContent: string, extractedData: any): Promise<string> {
    // Intelligently combine text and image analysis results
    if (extractedData && textContent) {
      return `${textContent}\n\nBased on your uploaded data: ${imageContent}`;
    }
    return textContent || imageContent;
  }

  private formatContextualResponse(contextAnalysis: any, recommendations: any): string {
    return `Based on your current state (readiness: ${contextAnalysis.readinessScore}), here's what I recommend: ${recommendations.recommendations.join(', ')}`;
  }

  private generateFallbackResponse(requestType: string, error: any): string {
    const fallbacks = {
      'training_guidance': 'I apologize, but I encountered an issue generating your workout guidance. Please try again or contact support.',
      'progress_analysis': 'I had trouble analyzing your progress data. Please ensure your data is formatted correctly and try again.',
      'data_import': 'There was an issue processing your uploaded data. Please check the file format and try again.',
      'motivation': 'I believe in your fitness journey! Even when technology hiccups, your dedication will see you through.',
      'planning': 'I had trouble creating your plan. Let\'s start with your basic goals and build from there.',
      'troubleshooting': 'I encountered an error while troubleshooting. Please describe your issue in detail and I\'ll do my best to help.'
    };

    return fallbacks[requestType] || 'I apologize for the inconvenience. Please try your request again.';
  }

  private determineExpertiseLevel(userContext: any): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    // Analyze user context to determine expertise level
    const sessionCount = userContext.historicalPerformance?.length || 0;
    
    if (sessionCount < 10) return 'beginner';
    if (sessionCount < 50) return 'intermediate';
    if (sessionCount < 200) return 'advanced';
    return 'expert';
  }
}