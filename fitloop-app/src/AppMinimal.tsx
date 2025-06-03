import { useState } from 'react'
import { Header } from './components/layout/Header'
import { TabBar } from './components/layout/TabBar'
import { useTheme } from './hooks/useTheme'
import type { TabType } from './types/app.types'
import './App.css'

function AppMinimal() {
  const [activeTab, setActiveTab] = useState<TabType>('prompt')
  const { darkMode } = useTheme()
  
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-gradient-to-br from-gray-50 to-white'} flex flex-col`}>
      <Header />
      
      <main className="flex-1 flex flex-col pb-20">
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 w-full">
          <div className="text-center py-20">
            <h1 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              FitLoop Minimal Test
            </h1>
            <p className={`text-xl mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              タブバーテスト版
            </p>
            <div className={`p-8 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h2 className={`text-2xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                現在のタブ: {activeTab}
              </h2>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                下部のタブバーが表示されているか確認してください。
              </p>
              <div className="mt-6 space-y-2 text-left">
                <p>✅ 認証なしでタブバーを表示</p>
                <p>✅ タブの切り替えをテスト</p>
                <p>✅ レスポンシブデザインの確認</p>
              </div>
            </div>
          </div>
        </div>
        
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </main>
    </div>
  )
}

export default AppMinimal