import { useEffect, useState } from 'react'
import { ThemeService } from '../services/ThemeService'

// Singleton instance
const themeService = new ThemeService()

export function useTheme() {
  const [darkMode, setDarkMode] = useState(themeService.isDarkMode())

  useEffect(() => {
    // Subscribe to theme changes
    const unsubscribe = themeService.subscribe(() => {
      setDarkMode(themeService.isDarkMode())
    })

    return unsubscribe
  }, [])

  const toggleDarkMode = () => {
    themeService.toggle()
  }

  const setDarkModeValue = (enabled: boolean) => {
    themeService.setDarkMode(enabled)
  }

  return {
    darkMode,
    toggleDarkMode,
    setDarkMode: setDarkModeValue
  }
}