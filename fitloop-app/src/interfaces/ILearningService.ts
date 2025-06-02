export interface WorkoutMetrics {
  exercise: string;
  weight: number;
  reps: number;
  sets: number;
  restTime?: number;
  difficulty: 'easy' | 'moderate' | 'hard';
  notes?: string;
  timestamp: Date;
  userId: string;
}

export interface ExerciseProgress {
  exercise: string;
  history: WorkoutMetrics[];
  personalRecord: {
    weight: number;
    reps: number;
    date: Date;
  };
  lastWorkout?: WorkoutMetrics;
  trend: 'improving' | 'maintaining' | 'declining';
}

export interface WeightRecommendation {
  exercise: string;
  recommendedWeight: number;
  reasoning: string;
  confidence: number;
  alternatives: {
    conservative: number;
    aggressive: number;
  };
}

export interface ProgressInsights {
  overallProgress: 'excellent' | 'good' | 'moderate' | 'needs_attention';
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  muscleBalance: {
    upperBody: number;
    lowerBody: number;
    core: number;
  };
  consistency: {
    workoutsPerWeek: number;
    streak: number;
    lastWorkout: Date;
  };
}

export interface ILearningService {
  trackWorkout(metrics: WorkoutMetrics): Promise<void>;
  getExerciseProgress(exercise: string, userId: string): Promise<ExerciseProgress>;
  recommendWeight(exercise: string, userId: string): Promise<WeightRecommendation>;
  analyzeProgress(userId: string, timeRange?: { start: Date; end: Date }): Promise<ProgressInsights>;
  getAllExercises(userId: string): Promise<string[]>;
}