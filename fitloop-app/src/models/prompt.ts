export interface GeneratedPrompt {
  id?: number
  type: 'training' | 'import' | 'export' | 'analysis'
  content: string
  metadata: any
  createdAt: Date
  used: boolean
  source?: 'profile' | 'training' | 'manual'
  title?: string
}

export interface TrainingSession {
  id?: number
  date: Date
  exercises: Array<{
    name: string
    sets: Array<{
      weight: number
      weightUnit: 'kg' | 'lbs'
      reps: number
      rpe?: number
    }>
  }>
  cardio?: {
    type: string
    duration: number
    distance?: number
    distanceUnit?: 'km' | 'miles'
  }
  notes?: string
  aiResponse?: string
}

export interface ImportedData {
  type: 'training_session' | 'body_measurement' | 'training_history'
  data: any
  importedAt: Date
}