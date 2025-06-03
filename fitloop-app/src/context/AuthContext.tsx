import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { apiService, type User, type ApiResponse, type AuthResponse } from '../services/ApiService'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signup: (email: string, password: string, name: string) => Promise<ApiResponse<AuthResponse>>
  signin: (email: string, password: string) => Promise<ApiResponse<AuthResponse>>
  signout: () => Promise<void>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const token = apiService.getToken()
      if (token) {
        // Try to verify token by getting profile
        const response = await apiService.getProfile()
        if (response.status === 200 && response.data) {
          setUser({
            id: response.data.user_id || '',
            email: '', // Will be set when we have proper user endpoint
            name: response.data.name
          })
        } else {
          // Token is invalid, clear it
          apiService.clearToken()
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      apiService.clearToken()
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string): Promise<ApiResponse<AuthResponse>> => {
    setIsLoading(true)
    try {
      const response = await apiService.signup(email, password, name)
      if (response.status === 201 && response.data) {
        setUser(response.data.user)
      }
      return response
    } finally {
      setIsLoading(false)
    }
  }

  const signin = async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    setIsLoading(true)
    try {
      const response = await apiService.signin(email, password)
      if (response.status === 200 && response.data) {
        setUser(response.data.user)
      }
      return response
    } finally {
      setIsLoading(false)
    }
  }

  const signout = async (): Promise<void> => {
    try {
      await apiService.signout()
    } catch (error) {
      console.error('Signout error:', error)
    } finally {
      setUser(null)
    }
  }

  const refreshAuth = async (): Promise<void> => {
    await initializeAuth()
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signup,
    signin,
    signout,
    refreshAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext