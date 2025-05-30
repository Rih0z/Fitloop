export interface UserPreferences {
  intensity: 'low' | 'medium' | 'high'
  frequency: number // 週あたりの回数 (1-7)
  timeAvailable: number // 利用可能時間（分）
}

export interface UserProfile {
  id?: number
  name: string
  goals: string // ユーザーの本質的な欲求（モテたい、健康になりたい等）
  environment: string // トレーニング環境
  preferences: UserPreferences
  createdAt: Date
  updatedAt: Date
}

export function validateUserProfile(profile: UserProfile): void {
  // 必須フィールドのチェック
  if (profile.goals === undefined || profile.goals === null) {
    throw new Error('Goals are required')
  }

  if (profile.goals.trim() === '') {
    throw new Error('Goals cannot be empty')
  }

  if (!profile.environment) {
    throw new Error('Environment is required')
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
  if (profile.preferences.timeAvailable < 0) {
    throw new Error('Time available cannot be negative')
  }
}

export function createDefaultUserProfile(): Omit<UserProfile, 'id'> {
  return {
    name: '',
    goals: '',
    environment: '',
    preferences: {
      intensity: 'medium',
      frequency: 3,
      timeAvailable: 45,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}