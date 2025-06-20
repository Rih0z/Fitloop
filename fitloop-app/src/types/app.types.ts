export type TabType = 'prompt' | 'profile' | 'library' | 'help'

export interface TabItem {
  id: TabType
  icon: React.ComponentType<{ size?: number }>
  labelKey: string
}

// UI/UX仕様書に準拠したPrompt関連の型定義
export interface SavedPrompt {
  id?: string
  title: string
  content: string
  description?: string
  category?: string
  tags?: string[]
  isFavorite?: boolean
  usageCount?: number
  createdAt: Date
  updatedAt?: Date
}

// UI/UX仕様書に準拠したUser Profile関連の型定義
export interface UserProfile {
  basic: {
    name: string
    age: number
    gender: 'male' | 'female' | 'other'
    height: number
    weight: number
    experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  }
  goals: {
    primaryGoal: 'strength' | 'weight_loss' | 'endurance' | 'muscle_gain'
    deadline: '1month' | '3months' | '6months' | '1year'
  }
  environment: {
    location: 'gym' | 'home' | 'outdoor'
    frequency: number // 1-7
  }
}

// UI/UX仕様書に準拠したApp State
export interface AppState {
  // UI State
  activeTab: TabType
  darkMode: boolean
  
  // Meta Prompt State
  promptVersion: number
  nextSession: number
  currentBodyStats: {
    musclePercentage: number
    fatPercentage: number
    weight: number
    trend: 'improving' | 'stable' | 'declining' | 'critical'
  }
  
  // User Profile
  profile: UserProfile | null
  
  // Training Records
  trainingRecords: TrainingRecord[]
  
  // Saved Menus
  savedMenus: SavedPrompt[]
}

export interface TrainingRecord {
  id: string
  sessionNumber: number
  date: Date
  exercises: ExerciseRecord[]
  aiResponse?: string
}

export interface ExerciseRecord {
  name: string
  weight: number
  reps: number
  sets: number
}