import React, { useState } from 'react'
import { X, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../context/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signin' | 'signup'
  onSuccess?: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'signin',
  onSuccess 
}) => {
  const { darkMode } = useTheme()
  const { signup, signin, isLoading } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<string[]>([])

  if (!isOpen) return null

  const validateForm = (): boolean => {
    const newErrors: string[] = []

    if (mode === 'signup' && !formData.name.trim()) {
      newErrors.push('お名前を入力してください')
    }

    if (!formData.email.trim()) {
      newErrors.push('メールアドレスを入力してください')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push('有効なメールアドレスを入力してください')
    }

    if (!formData.password) {
      newErrors.push('パスワードを入力してください')
    } else {
      // 強化されたパスワード要件
      if (formData.password.length < 8) {
        newErrors.push('パスワードは8文字以上で入力してください')
      }
      if (!/(?=.*[a-z])/.test(formData.password)) {
        newErrors.push('パスワードには小文字を含めてください')
      }
      if (!/(?=.*[A-Z])/.test(formData.password)) {
        newErrors.push('パスワードには大文字を含めてください')
      }
      if (!/(?=.*\d)/.test(formData.password)) {
        newErrors.push('パスワードには数字を含めてください')
      }
      if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
        newErrors.push('パスワードには特殊文字（@$!%*?&）を含めてください')
      }
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      let response
      if (mode === 'signup') {
        response = await signup(formData.email, formData.password, formData.name)
      } else {
        response = await signin(formData.email, formData.password)
      }

      if (response.status === 200 || response.status === 201) {
        onSuccess?.()
        onClose()
        setFormData({ name: '', email: '', password: '' })
        setErrors([])
      } else {
        setErrors([response.error || 'エラーが発生しました'])
      }
    } catch (error) {
      setErrors(['ネットワークエラーが発生しました'])
    }
  }

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setErrors([])
    setFormData({ name: '', email: '', password: '' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {mode === 'signin' ? 'ログイン' : 'アカウント作成'}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              darkMode 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Messages */}
          {errors.length > 0 && (
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-red-900/20 border border-red-700/30' : 'bg-red-50 border border-red-200'}`}>
              {errors.map((error, index) => (
                <div key={index} className={`flex items-center gap-2 text-sm ${darkMode ? 'text-red-200' : 'text-red-700'}`}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              ))}
            </div>
          )}

          {/* Name Field (Signup only) */}
          {mode === 'signup' && (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                お名前
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
                  }`}
                  placeholder="田中太郎"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              メールアドレス
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
                }`}
                placeholder="example@email.com"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              パスワード
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 transition-all ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
                }`}
                placeholder="6文字以上"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-semibold transition-all ${
              isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : darkMode 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                処理中...
              </div>
            ) : (
              mode === 'signin' ? 'ログイン' : 'アカウント作成'
            )}
          </button>

          {/* Mode Switch */}
          <div className="text-center">
            <button
              type="button"
              onClick={switchMode}
              className={`text-sm transition-colors ${
                darkMode 
                  ? 'text-purple-400 hover:text-purple-300'
                  : 'text-purple-600 hover:text-purple-700'
              }`}
            >
              {mode === 'signin' 
                ? 'アカウントをお持ちでない方はこちら' 
                : '既にアカウントをお持ちの方はこちら'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}