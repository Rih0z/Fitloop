import { useEffect, useState } from 'react'
import { Header } from './components/layout/Header'
import { TabBar } from './components/layout/TabBar'
import { PromptDisplay } from './components/prompt/PromptDisplay'
import { AIResponseArea } from './components/prompt/AIResponseArea'
import { ProgressChart, MuscleBalanceChart } from './components/common/ProgressChart'
import { WorkoutTracker } from './components/common/WorkoutTracker'
import { ProfileManager } from './components/profile/ProfileManager'
import { ProfileOnboarding } from './components/profile/ProfileOnboarding'
import { PromptLibrary } from './components/library/PromptLibrary'
import { Settings } from './components/settings/Settings'
import { AuthModal } from './components/auth/AuthModal'
import { AuthProvider, useAuth } from './context/AuthContext'
import { TabDebugInfo } from './components/debug/TabDebugInfo'
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

function AppContent() {
  const { activeTab, changeTab } = useTabs()
  const { profile, loading: profileLoading, error: profileError, reloadProfile } = useProfile()
  const { t, language } = useTranslation()
  const { darkMode } = useTheme()
  const clipboard = useClipboard()
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  // App state
  const [context, setContext] = useState<Context | null>(null)
  const [currentPrompt, setCurrentPrompt] = useState<string>('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiResponseData] = useState<AIResponse | null>(null)
  const [learningData, setLearningData] = useState<any>(null)
  const [progressData, setProgressData] = useState<any[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [, setSavedPrompts] = useState<SavedPrompt[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  // Debug mode check - check immediately
  const debugMode = (() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      return urlParams.get('debug') === 'true'
    }
    return false
  })()
  
  const [showOnboarding, setShowOnboarding] = useState(false)
  // For now, disable auth modal to make the app accessible
  const [showAuthModal, setShowAuthModal] = useState(false) // Temporarily disabled

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  // Check authentication and onboarding
  useEffect(() => {
    // Debug: Log authentication state
    console.log('Auth State:', {
      authLoading,
      isAuthenticated,
      profileLoading,
      profile,
      showAuthModal,
      showOnboarding,
      debugMode
    })
    
    if (debugMode) {
      console.log('🐛 Debug mode enabled - bypassing authentication')
      setShowAuthModal(false)
      setShowOnboarding(false)
      return
    }
    
    // Temporarily disable auth modal to make app accessible
    if (!authLoading && !isAuthenticated && !debugMode) {
      // setShowAuthModal(true) // Temporarily commented out
    } else if (!profileLoading && !profile && isAuthenticated && !debugMode) {
      // setShowOnboarding(true) // Temporarily commented out
    }
  }, [authLoading, isAuthenticated, profileLoading, profile, debugMode])

  // Load learning data when profile changes
  useEffect(() => {
    if (profile) {
      loadLearningData()
    }
  }, [profile])

  // Generate prompt when profile or context changes
  useEffect(() => {
    console.log('Prompt generation check:', { profile: !!profile, context: !!context, debugMode })
    
    if (profile && context) {
      console.log('Generating prompt with profile:', profile.name)
      const prompt = promptService.generateFullPrompt(profile, context, language)
      setCurrentPrompt(prompt)
    } else if (!profile && context && debugMode) {
      console.log('Generating demo prompt for debug mode')
      // In debug mode, create a demo prompt without profile
      const demoProfile = {
        id: 999,
        name: 'デモユーザー',
        goals: '筋肉を大きくしたい',
        environment: 'ジム（フル装備）',
        preferences: {
          intensity: 'medium' as const,
          frequency: 3,
          timeAvailable: 45,
          workoutDuration: 60,
          workoutFrequency: 3,
          preferredTime: 'morning' as const,
          equipment: [],
          focusAreas: []
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
      const prompt = promptService.generateFullPrompt(demoProfile, context, language)
      setCurrentPrompt(prompt)
    } else {
      console.log('No prompt generated - missing requirements')
    }
  }, [profile, context, language, debugMode])

  const loadData = async () => {
    setLoading(true)
    try {
      const savedContext = await storage.getContext()
      
      if (savedContext) {
        setContext(savedContext)
      } else {
        // Initialize context even without profile in debug mode
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

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false)
    await loadData()
    changeTab('prompt')
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
    if (!currentPrompt) {
      console.error('No prompt to copy')
      return
    }

    try {
      await clipboard.copy(currentPrompt)
      
      // Save prompt with date format only if we have profile and context
      if (context && profile) {
        const today = new Date()
        const month = today.getMonth() + 1
        const day = today.getDate()
        const dateTitle = `${month}月${day}日の筋トレ記録`
        
        await storage.saveCurrentPromptAsLast(currentPrompt, dateTitle)
        await loadSavedPrompts()
      }
    } catch (err) {
      console.error('Copy failed:', err)
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

  if (loading || profileLoading || authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-gradient-to-br from-gray-50 to-white'}`}>
        <div className="loading-modern rounded-full h-16 w-16 border-4 border-orange-500/20 border-t-orange-500 animate-spin"></div>
      </div>
    )
  }

  if (showAuthModal && !debugMode) {
    return (
      <>
        <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-gradient-to-br from-gray-50 to-white'}`}>
          <div className="text-center space-y-8">
            <div className="text-6xl mb-4">🏋️‍♀️</div>
            <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              FitLoop
            </h1>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              AIパワードパーソナルトレーニング
            </p>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      </>
    )
  }

  if (showOnboarding && !debugMode) {
    return (
      <ProfileOnboarding
        onComplete={handleOnboardingComplete}
        initialProfile={profile}
      />
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'} flex flex-col`}>
      <TabDebugInfo />
      <Header />

      <main className="flex-1 flex flex-col pb-20">
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 w-full">
          {activeTab === 'prompt' && (
            <div className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
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
            <div className="max-w-4xl mx-auto page-transition">
              <ProfileManager 
                profile={profile} 
                onProfileUpdate={async () => {
                  await loadData()
                  await reloadProfile()
                }}
              />
            </div>
          )}

          {activeTab === 'library' && (
            <div className="page-transition -mx-6 -my-8">
              <PromptLibrary />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="page-transition -mx-6 -my-8">
              <Settings />
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App