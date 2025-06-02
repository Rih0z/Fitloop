export interface UserPreferences {
  intensity: 'low' | 'medium' | 'high'
  frequency: number // 週あたりの回数 (1-7)
  timeAvailable: number // 利用可能時間（分）
  workoutDuration: number // 1回のワークアウト時間（分）
  workoutFrequency: number // 週間頻度
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'flexible'
  equipment: string[]
  focusAreas: string[]
}

export interface UserProfile {
  id?: number
  name: string
  age?: number
  gender?: 'male' | 'female' | 'other'
  weight?: number // kg
  height?: number // cm
  goals: string // ユーザーの本質的な欲求（モテたい、健康になりたい等）
  environment: string // トレーニング環境
  experience?: 'beginner' | 'intermediate' | 'advanced'
  preferences: UserPreferences
  createdAt: Date
  updatedAt: Date
}

export function validateUserProfile(profile: UserProfile): void {
  // 名前の検証
  if (!profile.name || typeof profile.name !== 'string') {
    throw new Error('Name is required')
  }
  if (profile.name.trim().length < 1 || profile.name.length > 100) {
    throw new Error('Name must be between 1 and 100 characters')
  }

  // 目標の検証
  if (profile.goals === undefined || profile.goals === null || typeof profile.goals !== 'string') {
    throw new Error('Goals are required')
  }
  if (profile.goals.trim().length < 1 || profile.goals.length > 500) {
    throw new Error('Goals must be between 1 and 500 characters')
  }

  // 環境の検証
  if (!profile.environment || typeof profile.environment !== 'string') {
    throw new Error('Environment is required')
  }
  if (profile.environment.trim().length < 1 || profile.environment.length > 500) {
    throw new Error('Environment must be between 1 and 500 characters')
  }

  // preferences の検証
  if (!profile.preferences) {
    throw new Error('Preferences are required')
  }

  // intensity の検証
  const validIntensities = ['low', 'medium', 'high']
  if (!validIntensities.includes(profile.preferences.intensity)) {
    throw new Error('Invalid intensity level')
  }

  // frequency の検証
  if (profile.preferences.frequency < 1 || profile.preferences.frequency > 7) {
    throw new Error('Frequency must be between 1 and 7')
  }

  // timeAvailable の検証
  if (profile.preferences.timeAvailable < 0 || profile.preferences.timeAvailable > 300) {
    throw new Error('Time available must be between 0 and 300 minutes')
  }
}

export function createDefaultUserProfile(): Omit<UserProfile, 'id'> {
  return {
    name: '',
    age: 25,
    gender: 'male',
    weight: 70,
    height: 170,
    goals: '',
    environment: '',
    experience: 'beginner',
    preferences: {
      intensity: 'medium',
      frequency: 3,
      timeAvailable: 45,
      workoutDuration: 60,
      workoutFrequency: 3,
      preferredTime: 'morning',
      equipment: [],
      focusAreas: []
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}