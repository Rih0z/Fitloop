import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Sparkles, Copy, Check } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { apiService } from '../../services/ApiService'
import type { UserProfile } from '../../models/user'
import type { GeneratedPrompt } from '../../models/prompt'
import { StorageManager } from '../../lib/db'

const storage = new StorageManager()

interface ProfileOnboardingProps {
  onComplete: (profile: UserProfile) => void
  initialProfile?: UserProfile | null
}

type Step = {
  id: string
  title: string
  subtitle: string
  emoji: string
}

const steps: Step[] = [
  { id: 'name', title: 'はじめまして！', subtitle: 'お名前を教えてください', emoji: '👋' },
  { id: 'basic', title: '基本情報', subtitle: 'あなたについて教えてください', emoji: '📋' },
  { id: 'body', title: '身体情報', subtitle: '最適なプランを提案するために', emoji: '📏' },
  { id: 'goals', title: '理想の未来', subtitle: '3ヶ月後のあなたは？', emoji: '✨' },
  { id: 'experience', title: '経験レベル', subtitle: 'トレーニング経験を教えてください', emoji: '💪' },
  { id: 'environment', title: 'トレーニング環境', subtitle: 'どこで運動しますか？', emoji: '🏠' },
  { id: 'equipment', title: '利用可能な器具', subtitle: '使える器具を選択', emoji: '🏋️' },
  { id: 'focus', title: '重点部位', subtitle: '特に鍛えたい部位は？', emoji: '🎯' },
  { id: 'schedule', title: 'スケジュール', subtitle: 'いつトレーニングしますか？', emoji: '📅' },
  { id: 'additional', title: 'その他', subtitle: '何か伝えたいことがあれば', emoji: '💬' }
]

