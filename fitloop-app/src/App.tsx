import { useEffect, useState } from 'react'
import { Copy, Check, Moon, Sun, ClipboardPaste, User, FileText, Settings, ChevronRight, ArrowLeft, CheckCircle2, BookOpen, Star, Search, Filter, Target, Home } from 'lucide-react'
import { StorageManager } from './lib/db'
import type { UserProfile } from './models/user'
import type { Context } from './models/context'
import type { SavedPrompt } from './models/promptCollection'
import { validateUserProfile } from './models/user'
import { sanitizeInput } from './utils/sanitize'
import { META_PROMPT_TEMPLATE, META_PROMPT_EXERCISES, SESSION_TITLES, extractMetadata } from './lib/metaPromptTemplate'
import { getGoalIcon, getEnvironmentIcon, getCategoryIcon, getCategoryName } from './utils/iconMappings'
import { AIAssistantIcon, TrainingIcon, CustomIcon } from './components/icons/CustomIcons'
import './App.css'

const storage = new StorageManager()

type TabType = 'prompt' | 'profile' | 'library' | 'settings'

function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [context, setContext] = useState<Context | null>(null)
  const [currentPrompt, setCurrentPrompt] = useState<string>('')
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('prompt')
  const [formData, setFormData] = useState({
    name: '',
    goals: '',
    environment: ''
  })
  const [profileStep, setProfileStep] = useState(1)
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('')
  const [customGoal, setCustomGoal] = useState('')
  const [customEnvironment, setCustomEnvironment] = useState('')
  
  // プロンプトライブラリ関連
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showMetaPromptsOnly, setShowMetaPromptsOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // 初期データ読み込み
  useEffect(() => {
    loadData()
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true')
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const savedProfile = await storage.getProfile()
      const savedContext = await storage.getContext()
      
      if (savedProfile) {
        setProfile(savedProfile)
        setFormData({
          name: savedProfile.name,
          goals: savedProfile.goals,
          environment: savedProfile.environment
        })
        // If profile exists, show completion state
        setProfileStep(1)
      }
      
      if (savedContext) {
        setContext(savedContext)
      } else if (savedProfile) {
        await storage.updateContext({ cycleNumber: 1, sessionNumber: 1 })
        const newContext = await storage.getContext()
        setContext(newContext)
      }

      if (savedProfile && savedContext) {
        generateFullPrompt(savedProfile, savedContext)
      }
      
      // 初期データとプロンプトライブラリを読み込み
      await storage.initializeDefaultPrompts()
      await loadSavedPrompts()
    } catch (error) {
      setError('データの読み込みに失敗しました')
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

  const generateFullPrompt = (userProfile: UserProfile, contextData: Context) => {
    const sessionNumber = contextData.sessionNumber
    const sessionTitle = SESSION_TITLES[sessionNumber as keyof typeof SESSION_TITLES] || SESSION_TITLES[1]
    const exercises = META_PROMPT_EXERCISES[sessionNumber as keyof typeof META_PROMPT_EXERCISES] || META_PROMPT_EXERCISES[1]
    const lastSession = contextData.sessionNumber > 1 ? contextData.sessionNumber - 1 : 8
    const lastSessionTitle = SESSION_TITLES[lastSession as keyof typeof SESSION_TITLES]
    const lastDate = new Date().toLocaleDateString('ja-JP')
    
    // Format exercises for the template
    const exercisesText = exercises.map((ex: any, i: number) => 
      `${i + 1}. **${ex.name}**
   - ${ex.sets}セット x ${ex.targetReps}
   - 推奨重量: ${ex.weight}${ex.unit}
   - セット間${ex.rest}秒休憩`
    ).join('\n\n')
    
    // Prepare JSON data for metadata
    const exercisesJSON = JSON.stringify(exercises.map((ex: any) => ({
      name: ex.name,
      targetWeight: ex.weight,
      targetReps: ex.targetReps,
      targetSets: ex.sets,
      lastPerformance: null
    })), null, 2)
    
    const muscleBalanceJSON = JSON.stringify({
      pushUpperBody: "normal",
      pullUpperBody: "normal",
      lowerBodyFront: "normal",
      lowerBodyBack: "normal",
      core: "normal"
    }, null, 2)
    
    const recommendationsJSON = JSON.stringify([
      "基礎筋力の構築に焦点を当てる",
      "正しいフォームの習得を優先"
    ], null, 2)
    
    // Include user info at the beginning
    const userInfoSection = `## ユーザー情報
- 名前: ${userProfile.name}
- 目標: ${userProfile.goals}
- 環境: ${userProfile.environment}

`
    
    // Replace placeholders in template
    let prompt = META_PROMPT_TEMPLATE
      .replace(/{{lastSession}}/g, `セッション${lastSession}（${lastSessionTitle}） - ${lastDate}実施`)
      .replace(/{{nextSession}}/g, `セッション${sessionNumber}（${sessionTitle}）`)
      .replace(/{{currentSession}}/g, `セッション${sessionNumber}: ${sessionTitle}`)
      .replace(/{{exercises}}/g, exercisesText)
      .replace(/{{sessionNumber}}/g, sessionNumber.toString())
      .replace(/{{sessionName}}/g, sessionTitle)
      .replace(/{{date}}/g, new Date().toISOString().split('T')[0])
      .replace(/{{exercisesJSON}}/g, exercisesJSON)
      .replace(/{{muscleBalanceJSON}}/g, muscleBalanceJSON)
      .replace(/{{recommendationsJSON}}/g, recommendationsJSON)
      .replace(/{{nextSessionNumber}}/g, (sessionNumber % 8 + 1).toString())
      .replace(/{{cycleProgress}}/g, `${sessionNumber}/8`)
      .replace(/{{pushUpperBodyStatus}}/g, '標準')
      .replace(/{{pullUpperBodyStatus}}/g, '標準')
      .replace(/{{lowerBodyFrontStatus}}/g, '標準')
      .replace(/{{lowerBodyBackStatus}}/g, '標準')
      .replace(/{{coreStatus}}/g, '標準')
    
    // Insert user info after the main title
    const titleEnd = prompt.indexOf('\n\n## 🔄')
    prompt = prompt.slice(0, titleEnd + 2) + userInfoSection + prompt.slice(titleEnd + 2)
    
    setCurrentPrompt(prompt)
  }
  
  const getSessionTitle = (sessionNumber: number): string => {
    const sessionIndex = ((sessionNumber - 1) % 8) + 1
    return SESSION_TITLES[sessionIndex as keyof typeof SESSION_TITLES] || SESSION_TITLES[1]
  }
  
  
  

  const handleUpdateProfile = async (customFormData?: typeof formData) => {
    try {
      const dataToUse = customFormData || formData
      const updatedProfile: UserProfile = {
        id: profile?.id,
        name: sanitizeInput(dataToUse.name),
        goals: sanitizeInput(dataToUse.goals),
        environment: sanitizeInput(dataToUse.environment),
        preferences: profile?.preferences || {
          intensity: 'medium',
          frequency: 3,
          timeAvailable: 60,
        },
        createdAt: profile?.createdAt || new Date(),
        updatedAt: new Date(),
      }

      validateUserProfile(updatedProfile)
      await storage.saveProfile(updatedProfile)
      setProfile(updatedProfile)
      
      // 初回の場合はコンテキストも作成
      if (!context) {
        await storage.updateContext({ cycleNumber: 1, sessionNumber: 1 })
        const newContext = await storage.getContext()
        setContext(newContext)
        if (newContext) {
          generateFullPrompt(updatedProfile, newContext)
        }
      } else {
        generateFullPrompt(updatedProfile, context)
      }
      
      setError(null)
      setActiveTab('prompt') // プロンプトタブに自動で切り替え
      setProfileStep(1) // Reset to completion state
    } catch (error: any) {
      setError(error.message || 'プロフィール更新に失敗しました')
    }
  }

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(currentPrompt)
    setCopiedPrompt(true)
    
    // 現在のプロンプトを前回のプロンプトとして保存
    if (currentPrompt && context && profile) {
      await storage.saveCurrentPromptAsLast(
        currentPrompt,
        `${profile.name}さんのセッション${context.sessionNumber}`
      )
      await loadSavedPrompts() // リストを更新
    }
    
    setTimeout(() => setCopiedPrompt(false), 2000)
  }

  const handlePasteResponse = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setAiResponse(text)
      
      if (text && context && profile) {
        // Check if the pasted text contains a new meta-prompt
        const metadata = extractMetadata(text)
        
        if (metadata) {
          // Claude generated a new prompt with metadata
          setCurrentPrompt(text)
          
          // Update context with new session info from metadata
          await storage.updateContext({ 
            cycleNumber: Math.ceil(metadata.nextSession / 8), 
            sessionNumber: metadata.nextSession,
            performance: context.performance
          })
          
          const newContext = await storage.getContext()
          if (newContext) {
            setContext(newContext)
          }
        } else {
          // Regular training record (old behavior)
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
            generateFullPrompt(profile, newContext)
          }
        }
        
        await storage.savePrompt({
          type: 'training',
          content: text,
          metadata: { sessionNumber: context.sessionNumber },
          createdAt: new Date(),
          used: true,
        })
      }
    } catch (err) {
      setError('クリップボードへのアクセスに失敗しました')
    }
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    localStorage.setItem('darkMode', String(!darkMode))
  }

  // プロンプトライブラリヘルパー関数
  const handleCopyLibraryPrompt = async (prompt: SavedPrompt) => {
    await navigator.clipboard.writeText(prompt.content)
    await storage.updatePromptUsage(prompt.id!)
    await loadSavedPrompts()
    setCopiedPrompt(true)
    setTimeout(() => setCopiedPrompt(false), 2000)
  }

  const filteredPrompts = savedPrompts.filter(prompt => {
    const matchesSearch = searchQuery === '' || 
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory
    const matchesMetaFilter = !showMetaPromptsOnly || prompt.isMetaPrompt
    
    return matchesSearch && matchesCategory && matchesMetaFilter
  })


  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-gradient-to-br from-gray-50 to-white'}`}>
        <div className="loading-modern rounded-full h-16 w-16 border-4 border-orange-500/20 border-t-orange-500 animate-spin"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'} flex flex-col`}>
      {/* Header */}
      <header className={`${darkMode ? 'nav-modern' : 'glass-modern'} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 energy-gradient rounded-2xl flex items-center justify-center floating-modern micro-bounce">
                <TrainingIcon size={28} color="white" />
              </div>
              <h1 className="text-display font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                FitLoop
              </h1>
              <div className="premium-indicator">
                <AIAssistantIcon size={16} className="mr-1" />
                AI対応
              </div>
            </div>
            
            <button
              onClick={toggleDarkMode}
              className={`p-3 rounded-2xl transition-all duration-300 ${
                darkMode 
                  ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400' 
                  : 'bg-gray-800/10 hover:bg-gray-800/20 text-gray-700'
              } hover:scale-110 micro-bounce`}
            >
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-indigo-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
          {activeTab === 'prompt' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Prompt Area */}
              <div className={`${darkMode ? 'card-modern-dark' : 'card-modern'} p-8 reveal-animation`}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className={`text-headline ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                      AI プロンプト
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      お使いのAIツール（Claude、ChatGPT等）にコピー&ペーストしてください
                    </p>
                  </div>
                  <button
                    onClick={handleCopyPrompt}
                    className={`btn-energy-modern ${
                      copiedPrompt ? 'animate-pulse' : ''
                    }`}
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="inline w-4 h-4 mr-2" />
                        コピー済み
                      </>
                    ) : (
                      <>
                        <Copy className="inline w-4 h-4 mr-2" />
                        コピー
                      </>
                    )}
                  </button>
                </div>
                
                <div className={`rounded-2xl p-6 ${
                  darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50/50 border border-gray-200'
                } h-[600px] overflow-auto backdrop-blur-sm`}>
                  <pre className={`whitespace-pre-wrap text-lg leading-relaxed font-mono ${
                    darkMode ? 'text-gray-100' : 'text-gray-800'
                  }`}>
                    {currentPrompt || (
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} italic`}>
                        プロフィールを設定してプロンプトを生成してください
                      </span>
                    )}
                  </pre>
                </div>
              </div>

              {/* Response Area */}
              <div className={`${darkMode ? 'card-modern-dark' : 'card-modern'} p-8 reveal-animation`}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className={`text-headline ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                      AI の回答
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      AIからの回答をここに貼り付けて次のセッションを生成
                    </p>
                  </div>
                  <button
                    onClick={handlePasteResponse}
                    className="btn-uber micro-bounce"
                  >
                    <ClipboardPaste className="inline w-4 h-4 mr-2" />
                    貼り付け
                  </button>
                </div>
                
                <div className="modern-input">
                  <textarea
                    value={aiResponse}
                    onChange={(e) => setAiResponse(e.target.value)}
                    placeholder="Claude からの結果をここに貼り付けてください..."
                    className={`w-full h-[600px] text-lg leading-relaxed resize-none ${
                      darkMode ? 'input-modern-dark' : 'input-modern'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className={`max-w-3xl mx-auto ${darkMode ? 'card-modern-dark' : 'card-modern'} p-8 reveal-animation`}>
              {/* Progress Indicator */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-hero ${darkMode ? 'text-white' : 'text-gray-900'} leading-tight`}>
                    <TrainingIcon size={40} className="inline mr-3 text-orange-500 floating-modern" />
                    フィットネスの旅を始めよう！
                  </h2>
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-3 rounded-full transition-all duration-500 ${
                      profileStep >= 1 ? 'health-gradient' : darkMode ? 'bg-gray-700' : 'bg-gray-300'
                    }`} />
                    <div className={`w-12 h-3 rounded-full transition-all duration-500 ${
                      profileStep >= 2 ? 'health-gradient' : darkMode ? 'bg-gray-700' : 'bg-gray-300'
                    }`} />
                    <div className={`w-12 h-3 rounded-full transition-all duration-500 ${
                      profileStep >= 3 ? 'success-gradient' : darkMode ? 'bg-gray-700' : 'bg-gray-300'
                    }`} />
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Step 1: Name */}
                {profileStep === 1 && (
                  <div className="reveal-animation">
                    <div className="text-center mb-12">
                      <div className="w-24 h-24 mx-auto mb-6 energy-gradient rounded-3xl flex items-center justify-center floating-modern micro-bounce">
                        <User className="w-12 h-12 text-white" />
                      </div>
                      <h3 className={`text-display mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        こんにちは！お名前を教えてください
                      </h3>
                      <p className={`text-body-modern ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        あなたに合わせたプログラムを作成します
                      </p>
                    </div>
                    
                    <div className="mb-8">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        maxLength={100}
                        className={`w-full text-2xl font-medium ${
                          darkMode ? 'input-modern-dark' : 'input-modern'
                        }`}
                        placeholder="お名前を入力..."
                        autoFocus
                      />
                    </div>
                    
                    <button
                      onClick={() => formData.name && setProfileStep(2)}
                      disabled={!formData.name}
                      className={`w-full py-5 rounded-2xl font-bold text-xl transition-all flex items-center justify-center ${
                        formData.name
                          ? 'btn-energy-modern'
                          : darkMode ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' : 'bg-gray-200/50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      次へ
                      <ChevronRight className="ml-2 w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Step 2: Goals */}
                {profileStep === 2 && (
                  <div className="fade-in">
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 mx-auto mb-4 energy-gradient rounded-full flex items-center justify-center floating motivation-pulse">
                        <Target className="w-10 h-10 text-white" />
                      </div>
                      <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white text-contrast-dark' : 'text-gray-900 text-contrast'}`}>
                        {formData.name}さん、目標を選んでください
                      </h3>
                      <p className={`text-base font-medium ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>
                        複数選択できます（タップして選択）
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {[
                        { label: '筋肉をつけたい', value: '筋肉を大きくしたい' },
                        { label: '体力をつけたい', value: '体力・持久力向上' },
                        { label: '健康になりたい', value: '健康維持・改善' },
                        { label: 'モテたい', value: '見た目を良くしたい' },
                        { label: '痩せたい', value: 'ダイエット・減量' },
                        { label: 'スポーツ向上', value: 'スポーツパフォーマンス向上' }
                      ].map((goal) => {
                        const IconComponent = getGoalIcon(goal.value)
                        return (
                        <button
                          key={goal.value}
                          onClick={() => {
                            if (selectedGoals.includes(goal.value)) {
                              setSelectedGoals(selectedGoals.filter(g => g !== goal.value))
                            } else {
                              setSelectedGoals([...selectedGoals, goal.value])
                            }
                          }}
                          className={`p-6 rounded-2xl border-2 transition-all transform hover:scale-105 micro-bounce ${
                            selectedGoals.includes(goal.value)
                              ? 'border-orange-500 bg-gradient-to-br from-orange-500/10 to-red-500/10 shadow-lg'
                              : darkMode 
                                ? 'border-gray-700 hover:border-gray-600 bg-gray-800/50' 
                                : 'border-gray-300 hover:border-gray-400 bg-white/50'
                          }`}
                        >
                          <div className="relative">
                            <div className="mb-3 flex justify-center">
                              <IconComponent 
                                size={48} 
                                className={`${
                                  selectedGoals.includes(goal.value)
                                    ? 'text-orange-500'
                                    : darkMode ? 'text-gray-300' : 'text-gray-600'
                                }`}
                              />
                            </div>
                            {selectedGoals.includes(goal.value) && (
                              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>
                          <div className={`text-lg font-bold ${
                            selectedGoals.includes(goal.value)
                              ? 'text-orange-500'
                              : darkMode ? 'text-gray-100' : 'text-gray-800'
                          }`}>
                            {goal.label}
                          </div>
                        </button>
                        )
                      })}
                    </div>
                    
                    <div className="mb-6">
                      <label className={`block text-base font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                        その他の目標（任意）
                      </label>
                      <input
                        type="text"
                        value={customGoal}
                        onChange={(e) => setCustomGoal(e.target.value)}
                        className={`w-full px-4 py-3 text-base font-medium rounded-xl border ${
                          darkMode 
                            ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-300' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all`}
                        placeholder="他に目標があれば入力..."
                      />
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setProfileStep(1)}
                        className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center ${
                          darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <ArrowLeft className="mr-2 w-5 h-5" />
                        戻る
                      </button>
                      <button
                        onClick={() => {
                          const goals = [...selectedGoals]
                          if (customGoal) goals.push(customGoal)
                          setFormData({ ...formData, goals: goals.join('、') })
                          setProfileStep(3)
                        }}
                        disabled={selectedGoals.length === 0 && !customGoal}
                        className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center ${
                          selectedGoals.length > 0 || customGoal
                            ? 'btn-gradient text-white hover:shadow-lg transform hover:scale-105 energy-glow'
                            : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        次へ
                        <ChevronRight className="ml-2 w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Environment */}
                {profileStep === 3 && (
                  <div className="fade-in">
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 mx-auto mb-4 energy-gradient rounded-full flex items-center justify-center floating motivation-pulse">
                        <Home className="w-10 h-10 text-white" />
                      </div>
                      <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white text-contrast-dark' : 'text-gray-900 text-contrast'}`}>
                        トレーニング環境を教えてください
                      </h3>
                      <p className={`text-base font-medium ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>
                        あなたの環境に合わせたプログラムを作成します
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 mb-6">
                      {[
                        { label: 'ジムに通っている', desc: 'フル装備のジムが利用可能', value: 'ジムに通っている（フル装備）' },
                        { label: '自宅でダンベル', desc: 'ダンベルとベンチがある', value: '自宅トレーニング（ダンベルとベンチ）' },
                        { label: '自重トレーニング', desc: '器具なしでトレーニング', value: '自重トレーニングのみ' },
                        { label: 'ミニマル装備', desc: '最小限の器具', value: 'ミニマル装備（抵抗バンドなど）' }
                      ].map((env) => {
                        const IconComponent = getEnvironmentIcon(env.value)
                        return (
                        <button
                          key={env.value}
                          onClick={() => setSelectedEnvironment(env.value)}
                          className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 text-left goal-card ${
                            selectedEnvironment === env.value
                              ? 'border-blue-500 bg-blue-500/10 health-glow selected'
                              : darkMode 
                                ? 'border-gray-700 hover:border-gray-600' 
                                : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-start relative">
                            <div className="mr-4">
                              <IconComponent size={32} className={selectedEnvironment === env.value ? 'text-blue-500' : darkMode ? 'text-gray-300' : 'text-gray-600'} />
                            </div>
                            <div className="flex-1">
                              <div className={`text-lg font-bold mb-1 ${
                                selectedEnvironment === env.value
                                  ? 'text-blue-500'
                                  : darkMode ? 'text-gray-50' : 'text-gray-900'
                              }`}>
                                {env.label}
                              </div>
                              <div className={`text-base font-medium ${
                                darkMode ? 'text-gray-200' : 'text-gray-600'
                              }`}>
                                {env.desc}
                              </div>
                            </div>
                            {selectedEnvironment === env.value && (
                              <div className="absolute top-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                        )
                      })}
                    </div>
                    
                    <div className="mb-6">
                      <label className={`block text-base font-bold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                        詳細を追加（任意）
                      </label>
                      <input
                        type="text"
                        value={customEnvironment}
                        onChange={(e) => setCustomEnvironment(e.target.value)}
                        className={`w-full px-4 py-3 text-base font-medium rounded-xl border ${
                          darkMode 
                            ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-300' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                        placeholder="例: 週3回ジムに通える、朝しか時間がない"
                      />
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setProfileStep(2)}
                        className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center ${
                          darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <ArrowLeft className="mr-2 w-5 h-5" />
                        戻る
                      </button>
                      <button
                        onClick={() => {
                          const environment = customEnvironment 
                            ? `${selectedEnvironment}、${customEnvironment}`
                            : selectedEnvironment
                          const updatedFormData = { ...formData, environment }
                          setFormData(updatedFormData)
                          handleUpdateProfile(updatedFormData)
                        }}
                        disabled={!selectedEnvironment}
                        className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center ${
                          selectedEnvironment
                            ? 'btn-achievement text-white hover:shadow-lg transform hover:scale-105 achievement-glow'
                            : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        <CheckCircle2 className="mr-2 w-5 h-5" />
                        始める！
                      </button>
                    </div>
                  </div>
                )}

                {/* Completion State */}
                {profile && profileStep === 1 && (
                  <div className={`mt-6 p-6 rounded-xl ${darkMode ? 'neumorphism-dark' : 'neumorphism'} text-center`}>
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500 success-glow" />
                    <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white text-contrast-dark' : 'text-gray-900 text-contrast'}`}>
                      プロフィール設定完了！
                    </h3>
                    <p className={`text-base font-medium mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>
                      プロンプトタブで始めましょう
                    </p>
                    <div className="space-y-2 text-left">
                      <p className={`text-base font-medium ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                        <strong>名前:</strong> {profile.name}
                      </p>
                      <p className={`text-base font-medium ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                        <strong>目標:</strong> {profile.goals}
                      </p>
                      <p className={`text-base font-medium ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                        <strong>環境:</strong> {profile.environment}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setProfileStep(1)
                        setSelectedGoals([])
                        setSelectedEnvironment('')
                        setCustomGoal('')
                        setCustomEnvironment('')
                      }}
                      className={`mt-4 px-6 py-2 rounded-xl font-bold text-base transition-all ${
                        darkMode ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      プロフィールを編集
                    </button>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-600 dark:text-red-400 text-base font-medium">
                    {error}
                  </div>
                )}

                {context && profile && profileStep === 1 && (
                  <div className={`mt-6 p-4 rounded-xl ${darkMode ? 'neumorphism-dark' : 'neumorphism'}`}>
                    <p className={`text-base font-medium ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                      現在のセッション: <span className="font-bold health-text text-lg">{context.sessionNumber}</span> ({getSessionTitle(context.sessionNumber)})
                    </p>
                    <p className={`text-base font-medium ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                      サイクル: <span className="font-bold health-text text-lg">{context.cycleNumber}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'library' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className={`${darkMode ? 'glass-effect-dark' : 'glass-effect'} rounded-2xl p-6 card-hover fade-in`}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-3xl font-bold ${darkMode ? 'text-white text-contrast-dark' : 'text-gray-900 text-contrast'}`}>
                    <BookOpen className="inline w-8 h-8 mr-3 text-orange-500 energy-glow" />
                    プロンプトライブラリ
                  </h2>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setShowMetaPromptsOnly(!showMetaPromptsOnly)}
                      className={`px-4 py-2 rounded-xl font-bold text-base transition-all flex items-center ${
                        showMetaPromptsOnly
                          ? 'btn-gradient text-white energy-glow'
                          : darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      メタプロンプトのみ
                    </button>
                  </div>
                </div>

                {/* フィルター & 検索 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="modern-input">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="プロンプトを検索..."
                        className={`w-full pl-12 pr-4 py-3 text-base font-medium rounded-xl border ${
                          darkMode 
                            ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-300' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all`}
                      />
                    </div>
                  </div>
                  
                  <div className="modern-input">
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 text-base font-medium rounded-xl border ${
                          darkMode 
                            ? 'bg-gray-800 border-gray-600 text-gray-100' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all`}
                      >
                        <option value="all">全カテゴリ</option>
                        <option value="training">筋トレ</option>
                        <option value="nutrition">栄養</option>
                        <option value="analysis">分析</option>
                        <option value="planning">計画</option>
                        <option value="custom">カスタム</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* プロンプトリスト */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredPrompts.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <div className="mb-4 flex justify-center">
                        <CustomIcon size={64} className={darkMode ? 'text-gray-600' : 'text-gray-400'} />
                      </div>
                      <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        プロンプトが見つかりませんでした
                      </p>
                    </div>
                  ) : (
                    filteredPrompts.map((prompt) => (
                      <div
                        key={prompt.id}
                        className={`${darkMode ? 'prompt-card-modern-dark' : 'prompt-card-modern'} relative group reveal-animation`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              {(() => {
                                const CategoryIconComponent = getCategoryIcon(prompt.category)
                                return <CategoryIconComponent size={24} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                              })()}
                            </div>
                            {prompt.isMetaPrompt && (
                              <div className="badge-meta">
                                META
                              </div>
                            )}
                            <span className={`badge-modern ${
                              darkMode ? 'badge-category-dark' : 'badge-category'
                            }`}>
                              {getCategoryName(prompt.category)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <span>{prompt.usageCount}</span>
                            <span>回使用</span>
                          </div>
                        </div>
                        
                        <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {prompt.title}
                        </h3>
                        
                        {prompt.description && (
                          <p className={`text-base font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {prompt.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {prompt.tags.map((tag, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 text-xs rounded-full ${
                                darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {prompt.lastUsed 
                              ? `最終使用: ${new Date(prompt.lastUsed).toLocaleDateString('ja-JP')}`
                              : '未使用'
                            }
                          </div>
                          <button
                            onClick={() => handleCopyLibraryPrompt(prompt)}
                            className="px-4 py-2 btn-gradient text-white rounded-xl font-bold text-sm transition-all energy-glow hover:scale-105"
                          >
                            <Copy className="inline w-4 h-4 mr-2" />
                            コピー
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className={`max-w-2xl mx-auto ${darkMode ? 'glass-effect-dark' : 'glass-effect'} rounded-2xl p-6 card-hover fade-in`}>
              <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white text-contrast-dark' : 'text-gray-900 text-contrast'}`}>
                使い方
              </h2>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${darkMode ? 'neumorphism-dark' : 'neumorphism'} card-hover`}>
                  <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <span className="energy-text">使い方</span>
                  </h3>
                  <ol className={`list-decimal list-inside space-y-3 text-base font-medium ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                    <li className="hover:translate-x-1 transition-transform">「プロフィール」タブで情報を入力</li>
                    <li className="hover:translate-x-1 transition-transform">「プロンプト」タブでプロンプトをコピー</li>
                    <li className="hover:translate-x-1 transition-transform">Claude AIに貼り付けて実行</li>
                    <li className="hover:translate-x-1 transition-transform">Claudeの結果を「Claudeの結果」エリアに貼り付け</li>
                    <li className="hover:translate-x-1 transition-transform">自動的に次のセッションのプロンプトが生成されます</li>
                  </ol>
                </div>
                
                <div className={`p-4 rounded-xl ${darkMode ? 'neumorphism-dark' : 'neumorphism'} card-hover`}>
                  <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <span className="health-text">トレーニングサイクル</span>
                  </h3>
                  <p className={`text-base font-medium ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                    <span className="font-bold achievement-text text-lg streak-glow">8セッション</span>で<span className="font-bold health-text text-lg">1サイクル</span>です。サイクル完了後、トレーニングメニューが自動的に再構成されます。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modern Tab Bar */}
        <div className={`${darkMode ? 'tab-bar-modern-dark' : 'tab-bar-modern'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-around relative">
              <button
                onClick={() => setActiveTab('prompt')}
                className={`tab-button-modern flex-1 py-4 flex flex-col items-center gap-2 transition-all micro-bounce ${
                  activeTab === 'prompt' 
                    ? 'text-orange-500 active' 
                    : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FileText size={26} />
                <span className="text-sm font-bold">プロンプト</span>
              </button>
              
              <button
                onClick={() => setActiveTab('profile')}
                className={`tab-button-modern flex-1 py-4 flex flex-col items-center gap-2 transition-all micro-bounce ${
                  activeTab === 'profile' 
                    ? 'text-orange-500 active' 
                    : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <User size={26} />
                <span className="text-sm font-bold">プロフィール</span>
              </button>
              
              <button
                onClick={() => setActiveTab('library')}
                className={`tab-button-modern flex-1 py-4 flex flex-col items-center gap-2 transition-all micro-bounce ${
                  activeTab === 'library' 
                    ? 'text-orange-500 active' 
                    : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <BookOpen size={26} />
                <span className="text-sm font-bold">ライブラリ</span>
              </button>
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`tab-button-modern flex-1 py-4 flex flex-col items-center gap-2 transition-all micro-bounce ${
                  activeTab === 'settings' 
                    ? 'text-orange-500 active' 
                    : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Settings size={26} />
                <span className="text-sm font-bold">使い方</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Error Display */}
      {error && activeTab === 'prompt' && (
        <div className="fixed bottom-20 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-4 rounded-xl shadow-lg fade-in neon-glow">
          <span className="text-base font-medium">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-3 text-white/80 hover:text-white hover:scale-110 transition-all text-lg font-bold"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

export default App