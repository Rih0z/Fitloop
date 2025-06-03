// API Service for FitLoop Backend Integration
export interface ApiResponse<T> {
  data?: T
  message?: string
  error?: string
  status: number
}

export interface User {
  id: string
  email: string
  name: string
}

export interface AuthResponse {
  user: User
  token: string
  message: string
}

export interface UserProfile {
  id?: string
  user_id?: string
  name: string
  age?: number
  weight?: number
  height?: number
  experience: 'beginner' | 'intermediate' | 'advanced'
  goals: string
  environment: string
  preferences?: {
    workoutFrequency?: number
    workoutDuration?: number
    preferredTime?: 'morning' | 'afternoon' | 'evening' | 'anytime'
    equipment?: string[]
    focusAreas?: string[]
  }
  created_at?: string
  updated_at?: string
}

export interface Prompt {
  id: string
  user_id: string
  type: 'training' | 'import' | 'export' | 'analysis'
  title: string
  content: string
  metadata?: any
  source?: 'profile' | 'training' | 'manual'
  used: boolean
  created_at: string
  updated_at: string
}

export interface WorkoutSession {
  id?: string
  user_id?: string
  workout_date: string
  exercises: {
    name: string
    sets: number
    reps: number
    weight?: number
    notes?: string
  }[]
  duration_minutes?: number
  satisfaction_rating?: number
  notes?: string
  created_at?: string
  updated_at?: string
}

class ApiService {
  private baseURL: string
  private token: string | null = null

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://fitloop-backend.riho-dare.workers.dev/api'
    this.token = localStorage.getItem('auth_token')
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    return headers
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      })

      const data = await response.json()
      
      return {
        data: response.ok ? data : undefined,
        message: data.message,
        error: response.ok ? undefined : data.error || data.message,
        status: response.status
      }
    } catch (error) {
      console.error('API Request Error:', error)
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0
      }
    }
  }

  // Authentication methods
  async signup(email: string, password: string, name: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })

    if (response.data?.token) {
      this.setToken(response.data.token)
    }

    return response
  }

  async signin(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (response.data?.token) {
      this.setToken(response.data.token)
    }

    return response
  }

  async signout(): Promise<ApiResponse<{ message: string }>> {
    const response = await this.request<{ message: string }>('/auth/signout', {
      method: 'POST',
    })

    this.clearToken()
    return response
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (response.data?.token) {
      this.setToken(response.data.token)
    }

    return response
  }

  // Profile methods
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>('/profile')
  }

  async saveProfile(profile: Partial<UserProfile>): Promise<ApiResponse<{ profile: UserProfile, message: string }>> {
    return this.request<{ profile: UserProfile, message: string }>('/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    })
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<ApiResponse<{ profile: UserProfile, message: string }>> {
    return this.request<{ profile: UserProfile, message: string }>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  async deleteProfile(): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/profile', {
      method: 'DELETE',
    })
  }

  // Prompt methods
  async getPrompts(type?: string, source?: string, limit = 50, offset = 0): Promise<ApiResponse<Prompt[]>> {
    const params = new URLSearchParams()
    if (type) params.append('type', type)
    if (source) params.append('source', source)
    params.append('limit', limit.toString())
    params.append('offset', offset.toString())

    return this.request<Prompt[]>(`/prompts?${params.toString()}`)
  }

  async getPrompt(id: string): Promise<ApiResponse<Prompt>> {
    return this.request<Prompt>(`/prompts/${id}`)
  }

  async createPrompt(prompt: Omit<Prompt, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<{ prompt: Prompt, message: string }>> {
    return this.request<{ prompt: Prompt, message: string }>('/prompts', {
      method: 'POST',
      body: JSON.stringify(prompt),
    })
  }

  async generatePromptFromProfile(): Promise<ApiResponse<{ prompt: Prompt, message: string }>> {
    return this.request<{ prompt: Prompt, message: string }>('/prompts/generate', {
      method: 'POST',
    })
  }

  async updatePrompt(id: string, updates: Partial<Prompt>): Promise<ApiResponse<{ prompt: Prompt, message: string }>> {
    return this.request<{ prompt: Prompt, message: string }>(`/prompts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async markPromptAsUsed(id: string): Promise<ApiResponse<{ prompt: Prompt, message: string }>> {
    return this.request<{ prompt: Prompt, message: string }>(`/prompts/${id}/use`, {
      method: 'PATCH',
    })
  }

  async deletePrompt(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/prompts/${id}`, {
      method: 'DELETE',
    })
  }

  // Workout methods
  async getWorkouts(limit = 50, offset = 0, dateFrom?: string, dateTo?: string): Promise<ApiResponse<WorkoutSession[]>> {
    const params = new URLSearchParams()
    params.append('limit', limit.toString())
    params.append('offset', offset.toString())
    if (dateFrom) params.append('date_from', dateFrom)
    if (dateTo) params.append('date_to', dateTo)

    return this.request<WorkoutSession[]>(`/workouts?${params.toString()}`)
  }

  async getWorkout(id: string): Promise<ApiResponse<WorkoutSession>> {
    return this.request<WorkoutSession>(`/workouts/${id}`)
  }

  async createWorkout(workout: Omit<WorkoutSession, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<{ workout: WorkoutSession, message: string }>> {
    return this.request<{ workout: WorkoutSession, message: string }>('/workouts', {
      method: 'POST',
      body: JSON.stringify(workout),
    })
  }

  async updateWorkout(id: string, updates: Partial<WorkoutSession>): Promise<ApiResponse<{ workout: WorkoutSession, message: string }>> {
    return this.request<{ workout: WorkoutSession, message: string }>(`/workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteWorkout(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/workouts/${id}`, {
      method: 'DELETE',
    })
  }

  async getWorkoutStats(period = 30): Promise<ApiResponse<{
    period: number
    statistics: {
      totalWorkouts: number
      totalExercises: number
      totalDuration: number
      averageRating: number
      averageDuration: number
    }
    workouts: WorkoutSession[]
  }>> {
    return this.request(`/workouts/stats/summary?period=${period}`)
  }

  // Token management
  setToken(token: string): void {
    this.token = token
    localStorage.setItem('auth_token', token)
  }

  clearToken(): void {
    this.token = null
    localStorage.removeItem('auth_token')
  }

  getToken(): string | null {
    return this.token
  }

  isAuthenticated(): boolean {
    return !!this.token
  }
}

export const apiService = new ApiService()
export default apiService