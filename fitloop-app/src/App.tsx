import { useEffect, useState } from 'react'
import { Copy, Check, Moon, Sun, ClipboardPaste, User, FileText, Settings, ChevronRight, ArrowLeft, CheckCircle2, BookOpen, Star, Search, Filter, Target, Home, Edit3, X, Save, Globe } from 'lucide-react'
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
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem('language')
    const browserLang = navigator.language.split('-')[0]
    return stored || (browserLang === 'en' ? 'en' : 'ja')
  })
  
  // 簡単な翻訳関数
  const t = (key: string) => {
    const translations: any = {
      ja: {
        appName: 'FitLoop',
        aiSupported: 'AI対応',
        promptTab: 'プロンプト',
        profileTab: 'プロフィール', 
        libraryTab: 'ライブラリ',
        settingsTab: '使い方',
        aiPrompt: 'AI プロンプト',
        promptDescription: 'お使いのAIツール（Claude、Gemini等）にコピー&ペーストしてください',
        copy: 'コピー',
        copied: 'コピー済み',
        saveMessage: 'プロンプトをテンプレートとして保存しました',
        updateMessage: 'プロンプトを更新しました',
        howToUse: '使い方',
        usage: '使い方',
        trainingCycle: 'トレーニングサイクル',
        session: 'セッション',
        trainingCycleDescription: 'で1サイクルです。サイクル完了後、トレーニングメニューが自動的に再構成されます。',
        usageSteps: [
          '「プロフィール」タブで情報を入力',
          '「プロンプト」タブでプロンプトをコピー',
          'Claude AIに貼り付けて実行',
          'Claudeの結果を「Claudeの結果」エリアに貼り付け',
          '自動的に次のセッションのプロンプトが生成されます'
        ],
        meta: 'META',
        timesUsed: '回使用',
        unused: '未使用',
        noPromptsFound: 'プロンプトが見つかりませんでした'
      },
      en: {
        appName: 'FitLoop',
        aiSupported: 'AI Ready',
        promptTab: 'Prompt',
        profileTab: 'Profile',
        libraryTab: 'Library', 
        settingsTab: 'How to Use',
        aiPrompt: 'AI Prompt',
        promptDescription: 'Copy and paste this into your AI tool (Claude, Gemini, etc.)',
        copy: 'Copy',
        copied: 'Copied',
        saveMessage: 'Prompt saved as template',
        updateMessage: 'Prompt updated',
        howToUse: 'How to Use',
        usage: 'Usage',
        trainingCycle: 'Training Cycle',
        session: ' sessions',
        trainingCycleDescription: ' make 1 cycle. After cycle completion, the training menu is automatically reconstructed.',
        usageSteps: [
          'Enter your information in the "Profile" tab',
          'Copy the prompt from the "Prompt" tab',
          'Paste it into Claude AI and execute',
          'Paste Claude\'s response into the "AI Response" area',
          'The next session prompt will be automatically generated'
        ],
        meta: 'META',
        timesUsed: ' times used',
        unused: 'Unused',
        noPromptsFound: 'No prompts found'
      }
    }
    return translations[language]?.[key] || key
  }
  
  // 言語に応じたメッセージ
  const getLanguageInstruction = (lang: string) => {
    return lang === 'en' ? 'Please respond in English only.' : '回答は必ず日本語でお願いします。'
  }
  
  // 言語切り替え
  const toggleLanguage = () => {
    const newLang = language === 'ja' ? 'en' : 'ja'
    setLanguage(newLang)
    localStorage.setItem('language', newLang)
  }
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
  const [editingPrompt, setEditingPrompt] = useState<SavedPrompt | null>(null)
  const [editContent, setEditContent] = useState('')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

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
    
    // Replace placeholders in template and add language instruction
    const languageInstruction = getLanguageInstruction(language)
    let prompt = META_PROMPT_TEMPLATE
      .replace(/{{languageInstruction}}/g, languageInstruction)
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
      setError(error.message || t('profileUpdateFailed'))
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
          
          // Save the prompt as a template in the library
          await storage.savePromptToCollection({
            title: `セッション${metadata.sessionNumber} - ${metadata.sessionName}`,
            content: text,
            description: `${profile.name}さんのセッション${metadata.sessionNumber}用プロンプト`,
            category: 'training',
            tags: ['自動生成', `セッション${metadata.sessionNumber}`, metadata.sessionName],
            isMetaPrompt: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            usageCount: 0
          })
          
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
          
          // Reload prompts to show the new template
          await loadSavedPrompts()
          
          // Show save message
          setSaveMessage(t('saveMessage'))
          setTimeout(() => setSaveMessage(null), 3000)
        } else {
          // Check if this is a prompt (contains specific keywords)
          const isPrompt = text.includes('トレーニング') || text.includes('セッション') || text.includes('エクササイズ')
          
          if (isPrompt && text.length > 500) {
            // Save as a custom prompt template
            await storage.savePromptToCollection({
              title: `カスタムプロンプト - ${new Date().toLocaleDateString('ja-JP')}`,
              content: text,
              description: `${profile.name}さんがAIから取得したプロンプト`,
              category: 'custom',
              tags: ['AI生成', 'カスタム', `セッション${context.sessionNumber}`],
              isMetaPrompt: false,
              createdAt: new Date(),
              updatedAt: new Date(),
              usageCount: 0
            })
            
            // Set as current prompt
            setCurrentPrompt(text)
            
            // Reload prompts to show the new template
            await loadSavedPrompts()
            
            // Show save message
            setSaveMessage(t('saveMessage'))
            setTimeout(() => setSaveMessage(null), 3000)
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
        }
      }
    } catch (err) {
      setError(t('clipboardAccessFailed'))
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
  
  const handleEditPrompt = (prompt: SavedPrompt) => {
    setEditingPrompt(prompt)
    setEditContent(prompt.content)
  }
  
  const handleSaveEdit = async () => {
    if (editingPrompt && editingPrompt.id) {
      await storage.updatePromptContent(editingPrompt.id, editContent)
      await loadSavedPrompts()
      setEditingPrompt(null)
      setEditContent('')
      setSaveMessage(t('updateMessage'))
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }
  
  const handleCancelEdit = () => {
    setEditingPrompt(null)
    setEditContent('')
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
                {t('appName')}
              </h1>
              <div className="premium-indicator">
                <AIAssistantIcon size={16} className="mr-1" />
                {t('aiSupported')}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleLanguage}
                className={`flex items-center space-x-2 p-3 rounded-2xl transition-all duration-300 ${ 
                  darkMode 
                    ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' 
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                } hover:scale-110 micro-bounce`}
                title={`Current: ${language === 'ja' ? '日本語' : 'English'}`}
              >
                <Globe size={20} />
                <span className="text-sm font-bold">
                  {language === 'ja' ? '日本語' : 'EN'}
                </span>
              </button>
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
                      {t('aiPrompt')}
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('promptDescription')}
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
                        {t('copied')}
                      </>
                    ) : (
                      <>
                        <Copy className="inline w-4 h-4 mr-2" />
                        {t('copy')}
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
                        {t('promptPlaceholder')}
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
                      {t('aiResponse')}
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('aiResponseDescription')}
                    </p>
                  </div>
                  <button
                    onClick={handlePasteResponse}
                    className="btn-uber micro-bounce"
                  >
                    <ClipboardPaste className="inline w-4 h-4 mr-2" />
                    {t('paste')}
                  </button>
                </div>
                
                <div className="modern-input">
                  <textarea
                    value={aiResponse}
                    onChange={(e) => setAiResponse(e.target.value)}
                    placeholder={t('responsePlaceholder')}
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
                    {t('startFitnessJourney')}
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
                        {t('profileStep1Title')}
                      </h3>
                      <p className={`text-body-modern ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {t('profileStep1Description')}
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
                        placeholder={t('nameInputPlaceholder')}
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
                      {t('next')}
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
                        { label: t('goalOptions.buildMuscle'), value: '筋肉を大きくしたい' },
                        { label: t('goalOptions.improveStamina'), value: '体力・持久力向上' },
                        { label: t('goalOptions.stayHealthy'), value: '健康維持・改善' },
                        { label: t('goalOptions.lookBetter'), value: '見た目を良くしたい' },
                        { label: t('goalOptions.loseWeight'), value: 'ダイエット・減量' },
                        { label: t('goalOptions.improveSports'), value: 'スポーツパフォーマンス向上' }
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
                        {t('otherGoalsLabel')}
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
                        placeholder={t('otherGoalsPlaceholder')}
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
                        {t('back')}
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
                        {t('next')}
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
                        {t('profileStep3Title')}
                      </h3>
                      <p className={`text-base font-medium ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>
                        {t('profileStep3Description')}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 mb-6">
                      {[
                        { label: t('environments.gym'), desc: t('environments.gymDesc'), value: 'ジムに通っている（フル装備）' },
                        { label: t('environments.homeDumbbell'), desc: t('environments.homeDumbbellDesc'), value: '自宅トレーニング（ダンベルとベンチ）' },
                        { label: t('environments.bodyweight'), desc: t('environments.bodyweightDesc'), value: '自重トレーニングのみ' },
                        { label: t('environments.minimal'), desc: t('environments.minimalDesc'), value: 'ミニマル装備（抵抗バンドなど）' }
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
                        {t('detailsLabel')}
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
                        placeholder={t('detailsPlaceholder')}
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
                        {t('back')}
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
                        {t('start')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Completion State */}
                {profile && profileStep === 1 && (
                  <div className={`mt-6 p-6 rounded-xl ${darkMode ? 'neumorphism-dark' : 'neumorphism'} text-center`}>
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500 success-glow" />
                    <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white text-contrast-dark' : 'text-gray-900 text-contrast'}`}>
                      {t('profileComplete')}
                    </h3>
                    <p className={`text-base font-medium mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>
                      {t('profileCompleteDescription')}
                    </p>
                    <div className="space-y-2 text-left">
                      <p className={`text-base font-medium ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                        <strong>{t('name')}:</strong> {profile.name}
                      </p>
                      <p className={`text-base font-medium ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                        <strong>{t('goals')}:</strong> {profile.goals}
                      </p>
                      <p className={`text-base font-medium ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                        <strong>{t('environment')}:</strong> {profile.environment}
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
                      {t('editProfile')}
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
                      {t('currentSession')}: <span className="font-bold health-text text-lg">{context.sessionNumber}</span> ({getSessionTitle(context.sessionNumber)})
                    </p>
                    <p className={`text-base font-medium ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                      {t('cycle')}: <span className="font-bold health-text text-lg">{context.cycleNumber}</span>
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
                    {t('promptLibrary')}
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
                      {t('metaPromptsOnly')}
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
                        placeholder={t('searchPlaceholder')}
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
                        <option value="all">{t('allCategories')}</option>
                        <option value="training">{t('categories.training')}</option>
                        <option value="nutrition">{t('categories.nutrition')}</option>
                        <option value="analysis">{t('categories.analysis')}</option>
                        <option value="planning">{t('categories.planning')}</option>
                        <option value="custom">{t('categories.custom')}</option>
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
                        {t('noPromptsFound')}
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
                                {t('meta')}
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
                            <span>{t('timesUsed')}</span>
                          </div>
                        </div>
                        
                        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {prompt.title}
                        </h3>
                        
                        <div className="flex justify-between items-center">
                          <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {prompt.lastUsed 
                              ? `${new Date(prompt.lastUsed).toLocaleDateString('ja-JP')}`
                              : t('unused')
                            }
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditPrompt(prompt)}
                              className={`p-2 rounded-lg transition-all ${
                                darkMode 
                                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                              }`}
                              title={t('edit')}
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleCopyLibraryPrompt(prompt)}
                              className="px-4 py-2 btn-gradient text-white rounded-xl font-bold text-sm transition-all energy-glow hover:scale-105"
                            >
                              <Copy className="inline w-4 h-4 mr-2" />
                              {t('copy')}
                            </button>
                          </div>
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
                
                <div className={`p-4 rounded-xl ${darkMode ? 'neumorphism-dark' : 'neumorphism'} card-hover`}>
                  <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <span className="health-text">{t('trainingCycle')}</span>
                  </h3>
                  <p className={`text-base font-medium ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                    <span className="font-bold achievement-text text-lg streak-glow">8{t('session')}</span>{t('trainingCycleDescription')}
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
                <span className="text-sm font-bold">{t('promptTab')}</span>
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
                <span className="text-sm font-bold">{t('profileTab')}</span>
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
                <span className="text-sm font-bold">{t('libraryTab')}</span>
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
                <span className="text-sm font-bold">{t('settingsTab')}</span>
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
      
      {/* Save Message */}
      {saveMessage && (
        <div className="fixed bottom-20 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-4 rounded-xl shadow-lg fade-in">
          <span className="text-base font-medium">{saveMessage}</span>
        </div>
      )}
      
      {/* Edit Modal */}
      {editingPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-4xl ${darkMode ? 'card-modern-dark' : 'card-modern'} p-6 max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('editPrompt')}
              </h2>
              <button
                onClick={handleCancelEdit}
                className={`p-2 rounded-lg transition-all ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className={`text-lg font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {editingPrompt.title}
              </p>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className={`w-full h-96 p-4 rounded-xl border text-base font-mono ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all`}
                placeholder={t('editPlaceholder')}
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelEdit}
                className={`px-6 py-2 rounded-xl font-bold transition-all ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2 btn-gradient text-white rounded-xl font-bold transition-all energy-glow hover:scale-105 flex items-center"
              >
                <Save size={18} className="mr-2" />
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App