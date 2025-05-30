import { useEffect, useState } from 'react'
import { Copy, Check, Brain, Dumbbell, Moon, Sun, ClipboardPaste, User, FileText, Settings } from 'lucide-react'
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
  
  
  

  const handleUpdateProfile = async () => {
    try {
      const updatedProfile: UserProfile = {
        id: profile?.id,
        name: sanitizeInput(formData.name),
        goals: sanitizeInput(formData.goals),
        environment: sanitizeInput(formData.environment),
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
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
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center floating">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">
                FitLoop
              </h1>
              <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white neon-glow">
                <Brain className="w-3 h-3 mr-1" />
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
                  <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    プロンプト
                  </h2>
                  <button
                    onClick={handleCopyPrompt}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      copiedPrompt 
                        ? 'bg-green-600 text-white' 
                        : 'btn-gradient text-white'
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
                  <pre className={`whitespace-pre-wrap text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {currentPrompt || 'プロフィールを入力してください'}
                  </pre>
                </div>
              </div>

              {/* Response Area */}
              <div className={`${darkMode ? 'glass-effect-dark' : 'glass-effect'} rounded-2xl p-6 card-hover`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Claudeの結果
                  </h2>
                  <button
                    onClick={handlePasteResponse}
                    className="px-4 py-2 btn-gradient text-white rounded-xl font-medium transition-all"
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
                    className={`w-full px-4 py-4 rounded-xl border h-[600px] ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                    } focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all`}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className={`max-w-2xl mx-auto ${darkMode ? 'glass-effect-dark' : 'glass-effect'} rounded-2xl p-6 card-hover fade-in`}>
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                プロフィール設定
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    お名前
                  </label>
                  <div className="modern-input">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      maxLength={100}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-700 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all`}
                      placeholder="山田太郎"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    あなたの目的は？
                  </label>
                  <div className="modern-input">
                    <textarea
                      value={formData.goals}
                      onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                      maxLength={500}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-700 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all`}
                      rows={4}
                      placeholder="例: モテたい、健康になりたい、筋肉を大きくしたい"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    トレーニング環境は？
                  </label>
                  <div className="modern-input">
                    <textarea
                      value={formData.environment}
                      onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                      maxLength={500}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-700 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all`}
                      rows={4}
                      placeholder="例: ジムに通っている、ダンベルとベンチがある"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-500 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleUpdateProfile}
                  className="w-full py-4 btn-gradient text-white font-bold rounded-xl hover:shadow-lg transform transition-all duration-300"
                >
                  保存してプロンプトを更新
                </button>

                {context && (
                  <div className={`mt-6 p-4 rounded-xl ${darkMode ? 'neumorphism-dark' : 'neumorphism'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      現在のセッション: <span className="font-bold gradient-text">{context.sessionNumber}</span> ({getSessionTitle(context.sessionNumber)})
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      サイクル: <span className="font-bold gradient-text">{context.cycleNumber}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className={`max-w-2xl mx-auto ${darkMode ? 'glass-effect-dark' : 'glass-effect'} rounded-2xl p-6 card-hover fade-in`}>
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                設定
              </h2>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${darkMode ? 'neumorphism-dark' : 'neumorphism'} card-hover`}>
                  <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <span className="gradient-text">使い方</span>
                  </h3>
                  <ol className={`list-decimal list-inside space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <li className="hover:translate-x-1 transition-transform">「プロフィール」タブで情報を入力</li>
                    <li className="hover:translate-x-1 transition-transform">「プロンプト」タブでプロンプトをコピー</li>
                    <li className="hover:translate-x-1 transition-transform">Claude AIに貼り付けて実行</li>
                    <li className="hover:translate-x-1 transition-transform">Claudeの結果を「Claudeの結果」エリアに貼り付け</li>
                    <li className="hover:translate-x-1 transition-transform">自動的に次のセッションのプロンプトが生成されます</li>
                  </ol>
                </div>
                
                <div className={`p-4 rounded-xl ${darkMode ? 'neumorphism-dark' : 'neumorphism'} card-hover`}>
                  <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <span className="gradient-text">トレーニングサイクル</span>
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-bold text-purple-600">8セッション</span>で<span className="font-bold text-purple-600">1サイクル</span>です。サイクル完了後、トレーニングメニューが自動的に再構成されます。
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
                    ? 'text-purple-600' 
                    : darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <FileText size={24} />
                <span className="text-xs">プロンプト</span>
              </button>
              
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'profile' 
                    ? 'text-purple-600' 
                    : darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <User size={24} />
                <span className="text-xs">プロフィール</span>
              </button>
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
                  activeTab === 'settings' 
                    ? 'text-purple-600' 
                    : darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <Settings size={24} />
                <span className="text-xs">設定</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Error Display */}
      {error && activeTab === 'prompt' && (
        <div className="fixed bottom-20 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-3 rounded-xl shadow-lg fade-in neon-glow">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-3 text-white/80 hover:text-white hover:scale-110 transition-all"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

export default App