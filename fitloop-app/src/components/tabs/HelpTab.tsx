import React from 'react'
import { Brain, TrendingUp, Target, ExternalLink } from 'lucide-react'

// UI/UX仕様書 Section 4.4 使い方タブ 完全準拠

export const HelpTab: React.FC = () => {

  const guideSteps = [
    {
      number: 1,
      title: 'プロフィール設定',
      description: 'プロフィールタブで基本情報、目標、トレーニング環境を入力してください。'
    },
    {
      number: 2,
      title: 'メタプロンプトをコピー',
      description: 'プロンプトタブで生成されたメタプロンプトをコピーボタンで取得してください。'
    },
    {
      number: 3,
      title: 'ClaudeでAI指導を受ける',
      description: 'コピーしたプロンプトをClaude AIに貼り付けて、個別指導を受けてください。',
      hasLink: true,
      linkUrl: 'https://claude.ai'
    },
    {
      number: 4,
      title: 'AI応答を貼り付け',
      description: 'ClaudeからのトレーニングガイダンスをAI応答エリアに貼り付けて記録してください。'
    },
    {
      number: 5,
      title: '自動プロンプト更新',
      description: 'システムが自動的に次回用のメタプロンプトを生成し、継続的に改善されます。'
    }
  ]

  const features = [
    {
      icon: Brain,
      iconColor: 'text-purple-500',
      title: 'メタプロンプト機能',
      description: 'トレーニング結果に基づいて自動的にプロンプトが改善され、個人に最適化されます。'
    },
    {
      icon: TrendingUp,
      iconColor: 'text-green-500',
      title: '継続的改善',
      description: '8セッションサイクルで筋肉バランスを分析し、弱点を重点的に強化します。'
    },
    {
      icon: Target,
      iconColor: 'text-blue-500',
      title: '目標達成サポート',
      description: 'あなたの目標（筋力向上・脂肪燃焼・筋肥大）に合わせたプログラムを自動生成します。'
    }
  ]

  return (
    <div className="flex-1 overflow-y-auto space-y-6">
      <div className="card-glass p-4 bg-gradient-to-br from-purple-100 to-pink-100 animate-bounce-in card-hover-lift">
        <div className="flex items-start gap-3">
          <Brain size={24} className="text-purple-600" />
          <div className="flex-1">
            <h2 className="heading-2 text-purple-900 mb-2">
              🔄 メタプロンプト システム
            </h2>
            <p className="text-sm text-purple-800">
              このアプリは「メタプロンプト」機能により、あなたのトレーニング結果を学習し、
              Claude AIと連携して最適なワークアウトプランを自動生成します。
              使用すればするほど、あなた専用にカスタマイズされていきます。
            </p>
          </div>
        </div>
      </div>

      <div className="card-glass animate-bounce-in card-hover-lift">
        <h3 className="heading-3 mb-4">
          📋 使い方ガイド
        </h3>
          
          {/* Step Item: Layout: Flex horizontal, Gap: 12px, Margin Bottom: 16px */}
          <div className="space-y-4">
            {guideSteps.map((step, index) => (
              <div key={step.number} className="flex gap-3" style={{ animationDelay: `${index * 100}ms` }}>
                {/* Number Circle: Size: 32x32px, Background: Blue-500, Color: White, Font: text-sm font-medium, Flex Shrink: 0 */}
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium">{step.number}</span>
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <h4 className="font-medium mb-1 text-primary">
                    {step.title}
                  </h4>
                  <p className="text-sm text-secondary">
                    {step.description}
                  </p>
                  
                  {/* Link Button (Step 3): Color: Blue-500, Font: text-sm font-medium, Icon: ExternalLink 12x12px margin-left 4px, Hover: underline */}
                  {step.hasLink && (
                    <a
                      href={step.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        inline-flex items-center gap-1 mt-2 btn-micro
                        text-sm font-medium text-blue-500
                        hover:underline
                        transition-colors duration-200
                      "
                    >
                      Claude AIを開く
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      <div className="card-glass animate-bounce-in card-hover-lift">
        <h3 className="heading-3 mb-4">
          ⚡ 主な機能
        </h3>
          
          {/* Feature Item: Layout: Flex horizontal, Gap: 12px, Margin Bottom: 12px */}
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-3" style={{ animationDelay: `${(index + 5) * 100}ms` }}>
                {/* Icon: Size: 20x20px, Margin Top: 2px (align with text), Colors: Brain: Purple-500, TrendingUp: Green-500, Target: Blue-500 */}
                <feature.icon size={20} className={`${feature.iconColor} mt-0.5 flex-shrink-0`} />
                
                {/* Content */}
                <div className="flex-1">
                  <h4 className="font-medium mb-1 text-primary">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-secondary">
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