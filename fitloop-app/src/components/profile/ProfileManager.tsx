import React, { useState, useEffect } from 'react'
import { User, Target, Activity, TrendingUp, Save, Edit3, Plus, X } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import type { UserProfile } from '../../models/user'
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
      preferredTime: 'morning',
      equipment: [],
      focusAreas: []
    },
    createdAt: new Date(),
    updatedAt: new Date()
  })
  
  const [equipment, setEquipment] = useState<string>('')
  const [focusArea, setFocusArea] = useState<string>('')
  
  const equipmentOptions = [
    'ダンベル', 'バーベル', 'ケトルベル', 'レジスタンスバンド',
    'プルアップバー', 'ベンチ', 'ケーブルマシン', 'なし（自重のみ）'
  ]
  
  const focusAreaOptions = [
    '胸筋', '背筋', '肩', '腕', '腹筋', '脚', '全身', '体幹'
  ]

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile)
      setEditMode(false)
    }
  }, [initialProfile])

  const handleSave = async () => {
    try {
      await storage.saveProfile(profile)
      setEditMode(false)
      onProfileUpdate()
    } catch (error) {
      console.error('Failed to save profile:', error)
    }
  }

  const handleAddEquipment = () => {
    if (equipment && !profile.preferences.equipment.includes(equipment)) {
      setProfile(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          equipment: [...prev.preferences.equipment, equipment]
        }
      }))
      setEquipment('')
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

      {/* 目標 */}
      <div className="mb-8">
        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <Target className="inline w-4 h-4 mr-1" />
          フィットネス目標
        </label>
        <textarea
          value={profile.goals}
          onChange={(e) => setProfile(prev => ({ ...prev, goals: e.target.value }))}
          disabled={!editMode}
          rows={3}
          className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
            darkMode 
              ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' 
              : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
          } ${!editMode ? 'opacity-60' : ''}`}
          placeholder="例: 筋力アップ、体重減少、健康維持..."
        />
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
            <div className="flex gap-2 mb-3">
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className={`flex-1 px-4 py-2 rounded-xl border-2 transition-all ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-purple-500' 
                    : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
                }`}
              >
                <option value="">器具を選択...</option>
                {equipmentOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <button
                onClick={handleAddEquipment}
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