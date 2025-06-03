import type { 
  ILearningService, 
  WorkoutMetrics, 
  ExerciseProgress, 
  WeightRecommendation, 
  ProgressInsights 
} from '../interfaces/ILearningService';
import { db } from '../lib/db';

export class LearningService implements ILearningService {
  private static instance: LearningService;
  
  private constructor() {}
  
  static getInstance(): LearningService {
    if (!LearningService.instance) {
      LearningService.instance = new LearningService();
    }
    return LearningService.instance;
  }
  
  async trackWorkout(metrics: WorkoutMetrics): Promise<void> {
    try {
      await db.workoutHistory.add({
        ...metrics,
        id: crypto.randomUUID(),
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Failed to track workout:', error);
      throw error;
    }
  }
  
  async getExerciseProgress(
    exercise: string, 
    userId: string
  ): Promise<ExerciseProgress> {
    try {
      if (!db.workoutHistory) {
        return this.getDefaultExerciseProgress(exercise);
      }
      
      const history = await db.workoutHistory
        .where('[userId+exercise]')
        .equals([userId, exercise])
        .reverse()
        .sortBy('timestamp');
    } catch (error) {
      console.error('Failed to get exercise progress:', error);
      return this.getDefaultExerciseProgress(exercise);
    }
    
    if (history.length === 0) {
      return {
        exercise,
        history: [],
        personalRecord: {
          weight: 0,
          reps: 0,
          date: new Date()
        },
        trend: 'maintaining'
      };
    }
    
    // パーソナルレコードを計算
    const pr = history.reduce((best, workout) => {
      const currentVolume = workout.weight * workout.reps;
      const bestVolume = best.weight * best.reps;
      
      if (currentVolume > bestVolume) {
        return {
          weight: workout.weight,
          reps: workout.reps,
          date: workout.timestamp
        };
      }
      return best;
    }, {
      weight: 0,
      reps: 0,
      date: new Date()
    });
    
    // トレンドを分析
    const trend = this.analyzeTrend(history);
    
    return {
      exercise,
      history,
      personalRecord: pr,
      lastWorkout: history[0],
      trend
    };
  }
  
  async recommendWeight(
    exercise: string, 
    userId: string
  ): Promise<WeightRecommendation> {
    const progress = await this.getExerciseProgress(exercise, userId);
    
    if (progress.history.length === 0) {
      return {
        exercise,
        recommendedWeight: 20, // デフォルトの開始重量
        reasoning: '初めてのエクササイズです。軽い重量から始めましょう。',
        confidence: 0.5,
        alternatives: {
          conservative: 15,
          aggressive: 25
        }
      };
    }
    
    const lastWorkout = progress.lastWorkout!;
    const { recommendedWeight, reasoning, confidence } = 
      this.calculateRecommendation(lastWorkout, progress.history);
    
    return {
      exercise,
      recommendedWeight,
      reasoning,
      confidence,
      alternatives: {
        conservative: Math.round(recommendedWeight * 0.9),
        aggressive: Math.round(recommendedWeight * 1.1)
      }
    };
  }
  
  async analyzeProgress(
    userId: string, 
    timeRange?: { start: Date; end: Date }
  ): Promise<ProgressInsights> {
    try {
      // データベースが初期化されていない場合のチェック
      if (!db.workoutHistory) {
        return this.getDefaultProgressInsights();
      }

      let query = db.workoutHistory.where('userId').equals(userId);
      
      if (timeRange) {
        query = query.and(workout => 
          workout.timestamp >= timeRange.start && 
          workout.timestamp <= timeRange.end
        );
      }
      
      const workouts = await query.toArray();
    } catch (error) {
      console.error('Failed to analyze progress:', error);
      return this.getDefaultProgressInsights();
    }
    
    if (workouts.length === 0) {
      return this.getDefaultProgressInsights();
    }
    
    // 分析ロジック
    const insights = this.generateInsights(workouts);
    
    return insights;
  }
  
  async getAllExercises(userId: string): Promise<string[]> {
    try {
      if (!db.workoutHistory) {
        return [];
      }
      
      const workouts = await db.workoutHistory
        .where('userId')
        .equals(userId)
        .toArray();
      
      const exercises = new Set(workouts.map(w => w.exercise));
      return Array.from(exercises).sort();
    } catch (error) {
      console.error('Failed to get exercises:', error);
      return [];
    }
  }
  
  private analyzeTrend(
    history: WorkoutMetrics[]
  ): 'improving' | 'maintaining' | 'declining' {
    if (history.length < 3) {
      return 'maintaining';
    }
    
    // 最近3回のワークアウトのボリュームを比較
    const recentVolumes = history.slice(0, 3).map(w => w.weight * w.reps * w.sets);
    const avgRecent = recentVolumes.reduce((sum, v) => sum + v, 0) / 3;
    
    // それ以前のワークアウトのボリューム
    const olderVolumes = history.slice(3, 6).map(w => w.weight * w.reps * w.sets);
    const avgOlder = olderVolumes.reduce((sum, v) => sum + v, 0) / olderVolumes.length;
    
    if (avgRecent > avgOlder * 1.05) {
      return 'improving';
    } else if (avgRecent < avgOlder * 0.95) {
      return 'declining';
    }
    
    return 'maintaining';
  }
  
  private calculateRecommendation(
    lastWorkout: WorkoutMetrics,
    history: WorkoutMetrics[]
  ): { recommendedWeight: number; reasoning: string; confidence: number } {
    // 前回のワークアウトの難易度を考慮
    if (lastWorkout.difficulty === 'easy') {
      return {
        recommendedWeight: Math.round(lastWorkout.weight * 1.05),
        reasoning: '前回は楽だったので、5%増量をお勧めします。',
        confidence: 0.8
      };
    } else if (lastWorkout.difficulty === 'hard') {
      return {
        recommendedWeight: lastWorkout.weight,
        reasoning: '前回はきつかったので、同じ重量で継続しましょう。',
        confidence: 0.9
      };
    }
    
    // トレンドを考慮
    const trend = this.analyzeTrend(history);
    
    if (trend === 'improving') {
      return {
        recommendedWeight: Math.round(lastWorkout.weight * 1.025),
        reasoning: '順調に向上しているので、2.5%増量を提案します。',
        confidence: 0.85
      };
    } else if (trend === 'declining') {
      return {
        recommendedWeight: Math.round(lastWorkout.weight * 0.95),
        reasoning: '最近の傾向を考慮して、5%減量を提案します。',
        confidence: 0.7
      };
    }
    
    return {
      recommendedWeight: lastWorkout.weight,
      reasoning: '現在の重量を維持することをお勧めします。',
      confidence: 0.8
    };
  }
  
  private generateInsights(workouts: WorkoutMetrics[]): ProgressInsights {
    // エクササイズをカテゴリー分け
    const upperBodyExercises = ['bench press', 'shoulder press', 'pull up', 'row'];
    const lowerBodyExercises = ['squat', 'deadlift', 'leg press', 'lunge'];
    const coreExercises = ['plank', 'crunch', 'leg raise'];
    
    const upperBodyCount = workouts.filter(w => 
      upperBodyExercises.some(ex => w.exercise.toLowerCase().includes(ex))
    ).length;
    
    const lowerBodyCount = workouts.filter(w => 
      lowerBodyExercises.some(ex => w.exercise.toLowerCase().includes(ex))
    ).length;
    
    const coreCount = workouts.filter(w => 
      coreExercises.some(ex => w.exercise.toLowerCase().includes(ex))
    ).length;
    
    const total = upperBodyCount + lowerBodyCount + coreCount || 1;
    
    // 一貫性の分析
    const sortedWorkouts = workouts.sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
    
    const lastWorkout = sortedWorkouts[0]?.timestamp || new Date();
    const workoutsPerWeek = this.calculateWorkoutsPerWeek(workouts);
    const streak = this.calculateStreak(workouts);
    
    // 強みと改善点
    const strengths: string[] = [];
    const areasForImprovement: string[] = [];
    const recommendations: string[] = [];
    
    if (workoutsPerWeek >= 3) {
      strengths.push('優れたトレーニング頻度');
    } else {
      areasForImprovement.push('トレーニング頻度の向上');
      recommendations.push('週3回以上のトレーニングを目指しましょう');
    }
    
    if (Math.abs(upperBodyCount - lowerBodyCount) > total * 0.3) {
      areasForImprovement.push('筋肉バランスの改善');
      if (upperBodyCount > lowerBodyCount) {
        recommendations.push('下半身のトレーニングを増やしましょう');
      } else {
        recommendations.push('上半身のトレーニングを増やしましょう');
      }
    } else {
      strengths.push('バランスの取れたトレーニング');
    }
    
    // 総合評価
    let overallProgress: ProgressInsights['overallProgress'] = 'moderate';
    
    if (strengths.length >= 2 && workoutsPerWeek >= 3) {
      overallProgress = 'excellent';
    } else if (strengths.length >= 1 && workoutsPerWeek >= 2) {
      overallProgress = 'good';
    } else if (workoutsPerWeek < 1) {
      overallProgress = 'needs_attention';
    }
    
    return {
      overallProgress,
      strengths,
      areasForImprovement,
      recommendations,
      muscleBalance: {
        upperBody: (upperBodyCount / total) * 100,
        lowerBody: (lowerBodyCount / total) * 100,
        core: (coreCount / total) * 100
      },
      consistency: {
        workoutsPerWeek,
        streak,
        lastWorkout
      }
    };
  }
  
  private calculateWorkoutsPerWeek(workouts: WorkoutMetrics[]): number {
    if (workouts.length === 0) return 0;
    
    const sortedWorkouts = workouts.sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );
    
    const firstDate = sortedWorkouts[0].timestamp;
    const lastDate = sortedWorkouts[sortedWorkouts.length - 1].timestamp;
    
    const weeks = Math.max(1, 
      (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
    );
    
    return Math.round((workouts.length / weeks) * 10) / 10;
  }
  
  private calculateStreak(workouts: WorkoutMetrics[]): number {
    if (workouts.length === 0) return 0;
    
    const sortedWorkouts = workouts.sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
    
    let streak = 1;
    const oneDayMs = 1000 * 60 * 60 * 24;
    
    for (let i = 1; i < sortedWorkouts.length; i++) {
      const daysDiff = Math.floor(
        (sortedWorkouts[i - 1].timestamp.getTime() - 
         sortedWorkouts[i].timestamp.getTime()) / oneDayMs
      );
      
      if (daysDiff <= 2) { // 2日以内なら連続とみなす
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private getDefaultProgressInsights(): ProgressInsights {
    return {
      overallProgress: 'needs_attention',
      strengths: [],
      areasForImprovement: ['トレーニング履歴がありません'],
      recommendations: ['定期的なトレーニングを始めましょう'],
      muscleBalance: {
        upperBody: 0,
        lowerBody: 0,
        core: 0
      },
      consistency: {
        workoutsPerWeek: 0,
        streak: 0,
        lastWorkout: new Date()
      }
    };
  }

  private getDefaultExerciseProgress(exercise: string): ExerciseProgress {
    return {
      exercise,
      history: [],
      personalRecord: {
        weight: 0,
        reps: 0,
        date: new Date()
      },
      trend: 'maintaining'
    };
  }
}