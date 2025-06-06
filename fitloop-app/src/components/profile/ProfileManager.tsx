import React, { useState, useEffect } from 'react'
import { User, ChevronUp, ChevronDown, Target, MapPin, Upload } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import type { UserProfile } from '../../models/user'
import { StorageManager } from '../../lib/db'
import { DataImport } from './DataImport'

const storage = new StorageManager()

interface ProfileManagerProps {
  profile: UserProfile | null
  onProfileUpdate: () => void
  className?: string
}

interface SectionState {
  basic: boolean
  goals: boolean
  environment: boolean
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({ 
  profile: initialProfile, 
  onProfileUpdate,
  className = '' 
}) => {
  const { darkMode } = useTheme()
  const [showDataImport, setShowDataImport] = useState(false)
  const [expanded, setExpanded] = useState<SectionState>({
    basic: true,    // Default expanded
    goals: false,
    environment: false
  })

  const [profile, setProfile] = useState<UserProfile>(initialProfile || {
    name: '',
    age: 25,
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

  const [selectedGoal, setSelectedGoal] = useState<string>('')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [frequency, setFrequency] = useState<number>(3)

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile)
    }
  }, [initialProfile])

  const toggleSection = (section: keyof SectionState) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleSave = async () => {
    try {
      await storage.saveProfile({
        ...profile,
        updatedAt: new Date()
      })
      onProfileUpdate()
    } catch (error) {
      console.error('Failed to save profile:', error)
    }
  }

  const CollapsibleSection: React.FC<{
    title: string
    isExpanded: boolean
    onToggle: () => void
    children: React.ReactNode
  }> = ({ title, isExpanded, onToggle, children }) => (
    <div className={`${darkMode ? 'bg-dark-secondary' : 'bg-white'} rounded-xl shadow-sm overflow-hidden animate-fadeIn mb-4`}>
      <button
        onClick={onToggle}
        className={`w-full p-4 flex items-center justify-between transition-colors duration-200 ${
          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
        }`}
      >
        <h3 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        <div className="transition-transform duration-200">
          {isExpanded ? (
            <ChevronUp size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
          ) : (
            <ChevronDown size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
          )}
        </div>
      </button>
      
      {isExpanded && (
        <div className="p-4 pt-0 animate-slideDown">
          {children}
        </div>
      )}
    </div>
  )

  return (
    <div className={className}>
      {/* Basic Information Section */}
      <CollapsibleSection
        title="基本情報"
        isExpanded={expanded.basic}
        onToggle={() => toggleSection('basic')}
      >
        <div className="space-y-4">
          {/* Name & Age (2 columns) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                名前
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full h-10 px-3 rounded-lg border transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-blue-500' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500'
                } focus:outline-none`}
                placeholder="お名前を入力"
              />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                年齢
              </label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                className={`w-full h-10 px-3 rounded-lg border transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-blue-500' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500'
                } focus:outline-none`}
                placeholder="25"
              />
            </div>
          </div>

          {/* Gender, Height, Weight (3 columns) */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                性別
              </label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' | 'other' }))}
                className={`w-full h-10 px-3 rounded-lg border transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-blue-500' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500'
                } focus:outline-none`}
              >
                <option value="male">男性</option>
                <option value="female">女性</option>
                <option value="other">その他</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                身長 (cm)
              </label>
              <input
                type="number"
                value={profile.height}
                onChange={(e) => setProfile(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                className={`w-full h-10 px-3 rounded-lg border transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-blue-500' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500'
                } focus:outline-none`}
                placeholder="170"
              />
            </div>
            <div>
              <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                体重 (kg)
              </label>
              <input
                type="number"
                value={profile.weight}
                onChange={(e) => setProfile(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                className={`w-full h-10 px-3 rounded-lg border transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-blue-500' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500'
                } focus:outline-none`}
                placeholder="70"
              />
            </div>
          </div>

          {/* Experience Level (3 button grid) */}
          <div>
            <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              経験レベル
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'beginner', label: '初心者' },
                { value: 'intermediate', label: '中級者' },
                { value: 'advanced', label: '上級者' }
              ].map((level) => (
                <button
                  key={level.value}
                  onClick={() => setProfile(prev => ({ ...prev, experience: level.value as any }))}
                  className={`p-3 rounded-lg transition-colors ${
                    profile.experience === level.value
                      ? 'bg-blue-500 text-white'
                      : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Goal Setting Section */}
      <CollapsibleSection
        title="目標設定"
        isExpanded={expanded.goals}
        onToggle={() => toggleSection('goals')}
      >
        <div className="space-y-4">
          {/* Goal Buttons (2x2 grid) */}
          <div>
            <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              主な目標
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'strength', label: '筋力向上' },
                { value: 'weight_loss', label: '減量' },
                { value: 'endurance', label: '持久力' },
                { value: 'muscle_gain', label: '筋肉増量' }
              ].map((goal) => (
                <button
                  key={goal.value}
                  onClick={() => setSelectedGoal(goal.value)}
                  className={`p-3 rounded-lg transition-colors ${
                    selectedGoal === goal.value
                      ? 'bg-blue-500 text-white'
                      : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>

          {/* Period Select (full width) */}
          <div>
            <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              目標期間
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className={`w-full h-10 px-3 rounded-lg border transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-blue-500' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500'
              } focus:outline-none`}
            >
              <option value="">期間を選択</option>
              <option value="1month">1ヶ月</option>
              <option value="3months">3ヶ月</option>
              <option value="6months">6ヶ月</option>
              <option value="1year">1年</option>
            </select>
          </div>
        </div>
      </CollapsibleSection>

      {/* Environment Section */}
      <CollapsibleSection
        title="環境設定"
        isExpanded={expanded.environment}
        onToggle={() => toggleSection('environment')}
      >
        <div className="space-y-4">
          {/* Location Buttons (3 columns) */}
          <div>
            <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              トレーニング場所
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'gym', label: 'ジム' },
                { value: 'home', label: '自宅' },
                { value: 'outdoor', label: '屋外' }
              ].map((location) => (
                <button
                  key={location.value}
                  onClick={() => setSelectedLocation(location.value)}
                  className={`p-3 rounded-lg transition-colors ${
                    selectedLocation === location.value
                      ? 'bg-blue-500 text-white'
                      : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {location.label}
                </button>
              ))}
            </div>
          </div>

          {/* Frequency Slider */}
          <div>
            <label className={`block text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              週間頻度: {frequency}回
            </label>
            <div className="relative">
              <input
                type="range"
                min="1"
                max="7"
                value={frequency}
                onChange={(e) => setFrequency(parseInt(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1回</span>
                <span>7回</span>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* AI Data Import Button */}
      <button
        onClick={() => setShowDataImport(true)}
        className="w-full p-6 bg-gradient-purple-pink text-white rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 mb-4"
      >
        <div className="flex items-center justify-center gap-3">
          <Upload size={20} />
          <div>
            <div className="font-medium">AIデータインポート</div>
            <div className="text-sm opacity-80 mt-1">AIツールからデータをインポート</div>
          </div>
        </div>
      </button>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full h-12 bg-primary-blue hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200"
      >
        プロフィールを保存
      </button>

      {/* Data Import Modal */}
      {showDataImport && (
        <DataImport
          onClose={() => setShowDataImport(false)}
          onImportComplete={() => {
            setShowDataImport(false)
            onProfileUpdate()
          }}
        />
      )}
    </div>
  )
}