import React, { useState } from 'react'
import { User, Target, MapPin, ChevronDown, ChevronUp, Upload } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

// UI/UX仕様書 Section 4.2 プロフィールタブ 完全準拠

interface CollapsibleSectionProps {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  defaultExpanded?: boolean
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon: Icon,
  children,
  defaultExpanded = false
}) => {
  const { darkMode } = useTheme()
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    // Background: Card glass, Overflow: hidden
    <div className="card-glass animate-bounce-in card-hover-lift overflow-hidden mb-4">
      {/* Header: Padding: 16px, Clickable: entire area, Hover: Background Gray-50/700, Transition: background 200ms */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-full p-4 flex items-center justify-between
          transition-colors duration-200
          ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
        `}
        aria-label={isExpanded ? `${title}セクションを折りたたむ` : `${title}セクションを展開する`}
      >
        <div className="flex items-center gap-3">
          <Icon size={20} className="text-blue-500" />
          {/* Title: bold typography */}
          <h3 className="heading-3">
            {title}
          </h3>
        </div>
        
        {/* Chevron: Rotation animation 200ms */}
        <div className="transition-transform duration-200">
          {isExpanded ? (
            <ChevronUp size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
          ) : (
            <ChevronDown size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
          )}
        </div>
      </button>

      {/* Content: Animation: slideDown 300ms, Padding: 0 16px 16px 16px */}
      {isExpanded && (
        <div className="px-4 pb-4 animate-slideDown">
          {children}
        </div>
      )}
    </div>
  )
}

export const ProfileTab: React.FC = () => {
  const { darkMode } = useTheme()
  
  // State for form inputs
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    height: '',
    weight: '',
    experienceLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    primaryGoal: 'strength' as 'strength' | 'weight_loss' | 'endurance' | 'muscle_gain',
    deadline: '3months' as '1month' | '3months' | '6months' | '1year',
    location: 'gym' as 'gym' | 'home' | 'outdoor',
    frequency: 3
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAIImport = () => {
    // AIデータインポート処理
    console.log('AI data import triggered')
  }

  const renderBasicInfo = () => (
    <div className="space-y-4">
      {/* Name & Age: 2 columns */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`
            block text-sm font-medium mb-2
            ${darkMode ? 'text-gray-300' : 'text-gray-600'}
          `}>
            名前
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="山田太郎"
            className={`
              w-full p-3 rounded-lg border
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
              }
            `}
          />
        </div>
        
        <div>
          <label className={`
            block text-sm font-medium mb-2
            ${darkMode ? 'text-gray-300' : 'text-gray-600'}
          `}>
            年齢
          </label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            placeholder="30"
            className={`
              w-full p-3 rounded-lg border
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
              }
            `}
          />
        </div>
      </div>

      {/* Gender, Height, Weight: 3 columns */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={`
            block text-sm font-medium mb-2
            ${darkMode ? 'text-gray-300' : 'text-gray-600'}
          `}>
            性別
          </label>
          <select
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className={`
              w-full p-3 rounded-lg border
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-gray-50 border-gray-200 text-gray-900'
              }
            `}
          >
            <option value="male">男性</option>
            <option value="female">女性</option>
            <option value="other">その他</option>
          </select>
        </div>
        
        <div>
          <label className={`
            block text-sm font-medium mb-2
            ${darkMode ? 'text-gray-300' : 'text-gray-600'}
          `}>
            身長(cm)
          </label>
          <input
            type="number"
            value={formData.height}
            onChange={(e) => handleInputChange('height', e.target.value)}
            placeholder="170"
            className={`
              w-full p-3 rounded-lg border
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
              }
            `}
          />
        </div>
        
        <div>
          <label className={`
            block text-sm font-medium mb-2
            ${darkMode ? 'text-gray-300' : 'text-gray-600'}
          `}>
            体重(kg)
          </label>
          <input
            type="number"
            value={formData.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            placeholder="70"
            className={`
              w-full p-3 rounded-lg border
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
              }
            `}
          />
        </div>
      </div>

      {/* Experience Level: 3 button grid */}
      <div>
        <label className={`
          block text-sm font-medium mb-3
          ${darkMode ? 'text-gray-300' : 'text-gray-600'}
        `}>
          トレーニング経験
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'beginner', label: '初心者' },
            { value: 'intermediate', label: '中級者' },
            { value: 'advanced', label: '上級者' }
          ].map((level) => (
            <button
              key={level.value}
              onClick={() => handleInputChange('experienceLevel', level.value)}
              className={`
                p-3 rounded-lg text-sm font-medium btn-micro
                transition-all duration-200
                ${formData.experienceLevel === level.value
                  ? 'bg-blue-500 text-white feedback-success'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderGoalSetting = () => (
    <div className="space-y-4">
      {/* Goal Buttons: 2x2 grid */}
      <div>
        <label className={`
          block text-sm font-medium mb-3
          ${darkMode ? 'text-gray-300' : 'text-gray-600'}
        `}>
          主な目標
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'strength', label: '筋力向上' },
            { value: 'weight_loss', label: '脂肪燃焼' },
            { value: 'endurance', label: '持久力向上' },
            { value: 'muscle_gain', label: '筋肥大' }
          ].map((goal) => (
            <button
              key={goal.value}
              onClick={() => handleInputChange('primaryGoal', goal.value)}
              className={`
                p-3 rounded-lg text-sm font-medium btn-micro
                transition-all duration-200
                ${formData.primaryGoal === goal.value
                  ? 'bg-blue-500 text-white feedback-success'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              {goal.label}
            </button>
          ))}
        </div>
      </div>

      {/* Period Select: full width */}
      <div>
        <label className={`
          block text-sm font-medium mb-2
          ${darkMode ? 'text-gray-300' : 'text-gray-600'}
        `}>
          目標達成期間
        </label>
        <select
          value={formData.deadline}
          onChange={(e) => handleInputChange('deadline', e.target.value)}
          className={`
            w-full p-3 rounded-lg border
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${darkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-gray-50 border-gray-200 text-gray-900'
            }
          `}
        >
          <option value="1month">1ヶ月</option>
          <option value="3months">3ヶ月</option>
          <option value="6months">6ヶ月</option>
          <option value="1year">1年</option>
        </select>
      </div>
    </div>
  )

  const renderEnvironment = () => (
    <div className="space-y-4">
      {/* Location Buttons: 3 columns */}
      <div>
        <label className={`
          block text-sm font-medium mb-3
          ${darkMode ? 'text-gray-300' : 'text-gray-600'}
        `}>
          トレーニング場所
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'gym', label: 'ジム' },
            { value: 'home', label: '自宅' },
            { value: 'outdoor', label: '屋外' }
          ].map((location) => (
            <button
              key={location.value}
              onClick={() => handleInputChange('location', location.value)}
              className={`
                p-3 rounded-lg text-sm font-medium btn-micro
                transition-all duration-200
                ${formData.location === location.value
                  ? 'bg-blue-500 text-white feedback-success'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              {location.label}
            </button>
          ))}
        </div>
      </div>

      {/* Frequency Slider: Track: Gray-200, height 4px, Thumb: White 20x20px shadow, Labels: space-between */}
      <div>
        <label className={`
          block text-sm font-medium mb-3
          ${darkMode ? 'text-gray-300' : 'text-gray-600'}
        `}>
          週間頻度: {formData.frequency}回/週
        </label>
        <div className="relative">
          <input
            type="range"
            min="1"
            max="7"
            value={formData.frequency}
            onChange={(e) => handleInputChange('frequency', parseInt(e.target.value))}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((formData.frequency - 1) / 6) * 100}%, #E5E7EB ${((formData.frequency - 1) / 6) * 100}%, #E5E7EB 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
            <span>6</span>
            <span>7</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    // Global Container: Max Width: 512px (Webの場合), Mobile: 100% - padding 32px (左右16px)
    <div className={`
      flex-1 overflow-y-auto
      ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}
      page-transition
    `}>
      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Section 1: 基本情報 (default expanded) */}
        <CollapsibleSection 
          title="基本情報" 
          icon={User} 
          defaultExpanded={true}
        >
          {renderBasicInfo()}
        </CollapsibleSection>

        {/* Section 2: 目標設定 */}
        <CollapsibleSection 
          title="目標設定" 
          icon={Target}
        >
          {renderGoalSetting()}
        </CollapsibleSection>

        {/* Section 3: 環境設定 */}
        <CollapsibleSection 
          title="環境設定" 
          icon={MapPin}
        >
          {renderEnvironment()}
        </CollapsibleSection>

        <button
          onClick={handleAIImport}
          className="btn btn-gradient-purple btn-full btn-micro p-6 animate-bounce-in"
        >
          <div className="flex items-center justify-center gap-3">
            <Upload size={20} />
            <div className="text-left">
              <div className="font-medium">AIデータインポート</div>
              <div className="text-sm opacity-80 mt-1">
                体組成データをAIで自動入力
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}