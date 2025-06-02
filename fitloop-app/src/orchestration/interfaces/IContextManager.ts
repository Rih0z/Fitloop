/**
 * Context Management System Interface
 * Provides comprehensive user context tracking and analysis
 */

export interface EmotionalState {
  mood: 'motivated' | 'neutral' | 'stressed' | 'tired' | 'excited' | 'overwhelmed';
  energyLevel: number; // 1-10 scale
  confidence: number; // 1-10 scale
  motivation: number; // 1-10 scale
  stressLevel: number; // 1-10 scale
  lastUpdated: Date;
  source: 'self_reported' | 'inferred' | 'ai_analyzed';
}

export interface GoalProgression {
  goalId: string;
  goalType: 'strength' | 'endurance' | 'body_composition' | 'skill' | 'habit';
  currentValue: number;
  targetValue: number;
  startValue: number;
  progressRate: number; // percentage per week
  completionPercentage: number;
  estimatedCompletionDate?: Date;
  milestones: {
    id: string;
    description: string;
    targetValue: number;
    achieved: boolean;
    achievedDate?: Date;
  }[];
  blockers: string[];
  lastUpdated: Date;
}

export interface HistoricalPerformance {
  performanceId: string;
  sessionId: string;
  exerciseName: string;
  muscleGroups: string[];
  performanceMetrics: {
    volume: number; // sets * reps * weight
    intensity: number; // percentage of 1RM
    density: number; // volume per minute
    form_quality: number; // 1-10 scale
    rpe: number; // Rate of Perceived Exertion
  };
  trends: {
    volumeTrend: 'increasing' | 'stable' | 'decreasing';
    intensityTrend: 'increasing' | 'stable' | 'decreasing';
    formTrend: 'improving' | 'stable' | 'declining';
    consistencyScore: number; // 1-10 scale
  };
  periodization: {
    phase: 'accumulation' | 'intensification' | 'realization' | 'deload';
    weekInPhase: number;
    adaptationStatus: 'adapting' | 'adapted' | 'overreaching' | 'stagnant';
  };
  recordedAt: Date;
}

export interface EnvironmentalContext {
  location: 'home' | 'gym' | 'outdoor' | 'office' | 'other';
  equipment: string[];
  spaceConstraints: {
    area: 'small' | 'medium' | 'large';
    height: 'limited' | 'standard' | 'high';
    noise_concerns: boolean;
  };
  timeOfDay: 'early_morning' | 'morning' | 'afternoon' | 'evening' | 'late_night';
  availableTime: number; // minutes
  distractions: string[];
  temperature: number; // celsius
  weather?: string;
  companionType: 'alone' | 'with_trainer' | 'with_friend' | 'group';
  lastUpdated: Date;
}

export interface UserContext {
  userId: string;
  emotionalState: EmotionalState;
  goalProgressions: GoalProgression[];
  historicalPerformance: HistoricalPerformance[];
  environmentalContext: EnvironmentalContext;
  preferences: {
    communicationStyle: 'encouraging' | 'direct' | 'technical' | 'casual';
    difficultyPreference: 'progressive' | 'challenging' | 'conservative';
    feedbackFrequency: 'immediate' | 'session_end' | 'weekly';
    adaptationSpeed: 'fast' | 'moderate' | 'slow';
  };
  behavioralPatterns: {
    adherenceRate: number; // percentage
    skipPatterns: string[];
    peakPerformanceTimes: string[];
    recoveryPatterns: string[];
  };
  lastContextUpdate: Date;
}

export interface ContextAnalysis {
  readinessScore: number; // 1-10 scale for training readiness
  adaptationNeeds: {
    intensity: 'increase' | 'maintain' | 'decrease';
    volume: 'increase' | 'maintain' | 'decrease';
    complexity: 'increase' | 'maintain' | 'decrease';
    rest: 'increase' | 'maintain' | 'decrease';
  };
  emotionalSupport: {
    type: 'motivation' | 'encouragement' | 'validation' | 'challenge';
    message: string;
  };
  riskFactors: {
    injuryRisk: 'low' | 'moderate' | 'high';
    burnoutRisk: 'low' | 'moderate' | 'high';
    plateauRisk: 'low' | 'moderate' | 'high';
  };
  recommendations: string[];
  confidence: number; // confidence in analysis accuracy
  analysisTimestamp: Date;
}

export interface IContextManager {
  /**
   * Initialize context for a new user
   */
  initializeContext(userId: string, initialProfile: any): Promise<UserContext>;

  /**
   * Update user's emotional state
   */
  updateEmotionalState(userId: string, state: Partial<EmotionalState>): Promise<void>;

  /**
   * Update environmental context
   */
  updateEnvironmentalContext(userId: string, context: Partial<EnvironmentalContext>): Promise<void>;

  /**
   * Record performance data and update historical analysis
   */
  recordPerformance(userId: string, performance: Omit<HistoricalPerformance, 'performanceId' | 'recordedAt'>): Promise<void>;

  /**
   * Update goal progression
   */
  updateGoalProgression(userId: string, goalId: string, progress: Partial<GoalProgression>): Promise<void>;

  /**
   * Get current user context
   */
  getCurrentContext(userId: string): Promise<UserContext>;

  /**
   * Analyze current context and provide insights
   */
  analyzeContext(userId: string): Promise<ContextAnalysis>;

  /**
   * Predict user needs based on historical patterns
   */
  predictUserNeeds(userId: string, timeframe: 'next_session' | 'next_week' | 'next_month'): Promise<{
    predictedNeeds: string[];
    confidence: number;
    basis: string[];
  }>;

  /**
   * Get context-aware recommendations
   */
  getContextualRecommendations(userId: string, requestType: string): Promise<{
    recommendations: string[];
    reasoning: string;
    priority: 'low' | 'medium' | 'high';
  }>;

  /**
   * Clean up old context data based on retention policies
   */
  cleanupOldData(userId: string, retentionDays: number): Promise<void>;
}