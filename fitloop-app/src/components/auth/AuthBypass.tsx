import { useEffect } from 'react'

export const AuthBypass: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const searchParams = new URLSearchParams(window.location.search)
  const bypassAuth = searchParams.get('bypass') === 'true'
  
  useEffect(() => {
    if (bypassAuth) {
      console.warn('🚨 Auth bypass mode enabled! This should only be used for debugging.')
      // Set a fake auth token
      localStorage.setItem('auth_token', 'bypass_token_for_debugging')
      // Set a fake profile
      localStorage.setItem('fitloop_profile', JSON.stringify({
        name: 'デバッグユーザー',
        age: 30,
        weight: 70,
        height: 170,
        experience: 'intermediate',
        goals: 'デバッグ用の目標',
        environment: 'home'
      }))
    }
  }, [bypassAuth])
  
  return <>{children}</>
}