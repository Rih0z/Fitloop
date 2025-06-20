import { useState } from 'react'
import { Header } from './components/layout/Header'
import { TabBar } from './components/layout/TabBar'
import { PromptTab } from './components/tabs/PromptTab'
import { ProfileTab } from './components/tabs/ProfileTab'
import { LibraryTab } from './components/tabs/LibraryTab'
import { HelpTab } from './components/tabs/HelpTab'
import { useTheme } from './hooks/useTheme'
import './App.css'

// UI/UX仕様書完全準拠のメインアプリケーション - 既存デザインを全て破棄し、ゼロから再実装

function App() {
  useTheme() // Initialize theme system
  const [activeTab, setActiveTab] = useState<'prompt' | 'profile' | 'library' | 'help'>('prompt')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'prompt':
        return <PromptTab />
      case 'profile':
        return <ProfileTab />
      case 'library':
        return <LibraryTab />
      case 'help':
        return <HelpTab />
      default:
        return <PromptTab />
    }
  }

  return (
    <div className="app-container">
      <Header />
      
      <main className="app-content">
        <div className="animate-fade-in">
          {renderTabContent()}
        </div>
      </main>
      
      <TabBar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
      />
    </div>
  )
}

export default App