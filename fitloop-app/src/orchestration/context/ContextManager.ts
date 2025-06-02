import type {
  IContextManager,
  ContextAnalysis,
  PredictedNeeds,
  TimeRange,
  ContextChangeCallback
} from '../interfaces/IFitLoopOrchestrator'
import type { UserContext } from '../types/OrchestrationTypes'

export class ContextManager implements IContextManager {
  private contextStore: Map<string, UserContext> = new Map()
  private contextHistory: Map<string, UserContext[]> = new Map()
  private changeListeners: Map<string, Set<ContextChangeCallback>> = new Map()

  async setUserContext(userId: string, context: UserContext): Promise<void> {
    // Validate context data
    this.validateContext(context)
    
    // Store previous context in history
    const existingContext = this.contextStore.get(userId)
    if (existingContext) {
      this.addToHistory(userId, existingContext)
    }
    
    // Set new context
    this.contextStore.set(userId, { ...context, timestamp: new Date() })
    
    // Notify listeners
    this.notifyContextChange(userId, context)
  }

  async getUserContext(userId: string): Promise<UserContext | null> {
    return this.contextStore.get(userId) || null
  }

  async updateUserContext(userId: string, updates: Partial<UserContext>): Promise<void> {
    const existingContext = this.contextStore.get(userId)
    if (!existingContext) {
      throw new Error(`No context found for user ${userId}`)
    }

    // Merge updates with existing context
    const updatedContext: UserContext = {
      ...existingContext,
      ...updates,
      timestamp: new Date()
    }

    // Deep merge nested objects
    if (updates.emotionalState) {
      updatedContext.emotionalState = {
        ...existingContext.emotionalState,
        ...updates.emotionalState
      }
    }

    if (updates.environment) {
      updatedContext.environment = {
        ...existingContext.environment,
        ...updates.environment
      }
    }

    if (updates.preferences) {
      updatedContext.preferences = {
        ...existingContext.preferences,
        ...updates.preferences
      }
    }

    await this.setUserContext(userId, updatedContext)
  }

  async deleteUserContext(userId: string): Promise<void> {
    this.contextStore.delete(userId)
    this.contextHistory.delete(userId)
    this.changeListeners.delete(userId)
  }

  async analyzeContextPatterns(userId: string, timeRange?: TimeRange): Promise<ContextAnalysis> {
    const history = this.getContextHistory(userId, timeRange)
    
    if (history.length < 2) {
      return {
        patterns: [],
        trends: [],
        anomalies: [],
        insights: []
      }
    }

    const patterns = this.detectPatterns(history)
    const trends = this.detectTrends(history)
    const anomalies = this.detectAnomalies(history)
    const insights = this.generateInsights(patterns, trends, anomalies)

    return {
      patterns,
      trends,
      anomalies,
      insights
    }
  }

  async predictUserNeeds(context: UserContext): Promise<PredictedNeeds> {
    const predictions = []

    // Analyze emotional state for predictions
    if (context.emotionalState.motivation === 'low' || context.emotionalState.motivation === 'struggling') {
      predictions.push({
        type: 'motivational_support',
        priority: 0.9,
        description: 'User may benefit from motivational content and encouragement',
        suggestedAction: 'Provide uplifting prompts and success stories'
      })
    }

    if (context.emotionalState.energy === 'low') {
      predictions.push({
        type: 'low_intensity_workout',
        priority: 0.8,
        description: 'User may prefer lighter, more accessible workouts',
        suggestedAction: 'Suggest gentle exercises or active recovery'
      })
    }

    if (context.emotionalState.stress === 'high' || context.emotionalState.stress === 'overwhelming') {
      predictions.push({
        type: 'stress_relief',
        priority: 0.85,
        description: 'User may benefit from stress-reducing activities',
        suggestedAction: 'Recommend yoga, meditation, or light cardio'
      })
    }

    // Analyze environment for predictions
    if (context.environment.timeAvailable < 30) {
      predictions.push({
        type: 'quick_workout',
        priority: 0.7,
        description: 'User has limited time available',
        suggestedAction: 'Suggest high-intensity, short-duration workouts'
      })
    }

    if (context.environment.spaceConstraints === 'very_limited') {
      predictions.push({
        type: 'space_efficient_exercise',
        priority: 0.6,
        description: 'User has very limited space for exercise',
        suggestedAction: 'Focus on bodyweight exercises that require minimal space'
      })
    }

    // Sort by priority
    predictions.sort((a, b) => b.priority - a.priority)

    return {
      needs: predictions.slice(0, 5), // Top 5 predictions
      confidence: this.calculatePredictionConfidence(predictions),
      timeframe: this.determinePredictionTimeframe(context)
    }
  }

