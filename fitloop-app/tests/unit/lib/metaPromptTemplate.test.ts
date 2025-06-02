import { describe, it, expect } from 'vitest'
import { 
  META_PROMPT_TEMPLATE,
  META_PROMPT_EXERCISES,
  SESSION_TITLES,
  extractMetadata
} from '../../../src/lib/metaPromptTemplate'

describe('META_PROMPT_TEMPLATE', () => {
  it('should be a non-empty string', () => {
    expect(META_PROMPT_TEMPLATE).toBeTruthy()
    expect(typeof META_PROMPT_TEMPLATE).toBe('string')
    expect(META_PROMPT_TEMPLATE.length).toBeGreaterThan(1000)
  })

  it('should contain required placeholders', () => {
    const requiredPlaceholders = [
      '{{languageInstruction}}',
      '{{lastSession}}',
      '{{nextSession}}',
      '{{currentSession}}',
      '{{exercises}}',
      '{{sessionNumber}}',
      '{{sessionName}}',
      '{{date}}',
      '{{exercisesJSON}}',
      '{{muscleBalanceJSON}}',
      '{{recommendationsJSON}}',
      '{{nextSessionNumber}}',
      '{{cycleProgress}}'
    ]

    requiredPlaceholders.forEach(placeholder => {
      expect(META_PROMPT_TEMPLATE).toContain(placeholder)
    })
  })

  it('should contain meta-prompt instructions', () => {
    expect(META_PROMPT_TEMPLATE).toContain('このプロンプトはメタプロンプトです')
    expect(META_PROMPT_TEMPLATE).toContain('Claude への指示')
    expect(META_PROMPT_TEMPLATE).toContain('新しいプロンプトを生成')
  })

  it('should contain training system overview', () => {
    expect(META_PROMPT_TEMPLATE).toContain('システム概要')
    expect(META_PROMPT_TEMPLATE).toContain('筋肉バランス')
    expect(META_PROMPT_TEMPLATE).toContain('トレーニングサイクル')
  })

  it('should have proper markdown structure', () => {
    expect(META_PROMPT_TEMPLATE).toMatch(/^#\s+/m) // H1 header
    expect(META_PROMPT_TEMPLATE).toMatch(/^##\s+/m) // H2 headers
    expect(META_PROMPT_TEMPLATE).toMatch(/^###\s+/m) // H3 headers
    expect(META_PROMPT_TEMPLATE).toMatch(/```/m) // Code blocks
  })
})

describe('META_PROMPT_EXERCISES', () => {
  it('should have exercises for all 8 sessions', () => {
    expect(META_PROMPT_EXERCISES).toHaveProperty('1')
    expect(META_PROMPT_EXERCISES).toHaveProperty('2')
    expect(META_PROMPT_EXERCISES).toHaveProperty('3')
    expect(META_PROMPT_EXERCISES).toHaveProperty('4')
    expect(META_PROMPT_EXERCISES).toHaveProperty('5')
    expect(META_PROMPT_EXERCISES).toHaveProperty('6')
    expect(META_PROMPT_EXERCISES).toHaveProperty('7')
    expect(META_PROMPT_EXERCISES).toHaveProperty('8')
  })

  it('should have valid exercise structure for each session', () => {
    Object.values(META_PROMPT_EXERCISES).forEach((exercises: any) => {
      expect(Array.isArray(exercises)).toBe(true)
      expect(exercises.length).toBeGreaterThan(0)
      
      exercises.forEach((exercise: any) => {
        expect(exercise).toHaveProperty('name')
        expect(exercise).toHaveProperty('sets')
        expect(exercise).toHaveProperty('targetReps')
        expect(exercise).toHaveProperty('weight')
        expect(exercise).toHaveProperty('unit')
        expect(exercise).toHaveProperty('rest')
        
        expect(typeof exercise.name).toBe('string')
        expect(typeof exercise.sets).toBe('number')
        expect(typeof exercise.targetReps).toBe('string')
        expect(typeof exercise.weight).toBe('number')
        expect(typeof exercise.unit).toBe('string')
        expect(typeof exercise.rest).toBe('number')
      })
    })
  })

  it('should have appropriate exercise counts per session', () => {
    Object.values(META_PROMPT_EXERCISES).forEach((exercises: any) => {
      expect(exercises.length).toBeGreaterThanOrEqual(2)
      expect(exercises.length).toBeLessThanOrEqual(5)
    })
  })

  it('should use consistent units', () => {
    const validUnits = ['lbs', 'kg', '体重', 'ポンド', '', 'ポンド（背中に載せる）']
    Object.values(META_PROMPT_EXERCISES).forEach((exercises: any) => {
      exercises.forEach((exercise: any) => {
        expect(validUnits).toContain(exercise.unit)
      })
    })
  })

  it('should have reasonable rest periods', () => {
    Object.values(META_PROMPT_EXERCISES).forEach((exercises: any) => {
      exercises.forEach((exercise: any) => {
        expect(exercise.rest).toBeGreaterThanOrEqual(30)
        expect(exercise.rest).toBeLessThanOrEqual(180)
      })
    })
  })
})

describe('SESSION_TITLES', () => {
  it('should have titles for all 8 sessions', () => {
    expect(SESSION_TITLES).toHaveProperty('1')
    expect(SESSION_TITLES).toHaveProperty('2')
    expect(SESSION_TITLES).toHaveProperty('3')
    expect(SESSION_TITLES).toHaveProperty('4')
    expect(SESSION_TITLES).toHaveProperty('5')
    expect(SESSION_TITLES).toHaveProperty('6')
    expect(SESSION_TITLES).toHaveProperty('7')
    expect(SESSION_TITLES).toHaveProperty('8')
  })

  it('should have non-empty string titles', () => {
    Object.values(SESSION_TITLES).forEach(title => {
      expect(typeof title).toBe('string')
      expect(title.length).toBeGreaterThan(0)
    })
  })

  it('should have Japanese titles', () => {
    Object.values(SESSION_TITLES).forEach(title => {
      // Check for Japanese characters (Hiragana, Katakana, or Kanji)
      expect(title).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/)
    })
  })

  it('should have unique titles', () => {
    const titles = Object.values(SESSION_TITLES)
    const uniqueTitles = new Set(titles)
    expect(uniqueTitles.size).toBe(titles.length)
  })
})

describe('extractMetadata', () => {
  it('should extract metadata from valid prompt', () => {
    const validPrompt = `# Some title
<!-- METADATA_START -->
{
  "sessionNumber": 3,
  "sessionName": "上半身プッシュ",
  "date": "2025-01-01",
  "nextSession": 4,
  "cycleProgress": "3/8"
}
<!-- METADATA_END -->
Rest of the prompt...`

    const metadata = extractMetadata(validPrompt)
    expect(metadata).toBeDefined()
    expect(metadata?.sessionNumber).toBe(3)
    expect(metadata?.sessionName).toBe('上半身プッシュ')
    expect(metadata?.date).toBe('2025-01-01')
    expect(metadata?.nextSession).toBe(4)
    expect(metadata?.cycleProgress).toBe('3/8')
  })

  it('should return null for prompt without metadata', () => {
    const promptWithoutMetadata = `# Regular prompt
This is just a regular prompt without metadata.`

    const metadata = extractMetadata(promptWithoutMetadata)
    expect(metadata).toBeNull()
  })

  it('should return null for malformed metadata', () => {
    const malformedPrompt = `# Some title
<!-- METADATA_START -->
{
  "sessionNumber": 3,
  invalid syntax
}
<!-- METADATA_END -->
Rest of the prompt...`

    const metadata = extractMetadata(malformedPrompt)
    expect(metadata).toBeNull()
  })

  it('should handle metadata with missing fields', () => {
    const partialMetadata = `# Some title
<!-- METADATA_START -->
{
  "sessionNumber": 5,
  "sessionName": "下半身"
}
<!-- METADATA_END -->
Rest of the prompt...`

    const metadata = extractMetadata(partialMetadata)
    expect(metadata).toBeDefined()
    expect(metadata?.sessionNumber).toBe(5)
    expect(metadata?.sessionName).toBe('下半身')
    expect(metadata?.date).toBeUndefined()
  })

  it('should handle empty string', () => {
    const metadata = extractMetadata('')
    expect(metadata).toBeNull()
  })

  it('should handle metadata with extra fields', () => {
    const extraFieldsPrompt = `# Some title
<!-- METADATA_START -->
{
  "sessionNumber": 7,
  "sessionName": "コア&機能性",
  "date": "2025-01-15",
  "nextSession": 8,
  "cycleProgress": "7/8",
  "extraField": "This should be ignored but not cause error"
}
<!-- METADATA_END -->
Rest of the prompt...`

    const metadata = extractMetadata(extraFieldsPrompt)
    expect(metadata).toBeDefined()
    expect(metadata?.sessionNumber).toBe(7)
    expect(metadata?.cycleProgress).toBe('7/8')
  })
})

describe('Template consistency', () => {
  it('should have matching session numbers between EXERCISES and TITLES', () => {
    const exerciseKeys = Object.keys(META_PROMPT_EXERCISES).sort()
    const titleKeys = Object.keys(SESSION_TITLES).sort()
    
    expect(exerciseKeys).toEqual(titleKeys)
  })

  it('should have session numbers 1-8', () => {
    const expectedKeys = ['1', '2', '3', '4', '5', '6', '7', '8']
    const exerciseKeys = Object.keys(META_PROMPT_EXERCISES).sort()
    const titleKeys = Object.keys(SESSION_TITLES).sort()
    
    expect(exerciseKeys).toEqual(expectedKeys)
    expect(titleKeys).toEqual(expectedKeys)
  })

  it('should have consistent exercise patterns', () => {
    // Check that upper body sessions have appropriate exercises
    const upperBodySessions = [1, 3, 5, 7] // Based on typical split
    upperBodySessions.forEach(session => {
      const exercises = META_PROMPT_EXERCISES[session as keyof typeof META_PROMPT_EXERCISES]
      const exerciseNames = exercises.map((e: any) => e.name.toLowerCase())
      
      // Should contain at least one upper body exercise
      const hasUpperBody = exerciseNames.some(name => 
        name.includes('プレス') || 
        name.includes('プル') || 
        name.includes('カール') ||
        name.includes('ロウ') ||
        name.includes('ディップ') ||
        name.includes('ダンベル') ||
        name.includes('ケーブル') ||
        name.includes('フライ') ||
        name.includes('レイズ')
      )
      expect(hasUpperBody).toBe(true)
    })
  })
})

describe('Exercise weight progressions', () => {
  it('should have reasonable starting weights', () => {
    Object.values(META_PROMPT_EXERCISES).forEach((exercises: any) => {
      exercises.forEach((exercise: any) => {
        if (exercise.unit && (exercise.unit.includes('lbs') || exercise.unit.includes('ポンド'))) {
          expect(exercise.weight).toBeGreaterThanOrEqual(0)
          expect(exercise.weight).toBeLessThanOrEqual(200)
        }
      })
    })
  })

  it('should have valid rep ranges', () => {
    Object.values(META_PROMPT_EXERCISES).forEach((exercises: any) => {
      exercises.forEach((exercise: any) => {
        // targetReps can be a string like "8-12" or a single number
        const reps = exercise.targetReps
        if (typeof reps === 'string' && reps.includes('-')) {
          const parts = reps.split('-')
          if (parts.length === 2) {
            const min = parseInt(parts[0])
            const max = parseInt(parts[1])
            if (!isNaN(min) && !isNaN(max)) {
              expect(min).toBeGreaterThanOrEqual(1)
              expect(max).toBeLessThanOrEqual(60) // Allow for higher rep ranges
              expect(min).toBeLessThan(max)
            }
          }
        } else {
          const singleRep = typeof reps === 'string' ? parseInt(reps) : reps
          if (!isNaN(singleRep)) {
            expect(singleRep).toBeGreaterThanOrEqual(1)
            expect(singleRep).toBeLessThanOrEqual(60) // Allow for time-based exercises
          }
        }
      })
    })
  })

  it('should have appropriate set counts', () => {
    Object.values(META_PROMPT_EXERCISES).forEach((exercises: any) => {
      exercises.forEach((exercise: any) => {
        expect(exercise.sets).toBeGreaterThanOrEqual(1)
        expect(exercise.sets).toBeLessThanOrEqual(5)
      })
    })
  })
})