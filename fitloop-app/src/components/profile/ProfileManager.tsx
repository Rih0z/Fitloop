import React, { useState, useEffect } from 'react'
import { User, Target, Activity, TrendingUp, Save, Edit3, Plus, X } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import type { UserProfile } from '../../models/user'
import type { GeneratedPrompt } from '../../models/prompt'
import { StorageManager } from '../../lib/db'

const storage = new StorageManager()

interface ProfileManagerProps {
  profile: UserProfile | null
  onProfileUpdate: () => void
  className?: string
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({ 
  profile: initialProfile, 
  onProfileUpdate,
  className = '' 
}) => {
  const { darkMode } = useTheme()
  const [editMode, setEditMode] = useState(!initialProfile)
  const [profile, setProfile] = useState<UserProfile>(initialProfile || {
    name: '山田 太郎',
    age: 28,
    gender: 'male',
    weight: 70,
    height: 170,
    goals: '筋肉をつけてカッコよくなりたい, 健康的な体で長生きしたい',
    environment: 'ジム（フィットネスクラブ）',
    experience: 'beginner',
    preferences: {
      intensity: 'medium',
      frequency: 3,
      timeAvailable: 45,
      workoutDuration: 60,
      workoutFrequency: 3,
      preferredTime: 'evening',
      equipment: ['ダンベル', 'バーベル', 'ベンチ'],
      focusAreas: ['胸筋', '背筋', '脚']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  })
  
  const [focusArea, setFocusArea] = useState<string>('')
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [customGoal, setCustomGoal] = useState<string>('')
  const [showCustomGoal, setShowCustomGoal] = useState<boolean>(false)
  
  const equipmentOptions = [
    'ダンベル', 'バーベル', 'ケトルベル', 'レジスタンスバンド',
    'プルアップバー', 'ベンチ', 'ケーブルマシン', 'なし（自重のみ）'
  ]
  
  const focusAreaOptions = [
    '胸筋', '背筋', '肩', '腕', '腹筋', '脚', '全身', '体幹'
  ]

  const goalOptions = [
    {
      id: 'muscle_gain',
      title: '筋肉をつけてカッコよくなりたい',
      description: '引き締まったボディで自信を持ちたい',
      emoji: '💪'
    },
    {
      id: 'weight_loss',
      title: '体重を減らして軽やかに動きたい',
      description: '理想の体型で毎日をアクティブに',
      emoji: '✨'
    },
    {
      id: 'strength',
      title: '力強くなって日常をラクに',
      description: '重い物を持つのも、階段を登るのも楽々',
      emoji: '🚀'
    },
    {
      id: 'health',
      title: '健康的な体で長生きしたい',
      description: '病気知らず、エネルギッシュな毎日を',
      emoji: '❤️'
    },
    {
      id: 'endurance',
      title: '持久力をつけて疲れ知らず',
      description: '一日中アクティブに動けるスタミナを',
      emoji: '🏃'
    },
    {
      id: 'flexibility',
      title: '柔軟性を高めて体の不調を解消',
      description: '肩こり、腰痛とおさらばして快適に',
      emoji: '🧘'
    },
    {
      id: 'confidence',
      title: '自信をつけて人生を変えたい',
      description: '鏡の中の自分を好きになって積極的に',
      emoji: '🌟'
    },
    {
      id: 'stress_relief',
      title: 'ストレス発散で心をスッキリ',
      description: '運動でメンタルもリフレッシュ',
      emoji: '😌'
    }
  ]

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile)
      setEditMode(false)
      // 目標を選択状態に変換
      const goals = initialProfile.goals.split(',').map(g => g.trim()).filter(Boolean)
      const matchedGoals = goals.map(goal => {
        const option = goalOptions.find(opt => goal.includes(opt.title.substring(0, 10)))
        return option ? option.id : null
      }).filter(Boolean) as string[]
      setSelectedGoals(matchedGoals)
    }
  }, [initialProfile])

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => {
      const newGoals = prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
      
      // プロファイルの目標を更新
      const goalTexts = newGoals.map(id => {
        const option = goalOptions.find(opt => opt.id === id)
        return option ? option.title : ''
      }).filter(Boolean)
      
      setProfile(prev => ({
        ...prev,
        goals: goalTexts.join(', ')
      }))
      
      return newGoals
    })
  }

  const addCustomGoal = () => {
    if (customGoal.trim()) {
      const currentGoals = profile.goals ? profile.goals.split(',').map(g => g.trim()).filter(Boolean) : []
      const newGoals = [...currentGoals, customGoal.trim()]
      
      setProfile(prev => ({
        ...prev,
        goals: newGoals.join(', ')
      }))
      
      setCustomGoal('')
      setShowCustomGoal(false)
    }
  }

  const generateProfileBasedPrompt = (profile: UserProfile): string => {
    const equipment = profile.preferences.equipment.length > 0 
      ? profile.preferences.equipment.join('、') 
      : '自重のみ';
    
    const focusAreas = profile.preferences.focusAreas.length > 0 
      ? profile.preferences.focusAreas.join('、') 
      : '全身バランス良く';

    return `# ${profile.name}さん専用トレーニングプロンプト

## あなたのプロフィール
- 年齢: ${profile.age}歳
- 体重: ${profile.weight}kg、身長: ${profile.height}cm
- 経験レベル: ${profile.experience === 'beginner' ? '初心者' : profile.experience === 'intermediate' ? '中級者' : '上級者'}
- 目標: ${profile.goals}
- 環境: ${profile.environment}

## トレーニング設定
- 頻度: 週${profile.preferences.workoutFrequency}回
- 1回の時間: ${profile.preferences.workoutDuration}分
- 希望時間帯: ${profile.preferences.preferredTime === 'morning' ? '朝' : profile.preferences.preferredTime === 'afternoon' ? '昼' : profile.preferences.preferredTime === 'evening' ? '夜' : 'いつでも'}
- 利用器具: ${equipment}
- 重点部位: ${focusAreas}

## 今日のトレーニングメニュー

### ウォームアップ (5-10分)
- 軽い有酸素運動（ウォーキング、ジョギング）
- 動的ストレッチ（肩回し、腰回し、膝上げ）
- 関節の可動域を広げる準備運動

### メインセット
${profile.preferences.focusAreas.map(area => {
  const exercises = {
    '胸筋': ['腕立て伏せ', 'ベンチプレス', 'ダンベルフライ'],
    '背筋': ['懸垂', 'ラットプルダウン', 'ベントオーバーロウ'],
    '肩': ['ショルダープレス', 'サイドレイズ', 'フロントレイズ'],
    '腕': ['アームカール', 'トライセップスエクステンション', 'ディップス'],
    '腹筋': ['プランク', 'クランチ', 'レッグレイズ'],
    '脚': ['スクワット', 'ランジ', 'レッグプレス'],
    '全身': ['スクワット', '腕立て伏せ', 'プランク'],
    '体幹': ['プランク', 'サイドプランク', 'バードドッグ']
  };
  const areaExercises = exercises[area as keyof typeof exercises] || ['基本エクササイズ'];
  return `\n#### ${area}\n${areaExercises.map(ex => `- ${ex}: 3セット × 8-12回`).join('\n')}`;
}).join('')}