  subscribeToContextChanges(userId: string, callback: ContextChangeCallback): () => void {
    if (!this.changeListeners.has(userId)) {
      this.changeListeners.set(userId, new Set())
    }
    
    const userListeners = this.changeListeners.get(userId)!
    userListeners.add(callback)

    // Return unsubscribe function
    return () => {
      userListeners.delete(callback)
      if (userListeners.size === 0) {
        this.changeListeners.delete(userId)
      }
    }
  }

  // Private helper methods
  private validateContext(context: UserContext): void {
    if (!context.userId || !context.sessionId) {
      throw new Error('UserContext must have userId and sessionId')
    }

    // Validate emotional state values
    const validMoods = ['excellent', 'good', 'neutral', 'low', 'poor']
    if (!validMoods.includes(context.emotionalState.mood)) {
      throw new Error(`Invalid mood: ${context.emotionalState.mood}`)
    }

    // Add more validation as needed
  }

  private addToHistory(userId: string, context: UserContext): void {
    if (!this.contextHistory.has(userId)) {
      this.contextHistory.set(userId, [])
    }
    
    const history = this.contextHistory.get(userId)!
    history.push(context)
    
    // Keep only last 100 entries to prevent memory bloat
    if (history.length > 100) {
      history.shift()
    }
  }

