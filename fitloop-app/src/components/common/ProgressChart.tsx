import React from 'react'
import { TrendingUp, TrendingDown, ArrowRight, Dumbbell, Activity, Heart, CheckCircle, AlertTriangle } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

interface ProgressData {
  exercise: string
  history: Array<{
    weight: number
    date: Date
    reps: number
    sets: number
  }>
  trend: 'improving' | 'maintaining' | 'declining'
}

interface ProgressChartProps {
  data: ProgressData[]
  className?: string
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ data, className = '' }) => {
  const { darkMode } = useTheme()

  if (!data || data.length === 0) {
    return (
      <div className={`${className} ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-6 text-center`}>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          まだ進捗データがありません
        </p>
      </div>
    )
  }

  const maxWeight = Math.max(...data.flatMap(d => d.history.map(h => h.weight)))
  const minWeight = Math.min(...data.flatMap(d => d.history.map(h => h.weight)))
  const weightRange = maxWeight - minWeight || 1

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-500'
      case 'declining': return 'text-red-500'
      default: return 'text-yellow-500'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return TrendingUp
      case 'declining': return TrendingDown
      default: return ArrowRight
    }
  }

  return (
    <div className={`${className} ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6`}>
      <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        エクササイズ進捗
      </h3>
      
      <div className="space-y-6">
        {data.slice(0, 5).map((exercise) => (
          <div key={exercise.exercise} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {exercise.exercise}
              </span>
              <div className="flex items-center gap-2">
                <span className={getTrendColor(exercise.trend)}>
                  {React.createElement(getTrendIcon(exercise.trend), { className: 'w-4 h-4' })}
                </span>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {exercise.history[0]?.weight || 0}kg
                </span>
              </div>
            </div>
            
            {/* シンプルな重量進捗バー */}
            <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className={`h-full rounded-full ${
                  exercise.trend === 'improving' ? 'bg-green-500' :
                  exercise.trend === 'declining' ? 'bg-red-500' :
                  'bg-yellow-500'
                }`}
                style={{ 
                  width: `${Math.max(10, ((exercise.history[0]?.weight || 0) - minWeight) / weightRange * 100)}%` 
                }}
              />
            </div>
            
            {/* 最近の履歴 */}
            <div className="flex gap-1 mt-2">
              {exercise.history.slice(0, 7).reverse().map((record, recordIndex) => (
                <div
                  key={recordIndex}
                  className={`w-6 h-6 rounded text-xs flex items-center justify-center ${
                    darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                  title={`${record.weight}kg × ${record.reps} (${record.date.toLocaleDateString('ja-JP')})`}
                >
                  {record.weight}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface MuscleBalanceChartProps {
  data: {
    upperBody: number
    lowerBody: number
    core: number
  }
  className?: string
}

export const MuscleBalanceChart: React.FC<MuscleBalanceChartProps> = ({ data, className = '' }) => {
  const { darkMode } = useTheme()
  
  const total = data.upperBody + data.lowerBody + data.core || 1
  const upperPerc = (data.upperBody / total) * 100
  const lowerPerc = (data.lowerBody / total) * 100
  const corePerc = (data.core / total) * 100

  return (
    <div className={`${className} ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6`}>
      <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        筋肉バランス
      </h3>
      
      <div className="space-y-4">
        {/* 上半身 */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <Dumbbell className="w-4 h-4 inline mr-1" />
              上半身
            </span>
            <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {Math.round(upperPerc)}%
            </span>
          </div>
          <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${upperPerc}%` }}
            />
          </div>
        </div>
        
        {/* 下半身 */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <Activity className="w-4 h-4 inline mr-1" />
              下半身
            </span>
            <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {Math.round(lowerPerc)}%
            </span>
          </div>
          <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${lowerPerc}%` }}
            />
          </div>
        </div>
        
        {/* 体幹 */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <Heart className="w-4 h-4 inline mr-1" />
              体幹
            </span>
            <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {Math.round(corePerc)}%
            </span>
          </div>
          <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div 
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${corePerc}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* バランス評価 */}
      <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <span className="flex items-center gap-2">
            {Math.abs(upperPerc - lowerPerc) < 15 ? (
              <><CheckCircle className="w-4 h-4 text-green-500" /> バランス良好！</>
            ) : upperPerc > lowerPerc ? (
              <><AlertTriangle className="w-4 h-4 text-yellow-500" /> 下半身トレーニングを強化しましょう</>
            ) : (
              <><AlertTriangle className="w-4 h-4 text-yellow-500" /> 上半身トレーニングを強化しましょう</>
            )}
          </span>
        </p>
      </div>
    </div>
  )
}