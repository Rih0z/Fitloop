import { useState, useEffect } from 'react'

// 新しいデザインシステムに対応したテーマフック - 統一パターン実装

interface ThemeContextType {
  darkMode: boolean
  toggleDarkMode: () => void
  setDarkMode: (enabled: boolean) => void
}

export const useTheme = (): ThemeContextType => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // LocalStorageから保存されたテーマ設定を取得
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fitloop-theme')
      if (saved) {
        return saved === 'dark'
      }
      // システムのダークモード設定を確認
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  useEffect(() => {
    // HTML要素にdata-theme属性を設定（新デザインシステム対応）
    if (typeof document !== 'undefined') {
      if (darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark')
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.setAttribute('data-theme', 'light')
        document.documentElement.classList.remove('dark')
      }
      
      // LocalStorageに保存
      localStorage.setItem('fitloop-theme', darkMode ? 'dark' : 'light')
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev)
  }

  const setDarkModeValue = (enabled: boolean) => {
    setDarkMode(enabled)
  }

  return {
    darkMode,
    toggleDarkMode,
    setDarkMode: setDarkModeValue
  }
}