  private notifyContextChange(userId: string, context: UserContext): void {
    const listeners = this.changeListeners.get(userId)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(userId, context)
        } catch (error) {
          console.error('Error in context change callback:', error)
        }
      })
    }
  }

  private getContextHistory(userId: string, timeRange?: TimeRange): UserContext[] {
    const history = this.contextHistory.get(userId) || []
    
    if (!timeRange) {
      return history
    }

    return history.filter(context => 
      context.timestamp >= timeRange.start && context.timestamp <= timeRange.end
    )
  }

  private detectPatterns(history: UserContext[]): any[] {
    const patterns = []

    // Detect time-based patterns
    const timePatterns = this.analyzeTimePatterns(history)
    patterns.push(...timePatterns)

    // Detect mood patterns
    const moodPatterns = this.analyzeMoodPatterns(history)
    patterns.push(...moodPatterns)

    // Detect environment patterns
    const environmentPatterns = this.analyzeEnvironmentPatterns(history)
    patterns.push(...environmentPatterns)

    return patterns
  }

  private detectTrends(history: UserContext[]): any[] {
    const trends = []

    // Analyze motivation trend
    const motivationTrend = this.analyzeTrend(
      history.map(c => this.mapMoodToNumber(c.emotionalState.motivation)),
      'motivation'
    )
    if (motivationTrend) trends.push(motivationTrend)

    // Analyze energy trend
    const energyTrend = this.analyzeTrend(
      history.map(c => this.mapEnergyToNumber(c.emotionalState.energy)),
      'energy'
    )
    if (energyTrend) trends.push(energyTrend)

    return trends
  }

  private detectAnomalies(history: UserContext[]): any[] {
    const anomalies = []
    
    // Look for unusual mood drops
    for (let i = 1; i < history.length; i++) {
      const prev = history[i - 1]
      const curr = history[i]
      
      const prevMoodScore = this.mapMoodToNumber(prev.emotionalState.mood)
      const currMoodScore = this.mapMoodToNumber(curr.emotionalState.mood)
      
      if (prevMoodScore - currMoodScore >= 2) {
        anomalies.push({
          type: 'mood_drop',
          severity: 'medium' as const,
          description: `Significant mood drop detected from ${prev.emotionalState.mood} to ${curr.emotionalState.mood}`,
          timestamp: curr.timestamp
        })
      }
    }

    return anomalies
  }

  private generateInsights(patterns: any[], trends: any[], anomalies: any[]): any[] {
    const insights = []

    // Generate insights from trends
    trends.forEach(trend => {
      if (trend.direction === 'decreasing' && trend.metric === 'motivation') {
        insights.push({
          type: 'motivation_decline',
          description: 'User motivation has been declining over time',
          actionable: true,
          confidence: trend.significance
        })
      }
    })

    // Generate insights from patterns
    patterns.forEach(pattern => {
      if (pattern.type === 'time_preference' && pattern.confidence > 0.7) {
        insights.push({
          type: 'optimal_timing',
          description: `User tends to exercise most effectively during ${pattern.time}`,
          actionable: true,
          confidence: pattern.confidence
        })
      }
    })

    return insights
  }

  private analyzeTimePatterns(history: UserContext[]): any[] {
    // Group by hour of day
    const hourGroups: { [hour: number]: UserContext[] } = {}
    
    history.forEach(context => {
      const hour = context.timestamp.getHours()
      if (!hourGroups[hour]) {
        hourGroups[hour] = []
      }
      hourGroups[hour].push(context)
    })

    // Find most common exercise times
    const patterns = []
    for (const [hour, contexts] of Object.entries(hourGroups)) {
      if (contexts.length >= 3) { // Minimum occurrences
        patterns.push({
          type: 'time_preference',
          time: `${hour}:00`,
          frequency: contexts.length,
          confidence: Math.min(contexts.length / history.length * 2, 1),
          impact: 'scheduling'
        })
      }
    }

    return patterns
  }

  private analyzeMoodPatterns(history: UserContext[]): any[] {
    // Analyze mood consistency
    const moods = history.map(c => c.emotionalState.mood)
    const moodCounts = moods.reduce((acc, mood) => {
      acc[mood] = (acc[mood] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const patterns = []
    for (const [mood, count] of Object.entries(moodCounts)) {
      if (count / history.length > 0.6) {
        patterns.push({
          type: 'mood_consistency',
          mood: mood,
          frequency: count,
          confidence: count / history.length,
          impact: 'personalization'
        })
      }
    }

    return patterns
  }

  private analyzeEnvironmentPatterns(history: UserContext[]): any[] {
    // Analyze location preferences
    const locations = history.map(c => c.environment.location)
    const locationCounts = locations.reduce((acc, location) => {
      acc[location] = (acc[location] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const patterns = []
    for (const [location, count] of Object.entries(locationCounts)) {
      if (count / history.length > 0.5) {
        patterns.push({
          type: 'location_preference',
          location: location,
          frequency: count,
          confidence: count / history.length,
          impact: 'workout_planning'
        })
      }
    }

    return patterns
  }

  private analyzeTrend(values: number[], metric: string): any | null {
    if (values.length < 3) return null

    // Simple linear regression to detect trend
    const n = values.length
    const sumX = (n * (n - 1)) / 2 // 0 + 1 + 2 + ... + (n-1)
    const sumY = values.reduce((a, b) => a + b, 0)
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0)
    const sumX2 = values.reduce((sum, _, x) => sum + x * x, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    
    if (Math.abs(slope) < 0.1) return null // No significant trend

    return {
      metric,
      direction: slope > 0 ? 'increasing' : 'decreasing',
      magnitude: Math.abs(slope),
      significance: Math.min(Math.abs(slope) * 2, 1)
    }
  }

  private mapMoodToNumber(mood: string): number {
    const mapping = { poor: 1, low: 2, neutral: 3, good: 4, excellent: 5 }
    return mapping[mood as keyof typeof mapping] || 3
  }

  private mapEnergyToNumber(energy: string): number {
    const mapping = { low: 1, medium: 2, high: 3 }
    return mapping[energy as keyof typeof mapping] || 2
  }

  private calculatePredictionConfidence(predictions: any[]): number {
    if (predictions.length === 0) return 0
    const avgPriority = predictions.reduce((sum, p) => sum + p.priority, 0) / predictions.length
    return Math.min(avgPriority * 0.8, 1) // Scale down confidence slightly
  }

  private determinePredictionTimeframe(context: UserContext): string {
    // Determine timeframe based on context urgency
    if (context.emotionalState.stress === 'overwhelming' || 
        context.emotionalState.motivation === 'struggling') {
      return 'immediate'
    }
    
    if (context.environment.timeAvailable < 30) {
      return 'next_session'
    }
    
    return 'next_few_sessions'
  }
}