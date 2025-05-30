import {
  MuscleIcon,
  CardioIcon,
  HealthIcon,
  AttractiveIcon,
  WeightLossIcon,
  SportsIcon,
  GymIcon,
  HomeGymIcon,
  BodyweightIcon,
  MinimalEquipmentIcon,
  TrainingIcon,
  NutritionIcon,
  AnalysisIcon,
  PlanningIcon,
  CustomIcon
} from '../components/icons/CustomIcons'

// 目標選択用のアイコンマッピング
export const getGoalIcon = (goalValue: string) => {
  switch (goalValue) {
    case '筋肉を大きくしたい':
      return MuscleIcon
    case '体力・持久力向上':
      return CardioIcon
    case '健康維持・改善':
      return HealthIcon
    case '見た目を良くしたい':
      return AttractiveIcon
    case 'ダイエット・減量':
      return WeightLossIcon
    case 'スポーツパフォーマンス向上':
      return SportsIcon
    default:
      return CustomIcon
  }
}

// 環境選択用のアイコンマッピング
export const getEnvironmentIcon = (environmentValue: string) => {
  switch (environmentValue) {
    case 'ジムに通っている（フル装備）':
      return GymIcon
    case '自宅トレーニング（ダンベルとベンチ）':
      return HomeGymIcon
    case '自重トレーニングのみ':
      return BodyweightIcon
    case 'ミニマル装備（抵抗バンドなど）':
      return MinimalEquipmentIcon
    default:
      return CustomIcon
  }
}

// カテゴリ用のアイコンマッピング
export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'training':
      return TrainingIcon
    case 'nutrition':
      return NutritionIcon
    case 'analysis':
      return AnalysisIcon
    case 'planning':
      return PlanningIcon
    case 'custom':
      return CustomIcon
    default:
      return CustomIcon
  }
}

// カテゴリ名の日本語マッピング
export const getCategoryName = (category: string) => {
  switch (category) {
    case 'training':
      return 'トレーニング'
    case 'nutrition':
      return '栄養管理'
    case 'analysis':
      return 'データ分析'
    case 'planning':
      return '計画立案'
    case 'custom':
      return 'カスタム'
    default:
      return 'その他'
  }
}