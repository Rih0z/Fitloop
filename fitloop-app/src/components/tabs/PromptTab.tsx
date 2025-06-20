import React, { useState } from 'react'
import { 
  AlertCircle, 
  Brain, 
  RefreshCw, 
  Activity, 
  Target,
  Zap,
  Copy,
  Check,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ClipboardPaste
} from 'lucide-react'
import { useClipboard } from '../../hooks/useClipboard'

// UI/UX仕様書 Section 4.1 プロンプトタブ（メイン画面） 完全準拠

// デフォルトのメタプロンプト (仕様書通り)
const DEFAULT_META_PROMPT = `# 🔄 メタプロンプト：脂肪燃焼 & 理想的筋肉バランス トレーニングシステム

## 重要：このプロンプトの自動更新機能

**このプロンプトはメタプロンプトです。** トレーニング記録を入力すると、Claude が自動的に：

1. **データを分析** - 最新のトレーニング実績と体組成を評価
2. **筋肉バランスを更新** - 使用重量から筋力バランスを再計算  
3. **次回プランを調整** - 最適な重量と回数を設定
4. **新しいプロンプトを生成** - 完全に更新されたプロンプト全体をアーティファクトで出力

**⭐ 使用方法**: 下記のテンプレートでトレーニング記録を送信してください。Claude が即座に次回用の新しいプロンプトを生成します。

---

## システム概要

このプロンプトは以下の機能を提供します：

1. **使用重量から筋肉バランスを分析**：実際のトレーニング重量から体の筋肉バランスを推測
2. **理想的な筋肉バランスを目指したプログラム調整**：黄金比に基づく美しい筋肉バランスの実現
3. **柔軟なトレーニング再構成**：8パターンの基本構造を維持しつつ、個人の発達状況に合わせて調整
4. **トレーニングサイクルの自動進行管理**：前回のセッションから次のセッションを自動表示
5. **🔄 メタプロンプト機能**：トレーニング記録入力後、完全に更新されたプロンプトを自動生成

## 最新のトレーニング記録

**最後に実施したトレーニング**: セッション1（初回設定）
**次回のトレーニング**: セッション1（胸・三頭筋）

## 次回のトレーニング詳細

### セッション1: 胸・三頭筋

**筋力トレーニング (20分)**
1. **ダンベルベンチプレス**
   - 3セット x 8-10回
   - 推奨重量: 体重×0.3kg
   - セット間60秒休憩

2. **インクラインダンベルフライ**
   - 3セット x 10-12回
   - 推奨重量: 体重×0.2kg
   - セット間60秒休憩

3. **ダンベルトライセプスエクステンション**
   - 3セット x 10-12回
   - 推奨重量: 体重×0.15kg
   - セット間45秒休憩

**HIIT カーディオ (15分)**
- ウォーミングアップ: 3分間軽めのジョギング
- インターバル: 30秒全力 → 60秒軽め × 8ラウンド
- クールダウン: 2分間ウォーキング`

interface BodyStats {
  musclePercentage: number
  fatPercentage: number
  weight: number
  trend: 'improving' | 'stable' | 'declining' | 'critical'
}

// CriticalAlert Component (UI/UX仕様書 Section 4.1.1)
interface CriticalAlertProps {
  bodyStats: BodyStats
}

