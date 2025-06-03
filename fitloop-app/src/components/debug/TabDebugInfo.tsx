import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { useProfile } from '../../hooks/useProfile'
import { useTabs } from '../../hooks/useTabs'

export const TabDebugInfo: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { profile, loading: profileLoading } = useProfile()
  const { activeTab } = useTabs()
  
  const debugInfo = {
    authLoading,
    isAuthenticated,
    profileLoading,
    hasProfile: !!profile,
    activeTab,
    localStorage: {
      authToken: !!localStorage.getItem('auth_token'),
      profile: !!localStorage.getItem('fitloop_profile'),
      context: !!localStorage.getItem('fitloop_context')
    },
    windowHeight: window.innerHeight,
    documentHeight: document.documentElement.clientHeight,
    userAgent: navigator.userAgent
  }
  
  if (import.meta.env.PROD) {
    return null
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '350px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>🐛 Tab Debug Info</h4>
      <pre style={{ margin: 0 }}>
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  )
}