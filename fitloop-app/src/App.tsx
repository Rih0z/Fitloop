import { useEffect, useState } from 'react'
import { Copy, Check, Brain, Dumbbell, Moon, Sun, ClipboardPaste, User, FileText, Settings, ChevronRight, Target, Home, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { StorageManager } from './lib/db'
import type { UserProfile } from './models/user'
import type { Context } from './models/context'
import { validateUserProfile } from './models/user'
import { sanitizeInput } from './utils/sanitize'
import { META_PROMPT_TEMPLATE, META_PROMPT_EXERCISES, SESSION_TITLES, extractMetadata } from './lib/metaPromptTemplate'
import './App.css'

const storage = new StorageManager()

type TabType = 'prompt' | 'profile' | 'settings'

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
    } catch (error) {
      setError('データの読み込みに失敗しました')
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 energy-glow"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex flex-col`}>
      {/* Header */}
      <header className={`${darkMode ? 'glass-effect-dark' : 'glass-effect'} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 energy-gradient rounded-xl flex items-center justify-center floating motivation-pulse">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold energy-text">
                FitLoop
              </h1>
              <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-sm font-bold premium-gradient text-white">
                <Brain className="w-4 h-4 mr-1" />
                Claude AI 推奨
              </span>
            </div>
            
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-xl btn-secondary hover:scale-110 transition-all`}
            >
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-indigo-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
          {activeTab === 'prompt' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Prompt Area */}
              <div className={`${darkMode ? 'glass-effect-dark' : 'glass-effect'} rounded-2xl p-6 card-hover`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white text-contrast-dark' : 'text-gray-900 text-contrast'}`}>
                    プロンプト
                  </h2>
                  <button
                    onClick={handleCopyPrompt}
                    className={`px-4 py-2 rounded-xl font-bold text-base transition-all ${
                      copiedPrompt 
                        ? 'btn-success text-white success-glow' 
                        : 'btn-gradient text-white energy-glow'
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
                
                <div className={`rounded-xl p-4 ${
                  darkMode ? 'neumorphism-dark' : 'bg-gray-50'
                } h-[600px] overflow-auto`}>
                  <pre className={`whitespace-pre-wrap text-base leading-relaxed ${
                    darkMode ? 'text-gray-100 text-contrast-dark' : 'text-gray-800 text-contrast'
                  }`}>
                    {currentPrompt || 'プロフィールを入力してください'}
                  </pre>
                </div>
              </div>

              {/* Response Area */}
              <div className={`${darkMode ? 'glass-effect-dark' : 'glass-effect'} rounded-2xl p-6 card-hover`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white text-contrast-dark' : 'text-gray-900 text-contrast'}`}>
                    Claudeの結果
                  </h2>
                  <button
                    onClick={handlePasteResponse}
                    className="px-4 py-2 btn-gradient text-white rounded-xl font-bold text-base transition-all energy-glow"
                  >
                    <ClipboardPaste className="inline w-4 h-4 mr-2" />
                    貼り付け
                  </button>
                </div>
                
                <div className="modern-input">
                  <textarea
                    value={aiResponse}
                    onChange={(e) => setAiResponse(e.target.value)}
                    placeholder="Claudeからの結果をここに貼り付けてください..."
                    className={`w-full px-4 py-4 rounded-xl border h-[600px] text-base leading-relaxed ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-300' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all`}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className={`max-w-2xl mx-auto ${darkMode ? 'glass-effect-dark' : 'glass-effect'} rounded-2xl p-6 card-hover fade-in`}>
              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-3xl font-bold ${darkMode ? 'text-white text-contrast-dark' : 'text-gray-900 text-contrast'}`}>
                    <Sparkles className="inline w-7 h-7 mr-2 text-orange-500 energy-glow" />
                    フィットネスの旅を始めよう！
                  </h2>
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-2 rounded-full transition-all ${
                      profileStep >= 1 ? 'health-gradient health-progress' : darkMode ? 'bg-gray-700' : 'bg-gray-300'
                    }`} />
                    <div className={`w-8 h-2 rounded-full transition-all ${
                      profileStep >= 2 ? 'health-gradient health-progress' : darkMode ? 'bg-gray-700' : 'bg-gray-300'
                    }`} />
                    <div className={`w-8 h-2 rounded-full transition-all ${
                      profileStep >= 3 ? 'success-gradient health-progress' : darkMode ? 'bg-gray-700' : 'bg-gray-300'
                    }`} />
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Step 1: Name */}
                {profileStep === 1 && (
                  <div className="fade-in">
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 mx-auto mb-4 energy-gradient rounded-full flex items-center justify-center floating motivation-pulse">
                        <User className="w-10 h-10 text-white" />
                      </div>
                      <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white text-contrast-dark' : 'text-gray-900 text-contrast'}`}>
                        こんにちは！お名前を教えてください
                      </h3>
                      <p className={`text-base font-medium ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>
                        あなたに合わせたプログラムを作成します
                      </p>
                    </div>
                    
                    <div className="modern-input">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        maxLength={100}
                        className={`w-full px-6 py-4 text-xl font-medium rounded-xl border ${
                          darkMode 
                            ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-300' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all`}
                        placeholder="お名前を入力..."
                        autoFocus
                      />
                    </div>
                    
                    <button
                      onClick={() => formData.name && setProfileStep(2)}
                      disabled={!formData.name}
                      className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center ${
                        formData.name
                          ? 'btn-gradient text-white hover:shadow-lg transform hover:scale-105 energy-glow'
                          : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-400'
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
                        { icon: '💪', label: '筋肉をつけたい', value: '筋肉を大きくしたい' },
                        { icon: '🏃', label: '体力をつけたい', value: '体力・持久力向上' },
                        { icon: '❤️', label: '健康になりたい', value: '健康維持・改善' },
                        { icon: '✨', label: 'モテたい', value: '見た目を良くしたい' },
                        { icon: '🎯', label: '痩せたい', value: 'ダイエット・減量' },
                        { icon: '🏆', label: 'スポーツ向上', value: 'スポーツパフォーマンス向上' }
                      ].map((goal) => (
                        <button
                          key={goal.value}
                          onClick={() => {
                            if (selectedGoals.includes(goal.value)) {
                              setSelectedGoals(selectedGoals.filter(g => g !== goal.value))
                            } else {
                              setSelectedGoals([...selectedGoals, goal.value])
                            }
                          }}
                          className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 goal-card ${
                            selectedGoals.includes(goal.value)
                              ? 'border-orange-500 bg-orange-500/10 energy-glow selected'
                              : darkMode 
                                ? 'border-gray-700 hover:border-gray-600' 
                                : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-3xl mb-2">{goal.icon}</div>
                          <div className={`text-base font-bold ${
                            selectedGoals.includes(goal.value)
                              ? 'text-orange-500'
                              : darkMode ? 'text-gray-100' : 'text-gray-800'
                          }`}>
                            {goal.label}
                          </div>
                        </button>
                      ))}
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
                        { icon: '🏋️', label: 'ジムに通っている', desc: 'フル装備のジムが利用可能', value: 'ジムに通っている（フル装備）' },
                        { icon: '🏠', label: '自宅でダンベル', desc: 'ダンベルとベンチがある', value: '自宅トレーニング（ダンベルとベンチ）' },
                        { icon: '💪', label: '自重トレーニング', desc: '器具なしでトレーニング', value: '自重トレーニングのみ' },
                        { icon: '🎯', label: 'ミニマル装備', desc: '最小限の器具', value: 'ミニマル装備（抵抗バンドなど）' }
                      ].map((env) => (
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
                          <div className="flex items-start">
                            <div className="text-2xl mr-4">{env.icon}</div>
                            <div>
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
                          </div>
                        </button>
                      ))}
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

          {activeTab === 'settings' && (
            <div className={`max-w-2xl mx-auto ${darkMode ? 'glass-effect-dark' : 'glass-effect'} rounded-2xl p-6 card-hover fade-in`}>
              <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white text-contrast-dark' : 'text-gray-900 text-contrast'}`}>
                設定
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

        {/* iOS Style Tab Bar */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t relative`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-around relative">
              <button
                onClick={() => setActiveTab('prompt')}
                className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'prompt' 
                    ? 'text-orange-500 energy-glow' 
                    : darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <FileText size={24} />
                <span className="text-sm font-bold">プロンプト</span>
              </button>
              
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'profile' 
                    ? 'text-orange-500 energy-glow' 
                    : darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <User size={24} />
                <span className="text-sm font-bold">プロフィール</span>
              </button>
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'settings' 
                    ? 'text-orange-500 energy-glow' 
                    : darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <Settings size={24} />
                <span className="text-sm font-bold">設定</span>
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