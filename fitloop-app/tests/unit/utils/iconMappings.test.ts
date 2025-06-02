import { describe, it, expect } from 'vitest'
import {
  getGoalIcon,
  getEnvironmentIcon,
  getCategoryIcon,
  getCategoryName
} from '../../../src/utils/iconMappings'
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
} from '../../../src/components/icons/CustomIcons'

describe('getGoalIcon', () => {
  it('should return MuscleIcon for muscle building goal', () => {
    expect(getGoalIcon('筋肉を大きくしたい')).toBe(MuscleIcon)
  })

  it('should return CardioIcon for stamina improvement goal', () => {
    expect(getGoalIcon('体力・持久力向上')).toBe(CardioIcon)
  })

  it('should return HealthIcon for health maintenance goal', () => {
    expect(getGoalIcon('健康維持・改善')).toBe(HealthIcon)
  })

  it('should return AttractiveIcon for appearance improvement goal', () => {
    expect(getGoalIcon('見た目を良くしたい')).toBe(AttractiveIcon)
  })

  it('should return WeightLossIcon for weight loss goal', () => {
    expect(getGoalIcon('ダイエット・減量')).toBe(WeightLossIcon)
  })

  it('should return SportsIcon for sports performance goal', () => {
    expect(getGoalIcon('スポーツパフォーマンス向上')).toBe(SportsIcon)
  })

  it('should return CustomIcon for unknown goals', () => {
    expect(getGoalIcon('unknown goal')).toBe(CustomIcon)
    expect(getGoalIcon('')).toBe(CustomIcon)
    expect(getGoalIcon('その他の目標')).toBe(CustomIcon)
  })
})

describe('getEnvironmentIcon', () => {
  it('should return GymIcon for full gym environment', () => {
    expect(getEnvironmentIcon('ジムに通っている（フル装備）')).toBe(GymIcon)
  })

  it('should return HomeGymIcon for home gym environment', () => {
    expect(getEnvironmentIcon('自宅トレーニング（ダンベルとベンチ）')).toBe(HomeGymIcon)
  })

  it('should return BodyweightIcon for bodyweight training', () => {
    expect(getEnvironmentIcon('自重トレーニングのみ')).toBe(BodyweightIcon)
  })

  it('should return MinimalEquipmentIcon for minimal equipment', () => {
    expect(getEnvironmentIcon('ミニマル装備（抵抗バンドなど）')).toBe(MinimalEquipmentIcon)
  })

  it('should return CustomIcon for unknown environments', () => {
    expect(getEnvironmentIcon('unknown environment')).toBe(CustomIcon)
    expect(getEnvironmentIcon('')).toBe(CustomIcon)
    expect(getEnvironmentIcon('その他の環境')).toBe(CustomIcon)
  })
})

describe('getCategoryIcon', () => {
  it('should return TrainingIcon for training category', () => {
    expect(getCategoryIcon('training')).toBe(TrainingIcon)
  })

  it('should return NutritionIcon for nutrition category', () => {
    expect(getCategoryIcon('nutrition')).toBe(NutritionIcon)
  })

  it('should return AnalysisIcon for analysis category', () => {
    expect(getCategoryIcon('analysis')).toBe(AnalysisIcon)
  })

  it('should return PlanningIcon for planning category', () => {
    expect(getCategoryIcon('planning')).toBe(PlanningIcon)
  })

  it('should return CustomIcon for custom category', () => {
    expect(getCategoryIcon('custom')).toBe(CustomIcon)
  })

  it('should return CustomIcon for unknown categories', () => {
    expect(getCategoryIcon('unknown')).toBe(CustomIcon)
    expect(getCategoryIcon('')).toBe(CustomIcon)
    expect(getCategoryIcon('other')).toBe(CustomIcon)
  })
})

describe('getCategoryName', () => {
  it('should return Japanese name for training category', () => {
    expect(getCategoryName('training')).toBe('トレーニング')
  })

  it('should return Japanese name for nutrition category', () => {
    expect(getCategoryName('nutrition')).toBe('栄養管理')
  })

  it('should return Japanese name for analysis category', () => {
    expect(getCategoryName('analysis')).toBe('データ分析')
  })

  it('should return Japanese name for planning category', () => {
    expect(getCategoryName('planning')).toBe('計画立案')
  })

  it('should return Japanese name for custom category', () => {
    expect(getCategoryName('custom')).toBe('カスタム')
  })

  it('should return その他 for unknown categories', () => {
    expect(getCategoryName('unknown')).toBe('その他')
    expect(getCategoryName('')).toBe('その他')
    expect(getCategoryName('other')).toBe('その他')
  })

  it('should handle edge cases properly', () => {
    expect(getCategoryName(null as any)).toBe('その他')
    expect(getCategoryName(undefined as any)).toBe('その他')
    expect(getCategoryName(123 as any)).toBe('その他')
  })
})