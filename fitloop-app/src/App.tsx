import { useEffect, useState } from 'react'
import { Header } from './components/layout/Header'
import { TabBar } from './components/layout/TabBar'
import { PromptDisplay } from './components/prompt/PromptDisplay'
import { AIResponseArea } from './components/prompt/AIResponseArea'
import { ProgressChart, MuscleBalanceChart } from './components/common/ProgressChart'
import { WorkoutTracker } from './components/common/WorkoutTracker'
import { useTabs } from './hooks/useTabs'
import { useProfile } from './hooks/useProfile'
import { useTranslation } from './hooks/useTranslation'
import { useTheme } from './hooks/useTheme'
import { useClipboard } from './hooks/useClipboard'
import { PromptService } from './services/PromptService'
import { LearningService } from './services/LearningService'
import { StorageManager } from './lib/db'
import type { Context } from './models/context'
import type { SavedPrompt } from './models/promptCollection'
import type { AIResponse } from './interfaces/IAIService'
import './App.css'

const storage = new StorageManager()
const promptService = new PromptService()
const learningService = LearningService.getInstance()

function App() {
  const { activeTab, changeTab } = useTabs()
  const { profile, loading: profileLoading, error: profileError } = useProfile()
  const { t, language } = useTranslation()
  const { darkMode } = useTheme()
  const clipboard = useClipboard()

  // App state
  const [context, setContext] = useState<Context | null>(null)
  const [currentPrompt, setCurrentPrompt] = useState<string>('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiResponseData, setAiResponseData] = useState<AIResponse | null>(null)
  const [learningData, setLearningData] = useState<any>(null)
  const [progressData, setProgressData] = useState<any[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [, setSavedPrompts] = useState<SavedPrompt[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  // Load learning data when profile changes
  useEffect(() => {
    if (profile) {
      loadLearningData()
    }
  }, [profile])

  // Generate prompt when profile or context changes
  useEffect(() => {
    if (profile && context) {
      const prompt = promptService.generateFullPrompt(profile, context, language)
      setCurrentPrompt(prompt)
    }
  }, [profile, context, language])

  const loadData = async () => {
    setLoading(true)
    try {
      const savedContext = await storage.getContext()
      
      if (savedContext) {
        setContext(savedContext)
      } else if (profile) {
        await storage.updateContext({ cycleNumber: 1, sessionNumber: 1 })
        const newContext = await storage.getContext()
        setContext(newContext)
      }

      await storage.initializeDefaultPrompts()
      await loadSavedPrompts()
    } catch (error) {
      setError(t('loadingFailed'))
    } finally {
      setLoading(false)
    }
  }

  const loadSavedPrompts = async () => {
    try {
      const prompts = await storage.getSavedPrompts()
      setSavedPrompts(prompts)
    } catch (error) {
      console.error('Failed to load saved prompts:', error)
    }
  }

  const loadLearningData = async () => {
    if (!profile) return

    try {
      // 進捗分析を取得
      const analysis = await promptService.getProgressAnalysis(profile.name)
      setLearningData(analysis)

      // エクササイズ一覧を取得
      const exercises = await learningService.getAllExercises(profile.name)
      
      // 各エクササイズの進捗データを取得
      const progressPromises = exercises.slice(0, 5).map(async exercise => {
        const progress = await learningService.getExerciseProgress(exercise, profile.name)
        return {
          exercise,
          history: progress.history.slice(0, 7).map(h => ({
            weight: h.weight,
            date: h.timestamp,
            reps: h.reps,
            sets: h.sets
          })),
          trend: progress.trend
        }
      })

      const progressResults = await Promise.all(progressPromises)
      setProgressData(progressResults)

      // 推奨重量を取得
      const recommendationPromises = exercises.slice(0, 10).map(async exercise => {
        const rec = await promptService.getWeightRecommendation(profile.name, exercise)
        return {
          exercise,
          weight: rec.weight,
          reasoning: rec.reasoning
        }
      })

      const recommendationResults = await Promise.all(recommendationPromises)
      setRecommendations(recommendationResults)

    } catch (error) {
      console.error('Failed to load learning data:', error)
    }
  }

  const handleGenerateAI = async () => {
    if (!profile || !context) return

    setLoading(true)
    try {
      const response = await promptService.generateAIResponse(profile, context, language)
      setAiResponseData(response)
      setAiResponse(response.content)
    } catch (error) {
      setError('AI応答の生成に失敗しました。')
      console.error('Failed to generate AI response:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveWorkout = async (workout: any) => {
    if (!profile) return

    try {
      await promptService.trackWorkout(
        profile.name,
        workout.exercise,
        workout.weight,
        workout.reps,
        workout.sets,
        workout.difficulty,
        workout.notes
      )
      
      // 学習データを再読み込み
      await loadLearningData()
      
      setSaveMessage('ワークアウトを保存しました！')
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      setError('ワークアウトの保存に失敗しました。')
      console.error('Failed to save workout:', error)
    }
  }

  const handleCopyPrompt = async () => {
    if (!currentPrompt || !context || !profile) return

    try {
      await clipboard.copy(currentPrompt)
      
      // Save prompt with date format
      const today = new Date()
      const month = today.getMonth() + 1
      const day = today.getDate()
      const dateTitle = `${month}月${day}日の筋トレ記録`
      
      await storage.saveCurrentPromptAsLast(currentPrompt, dateTitle)
      await loadSavedPrompts()
    } catch (err) {
      setError(t('clipboardAccessFailed'))
    }
  }

  const handlePasteResponse = async () => {
    try {
      const text = await clipboard.paste()
      setAiResponse(text)
      
      if (text && context && profile) {
        const metadata = promptService.extractMetadata(text)
        
        if (metadata) {
          // AI generated a new prompt with metadata
          setCurrentPrompt(text)
          
          const today = new Date()
          const month = today.getMonth() + 1
          const day = today.getDate()
          const dateTitle = `${month}月${day}日の筋トレ記録`
          
          await storage.savePromptToCollection({
            title: dateTitle,
            content: text,
            description: `${profile.name}さんの${dateTitle}`,
            category: 'training',
            tags: ['自動生成', `セッション${metadata.sessionNumber}`, metadata.sessionName, dateTitle],
            isMetaPrompt: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            usageCount: 0
          })
          
          await storage.updateContext({ 
            cycleNumber: Math.ceil(metadata.nextSession / 8), 
            sessionNumber: metadata.nextSession,
            performance: context.performance
          })
          
          const newContext = await storage.getContext()
          if (newContext) {
            setContext(newContext)
          }
          
          await loadSavedPrompts()
          
          setSaveMessage(t('saveMessage'))
          setTimeout(() => setSaveMessage(null), 3000)
        } else {
          // Check if this is a prompt
          const isPrompt = text.includes('トレーニング') || text.includes('セッション') || text.includes('エクササイズ')
          
          if (isPrompt && text.length > 500) {
            const today = new Date()
            const month = today.getMonth() + 1
            const day = today.getDate()
            const dateTitle = `${month}月${day}日の筋トレ記録`
            
            await storage.savePromptToCollection({
              title: dateTitle,
              content: text,
              description: `${profile.name}さんの${dateTitle}`,
              category: 'custom',
              tags: ['AI生成', 'カスタム', `セッション${context.sessionNumber}`, dateTitle],
              isMetaPrompt: false,
              createdAt: new Date(),
              updatedAt: new Date(),
              usageCount: 0
            })
            
            setCurrentPrompt(text)
            await loadSavedPrompts()
            
            setSaveMessage(t('saveMessage'))
            setTimeout(() => setSaveMessage(null), 3000)
          } else {
            // Regular training record
            const newPerformance: any = {
              date: new Date(),
              exerciseName: `セッション${context.sessionNumber}の記録`,
              sets: [],
              notes: text,
              muscleGroups: [],
            }
            
            const updatedPerformance = [...context.performance, newPerformance]
            
            const nextSession = context.sessionNumber + 1
            const nextCycle = nextSession > 8 ? context.cycleNumber + 1 : context.cycleNumber
            const sessionNumber = nextSession > 8 ? 1 : nextSession
            
            await storage.updateContext({ 
              cycleNumber: nextCycle, 
              sessionNumber: sessionNumber,
              performance: updatedPerformance
            })
            
            const newContext = await storage.getContext()
            if (newContext) {
              setContext(newContext)
            }
          }
        }
      }
    } catch (err) {
      setError(t('clipboardAccessFailed'))
    }
  }

  if (loading || profileLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-gradient-to-br from-gray-50 to-white'}`}>
        <div className="loading-modern rounded-full h-16 w-16 border-4 border-orange-500/20 border-t-orange-500 animate-spin"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'} flex flex-col`}>
      <Header />

      <main className="flex-1 flex flex-col">
        <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
          {activeTab === 'prompt' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PromptDisplay
                  prompt={currentPrompt}
                  onCopy={handleCopyPrompt}
                  copied={clipboard.copied}
                  loading={loading}
                />
                <AIResponseArea
                  response={aiResponse}
                  onResponseChange={setAiResponse}
                  onPaste={handlePasteResponse}
                  onGenerateAI={handleGenerateAI}
                  aiResponse={aiResponseData}
                  learningData={learningData}
                  loading={loading}
                />
              </div>
              
              {/* 学習データの可視化 */}
              {profile && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <WorkoutTracker
                    onSaveWorkout={handleSaveWorkout}
                    recommendations={recommendations}
                    className="lg:col-span-2"
                  />
                  <div className="space-y-6">
                    <ProgressChart data={progressData} />
                    {learningData && (
                      <MuscleBalanceChart data={learningData.muscleBalance || { upperBody: 0, lowerBody: 0, core: 0 }} />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className={`max-w-3xl mx-auto ${darkMode ? 'card-modern-dark' : 'card-modern'} p-8 reveal-animation`}>
              <h2 className={`text-hero ${darkMode ? 'text-white' : 'text-gray-900'} leading-tight mb-6`}>
                {t('profileTab')}
              </h2>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Profile management component will be implemented here
              </p>
              {profile && (
                <div className="mt-6 space-y-2">
                  <p><strong>{t('name')}:</strong> {profile.name}</p>
                  <p><strong>{t('goals')}:</strong> {profile.goals}</p>
                  <p><strong>{t('environment')}:</strong> {profile.environment}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'library' && (
            <div className={`max-w-6xl mx-auto ${darkMode ? 'glass-effect-dark' : 'glass-effect'} rounded-2xl p-6 card-hover fade-in`}>
              <h2 className={`text-3xl font-bold ${darkMode ? 'text-white text-contrast-dark' : 'text-gray-900 text-contrast'} mb-6`}>
                {t('promptLibrary')}
              </h2>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Prompt library component will be implemented here
              </p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className={`max-w-2xl mx-auto ${darkMode ? 'glass-effect-dark' : 'glass-effect'} rounded-2xl p-6 card-hover fade-in`}>
              <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white text-contrast-dark' : 'text-gray-900 text-contrast'}`}>
                {t('howToUse')}
              </h2>
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${darkMode ? 'neumorphism-dark' : 'neumorphism'} card-hover`}>
                  <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <span className="energy-text">{t('usage')}</span>
                  </h3>
                  <ol className={`list-decimal list-inside space-y-3 text-base font-medium ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                    {t('usageSteps').map((step: string, index: number) => (
                      <li key={index} className="hover:translate-x-1 transition-transform">{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        <TabBar activeTab={activeTab} onTabChange={changeTab} />
      </main>

      {/* Error Display */}
      {(error || profileError) && activeTab === 'prompt' && (
        <div className="fixed bottom-20 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-4 rounded-xl shadow-lg fade-in neon-glow">
          <span className="text-base font-medium">{error || profileError}</span>
          <button
            onClick={() => setError(null)}
            className="ml-3 text-white/80 hover:text-white hover:scale-110 transition-all text-lg font-bold"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Save Message */}
      {saveMessage && (
        <div className="fixed bottom-20 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-4 rounded-xl shadow-lg fade-in">
          <span className="text-base font-medium">{saveMessage}</span>
        </div>
      )}
    </div>
  )
}

export default App