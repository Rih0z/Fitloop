import React from 'react'
import { Brain, TrendingUp, Target, ExternalLink } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

export const Settings: React.FC = () => {
  const { darkMode } = useTheme()

  const steps = [
    {
      number: 1,
      title: 'プロフィール設定',
      description: 'あなたの基本情報、目標、環境を設定してパーソナライズされた体験を開始'
    },
    {
      number: 2,
      title: 'プロンプト生成',
      description: 'AIが最適なトレーニングプロンプトを自動生成します'
    },
    {
      number: 3,
      title: 'AI実行',
      description: (
        <span>
          生成されたプロンプトをClaude、ChatGPT、Geminiにコピー&ペーストして実行
          <button className="ml-2 inline-flex items-center gap-1 text-blue-500 hover:underline">
            <span>外部AIサービス</span>
            <ExternalLink size={12} />
          </button>
        </span>
      )
    },
    {
      number: 4,
      title: '結果入力',
      description: 'AIの応答を貼り付けて、次回のプロンプトを自動改善'
    }
  ]

  const features = [
    {
      icon: Brain,
      title: 'メタプロンプトシステム',
      description: 'プロンプトがプロンプトを生成し、継続的に進化する革新的なシステム',
      color: 'text-purple-500'
    },
    {
      icon: TrendingUp,
      title: '自動進化',
      description: 'あなたの記録とフィードバックに基づいて、トレーニングプランが自動的に改善',
      color: 'text-green-500'
    },
    {
      icon: Target,
      title: 'パーソナライズ',
      description: 'あなたの目標、環境、経験レベルに合わせて最適化されたトレーニング',
      color: 'text-blue-500'
    }
  ]

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-dark-primary' : 'bg-background-primary'} p-4`}>
      {/* Meta Prompt Explanation Card */}
      <div className={`p-4 rounded-xl mb-6 ${
        darkMode 
          ? 'bg-gradient-to-r from-purple-900 to-pink-900' 
          : 'bg-gradient-to-r from-purple-100 to-pink-100'
      }`}>
        <div className="flex items-start gap-3">
          <Brain size={20} className={darkMode ? 'text-purple-300 mt-0.5' : 'text-purple-600 mt-0.5'} />
          <div>
            <h2 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              メタプロンプトシステムについて
            </h2>
            <p className={`text-sm leading-5 ${darkMode ? 'text-purple-200' : 'text-gray-700'}`}>
              FitLoopは「プロンプトがプロンプトを生む」革新的なメタプロンプトシステムを採用。
              あなたのトレーニング記録から次回の最適化されたプロンプトを自動生成し、
              継続的に進化するパーソナルトレーニングプログラムを提供します。
            </p>
          </div>
        </div>
      </div>

      {/* Usage Guide */}
      <div className={`${darkMode ? 'bg-dark-secondary' : 'bg-white'} rounded-xl shadow-sm p-4 mb-6`}>
        <h2 className={`text-base font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          使い方ガイド
        </h2>
        
        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-3">
              {/* Number Circle */}
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                {step.number}
              </div>
              
              {/* Content */}
              <div>
                <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {step.title}
                </h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className={`${darkMode ? 'bg-dark-secondary' : 'bg-white'} rounded-xl shadow-sm p-4`}>
        <h2 className={`text-base font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          主な機能
        </h2>
        
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-3">
              {/* Icon */}
              <feature.icon size={20} className={`${feature.color} mt-0.5 flex-shrink-0`} />
              
              {/* Content */}
              <div>
                <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}