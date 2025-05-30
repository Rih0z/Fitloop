export interface ExercisePerformance {
  exerciseName: string
  date: Date
  sets: {
    weight: number
    reps: number
    rpe?: number // Rate of Perceived Exertion (1-10)
  }[]
  muscleGroups: string[]
  notes?: string
}

export interface Measurements {
  weight?: number // kg
  bodyFatPercentage?: number
  muscleMass?: number // kg
  [key: string]: number | undefined
}

export interface Context {
  id?: number
  cycleNumber: number
  sessionNumber: number
  lastActivity: Date
  measurements?: Measurements
  performance: ExercisePerformance[]
}

export function createInitialContext(): Context {
  return {
    cycleNumber: 1,
    sessionNumber: 1,
    lastActivity: new Date(),
    performance: [],
  }
}

export function updateContext(
  current: Context,
  updates: Partial<Omit<Context, 'id' | 'lastActivity'>>
): Context {
  return {
    ...current,
    ...updates,
    lastActivity: new Date(),
  }
}

export function addPerformanceData(
  context: Context,
  performance: ExercisePerformance
): Context {
  return updateContext(context, {
    performance: [...context.performance, performance],
  })
}

export function shouldStartNewCycle(context: Context): boolean {
  return context.sessionNumber >= 8
}

export function getNextSession(context: Context): { cycleNumber: number; sessionNumber: number } {
  if (shouldStartNewCycle(context)) {
    return {
      cycleNumber: context.cycleNumber + 1,
      sessionNumber: 1,
    }
  }

  return {
    cycleNumber: context.cycleNumber,
    sessionNumber: context.sessionNumber + 1,
  }
}