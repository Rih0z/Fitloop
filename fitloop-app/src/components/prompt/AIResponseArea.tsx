import React, { useState } from 'react'
import { ClipboardPaste, Brain, TrendingUp, Sparkles } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import { useTheme } from '../../hooks/useTheme'
import type { AIResponse } from '../../interfaces/IAIService'

interface AIResponseAreaProps {
  response: string
  onResponseChange: (response: string) => void
  onPaste: () => void
  aiResponse?: AIResponse | null
  learningData?: any
  loading?: boolean
}

export const AIResponseArea: React.FC<AIResponseAreaProps> = ({ 
  response, 
  onResponseChange, 
  onPaste, 
  aiResponse,
  learningData,
  loading = false 
}) => {
  const { t } = useTranslation()
  const { darkMode } = useTheme()
  const [activeTab, setActiveTab] = useState<'manual' | 'ai' | 'insights'>('manual')

  const displayContent = () => {
    switch (activeTab) {
      case 'ai':
        return response || 'AI レスポンスはまだありません。'
      case 'insights':
        return learningData ? formatLearningData(learningData) : '学習データはまだありません。'
      default:
        return response
    }
  }

  const formatLearningData = (data: any) => {
    if (!data) return ''
    
    return `# 📊 あなたの進捗分析

## 総合評価: ${data.overallProgress}

### 🏋️ トレーニング状況
- 週間頻度: ${data.consistency?.workoutsPerWeek || 0}回
- 連続記録: ${data.consistency?.streak || 0}日
- 最終トレーニング: ${data.consistency?.lastWorkout ? new Date(data.consistency.lastWorkout).toLocaleDateString('ja-JP') : '記録なし'}

### 💪 筋肉バランス
- 上半身: ${Math.round(data.muscleBalance?.upperBody || 0)}%
- 下半身: ${Math.round(data.muscleBalance?.lowerBody || 0)}%
- 体幹: ${Math.round(data.muscleBalance?.core || 0)}%

### ✅ あなたの強み
${(data.strengths || []).map((s: string) => `- ${s}`).join('\n')}

### 🎯 改善ポイント
${(data.areasForImprovement || []).map((a: string) => `- ${a}`).join('\n')}

### 📋 推奨事項
${(data.recommendations || []).map((r: string) => `- ${r}`).join('\n')}`
  }

  return (
    <div className={`${darkMode ? 'card-modern-dark' : 'card-modern'} p-8 reveal-animation`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-headline ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            AI レスポンス & データ分析
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            AIからの応答と学習データに基づく分析
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onPaste}
            disabled={loading}
            className={`btn-uber micro-bounce ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ClipboardPaste className="inline w-4 h-4 mr-2" />
            {t('paste')}
          </button>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'manual'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <ClipboardPaste className="inline w-4 h-4 mr-1" />
          手動入力
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'ai'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <Sparkles className="inline w-4 h-4 mr-1" />
          AI応答
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'insights'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <TrendingUp className="inline w-4 h-4 mr-1" />
          進捗分析
        </button>
      </div>

      {/* AI使用ガイド */}
      {activeTab === 'ai' && (
        <div className={`mb-4 p-4 rounded-lg border-2 border-dashed ${darkMode ? 'bg-blue-900/20 border-blue-600/30' : 'bg-blue-50 border-blue-300'}`}>
          <div className="flex items-start gap-3">
            <Brain className={`w-5 h-5 mt-0.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <div>
              <h3 className={`font-semibold mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                💡 AI応答の取得方法
              </h3>
              <div className={`text-sm space-y-2 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                <p><strong>1.</strong> 左のプロンプトをコピーして以下のAIサービスに貼り付けてください：</p>
                <div className="ml-4 space-y-1">
                  <div>🤖 <a href="https://claude.ai" target="_blank" rel="noopener" className="underline hover:no-underline">Claude (Anthropic)</a></div>
                  <div>✨ <a href="https://gemini.google.com" target="_blank" rel="noopener" className="underline hover:no-underline">Gemini (Google)</a></div>
                  <div>💬 <a href="https://chat.openai.com" target="_blank" rel="noopener" className="underline hover:no-underline">ChatGPT (OpenAI)</a></div>
                </div>
                <p><strong>2.</strong> AIの応答をコピーして、このエリアに貼り付けてください</p>
                <p><strong>3.</strong> 貼り付けボタンを押すと、自動でトレーニング記録として保存されます</p>
              </div>
              <div className={`mt-3 p-2 rounded text-xs ${darkMode ? 'bg-amber-900/30 text-amber-200' : 'bg-amber-100 text-amber-700'}`}>
                <strong>📢 今後の予定：</strong> ユーザー数が増加次第、AI生成機能を直接実装予定です！
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* AI応答のメタデータ */}
      {activeTab === 'ai' && aiResponse && (
        <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex justify-between items-center text-sm">
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              プロバイダー: {aiResponse.provider} | 
              生成時間: {aiResponse.timestamp.toLocaleTimeString('ja-JP')}
            </span>
            {aiResponse.usage && (
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                トークン: {aiResponse.usage.totalTokens}
              </span>
            )}
          </div>
          {aiResponse.error && (
            <div className="mt-2 text-red-500 text-sm">
              エラー: {aiResponse.error}
            </div>
          )}
        </div>
      )}
      
      <div className="modern-input relative">
        <textarea
          value={displayContent()}
          onChange={(e) => {
            if (activeTab === 'manual' || activeTab === 'ai') {
              onResponseChange(e.target.value)
            }
          }}
          placeholder={
            activeTab === 'manual' 
              ? t('responsePlaceholder')
              : activeTab === 'ai'
              ? 'Claude、Gemini、ChatGPTからの応答をここに貼り付けてください...'
              : '学習データに基づく分析がここに表示されます...'
          }
          disabled={loading}
          readOnly={activeTab === 'insights'}
          className={`w-full h-[600px] text-lg leading-relaxed resize-none ${
            darkMode ? 'input-modern-dark' : 'input-modern'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${
            activeTab === 'insights' ? 'cursor-default' : ''
          }`}
        />
        
        {/* Paste button for AI tab */}
        {activeTab === 'ai' && (
          <button
            onClick={onPaste}
            disabled={loading}
            className={`absolute top-4 right-4 px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
              darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' 
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ClipboardPaste className="inline w-4 h-4 mr-2" />
            貼り付け
          </button>
        )}
      </div>
    </div>
  )
}