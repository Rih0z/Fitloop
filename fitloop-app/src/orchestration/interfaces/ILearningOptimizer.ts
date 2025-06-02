/**
 * Learning & Optimization System Interface
 * Provides intelligent analysis, A/B testing, and continuous improvement
 */

export interface UsagePattern {
  patternId: string;
  userId: string;
  patternType: 'temporal' | 'behavioral' | 'contextual' | 'performance';
  pattern: {
    name: string;
    description: string;
    frequency: number; // how often this pattern occurs
    confidence: number; // 0-1 confidence in pattern detection
    triggers: string[]; // what triggers this pattern
    outcomes: string[]; // what typically happens when this pattern occurs
  };
  detectionMetrics: {
    sampleSize: number;
    detectionDate: Date;
    lastOccurrence: Date;
    predictivePower: number; // how well this pattern predicts outcomes
  };
  contextFactors: {
    timeOfDay?: string[];
    dayOfWeek?: string[];
    emotionalState?: string[];
    environmentalFactors?: string[];
    externalFactors?: string[];
  };
  metadata: {
    detectionMethod: string;
    accuracy: number;
    stability: number; // how consistent this pattern is over time
  };
}

export interface EffectivenessMetric {
  metricId: string;
  userId: string;
  componentType: 'prompt' | 'ai_service' | 'data_extraction' | 'recommendation' | 'user_interface';
  componentId: string;
  metricType: 'engagement' | 'accuracy' | 'user_satisfaction' | 'goal_achievement' | 'efficiency';
  measurements: {
    timestamp: Date;
    value: number; // 0-1 normalized score
    context: any;
    comparisonBaseline: number;
  }[];
  trends: {
    shortTerm: 'improving' | 'stable' | 'declining'; // last 7 days
    mediumTerm: 'improving' | 'stable' | 'declining'; // last 30 days
    longTerm: 'improving' | 'stable' | 'declining'; // last 90 days
  };
  insights: {
    effectivenessScore: number; // overall effectiveness 0-1
    confidenceInterval: { min: number; max: number; };
    significantFactors: string[];
    recommendations: string[];
  };
}

export interface ABTestConfiguration {
  testId: string;
  name: string;
  description: string;
  testType: 'prompt_variation' | 'ai_service_selection' | 'ui_component' | 'algorithm_parameter' | 'user_experience';
  variants: {
    variantId: string;
    name: string;
    description: string;
    configuration: any;
    weight: number; // traffic allocation percentage
    targetAudience?: {
      userSegments: string[];
      criteria: any;
    };
  }[];
  successMetrics: {
    primary: {
      metric: string;
      target: number;
      minimumDetectableEffect: number;
    };
    secondary: {
      metric: string;
      target?: number;
    }[];
  };
  testParameters: {
    duration: number; // days
    minimumSampleSize: number;
    maxUsers: number;
    confidenceLevel: number; // 0.95 for 95%
    powerAnalysis: number; // 0.8 for 80% power
  };
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  results?: ABTestResults;
}

export interface ABTestResults {
  testId: string;
  status: 'running' | 'completed' | 'inconclusive';
  duration: number; // actual days run
  participants: {
    total: number;
    byVariant: { [variantId: string]: number };
  };
  metrics: {
    [metricName: string]: {
      overall: {
        mean: number;
        standardDeviation: number;
        confidenceInterval: { min: number; max: number; };
      };
      byVariant: {
        [variantId: string]: {
          mean: number;
          standardDeviation: number;
          confidenceInterval: { min: number; max: number; };
          sampleSize: number;
        };
      };
      statisticalSignificance: {
        pValue: number;
        isSignificant: boolean;
        effectSize: number;
        winner?: string;
      };
    };
  };
  insights: {
    summary: string;
    keyFindings: string[];
    recommendations: {
      action: 'deploy_winner' | 'continue_testing' | 'modify_test' | 'stop_test';
      reasoning: string;
      nextSteps: string[];
    };
  };
  completedAt: Date;
}

export interface ContinuousImprovementPlan {
  planId: string;
  userId?: string; // if user-specific, otherwise system-wide
  targetComponent: string;
  currentPerformance: {
    baseline: number;
    current: number;
    target: number;
  };
  improvementStrategies: {
    strategyId: string;
    type: 'algorithmic' | 'data_driven' | 'user_feedback' | 'ab_testing' | 'ml_model';
    description: string;
    expectedImpact: number; // expected improvement percentage
    implementationEffort: 'low' | 'medium' | 'high';
    timeline: number; // days
    dependencies: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'planned' | 'in_progress' | 'testing' | 'deployed' | 'completed';
  metrics: {
    trackingMetrics: string[];
    reviewFrequency: number; // days
    successCriteria: any;
  };
  timeline: {
    startDate: Date;
    expectedCompletion: Date;
    milestones: {
      name: string;
      date: Date;
      completed: boolean;
    }[];
  };
}

export interface LearningInsight {
  insightId: string;
  type: 'user_behavior' | 'system_performance' | 'content_effectiveness' | 'prediction' | 'anomaly';
  severity: 'info' | 'warning' | 'critical';
  confidence: number; // 0-1
  insight: {
    title: string;
    description: string;
    evidence: string[];
    implications: string[];
    recommendations: string[];
  };
  affectedComponents: string[];
  affectedUsers?: string[]; // specific users or user segments
  metadata: {
    discoveryMethod: string;
    dataSource: string[];
    analysisDate: Date;
    reviewStatus: 'pending' | 'reviewed' | 'acted_upon' | 'dismissed';
  };
  actionItems: {
    actionId: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    assignee?: string;
    dueDate?: Date;
    status: 'pending' | 'in_progress' | 'completed';
  }[];
}

export interface ModelPerformance {
  modelId: string;
  modelType: 'prompt_generation' | 'data_extraction' | 'user_prediction' | 'recommendation' | 'classification';
  version: string;
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    auc: number;
    customMetrics?: { [metricName: string]: number };
  };
  trainingData: {
    sampleSize: number;
    lastTrainingDate: Date;
    dataQuality: number;
    featureImportance: { [feature: string]: number };
  };
  validationResults: {
    validationAccuracy: number;
    crossValidationScore: number;
    overfitting: boolean;
    bias: { [dimension: string]: number };
  };
  driftDetection: {
    lastCheck: Date;
    driftDetected: boolean;
    driftScore: number;
    triggeredRetraining: boolean;
  };
  recommendations: {
    retrainingSuggested: boolean;
    dataAugmentationNeeded: boolean;
    featureEngineering: string[];
    hyperparameterTuning: boolean;
  };
}

