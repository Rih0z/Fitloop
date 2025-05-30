import React from 'react'

interface IconProps {
  className?: string
  size?: number
  color?: string
}

// 筋肉増強アイコン
export const MuscleIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 4C9 2.89543 9.89543 2 11 2H13C14.1046 2 15 2.89543 15 4V6H17C18.1046 6 19 6.89543 19 8V10C19.5523 10 20 10.4477 20 11V13C20 13.5523 19.5523 14 19 14V16C19 17.1046 18.1046 18 17 18H15V20C15 21.1046 14.1046 22 13 22H11C9.89543 22 9 21.1046 9 20V18H7C5.89543 18 5 17.1046 5 16V14C4.44772 14 4 13.5523 4 13V11C4 10.4477 4.44772 10 5 10V8C5 6.89543 5.89543 6 7 6H9V4Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="2" fill={color} />
  </svg>
)

// 有酸素運動アイコン
export const CardioIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 12L6 9L9 15L15 3L18 12L21 9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="19" r="3" stroke={color} strokeWidth="2" fill="none" />
    <path d="M12 16V22" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

// 健康アイコン
export const HealthIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22 12H18L15 21L9 3L6 12H2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="1" fill={color} />
  </svg>
)

// 魅力向上アイコン
export const AttractiveIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <path
      d="M8 14S9.5 16 12 16S16 14 16 14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="9" cy="9" r="1" fill={color} />
    <circle cx="15" cy="9" r="1" fill={color} />
    <path
      d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"
      fill={color}
      opacity="0.6"
    />
  </svg>
)

// ダイエットアイコン
export const WeightLossIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L15.09 8.26L22 9L16 14.74L17.18 21.02L12 18L6.82 21.02L8 14.74L2 9L8.91 8.26L12 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path d="M8 10L16 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M10 8L14 8" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

// スポーツアイコン
export const SportsIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <path
      d="M12 2C13.5 4 16 7 16 12S13.5 20 12 22C10.5 20 8 17 8 12S10.5 4 12 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M2 12H22" stroke={color} strokeWidth="2" />
  </svg>
)

// ジムアイコン
export const GymIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.5 6.5L17.5 17.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.5 17.5L17.5 6.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="6.5" cy="6.5" r="2.5" stroke={color} strokeWidth="2" />
    <circle cx="17.5" cy="6.5" r="2.5" stroke={color} strokeWidth="2" />
    <circle cx="6.5" cy="17.5" r="2.5" stroke={color} strokeWidth="2" />
    <circle cx="17.5" cy="17.5" r="2.5" stroke={color} strokeWidth="2" />
  </svg>
)

// ホームジムアイコン
export const HomeGymIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 9L12 2L21 9V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M9 21V12H15V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="7" y="14" width="2" height="1" rx="0.5" fill={color} />
    <rect x="15" y="14" width="2" height="1" rx="0.5" fill={color} />
    <rect x="11" y="13" width="2" height="3" rx="1" fill={color} />
  </svg>
)

// 自重トレーニングアイコン
export const BodyweightIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="5" r="3" stroke={color} strokeWidth="2" />
    <path
      d="M12 8V12L16 16M8 16L12 12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 21V19C8 18.4477 8.44772 18 9 18H15C15.5523 18 16 18.4477 16 19V21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="8" cy="16" r="1" fill={color} />
    <circle cx="16" cy="16" r="1" fill={color} />
  </svg>
)

// ミニマル装備アイコン
export const MinimalEquipmentIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" strokeDasharray="2 2" />
    <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2" strokeDasharray="4 4" />
    <circle cx="12" cy="12" r="1" fill={color} />
    <path d="M12 4V8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M12 16V20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M4 12H8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M16 12H20" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

// トレーニングアイコン
export const TrainingIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 9V15M10 11V13M14 8V16M18 10V14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="6" cy="12" r="1" fill={color} />
    <circle cx="10" cy="12" r="1" fill={color} />
    <circle cx="14" cy="12" r="1" fill={color} />
    <circle cx="18" cy="12" r="1" fill={color} />
  </svg>
)

// 栄養アイコン
export const NutritionIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 22V12C7 8.68629 9.68629 6 13 6V6C16.3137 6 19 8.68629 19 12V22"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 18H19M7 14H19"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13 6C13 4.89543 12.1046 4 11 4C9.89543 4 9 4.89543 9 6C9 3.79086 10.7909 2 13 2C15.2091 2 17 3.79086 17 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// 分析アイコン
export const AnalysisIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2" />
    <path d="M9 9L15 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 9L9 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none" />
    <path d="M7 7L17 17" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    <path d="M17 7L7 17" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
  </svg>
)

// 計画アイコン
export const PlanningIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="4" width="18" height="16" rx="2" stroke={color} strokeWidth="2" />
    <path d="M7 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M17 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="8" cy="14" r="1" fill={color} />
    <circle cx="12" cy="14" r="1" fill={color} />
    <circle cx="16" cy="14" r="1" fill={color} />
    <circle cx="8" cy="17" r="1" fill={color} />
    <circle cx="12" cy="17" r="1" fill={color} />
  </svg>
)

// カスタムアイコン
export const CustomIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <path d="M12 6V12L16 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="2" fill={color} />
  </svg>
)

// AI アシスタントアイコン（Claude の代替）
export const AIAssistantIcon: React.FC<IconProps> = ({ className = '', size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 16V8C21 5.79086 19.2091 4 17 4H7C4.79086 4 3 5.79086 3 8V16C3 18.2091 4.79086 20 7 20H17C19.2091 20 21 18.2091 21 16Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="9" cy="10" r="1" fill={color} />
    <circle cx="15" cy="10" r="1" fill={color} />
    <path
      d="M8 14C8.5 15 10 16 12 16S15.5 15 16 14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 4L10 2M12 4L14 2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)