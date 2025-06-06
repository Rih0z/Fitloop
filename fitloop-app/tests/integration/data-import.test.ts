import { describe, it, expect, beforeEach } from 'vitest'
import { validateImportData, convertToUserProfile, type ImportDataStructure } from '../../src/lib/dataImportPrompt'

describe('Data Import Integration Tests', () => {
  describe('JSON Validation', () => {
    it('should validate complete import data successfully', () => {
      const completeData: ImportDataStructure = {
        profile: {
          name: '田中太郎',
          age: 28,
          gender: 'male',
          height: 175,
          weight: 70,
          bodyFatPercentage: 15,
          muscleMass: 40
        },
        experience: {
          level: 'intermediate',
          yearsTraining: 2,
          previousPrograms: ['Starting Strength', 'Push Pull Legs'],
          injuries: [],
          limitations: []
        },
        currentHabits: {
          workoutFrequency: 4,
          workoutDuration: 60,
          preferredTime: 'evening',
          currentActivities: ['筋力トレーニング', 'ランニング'],
          restDays: 3
        },
        environment: {
          location: 'gym',
          availableEquipment: ['ダンベル', 'バーベル', 'ベンチ'],
          spaceConstraints: 'なし',
          timeConstraints: '1時間程度'
        },
        goals: {
          primary: '筋肉をつけてカッコよくなりたい',
          secondary: ['体脂肪を減らす', '筋力向上'],
          targetWeight: 75,
          targetBodyFat: 12,
          specificGoals: ['ベンチプレス100kg達成'],
          timeline: '6ヶ月'
        },
        currentApps: {
          fitnessApps: [
            {
              name: 'MyFitnessPal',
              usage: '毎日使用',
              data: { calories: 2500, protein: 150 }
            }
          ],
          nutritionApps: [],
          wearableDevices: [
            {
              name: 'Apple Watch',
              data: { steps: 8000, heartRate: 65 }
            }
          ]
        },
        nutrition: {
          dietType: '一般的',
          restrictions: [],
          dailyCalories: 2500,
          proteinIntake: 150,
          mealsPerDay: 4,
          supplements: ['プロテイン', 'クレアチン']
        },
        health: {
          conditions: [],
          medications: [],
          sleepHours: 7,
          stressLevel: 'moderate',
          energyLevel: 'high'
        },
        historicalData: {
          weightHistory: [
            { date: '2025-01-01', weight: 68 },
            { date: '2025-06-01', weight: 70 }
          ],
          performanceHistory: [
            { date: '2025-06-01', exercise: 'ベンチプレス', weight: 80, reps: 8 }
          ],
          bodyMeasurements: {}
        }
      }

      const jsonString = JSON.stringify(completeData)
      const result = validateImportData(jsonString)

      expect(result.isValid).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.errors).toBeUndefined()
    })

    it('should reject invalid JSON format', () => {
      const invalidJson = '{ invalid json format'
      const result = validateImportData(invalidJson)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('JSONの形式が正しくありません')
    })

    it('should validate required fields', () => {
      const incompleteData = {
        profile: {
          // name missing
          age: 25
        },
        // goals missing
        environment: {
          // location missing
        }
      }

      const jsonString = JSON.stringify(incompleteData)
      const result = validateImportData(jsonString)

      expect(result.isValid).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors).toContain('名前が設定されていません')
      expect(result.errors).toContain('主要目標が設定されていません')
      expect(result.errors).toContain('運動環境が設定されていません')
    })

    it('should validate data ranges', () => {
      const invalidRangeData: ImportDataStructure = {
        profile: {
          name: 'テストユーザー',
          age: 150, // Invalid age
          weight: 500, // Invalid weight
          height: 50 // Invalid height
        },
        goals: {
          primary: 'テスト目標'
        },
        environment: {
          location: 'home'
        }
      }

      const jsonString = JSON.stringify(invalidRangeData)
      const result = validateImportData(jsonString)

      expect(result.isValid).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors).toContain('年齢が有効な範囲にありません')
      expect(result.errors).toContain('体重が有効な範囲にありません')
      expect(result.errors).toContain('身長が有効な範囲にありません')
    })
  })

  describe('Data Conversion', () => {
    it('should convert import data to user profile format', () => {
      const importData: ImportDataStructure = {
        profile: {
          name: '佐藤花子',
          age: 30,
          weight: 55,
          height: 160
        },
        experience: {
          level: 'beginner'
        },
        goals: {
          primary: '健康的に痩せたい',
          secondary: ['筋力向上', '体力増進']
        },
        environment: {
          location: 'home',
          availableEquipment: ['ダンベル', 'ヨガマット']
        },
        currentHabits: {
          workoutFrequency: 3,
          workoutDuration: 45,
          preferredTime: 'morning'
        }
      }

      const userProfile = convertToUserProfile(importData)

      expect(userProfile.name).toBe('佐藤花子')
      expect(userProfile.age).toBe(30)
      expect(userProfile.weight).toBe(55)
      expect(userProfile.height).toBe(160)
      expect(userProfile.experience).toBe('beginner')
      expect(userProfile.goals).toBe('健康的に痩せたい')
      expect(userProfile.environment).toContain('home')
      expect(userProfile.environment).toContain('ダンベル')
      expect(userProfile.preferences.workoutFrequency).toBe(3)
      expect(userProfile.preferences.workoutDuration).toBe(45)
      expect(userProfile.preferences.preferredTime).toBe('morning')
      expect(userProfile.preferences.equipment).toEqual(['ダンベル', 'ヨガマット'])
      expect(userProfile.preferences.focusAreas).toEqual(['筋力向上', '体力増進'])
    })

    it('should handle missing optional fields gracefully', () => {
      const minimalData: ImportDataStructure = {
        profile: {
          name: 'ミニマムユーザー'
        },
        goals: {
          primary: 'フィットネス向上'
        },
        environment: {
          location: 'gym'
        }
      }

      const userProfile = convertToUserProfile(minimalData)

      expect(userProfile.name).toBe('ミニマムユーザー')
      expect(userProfile.goals).toBe('フィットネス向上')
      expect(userProfile.environment).toBe('gym')
      expect(userProfile.experience).toBe('beginner') // Default value
      expect(userProfile.preferences.workoutFrequency).toBe(3) // Default value
      expect(userProfile.preferences.equipment).toEqual([]) // Default empty array
    })
  })

  describe('Real-world Import Scenarios', () => {
    it('should handle typical MyFitnessPal user import', () => {
      const myFitnessPalUser: ImportDataStructure = {
        profile: {
          name: '山田健太',
          age: 26,
          gender: 'male',
          height: 178,
          weight: 72,
          bodyFatPercentage: 18
        },
        experience: {
          level: 'intermediate',
          yearsTraining: 1.5
        },
        goals: {
          primary: '筋肉をつけて体脂肪を減らしたい',
          targetWeight: 75,
          targetBodyFat: 15,
          timeline: '4ヶ月'
        },
        environment: {
          location: 'gym',
          availableEquipment: ['ダンベル', 'バーベル', 'ケーブルマシン', 'ベンチ']
        },
        currentApps: {
          fitnessApps: [
            {
              name: 'MyFitnessPal',
              usage: '食事記録メイン',
              data: {
                dailyCalories: 2300,
                protein: 140,
                carbs: 250,
                fat: 80
              }
            }
          ]
        },
        nutrition: {
          dietType: 'リーンバルク',
          dailyCalories: 2300,
          proteinIntake: 140,
          mealsPerDay: 5,
          supplements: ['ホエイプロテイン', 'マルチビタミン']
        },
        currentHabits: {
          workoutFrequency: 4,
          workoutDuration: 75,
          preferredTime: 'evening'
        }
      }

      const result = validateImportData(JSON.stringify(myFitnessPalUser))
      expect(result.isValid).toBe(true)

      const userProfile = convertToUserProfile(myFitnessPalUser)
      expect(userProfile.name).toBe('山田健太')
      expect(userProfile.experience).toBe('intermediate')
      expect(userProfile.preferences.workoutFrequency).toBe(4)
    })

    it('should handle Apple Watch user import', () => {
      const appleWatchUser: ImportDataStructure = {
        profile: {
          name: '鈴木美咲',
          age: 32,
          gender: 'female',
          height: 165,
          weight: 58
        },
        experience: {
          level: 'beginner',
          yearsTraining: 0.5
        },
        goals: {
          primary: '健康維持と体力向上',
          secondary: ['ストレス解消', '肩こり改善']
        },
        environment: {
          location: 'home',
          availableEquipment: ['ヨガマット', 'ダンベル'],
          timeConstraints: '30分程度'
        },
        currentApps: {
          wearableDevices: [
            {
              name: 'Apple Watch',
              data: {
                averageSteps: 7500,
                activeCalories: 350,
                exerciseMinutes: 25,
                standHours: 10,
                heartRateZones: {
                  fat_burn: 45,
                  cardio: 15,
                  peak: 5
                }
              }
            }
          ]
        },
        currentHabits: {
          workoutFrequency: 3,
          workoutDuration: 30,
          preferredTime: 'morning',
          currentActivities: ['ウォーキング', 'ヨガ', '軽い筋トレ']
        },
        health: {
          sleepHours: 6.5,
          stressLevel: 'high',
          energyLevel: 'moderate'
        }
      }

      const result = validateImportData(JSON.stringify(appleWatchUser))
      expect(result.isValid).toBe(true)

      const userProfile = convertToUserProfile(appleWatchUser)
      expect(userProfile.name).toBe('鈴木美咲')
      expect(userProfile.environment).toContain('home')
      expect(userProfile.preferences.workoutDuration).toBe(30)
    })
  })

  describe('Error Handling', () => {
    it('should handle corrupted AI output gracefully', () => {
      const corruptedJson = `{
        "profile": {
          "name": "テストユーザー",
          "age": "invalid_age_string"
        },
        "goals": {
          "primary": null
        },
        "environment": {
          "location": "unknown_location"
        }
      }`

      const result = validateImportData(corruptedJson)
      
      // Should still parse but may have validation errors
      expect(result.isValid).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should provide helpful error messages for common mistakes', () => {
      const commonMistakes = {
        profile: {
          // Common mistake: empty name
          name: '',
          age: 25
        },
        goals: {
          // Common mistake: empty goal
          primary: ''
        },
        environment: {
          location: 'gym'
        }
      }

      const result = validateImportData(JSON.stringify(commonMistakes))
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.some(error => error.includes('名前'))).toBe(true)
      expect(result.errors?.some(error => error.includes('目標'))).toBe(true)
    })
  })
})