export const ProfileOnboarding: React.FC<ProfileOnboardingProps> = ({ onComplete, initialProfile }) => {
  const { darkMode } = useTheme()
  const [currentStep, setCurrentStep] = useState(0)
  const [profile, setProfile] = useState<UserProfile>(initialProfile || {
    name: '',
    age: 28,
    gender: 'male',
    weight: 70,
    height: 170,
    goals: '',
    environment: '',
    experience: 'beginner',
    preferences: {
      intensity: 'medium',
      frequency: 3,
      timeAvailable: 45,
      workoutDuration: 60,
      workoutFrequency: 3,
      preferredTime: 'evening',
      equipment: [],
      focusAreas: []
    },
    createdAt: new Date(),
    updatedAt: new Date()
  })
  
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [additionalInfo, setAdditionalInfo] = useState<string>('')
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('')
  const [completedProfile, setCompletedProfile] = useState<UserProfile | null>(null)
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const goalOptions = [
    { id: 'muscle', title: '筋肉をつける', subtitle: '引き締まった体に', emoji: '💪' },
    { id: 'weight', title: '体重を落とす', subtitle: '理想の体型へ', emoji: '⚡' },
    { id: 'strength', title: '力を強く', subtitle: '日常が楽に', emoji: '🚀' },
    { id: 'health', title: '健康的に', subtitle: '元気な毎日を', emoji: '❤️' },
    { id: 'endurance', title: '持久力UP', subtitle: '疲れ知らずに', emoji: '🏃' },
    { id: 'flexibility', title: '柔軟性向上', subtitle: '体の不調解消', emoji: '🧘' }
  ]

  const experienceOptions = [
    { id: 'beginner', title: '初心者', subtitle: '1年未満', emoji: '🌱' },
    { id: 'intermediate', title: '中級者', subtitle: '1-3年', emoji: '🌿' },
    { id: 'advanced', title: '上級者', subtitle: '3年以上', emoji: '🌳' }
  ]

  const environmentOptions = [
    { id: 'home', title: '自宅', emoji: '🏠' },
    { id: 'gym', title: 'ジム', emoji: '🏋️' },
    { id: 'park', title: '公園', emoji: '🌳' },
    { id: 'both', title: '両方', emoji: '🔄' }
  ]

  const equipmentOptions = [
    { id: 'dumbbells', title: 'ダンベル', emoji: '🏋️' },
    { id: 'barbell', title: 'バーベル', emoji: '💪' },
    { id: 'kettlebell', title: 'ケトルベル', emoji: '🔔' },
    { id: 'bands', title: 'バンド', emoji: '🪢' },
    { id: 'pullupbar', title: 'プルアップバー', emoji: '🚪' },
    { id: 'bench', title: 'ベンチ', emoji: '🪑' },
    { id: 'none', title: '自重のみ', emoji: '🙌' }
  ]

  const focusOptions = [
    { id: 'chest', title: '胸筋', emoji: '🎯' },
    { id: 'back', title: '背筋', emoji: '🎯' },
    { id: 'shoulders', title: '肩', emoji: '🎯' },
    { id: 'arms', title: '腕', emoji: '🎯' },
    { id: 'abs', title: '腹筋', emoji: '🎯' },
    { id: 'legs', title: '脚', emoji: '🎯' },
    { id: 'fullbody', title: '全身', emoji: '⭐' }
  ]

  const timeOptions = [
    { id: 'morning', title: '朝', subtitle: '6-12時', emoji: '🌅' },
    { id: 'afternoon', title: '昼', subtitle: '12-18時', emoji: '☀️' },
    { id: 'evening', title: '夜', subtitle: '18-24時', emoji: '🌙' },
    { id: 'flexible', title: 'いつでも', subtitle: '柔軟に', emoji: '🔄' }
  ]

  const isStepValid = (): boolean => {
    const step = steps[currentStep].id
    switch (step) {
      case 'name': return profile.name.trim().length > 0
      case 'basic': return (profile.age || 0) > 0 && profile.gender !== undefined
      case 'body': return (profile.weight || 0) > 0 && (profile.height || 0) > 0
      case 'goals': return selectedGoals.length > 0
      case 'experience': return profile.experience !== undefined
      case 'environment': return profile.environment !== ''
      case 'equipment': return profile.preferences.equipment.length > 0
      case 'focus': return profile.preferences.focusAreas.length > 0
      case 'schedule': return true
      case 'additional': return true // 自由記述は任意
      default: return true
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1 && isStepValid()) {
      setCurrentStep(prev => prev + 1)
    } else if (currentStep === steps.length - 1 && isStepValid()) {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const generateProfileBasedPrompt = (profile: UserProfile): string => {
    const equipment = profile.preferences.equipment.length > 0 
      ? profile.preferences.equipment.join('、') 
      : '自重のみ'
    
    const focusAreas = profile.preferences.focusAreas.length > 0 
      ? profile.preferences.focusAreas.join('、') 
      : '全身バランス良く'

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

[トレーニング内容をここに生成してください]`
  }

  const handleComplete = async () => {
    setIsGenerating(true)
    
    // Update goals based on selected goals
    const goalTexts = selectedGoals.map(id => {
      const option = goalOptions.find(opt => opt.id === id)
      return option ? option.title : ''
    }).filter(Boolean).join(', ')
    
    const updatedProfile = { 
      ...profile, 
      goals: additionalInfo ? `${goalTexts}\n\n【追加情報】\n${additionalInfo}` : goalTexts 
    }
    
    setCompletedProfile(updatedProfile)
    
    try {
      // Save profile to backend API
      const profileData = {
        name: updatedProfile.name,
        age: updatedProfile.age,
        weight: updatedProfile.weight,
        height: updatedProfile.height,
        experience: updatedProfile.experience,
        goals: updatedProfile.goals,
        environment: updatedProfile.environment,
        preferences: {
          workoutFrequency: updatedProfile.preferences.workoutFrequency,
          workoutDuration: updatedProfile.preferences.workoutDuration,
          preferredTime: (updatedProfile.preferences.preferredTime === 'flexible' ? 'anytime' : updatedProfile.preferences.preferredTime) as 'morning' | 'afternoon' | 'evening' | 'anytime',
          equipment: updatedProfile.preferences.equipment,
          focusAreas: updatedProfile.preferences.focusAreas
        }
      }
      
      const profileResponse = await apiService.saveProfile(profileData)
      
      if (profileResponse.status === 200 && profileResponse.data) {
        // Generate prompt from profile via API
        const promptResponse = await apiService.generatePromptFromProfile()
        
        if (promptResponse.status === 201 && promptResponse.data) {
          setGeneratedPrompt(promptResponse.data.prompt.content)
        } else {
          // Fallback to local generation
          const promptContent = generateProfileBasedPrompt(updatedProfile)
          setGeneratedPrompt(promptContent)
        }
        
        // Also save locally for offline access
        await storage.saveProfile(updatedProfile)
        
        if (promptResponse.data) {
          const generatedPromptData: GeneratedPrompt = {
            type: 'training',
            content: promptResponse.data.prompt.content,
            metadata: {
              profileId: profileResponse.data.profile.id,
              profileName: profileResponse.data.profile.name,
              generatedFrom: 'profile',
              backendId: promptResponse.data.prompt.id
            },
            createdAt: new Date(),
            used: false,
            source: 'profile',
            title: promptResponse.data.prompt.title
          }
          
          await storage.savePrompt(generatedPromptData)
        }
      } else {
        throw new Error('Failed to save profile to backend')
      }
      
    } catch (error) {
      console.error('Failed to save profile:', error)
      
      // Fallback to local storage
      try {
        await storage.saveProfile(updatedProfile)
        const promptContent = generateProfileBasedPrompt(updatedProfile)
        const generatedPromptData: GeneratedPrompt = {
          type: 'training',
          content: promptContent,
          metadata: {
            profileId: updatedProfile.id,
            profileName: updatedProfile.name,
            generatedFrom: 'profile'
          },
          createdAt: new Date(),
          used: false,
          source: 'profile',
          title: `${updatedProfile.name}さん専用トレーニングプロンプト`
        }
        
        await storage.savePrompt(generatedPromptData)
        setGeneratedPrompt(promptContent)
      } catch (localError) {
        console.error('Failed to save profile locally:', localError)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const renderStepContent = () => {
    const step = steps[currentStep].id

    switch (step) {
      case 'name':
        return (
          <div className="space-y-6">
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              placeholder="ニックネームでOK！"
              className={`w-full px-6 py-4 text-xl rounded-2xl border-2 transition-all ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' 
                  : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
              }`}
              autoFocus
            />
          </div>
        )

      case 'basic':
        return (
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                年齢
              </label>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={profile.age || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                  className={`flex-1 px-4 py-3 text-lg rounded-xl border-2 transition-all ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' 
                      : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
                  }`}
                  placeholder="28"
                />
                <span className={`flex items-center px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>歳</span>
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                性別
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'male', label: '男性', emoji: '👨' },
                  { value: 'female', label: '女性', emoji: '👩' },
                  { value: 'other', label: 'その他', emoji: '🌈' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setProfile(prev => ({ ...prev, gender: option.value as any }))}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      profile.gender === option.value
                        ? darkMode 
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'bg-purple-500 border-purple-500 text-white'
                        : darkMode
                          ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-purple-500'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-sm font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 'body':
        return (
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                体重
              </label>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={profile.weight || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                  className={`flex-1 px-4 py-3 text-lg rounded-xl border-2 transition-all ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' 
                      : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
                  }`}
                  placeholder="70"
                />
                <span className={`flex items-center px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>kg</span>
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                身長
              </label>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={profile.height || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                  className={`flex-1 px-4 py-3 text-lg rounded-xl border-2 transition-all ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' 
                      : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
                  }`}
                  placeholder="170"
                />
                <span className={`flex items-center px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>cm</span>
              </div>
            </div>
          </div>
        )

      case 'goals':
        return (
          <div className="space-y-4">
            <div className={`text-sm text-center mb-4 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
              <span className="inline-flex items-center gap-2">
                <span className="text-lg">✅</span>
                複数選択可能です
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {goalOptions.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => {
                    setSelectedGoals(prev => 
                      prev.includes(goal.id) 
                        ? prev.filter(id => id !== goal.id)
                        : [...prev, goal.id]
                    )
                  }}
                  className={`relative p-4 rounded-2xl border-2 transition-all ${
                    selectedGoals.includes(goal.id)
                      ? darkMode 
                        ? 'bg-purple-600 border-purple-600 text-white transform scale-105 shadow-lg'
                        : 'bg-purple-500 border-purple-500 text-white transform scale-105 shadow-lg'
                      : darkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500 hover:shadow-md'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-purple-500 hover:shadow-md'
                  }`}
                >
                  {selectedGoals.includes(goal.id) && (
                    <div className="absolute top-2 right-2">
                      <span className="text-xl">✓</span>
                    </div>
                  )}
                  <div className="text-2xl mb-2">{goal.emoji}</div>
                  <div className="font-medium text-sm">{goal.title}</div>
                  <div className={`text-xs mt-1 ${selectedGoals.includes(goal.id) ? 'text-white/80' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {goal.subtitle}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )

      case 'experience':
        return (
          <div className="space-y-4">
            {experienceOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setProfile(prev => ({ ...prev, experience: option.id as any }))}
                className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
                  profile.experience === option.id
                    ? darkMode 
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'bg-purple-500 border-purple-500 text-white'
                    : darkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-purple-500'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{option.emoji}</div>
                  <div>
                    <div className="font-semibold text-lg">{option.title}</div>
                    <div className={`text-sm ${profile.experience === option.id ? 'text-white/80' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {option.subtitle}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )

      case 'environment':
        return (
          <div className="grid grid-cols-2 gap-4">
            {environmentOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setProfile(prev => ({ ...prev, environment: option.title }))}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  profile.environment === option.title
                    ? darkMode 
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'bg-purple-500 border-purple-500 text-white'
                    : darkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-purple-500'
                }`}
              >
                <div className="text-4xl mb-2">{option.emoji}</div>
                <div className="font-medium">{option.title}</div>
              </button>
            ))}
          </div>
        )

      case 'equipment':
        return (
          <div className="space-y-4">
            <div className={`text-sm text-center mb-4 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
              <span className="inline-flex items-center gap-2">
                <span className="text-lg">✅</span>
                複数選択可能です
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {equipmentOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => {
                    const equipment = option.title
                    setProfile(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        equipment: prev.preferences.equipment.includes(equipment)
                          ? prev.preferences.equipment.filter(e => e !== equipment)
                          : [...prev.preferences.equipment, equipment]
                      }
                    }))
                  }}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    profile.preferences.equipment.includes(option.title)
                      ? darkMode 
                        ? 'bg-purple-600 border-purple-600 text-white shadow-lg'
                        : 'bg-purple-500 border-purple-500 text-white shadow-lg'
                      : darkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500 hover:shadow-md'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-purple-500 hover:shadow-md'
                  }`}
                >
                  {profile.preferences.equipment.includes(option.title) && (
                    <div className="absolute top-2 right-2">
                      <span className="text-lg">✓</span>
                    </div>
                  )}
                  <div className="text-2xl mb-1">{option.emoji}</div>
                  <div className="text-sm font-medium">{option.title}</div>
                </button>
              ))}
            </div>
          </div>
        )

      case 'focus':
        return (
          <div className="space-y-4">
            <div className={`text-sm text-center mb-4 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
              <span className="inline-flex items-center gap-2">
                <span className="text-lg">✅</span>
                複数選択可能です
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {focusOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => {
                    const area = option.title
                    setProfile(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        focusAreas: prev.preferences.focusAreas.includes(area)
                          ? prev.preferences.focusAreas.filter(a => a !== area)
                          : [...prev.preferences.focusAreas, area]
                      }
                    }))
                  }}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    profile.preferences.focusAreas.includes(option.title)
                      ? darkMode 
                        ? 'bg-purple-600 border-purple-600 text-white shadow-lg'
                        : 'bg-purple-500 border-purple-500 text-white shadow-lg'
                      : darkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500 hover:shadow-md'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-purple-500 hover:shadow-md'
                  }`}
                >
                  {profile.preferences.focusAreas.includes(option.title) && (
                    <div className="absolute top-1 right-1">
                      <span className="text-sm">✓</span>
                    </div>
                  )}
                  <div className="text-sm font-medium">{option.title}</div>
                </button>
              ))}
            </div>
          </div>
        )

      case 'schedule':
        return (
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                週何回トレーニングしますか？
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[2, 3, 4].map(freq => (
                  <button
                    key={freq}
                    onClick={() => setProfile(prev => ({ 
                      ...prev, 
                      preferences: { ...prev.preferences, workoutFrequency: freq }
                    }))}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      profile.preferences.workoutFrequency === freq
                        ? darkMode 
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'bg-purple-500 border-purple-500 text-white'
                        : darkMode
                          ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-purple-500'
                    }`}
                  >
                    <div className="text-2xl font-bold">{freq}</div>
                    <div className="text-sm">回/週</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                いつトレーニングしますか？
              </label>
              <div className="grid grid-cols-2 gap-3">
                {timeOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => setProfile(prev => ({ 
                      ...prev, 
                      preferences: { ...prev.preferences, preferredTime: option.id as any }
                    }))}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      profile.preferences.preferredTime === option.id
                        ? darkMode 
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'bg-purple-500 border-purple-500 text-white'
                        : darkMode
                          ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-purple-500'
                    }`}
                  >
                    <div className="text-xl mb-1">{option.emoji}</div>
                    <div className="text-sm font-medium">{option.title}</div>
                    <div className={`text-xs ${
                      profile.preferences.preferredTime === option.id 
                        ? 'text-white/80' 
                        : darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {option.subtitle}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 'additional':
        return (
          <div className="space-y-4">
            <div className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              トレーニングに関して配慮が必要なことや、目標達成のために伝えたいことがあれば教えてください。
            </div>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="例：腰痛持ちなので、腰に負担がかからないメニューを希望します..."
              className={`w-full h-32 px-4 py-3 rounded-xl border-2 resize-none transition-all ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500'
              }`}
            />
            <div className={`text-xs text-right ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              任意入力
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (generatedPrompt) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl p-8`}>
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              準備完了！
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              あなた専用のプロンプトが生成されました
            </p>
          </div>

          <div className={`p-4 rounded-2xl mb-6 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <p className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              生成されたプロンプト
            </p>
            <div className={`p-3 rounded-xl text-sm ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} max-h-40 overflow-y-auto`}>
              {generatedPrompt.split('\n').slice(0, 8).join('\n')}...
            </div>
          </div>

          <button
            onClick={handleCopy}
            className={`w-full py-4 rounded-2xl font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-3 ${
              copied
                ? 'bg-green-500 text-white'
                : darkMode 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                コピーしました！
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                プロンプトをコピー
              </>
            )}
          </button>

          <div className={`mt-6 p-4 rounded-xl ${darkMode ? 'bg-purple-900/20 border border-purple-700/30' : 'bg-purple-50 border border-purple-200'}`}>
            <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>
              💡 <strong>次のステップ:</strong> コピーしたプロンプトをお好みのAIに貼り付けて、パーソナライズされたトレーニングメニューを生成してください！
            </p>
          </div>

          <button
            onClick={() => onComplete(completedProfile || profile)}
            className={`w-full mt-4 py-3 rounded-xl font-medium transition-all ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            ホームへ戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl overflow-hidden`}>
        {/* Progress Bar */}
        <div className={`h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step Info */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">{steps[currentStep].emoji}</div>
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {steps[currentStep].title}
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {steps[currentStep].subtitle}
            </p>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <ChevronLeft className="w-5 h-5 inline" />
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={!isStepValid() || isGenerating}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                isStepValid() && !isGenerating
                  ? darkMode 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {currentStep === steps.length - 1 ? (
                isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    完了
                  </>
                )
              ) : (
                <>
                  次へ
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}