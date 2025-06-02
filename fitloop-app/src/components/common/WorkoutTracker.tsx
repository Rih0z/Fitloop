import React, { useState } from 'react'
import { Plus, Save, Dumbbell, Target } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

interface WorkoutEntry {
  exercise: string
  weight: number
  reps: number
  sets: number
  difficulty: 'easy' | 'moderate' | 'hard'
  notes?: string
}

interface WorkoutTrackerProps {
  onSaveWorkout: (workout: WorkoutEntry) => Promise<void>
  recommendations?: Array<{
    exercise: string
    weight: number
    reasoning: string
  }>
  className?: string
}

export const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({ 
  onSaveWorkout, 
  recommendations = [],
  className = '' 
}) => {
  const { darkMode } = useTheme()
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([])
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutEntry>({
    exercise: '',
    weight: 0,
    reps: 0,
    sets: 0,
    difficulty: 'moderate',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  const commonExercises = [
    'ベンチプレス', 'スクワット', 'デッドリフト', 'ショルダープレス',
    'ローイング', 'プルアップ', 'ディップス', 'ランジ',
    'バイセップカール', 'トライセップエクステンション'
  ]

  const handleAddWorkout = () => {
    if (currentWorkout.exercise && currentWorkout.weight > 0) {
      setWorkouts([...workouts, { ...currentWorkout }])
      setCurrentWorkout({
        exercise: '',
        weight: 0,
        reps: 0,
        sets: 0,
        difficulty: 'moderate',
        notes: ''
      })
    }
  }

  const handleSaveAll = async () => {
    setLoading(true)
    try {
      for (const workout of workouts) {
        await onSaveWorkout(workout)
      }
      setWorkouts([])
    } catch (error) {
      console.error('Failed to save workouts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRecommendationForExercise = (exercise: string) => {
    return recommendations.find(r => 
      r.exercise.toLowerCase().includes(exercise.toLowerCase()) ||
      exercise.toLowerCase().includes(r.exercise.toLowerCase())
    )
  }

  const applyRecommendation = (exercise: string) => {
    const rec = getRecommendationForExercise(exercise)
    if (rec) {
      setCurrentWorkout(prev => ({
        ...prev,
        exercise,
        weight: rec.weight
      }))
    } else {
      setCurrentWorkout(prev => ({
        ...prev,
        exercise
      }))
    }
  }

  return (
    <div className={`${className} ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          ワークアウト記録
        </h3>
        {workouts.length > 0 && (
          <button
            onClick={handleSaveAll}
            disabled={loading}
            className={`btn-uber micro-bounce ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Save className="inline w-4 h-4 mr-2" />
            保存 ({workouts.length})
          </button>
        )}
      </div>

      {/* エクササイズ選択 */}
      <div className="mb-4">
        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          エクササイズ
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={currentWorkout.exercise}
            onChange={(e) => setCurrentWorkout(prev => ({ ...prev, exercise: e.target.value }))}
            placeholder="エクササイズ名を入力"
            className={`flex-1 ${darkMode ? 'input-modern-dark' : 'input-modern'}`}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {commonExercises.map(exercise => {
            const rec = getRecommendationForExercise(exercise)
            return (
              <button
                key={exercise}
                onClick={() => applyRecommendation(exercise)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                } ${rec ? 'ring-2 ring-blue-500' : ''}`}
                title={rec ? `推奨重量: ${rec.weight}kg - ${rec.reasoning}` : undefined}
              >
                {exercise}
                {rec && <Target className="inline w-3 h-3 ml-1 text-blue-500" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* 推奨重量表示 */}
      {currentWorkout.exercise && getRecommendationForExercise(currentWorkout.exercise) && (
        <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Target className="w-4 h-4" />
            <span className="text-sm font-medium">AI推奨</span>
          </div>
          <p className="text-sm mt-1">
            推奨重量: {getRecommendationForExercise(currentWorkout.exercise)!.weight}kg
          </p>
          <p className="text-xs mt-1 opacity-80">
            {getRecommendationForExercise(currentWorkout.exercise)!.reasoning}
          </p>
        </div>
      )}

      {/* 重量・回数・セット */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            重量 (kg)
          </label>
          <input
            type="number"
            value={currentWorkout.weight || ''}
            onChange={(e) => setCurrentWorkout(prev => ({ ...prev, weight: Number(e.target.value) }))}
            className={`w-full ${darkMode ? 'input-modern-dark' : 'input-modern'}`}
            min="0"
            step="0.5"
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            回数
          </label>
          <input
            type="number"
            value={currentWorkout.reps || ''}
            onChange={(e) => setCurrentWorkout(prev => ({ ...prev, reps: Number(e.target.value) }))}
            className={`w-full ${darkMode ? 'input-modern-dark' : 'input-modern'}`}
            min="1"
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            セット数
          </label>
          <input
            type="number"
            value={currentWorkout.sets || ''}
            onChange={(e) => setCurrentWorkout(prev => ({ ...prev, sets: Number(e.target.value) }))}
            className={`w-full ${darkMode ? 'input-modern-dark' : 'input-modern'}`}
            min="1"
          />
        </div>
      </div>

      {/* 難易度 */}
      <div className="mb-4">
        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          難易度
        </label>
        <div className="flex gap-2">
          {(['easy', 'moderate', 'hard'] as const).map(level => (
            <button
              key={level}
              onClick={() => setCurrentWorkout(prev => ({ ...prev, difficulty: level }))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentWorkout.difficulty === level
                  ? level === 'easy' ? 'bg-green-500 text-white' :
                    level === 'moderate' ? 'bg-yellow-500 text-white' :
                    'bg-red-500 text-white'
                  : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' :
                    'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {level === 'easy' ? '楽 😊' : level === 'moderate' ? '普通 😐' : 'きつい 😤'}
            </button>
          ))}
        </div>
      </div>

      {/* メモ */}
      <div className="mb-4">
        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          メモ（任意）
        </label>
        <textarea
          value={currentWorkout.notes || ''}
          onChange={(e) => setCurrentWorkout(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="フォームやコンディションについてのメモ"
          className={`w-full h-20 ${darkMode ? 'input-modern-dark' : 'input-modern'}`}
        />
      </div>

      {/* 追加ボタン */}
      <button
        onClick={handleAddWorkout}
        disabled={!currentWorkout.exercise || currentWorkout.weight <= 0}
        className={`w-full btn-uber micro-bounce mb-4 ${
          (!currentWorkout.exercise || currentWorkout.weight <= 0) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <Plus className="inline w-4 h-4 mr-2" />
        ワークアウトを追加
      </button>

      {/* 追加されたワークアウト一覧 */}
      {workouts.length > 0 && (
        <div className="space-y-2">
          <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            今日のワークアウト
          </h4>
          {workouts.map((workout, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-blue-500" />
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {workout.exercise}
                  </span>
                </div>
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {workout.weight}kg × {workout.reps} × {workout.sets}set
                </span>
              </div>
              {workout.notes && (
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {workout.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}