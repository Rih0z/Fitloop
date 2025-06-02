import React from 'react'
import { Settings as SettingsIcon, Book, Heart, Github, Mail, Moon, Sun, Globe } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { useTranslation } from '../../hooks/useTranslation'

export const Settings: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme()
  const { language, toggleLanguage } = useTranslation()

  const features = [
    { 
      icon: '🤖', 
      title: 'AI統合', 
      description: 'Claude、ChatGPT、Geminiとのシームレスな連携' 
    },
    { 
      icon: '📊', 
      title: '学習システム', 
      description: 'あなたの進捗を分析し、最適な重量を提案' 
    },
    { 
      icon: '💪', 
      title: 'パーソナライズ', 
      description: '個人に最適化されたトレーニングプラン' 
    },
    { 
      icon: '🎯', 
      title: 'ゼロフリクション', 
      description: 'シンプルで直感的な操作性' 
    }
  ]

  const steps = [
    {
      number: '1',
      title: 'プロフィール設定',
      description: 'あなたの情報を入力して、パーソナライズされた体験を開始'
    },
    {
      number: '2',
      title: 'プロンプト生成',
      description: 'AIが最適なトレーニングプロンプトを自動生成'
    },
    {
      number: '3',
      title: 'トレーニング記録',
      description: 'ワークアウトを記録して、進捗を可視化'
    },
    {
      number: '4',
      title: '継続的改善',
      description: 'AIが学習し、より良いプランを提案'
    }
  ]

  return (
    <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen pb-20`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-xl border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} sticky top-0 z-10`}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-orange-600 to-red-600' : 'bg-gradient-to-br from-orange-500 to-red-500'}`}>
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                設定
              </h1>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                アプリの設定と使い方
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Settings Controls */}
        <div className={`rounded-3xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            アプリ設定
          </h2>
          
          <div className="space-y-4">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                <div>
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    ダークモード
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    目に優しい暗いテーマ
                  </p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  darkMode ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-blue-500" />
                <div>
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    言語設定
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {language === 'ja' ? '日本語' : 'English'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleLanguage}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {language === 'ja' ? 'EN' : 'JP'}
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className={`rounded-3xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            主な機能
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`p-4 rounded-2xl ${
                  darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                } transition-all hover:scale-105`}
              >
                <div className="text-3xl mb-2">{feature.icon}</div>
                <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How to Use */}
        <div className={`rounded-3xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Book className="w-5 h-5" />
            使い方
          </h2>
          
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  darkMode ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-gradient-to-br from-purple-500 to-pink-500'
                }`}>
                  {step.number}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div className={`rounded-3xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            FitLoopについて
          </h2>
          
          <div className={`space-y-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <p>
              FitLoopは、AIとフィットネスを融合させた革新的なトレーニングサポートアプリです。
            </p>
            <p>
              メタプロンプトシステムにより、あなたに最適化されたトレーニングプランを自動生成し、
              継続的な学習により、より効果的なフィットネス体験を提供します。
            </p>
            
            <div className="flex items-center gap-4 pt-4">
              <a 
                href="https://github.com/Rih0z/Fitloop" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <a 
                href="mailto:support@fitloop.app" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Mail className="w-4 h-4" />
                お問い合わせ
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <p className="flex items-center justify-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500" /> by FitLoop Team
          </p>
          <p className="text-sm mt-2">
            Version 2.0.0 • © 2025 FitLoop
          </p>
        </div>
      </div>
    </div>
  )
}