export interface ILearningOptimizer {
  /**
   * Analyze user usage patterns
   */
  analyzeUsagePatterns(userId: string, timeRange: { start: Date; end: Date }): Promise<{
    patterns: UsagePattern[];
    insights: LearningInsight[];
    recommendations: string[];
  }>;

  /**
   * Track effectiveness of system components
   */
  trackEffectiveness(measurements: {
    componentType: string;
    componentId: string;
    metricType: string;
    value: number;
    context: any;
    userId: string;
  }[]): Promise<void>;

  /**
   * Get effectiveness metrics for component
   */
  getEffectivenessMetrics(componentId: string, timeRange?: { start: Date; end: Date }): Promise<EffectivenessMetric>;

  /**
   * Create and configure A/B test
   */
  createABTest(config: Omit<ABTestConfiguration, 'testId' | 'status'>): Promise<ABTestConfiguration>;

  /**
   * Start A/B test
   */
  startABTest(testId: string): Promise<{ started: boolean; participants: number; }>;

  /**
   * Get A/B test assignment for user
   */
  getABTestVariant(testId: string, userId: string): Promise<{
    variantId: string;
    variantConfig: any;
    trackingData: any;
  }>;

  /**
   * Record A/B test event
   */
  recordABTestEvent(testId: string, userId: string, eventType: string, eventData: any): Promise<void>;

  /**
   * Get A/B test results
   */
  getABTestResults(testId: string): Promise<ABTestResults>;

  /**
   * Stop A/B test and analyze results
   */
  completeABTest(testId: string): Promise<ABTestResults>;

  /**
   * Generate continuous improvement plans
   */
  generateImprovementPlans(targetComponents?: string[]): Promise<ContinuousImprovementPlan[]>;

  /**
   * Execute improvement strategy
   */
  executeImprovement(planId: string, strategyId: string): Promise<{
    executed: boolean;
    deploymentId: string;
    rollbackPlan: any;
  }>;

  /**
   * Monitor model performance and drift
   */
  monitorModelPerformance(modelId: string): Promise<ModelPerformance>;

  /**
   * Trigger model retraining
   */
  triggerModelRetraining(modelId: string, reason: string): Promise<{
    retrainingJobId: string;
    estimatedCompletion: Date;
    newModelVersion: string;
  }>;

  /**
   * Discover learning insights
   */
  discoverInsights(analysisScope: {
    userId?: string;
    components?: string[];
    timeRange: { start: Date; end: Date };
    insightTypes?: string[];
  }): Promise<LearningInsight[]>;

  /**
   * Get personalized recommendations
   */
  getPersonalizedRecommendations(userId: string, context: any): Promise<{
    recommendations: {
      type: string;
      content: string;
      confidence: number;
      reasoning: string;
      actionable: boolean;
    }[];
    personalizedInsights: string[];
    adaptations: any;
  }>;

  /**
   * Update learning models with feedback
   */
  provideFeedback(feedbackType: string, componentId: string, userId: string, feedback: {
    rating: number;
    comments?: string;
    correctiveData?: any;
  }): Promise<{
    feedbackRecorded: boolean;
    learningTriggered: boolean;
    immediateAdaptations: any;
  }>;

  /**
   * Predict user behavior/needs
   */
  predictUserBehavior(userId: string, predictionType: string, horizon: number): Promise<{
    predictions: {
      category: string;
      prediction: any;
      confidence: number;
      timeframe: string;
    }[];
    uncertainty: number;
    factors: string[];
  }>;

  /**
   * Optimize system parameters automatically
   */
  optimizeSystemParameters(component: string, optimizationGoals: string[]): Promise<{
    optimizedParameters: { [param: string]: any };
    expectedImprovement: number;
    testingPlan: any;
  }>;

  /**
   * Get learning system health
   */
  getSystemHealth(): Promise<{
    overallHealth: 'healthy' | 'warning' | 'critical';
    components: {
      [component: string]: {
        status: 'healthy' | 'degraded' | 'failing';
        metrics: any;
        lastCheck: Date;
      };
    };
    recommendations: string[];
  }>;

  /**
   * Export learning data for analysis
   */
  exportLearningData(exportConfig: {
    dataTypes: string[];
    timeRange: { start: Date; end: Date };
    format: 'json' | 'csv' | 'parquet';
    includePersonalData: boolean;
  }): Promise<{
    exportId: string;
    downloadUrl: string;
    size: number;
    expiration: Date;
  }>;

  /**
   * Configure learning parameters
   */
  configureLearning(config: {
    patternDetectionSensitivity: number;
    abTestAutoStop: boolean;
    modelRetrainingThreshold: number;
    insightDeliveryFrequency: string;
    privacyLevel: 'high' | 'medium' | 'low';
  }): Promise<void>;
}