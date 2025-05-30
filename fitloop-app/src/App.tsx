import { useEffect, useState } from 'react'
import { Copy, Check, Upload, Download, Plus } from 'lucide-react'
import { StorageManager } from './lib/db'
import { PromptGenerator } from './lib/promptGenerator'
import type { UserProfile } from './models/user'
import type { Context } from './models/context'

const storage = new StorageManager()
const promptGenerator = new PromptGenerator()

function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [context, setContext] = useState<Context | null>(null)
  const [currentPrompt, setCurrentPrompt] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [aiResponse, setAiResponse] = useState('')

  // 初期データ読み込み
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const savedProfile = await storage.getProfile()
    const savedContext = await storage.getContext()
    
    if (savedProfile) {
      setProfile(savedProfile)
    } else {
      setShowSetup(true)
    }
    
    if (savedContext) {
      setContext(savedContext)
    }

    // プロンプト生成
    if (savedProfile && savedContext) {
      const prompt = promptGenerator.generateTrainingPrompt(savedContext, savedProfile)
      setCurrentPrompt(prompt)
    }
  }

  const handleSetup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const newProfile: UserProfile = {
      name: formData.get('name') as string,
      goals: formData.get('goals') as string,
      environment: formData.get('environment') as string,
      preferences: {
        intensity: 'medium',
        frequency: 3,
        timeAvailable: 60,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await storage.saveProfile(newProfile)
    await storage.updateContext({ cycleNumber: 1, sessionNumber: 1 })
    
    setShowSetup(false)
    await loadData()
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleNextSession = async () => {
    if (!context) return
    
    const nextSession = context.sessionNumber + 1
    const nextCycle = nextSession > 8 ? context.cycleNumber + 1 : context.cycleNumber
    const sessionNumber = nextSession > 8 ? 1 : nextSession
    
    await storage.updateContext({ 
      cycleNumber: nextCycle, 
      sessionNumber: sessionNumber 
    })
    
    // プロンプトを保存
    await storage.savePrompt({
      type: 'training',
      content: currentPrompt,
      metadata: { sessionNumber: context.sessionNumber },
      createdAt: new Date(),
      used: true,
    })
    
    await loadData()
    setAiResponse('')
  }

  const handleExport = async () => {
    const data = await storage.exportAllData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fitloop-backup-${new Date().toISOString()}.json`
    a.click()
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const text = await file.text()
    await storage.importData(text)
    await loadData()
  }

  if (showSetup) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">FitLoop 初期設定</h1>
          
          <form onSubmit={handleSetup} className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                お名前
              </label>
              <input
                name="name"
                type="text"
                required
                className="w-full px-3 py-2 border rounded-md"
                placeholder="太郎"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                1. あなたの目的は何ですか？
              </label>
              <div className="text-xs text-gray-600 mb-2">
                例: モテたい、健康になりたい、筋肉を大きくしたい、体脂肪を減らしたい
              </div>
              <textarea
                name="goals"
                required
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="モテたい、健康になりたい"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                2. 現在のトレーニング環境は？
              </label>
              <div className="text-xs text-gray-600 mb-2">
                例: ジムに通っている、家にダンベルがある、自重トレーニングのみ
              </div>
              <textarea
                name="environment"
                required
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="ジムに通っている（フリーウェイト・マシン何でも使える）"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              設定を完了してトレーニングを開始
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">FitLoop</h1>
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <span className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200">
                <Upload size={16} />
                インポート
              </span>
            </label>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
              <Download size={16} />
              エクスポート
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {profile && context && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">現在の状況</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">名前:</span>
                <span className="ml-2 font-medium">{profile.name}</span>
              </div>
              <div>
                <span className="text-gray-600">サイクル:</span>
                <span className="ml-2 font-medium">{context.cycleNumber}/8</span>
              </div>
              <div>
                <span className="text-gray-600">セッション:</span>
                <span className="ml-2 font-medium">{context.sessionNumber}</span>
              </div>
              <div>
                <span className="text-gray-600">目標:</span>
                <span className="ml-2 font-medium">{profile.goals}</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold">今日のプロンプト</h2>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'コピー済み' : 'コピー'}
            </button>
          </div>
          
          <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded border overflow-auto max-h-96">
            {currentPrompt || 'プロンプトを生成中...'}
          </pre>
          
          <p className="text-sm text-gray-600 mt-2">
            このプロンプトをClaude、ChatGPT、またはGeminiにコピーして使用してください
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">トレーニング結果を記録</h2>
          <textarea
            value={aiResponse}
            onChange={(e) => setAiResponse(e.target.value)}
            placeholder="AIからの返答や、トレーニング結果をここに貼り付けてください"
            className="w-full px-3 py-2 border rounded-md mb-4"
            rows={6}
          />
          <button
            onClick={handleNextSession}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Plus size={16} />
            次のセッションへ進む
          </button>
        </div>
      </main>
    </div>
  )
}

export default App
