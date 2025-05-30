import { useEffect, useState } from 'react'
import { Copy, Check, Brain, Dumbbell, Moon, Sun, ClipboardPaste, User, FileText, Settings } from 'lucide-react'
import { StorageManager } from './lib/db'
import type { UserProfile } from './models/user'
import type { Context } from './models/context'
import { validateUserProfile } from './models/user'
import { sanitizeInput } from './utils/sanitize'
import { META_PROMPT_EXERCISES } from './lib/metaPromptTemplate'
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
    const lastDate = new Date().toLocaleDateString('ja-JP')
    
    const trainingHistory = contextData.performance.map((perf) => {
      const notes = typeof perf.notes === 'string' ? perf.notes : JSON.stringify(perf.notes || {})
      return `エクササイズ: ${perf.exerciseName} [${perf.date.toLocaleDateString('ja-JP')}]
${notes || '- データなし'}`
    }).join('\n\n')
    
    const bodyComp = '体組成データなし' // シンプル化
    
    const prompt = `# 脂肪燃焼 & 理想的筋肉バランス トレーニングシステム

## ユーザー情報
- 名前: ${userProfile.name}
- 目標: ${userProfile.goals}
- 環境: ${userProfile.environment}

## システム概要

このプロンプトは以下の機能を提供します：

1. **使用重量から筋肉バランスを分析**：実際のトレーニング重量から体の筋肉バランスを推測
2. **理想的な筋肉バランスを目指したプログラム調整**：黄金比に基づく美しい筋肉バランスの実現
3. **柔軟なトレーニング再構成**：8パターンの基本構造を維持しつつ、個人の発達状況に合わせて調整
4. **トレーニングサイクルの自動進行管理**：前回のセッションから次のセッションを自動表示

## 最新のトレーニング記録

**最後に実施したトレーニング**: セッション${contextData.sessionNumber > 1 ? contextData.sessionNumber - 1 : 8}（${lastDate}実施）

**次回のトレーニング**: セッション${contextData.sessionNumber}（${getSessionTitle(contextData.sessionNumber)}）

## 最新の身体測定値（${lastDate}測定）

${bodyComp}

## 過去のトレーニング実績データ

\`\`\`
${trainingHistory || 'トレーニング履歴なし'}
\`\`\`

## 次回のトレーニング詳細

### セッション${contextData.sessionNumber}: ${getSessionTitle(contextData.sessionNumber)}

**ウォームアップ (5分)**
- 軽いジョギング (3.5マイル/h) - 3分
- 関連部位のストレッチ - 2分

**筋力トレーニング (20分)**
${getSessionExercises(contextData.sessionNumber)}

**カーディオ (30分)**
- ${getCardioProtocol(contextData.sessionNumber)}に従って実施

**ストレッチ (5分)**
- 対象部位のストレッチ

## トレーニング後の記録方法（重要）

トレーニング実施後、**必ず以下のテンプレートに記入してClaudeに送信してください**：

\`\`\`
【トレーニング実施記録】
実施日: YYYY/MM/DD
実施セッション: [セッション番号]

使用重量と回数:
- [エクササイズ1]: [使用重量]ポンド × [実際の回数]回 × [セット数]セット
- [エクササイズ2]: [使用重量]ポンド × [実際の回数]回 × [セット数]セット
- [エクササイズ3]: [使用重量]ポンド × [実際の回数]回 × [セット数]セット

カーディオ:
- [プロトコルタイプ]
- 最高速度: [マイル/h]
- 総カロリー: [kcal]

体組成:
- 体重: [kg]
- 体脂肪率: [%]
- 筋肉量: [%]
- 内臓脂肪指数: [値]

主観的評価:
- 最も効いた部位: [部位名]
- 物足りなかった部位: [部位名]
- 全体的な疲労度 (1-10): [数値]

感想/備考:
[自由記述]
\`\`\`

${getFullTrainingProgram()}

## 理想的な筋肉バランスの指針

美しい筋肉バランスは以下の比率に基づいています：

1. **黄金比に基づく体型**:
   - 肩幅：ウエスト = 1.618：1（黄金比）
   - 胸囲：ウエスト = 1.4：1
   - 上腕：前腕 = 1.5：1
   - 大腿：ふくらはぎ = 1.75：1

2. **筋肉群間のバランス**:
   - 胸部：背中 = 1：1（均等な発達）
   - 大腿四頭筋：ハムストリング = 1：1（均等な発達）
   - プッシュ系：プル系 = 1：1（力のバランス）

3. **見た目の調和**:
   - 上半身と下半身の均衡
   - V字型上半身（広い肩、引き締まったウエスト）
   - 全体的な対称性

## 栄養戦略の基本指針

**マクロ栄養素バランス**
- タンパク質: 体重1kgあたり2.0-2.2g
- 炭水化物: 体重1kgあたり3-4g
- 脂質: 体重1kgあたり1g

**トレーニング前後の栄養**
- トレーニング前: 炭水化物30-40g + タンパク質20g（1-2時間前）
- トレーニング後: 炭水化物40-50g + タンパク質25-30g（30分以内）`
    
    setCurrentPrompt(prompt)
  }
  
  const getSessionTitle = (sessionNumber: number): string => {
    const titles: Record<number, string> = {
      1: '胸・三頭筋',
      2: '背中・二頭筋',
      3: '脚・コア',
      4: '肩・前腕',
      5: '全身サーキット',
      6: '上半身複合',
      7: '下半身・腹筋',
      8: '機能的全身',
    }
    const sessionIndex = ((sessionNumber - 1) % 8) + 1
    return titles[sessionIndex] || titles[1]
  }
  
  const getSessionExercises = (sessionNumber: number): string => {
    const sessionIndex = ((sessionNumber - 1) % 8) + 1 as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
    const exercises = META_PROMPT_EXERCISES[sessionIndex]
    return exercises.map((ex: any, idx: number) => 
      `${idx + 1}. **${ex.name}**
   - ${ex.sets}セット x ${ex.targetReps}
   - 推奨重量: ${ex.weight}${ex.unit}
   - セット間${ex.rest}秒休憩`
    ).join('\n\n')
  }
  
  const getCardioProtocol = (sessionNumber: number): string => {
    const protocols = ['標準HIITプロトコル', '中強度定常状態カーディオ', '標準HIITプロトコル', '標準HIITプロトコル', '軽めのHIITプロトコル', '標準HIITプロトコル', '中強度定常状態カーディオ', '軽めのHIITプロトコル']
    return protocols[((sessionNumber - 1) % 8)]
  }
  
  const getFullTrainingProgram = (): string => {
    return `## トレーニングセッション一覧

${[1,2,3,4,5,6,7,8].map(num => {
      const title = getSessionTitle(num)
      return `### セッション${num}: ${title}

詳細はトレーニング当日のプロンプトに含まれます。`
    }).join('\n\n')}

## カーディオプロトコル

### 標準HIITプロトコル
**合計時間: 30分**
- ウォームアップ (3分): 3.5マイル/hから徐々に5.0マイル/hまで上げる
- HIIT主要部分 (22分): 30秒8.5-9.0マイル/h（ダッシュ）、90秒4.5マイル/h（回復）を8-9回
- クールダウン (5分): 4.5マイル/hから徐々に3.5マイル/hに下げる

### 中強度定常状態カーディオ
**合計時間: 30分**
- ウォームアップ (5分): 3.5マイル/hから徐々に5.5-6.0マイル/hまで上げる
- 主要部分 (20分): 一定ペース5.5-6.0マイル/h（会話ができる程度の強度）
- クールダウン (5分): 5.5マイル/hから徐々に3.5マイル/hに下げる

### 軽めのHIITプロトコル
**合計時間: 30分**
- ウォームアップ (3分): 3.5マイル/hから徐々に5.0マイル/hまで上げる
- HIIT主要部分 (22分): 30秒7.5-8.0マイル/h（軽めダッシュ）、90秒4.5マイル/h（回復）を8-9回
- クールダウン (5分): 4.5マイル/hから徐々に3.5マイル/hに下げる`
  }

  const handleUpdateProfile = async () => {
    try {
      const updatedProfile: UserProfile = {
        ...profile,
        name: sanitizeInput(formData.name),
        goals: sanitizeInput(formData.goals),
        environment: sanitizeInput(formData.environment),
        updatedAt: new Date(),
      } as UserProfile

      validateUserProfile(updatedProfile)
      await storage.saveProfile(updatedProfile)
      setProfile(updatedProfile)
      
      if (context) {
        generateFullPrompt(updatedProfile, context)
      }
      
      setError(null)
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
        // Claudeの結果を記録として保存
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
        
        await storage.savePrompt({
          type: 'training',
          content: currentPrompt,
          metadata: { sessionNumber: context.sessionNumber },
          createdAt: new Date(),
          used: true,
        })
        
        const newContext = await storage.getContext()
        if (newContext) {
          setContext(newContext)
          generateFullPrompt(profile, newContext)
        }
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