### クールダウン (5-10分)
- 静的ストレッチ
- 深呼吸とリラクゼーション
- 水分補給

## 記録してください
1. 実際に行ったエクササイズと回数
2. 使用した重量（該当する場合）
3. セット間の疲労度 (1-10)
4. 全体的な満足度
5. 体調の変化

## 次回への改善点
- 今日の調子に応じて次回の負荷を調整
- フォームの確認と改善
- 新しいエクササイズの挑戦

*このプロンプトはあなたのプロフィールに基づいて自動生成されました。*`;
  };

  const handleSave = async () => {
    try {
      await storage.saveProfile(profile)
      
      // プロフィール保存時にパーソナライズされたプロンプトを生成・保存
      const generatedPrompt: GeneratedPrompt = {
        type: 'training',
        content: generateProfileBasedPrompt(profile),
        metadata: {
          profileId: profile.id,
          profileName: profile.name,
          generatedFrom: 'profile'
        },
        createdAt: new Date(),
        used: false,
        source: 'profile',
        title: `${profile.name}さん専用トレーニングプロンプト`
      };
      
      await storage.savePrompt(generatedPrompt);
      
      setEditMode(false)
      onProfileUpdate()
    } catch (error) {
      console.error('Failed to save profile:', error)
    }
  }


  const handleRemoveEquipment = (item: string) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        equipment: prev.preferences.equipment.filter(e => e !== item)
      }
    }))
  }

  const handleAddFocusArea = () => {
    if (focusArea && !profile.preferences.focusAreas.includes(focusArea)) {
      setProfile(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          focusAreas: [...prev.preferences.focusAreas, focusArea]
        }
      }))
      setFocusArea('')
    }
  }

  const handleRemoveFocusArea = (area: string) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        focusAreas: prev.preferences.focusAreas.filter(a => a !== area)
      }
    }))
  }

  const experienceLevels = [
    { value: 'beginner', label: '初心者', description: 'トレーニング経験1年未満' },
    { value: 'intermediate', label: '中級者', description: '1-3年の経験' },
    { value: 'advanced', label: '上級者', description: '3年以上の経験' }
  ]

  return (
    <div className={`${className} ${darkMode ? 'bg-gray-900/50' : 'bg-white'} backdrop-blur-lg rounded-3xl shadow-2xl p-8 transition-all duration-300`}>
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-gradient-to-br from-purple-500 to-pink-500'}`}>
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              プロフィール管理
            </h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              あなたの情報を管理してパーソナライズされた体験を
            </p>
          </div>
        </div>
        {!editMode && initialProfile && (
          <button
            onClick={() => setEditMode(true)}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
              darkMode 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            編集
          </button>
        )}
      </div>

      {/* 基本情報セクション */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            お名前
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
            disabled={!editMode}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' 
                : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
            } ${!editMode ? 'opacity-60' : ''}`}
            placeholder="山田 太郎"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              年齢
            </label>
            <input
              type="number"
              value={profile.age || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
              disabled={!editMode}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' 
                  : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
              } ${!editMode ? 'opacity-60' : ''}`}
              placeholder="25"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              性別
            </label>
            <select
              value={profile.gender}
              onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' | 'other' }))}
              disabled={!editMode}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' 
                  : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
              } ${!editMode ? 'opacity-60' : ''}`}
            >
              <option value="male">男性</option>
              <option value="female">女性</option>
              <option value="other">その他</option>
            </select>
          </div>
        </div>
      </div>

      {/* 身体情報 */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            体重 (kg)
          </label>
          <div className="relative">
            <input
              type="number"
              value={profile.weight || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
              disabled={!editMode}
              className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' 
                  : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
              } ${!editMode ? 'opacity-60' : ''}`}
              placeholder="70"
            />
            <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              kg
            </span>
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            身長 (cm)
          </label>
          <div className="relative">
            <input
              type="number"
              value={profile.height || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
              disabled={!editMode}
              className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' 
                  : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
              } ${!editMode ? 'opacity-60' : ''}`}
              placeholder="170"
            />
            <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              cm
            </span>
          </div>
        </div>
      </div>

      {/* 目標 - 心理学的アプローチ */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Target className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            あなたの理想の未来は？
          </h3>
          <span className="text-xl">🌟</span>
        </div>
        <div className={`p-4 rounded-xl mb-6 ${darkMode ? 'bg-purple-900/20 border border-purple-700/30' : 'bg-purple-50 border border-purple-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>
            💭 <strong>誰でも簡単！</strong> 3ヶ月後の理想のあなたをイメージして、ワクワクする目標をタップしてください。複数選択OK！
          </p>
        </div>

        {editMode ? (
          <div className="space-y-4">
            {/* 選択式目標オプション */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {goalOptions.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`group p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                    selectedGoals.includes(goal.id)
                      ? darkMode 
                        ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500 transform scale-105'
                        : 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500 transform scale-105'
                      : darkMode
                        ? 'bg-gray-800/50 border-gray-700 hover:border-purple-400 hover:bg-gray-800'
                        : 'bg-white border-gray-200 hover:border-purple-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`text-2xl transition-transform ${
                      selectedGoals.includes(goal.id) ? 'scale-110' : 'group-hover:scale-105'
                    }`}>
                      {goal.emoji}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold text-base mb-1 ${
                        selectedGoals.includes(goal.id)
                          ? darkMode ? 'text-purple-300' : 'text-purple-700'
                          : darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {goal.title}
                      </h4>
                      <p className={`text-sm ${
                        selectedGoals.includes(goal.id)
                          ? darkMode ? 'text-purple-200' : 'text-purple-600'
                          : darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {goal.description}
                      </p>
                      {selectedGoals.includes(goal.id) && (
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            darkMode ? 'bg-purple-500/30 text-purple-300' : 'bg-purple-500/20 text-purple-700'
                          }`}>
                            ✓ 選択中
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* カスタム目標 */}
            <div className="mt-6">
              <button
                onClick={() => setShowCustomGoal(!showCustomGoal)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                }`}
              >
                <span className="text-lg">✨</span>
                <span className="font-medium">オリジナルの目標を追加</span>
                <span className={`transition-transform ${showCustomGoal ? 'rotate-180' : ''}`}>▼</span>
              </button>
              
              {showCustomGoal && (
                <div className="mt-3 space-y-3">
                  <input
                    type="text"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    placeholder="例: マラソン完走、ベンチプレス100kg..."
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' 
                        : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
                    }`}
                  />
                  <button
                    onClick={addCustomGoal}
                    disabled={!customGoal.trim()}
                    className={`px-4 py-2 rounded-xl transition-all ${
                      customGoal.trim()
                        ? darkMode 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-purple-500 hover:bg-purple-600 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    目標を追加
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {profile.goals.split(',').filter(g => g.trim()).map((goal, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border ${
                  darkMode 
                    ? 'bg-gray-800/50 border-gray-700 text-gray-300'
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <span className="font-medium">{goal.trim()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 環境 */}
      <div className="mb-8">
        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          トレーニング環境
        </label>
        <input
          type="text"
          value={profile.environment}
          onChange={(e) => setProfile(prev => ({ ...prev, environment: e.target.value }))}
          disabled={!editMode}
          className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
            darkMode 
              ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' 
              : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
          } ${!editMode ? 'opacity-60' : ''}`}
          placeholder="例: 自宅、ジム、公園..."
        />
      </div>

      {/* 経験レベル */}
      <div className="mb-8">
        <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <Activity className="inline w-4 h-4 mr-1" />
          トレーニング経験
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {experienceLevels.map(level => (
            <button
              key={level.value}
              onClick={() => editMode && setProfile(prev => ({ ...prev, experience: level.value as any }))}
              disabled={!editMode}
              className={`p-4 rounded-xl border-2 transition-all ${
                profile.experience === level.value
                  ? darkMode 
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-transparent text-white'
                    : 'bg-gradient-to-br from-purple-500 to-pink-500 border-transparent text-white'
                  : darkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-purple-500'
              } ${!editMode ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <div className="font-semibold">{level.label}</div>
              <div className={`text-xs mt-1 ${profile.experience === level.value ? 'text-white/80' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {level.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 詳細設定 */}
      <div className="space-y-6 mb-8">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          詳細設定
        </h3>

        {/* トレーニング頻度と時間 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              週間頻度
            </label>
            <select
              value={profile.preferences.workoutFrequency}
              onChange={(e) => setProfile(prev => ({ 
                ...prev, 
                preferences: { ...prev.preferences, workoutFrequency: parseInt(e.target.value) }
              }))}
              disabled={!editMode}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' 
                  : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
              } ${!editMode ? 'opacity-60' : ''}`}
            >
              {[1,2,3,4,5,6,7].map(n => (
                <option key={n} value={n}>{n}回/週</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              1回の時間
            </label>
            <select
              value={profile.preferences.workoutDuration}
              onChange={(e) => setProfile(prev => ({ 
                ...prev, 
                preferences: { ...prev.preferences, workoutDuration: parseInt(e.target.value) }
              }))}
              disabled={!editMode}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' 
                  : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
              } ${!editMode ? 'opacity-60' : ''}`}
            >
              {[15,30,45,60,90,120].map(n => (
                <option key={n} value={n}>{n}分</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              希望時間帯
            </label>
            <select
              value={profile.preferences.preferredTime}
              onChange={(e) => setProfile(prev => ({ 
                ...prev, 
                preferences: { ...prev.preferences, preferredTime: e.target.value as any }
              }))}
              disabled={!editMode}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' 
                  : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
              } ${!editMode ? 'opacity-60' : ''}`}
            >
              <option value="morning">朝（6-12時）</option>
              <option value="afternoon">昼（12-18時）</option>
              <option value="evening">夜（18-24時）</option>
              <option value="flexible">いつでも</option>
            </select>
          </div>
        </div>

        {/* 使用器具 */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            利用可能な器具
          </label>
          
          {editMode && (
            <div className="space-y-3 mb-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {equipmentOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => {
                      if (profile.preferences.equipment.includes(opt)) {
                        handleRemoveEquipment(opt);
                      } else {
                        setProfile(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            equipment: [...prev.preferences.equipment, opt]
                          }
                        }));
                      }
                    }}
                    className={`p-3 rounded-xl border-2 text-sm transition-all ${
                      profile.preferences.equipment.includes(opt)
                        ? darkMode 
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'bg-purple-500 border-purple-500 text-white'
                        : darkMode
                          ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-purple-500'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                複数選択可能です。クリックして選択/解除してください。
              </p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            {profile.preferences.equipment.map(item => (
              <div
                key={item}
                className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-2 ${
                  darkMode 
                    ? 'bg-purple-900/50 text-purple-300' 
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                <span>{item}</span>
                {editMode && (
                  <button
                    onClick={() => handleRemoveEquipment(item)}
                    className="hover:opacity-70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            {profile.preferences.equipment.length === 0 && (
              <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                器具なし
              </span>
            )}
          </div>
        </div>

        {/* フォーカスエリア */}
        <div>
          <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            重点的に鍛えたい部位
          </label>
          
          {editMode && (
            <div className="flex gap-2 mb-3">
              <select
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className={`flex-1 px-4 py-2 rounded-xl border-2 transition-all ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' 
                    : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
                }`}
              >
                <option value="">部位を選択...</option>
                {focusAreaOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <button
                onClick={handleAddFocusArea}
                className={`px-4 py-2 rounded-xl transition-all ${
                  darkMode 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            {profile.preferences.focusAreas.map(area => (
              <div
                key={area}
                className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-2 ${
                  darkMode 
                    ? 'bg-pink-900/50 text-pink-300' 
                    : 'bg-pink-100 text-pink-700'
                }`}
              >
                <span>{area}</span>
                {editMode && (
                  <button
                    onClick={() => handleRemoveFocusArea(area)}
                    className="hover:opacity-70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            {profile.preferences.focusAreas.length === 0 && (
              <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                全身バランス良く
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 保存ボタン */}
      {editMode && (
        <div className="flex justify-end gap-3">
          {initialProfile && (
            <button
              onClick={() => {
                setProfile(initialProfile)
                setEditMode(false)
              }}
              className={`px-6 py-3 rounded-xl transition-all ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              キャンセル
            </button>
          )}
          <button
            onClick={handleSave}
            className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all ${
              darkMode 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
            }`}
          >
            <Save className="w-5 h-5" />
            保存
          </button>
        </div>
      )}

      {/* BMI計算結果 */}
      {profile.weight && profile.height && !editMode && (
        <div className={`mt-8 p-6 rounded-2xl ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                BMI（体格指数）
              </h4>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {(profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)}
                </span>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  (profile.weight / Math.pow(profile.height / 100, 2)) < 18.5 
                    ? 'bg-blue-500/20 text-blue-500'
                    : (profile.weight / Math.pow(profile.height / 100, 2)) < 25
                    ? 'bg-green-500/20 text-green-500'
                    : (profile.weight / Math.pow(profile.height / 100, 2)) < 30
                    ? 'bg-yellow-500/20 text-yellow-500'
                    : 'bg-red-500/20 text-red-500'
                }`}>
                  {(profile.weight / Math.pow(profile.height / 100, 2)) < 18.5 
                    ? '低体重'
                    : (profile.weight / Math.pow(profile.height / 100, 2)) < 25
                    ? '標準'
                    : (profile.weight / Math.pow(profile.height / 100, 2)) < 30
                    ? '肥満(1度)'
                    : '肥満(2度以上)'}
                </span>
              </div>
            </div>
            <TrendingUp className={`w-8 h-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          </div>
        </div>
      )}
    </div>
  )
}