const CriticalAlert: React.FC<CriticalAlertProps> = ({ bodyStats }) => {
  // Show when bodyStats.trend === 'critical'
  if (bodyStats.trend !== 'critical') {
    return null
  }

  return (
    <div className="card card-alert animate-fade-in">
      <div className="card-header">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="card-alert-icon flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="card-alert-title">
              ⚠️ 筋肉量低下の警告
            </h4>
            <p className="card-alert-text">
              筋肉量が{bodyStats.musclePercentage}%まで低下しています。
              プロテイン摂取量を増やし、筋力トレーニングの頻度を上げることを強く推奨します。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// MetaPromptStatus Component (UI/UX仕様書 Section 4.1.2)
interface MetaPromptStatusProps {
  promptVersion: number
  nextSession: number
  bodyStats: BodyStats
}

const MetaPromptStatus: React.FC<MetaPromptStatusProps> = ({ 
  promptVersion, 
  nextSession, 
  bodyStats 
}) => {
  return (
    <div className="card-glass animate-bounce-in card-hover-lift">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <Brain size={20} className="text-purple-500 animate-heartbeat" />
          <h3 className="heading-3">
            メタプロンプト状態
          </h3>
        </div>
        
        <div className="flex items-center gap-1">
          <RefreshCw size={16} className="text-green-500 animate-spin" />
          <span className="text-sm text-green-500 font-semibold">自動進化中</span>
        </div>
      </div>

      <div className="card-content">
        <div className="input-grid-2 mb-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-tertiary mb-1">プロンプト版数</div>
            <div className="font-semibold text-base">v{promptVersion}</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-tertiary mb-1">次回セッション</div>
            <div className="font-semibold text-base">#{nextSession}</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Activity size={16} className="text-blue-500" />
            <span>筋肉量: {bodyStats.musclePercentage}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Target size={16} className="text-green-500" />
            <span>体脂肪率: {bodyStats.fatPercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// MetaPromptDisplay Component (UI/UX仕様書 Section 4.1.3)
interface MetaPromptDisplayProps {
  prompt: string
  onRecordClick: () => void
}

const MetaPromptDisplay: React.FC<MetaPromptDisplayProps> = ({ 
  prompt, 
  onRecordClick 
}) => {
  const { copy } = useClipboard()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await copy(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  return (
    <div className="card-glass animate-fade-in card-hover-lift">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-yellow-500 animate-bounce" />
          <h3 className="heading-3">
            生成されたメタプロンプト
          </h3>
        </div>
      </div>

      <div className="card-content">
        <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
          <pre className="text-sm font-mono leading-6 whitespace-pre-wrap text-primary">
            {prompt}
          </pre>
        </div>

        <div className="card-actions">
          <button
            onClick={handleCopy}
            className={`
              btn btn-primary btn-micro flex-1
              ${copied ? 'btn-success feedback-success' : ''}
            `}
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
            {copied ? 'コピー完了!' : 'プロンプトをコピー'}
          </button>
          
          <button
            onClick={onRecordClick}
            className="btn btn-gradient-purple btn-micro"
          >
            <RefreshCw size={20} />
            記録入力
          </button>
        </div>
      </div>
    </div>
  )
}

// AIResponseArea Component (UI/UX仕様書 Section 4.1.5)
interface AIResponseAreaProps {
  response: string
  onResponseChange: (response: string) => void
  onPaste: () => void
  loading?: boolean
}

const AIResponseArea: React.FC<AIResponseAreaProps> = ({ 
  response, 
  onResponseChange, 
  onPaste, 
  loading = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="card animate-fade-in">
      <div className="card-collapsible-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-purple-500" />
          <h3 className="card-title">
            AI応答
          </h3>
        </div>
        
        <div className="transition-transform duration-200">
          {isExpanded ? (
            <ChevronUp size={20} className="text-tertiary" />
          ) : (
            <ChevronDown size={20} className="text-tertiary" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="card-collapsible-content">
          <div className="flex items-start gap-2 p-3 rounded-lg mb-3 bg-yellow-50">
            <Brain size={16} className="mt-1 flex-shrink-0 text-yellow-600" />
            <p className="text-sm text-secondary">
              外部AIサービス（Claude、ChatGPT、Gemini）からの応答を貼り付けてください。
              AIが分析して次回のメタプロンプトを自動改善します。
            </p>
          </div>

          <div className="relative">
            <textarea
              value={response}
              onChange={(e) => onResponseChange(e.target.value)}
              placeholder="AIの応答をここに貼り付けてください..."
              className="input textarea"
            />
            
            <button
              onClick={onPaste}
              disabled={loading}
              className={`
                absolute bottom-3 right-3
                btn-secondary px-3 py-1 text-sm
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <ClipboardPaste size={16} />
              貼り付け
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export const PromptTab: React.FC = () => {
  const { paste } = useClipboard()
  
  // State management
  const [prompt] = useState(DEFAULT_META_PROMPT)
  const [aiResponse, setAiResponse] = useState('')
  const [isAnalyzing] = useState(false)
  
  // Mock data - 実際の実装では Context/State から取得
  const [bodyStats] = useState<BodyStats>({
    musclePercentage: 82.3,
    fatPercentage: 15.2,
    weight: 71.2,
    trend: 'improving'
  })
  
  const [promptVersion] = useState(3)
  const [nextSession] = useState(2)

  const handleRecordClick = () => {
    // トレーニング記録入力モーダルを開く処理
    console.log('Record button clicked')
  }

  const handlePaste = async () => {
    try {
      const pastedText = await paste()
      setAiResponse(pastedText)
    } catch (error) {
      console.error('Paste failed:', error)
    }
  }

  const handleResponseChange = (response: string) => {
    setAiResponse(response)
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-4">
      <CriticalAlert bodyStats={bodyStats} />
      
      <MetaPromptStatus 
        promptVersion={promptVersion}
        nextSession={nextSession}
        bodyStats={bodyStats}
      />
      
      <MetaPromptDisplay 
        prompt={prompt}
        onRecordClick={handleRecordClick}
      />
      
      <AIResponseArea 
        response={aiResponse}
        onResponseChange={handleResponseChange}
        onPaste={handlePaste}
        loading={isAnalyzing}
      />
    </div>
  )
}