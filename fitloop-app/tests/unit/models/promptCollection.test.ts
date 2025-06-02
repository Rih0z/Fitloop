import { describe, it, expect } from 'vitest'
import { 
  DEFAULT_PROMPT_COLLECTIONS, 
  DEFAULT_META_PROMPTS 
} from '../../../src/models/promptCollection'
import type { 
  PromptCollection, 
  SavedPrompt, 
  MetaPromptTemplate, 
  PromptVariable 
} from '../../../src/models/promptCollection'

describe('PromptCollection', () => {
  describe('PromptCollection interface', () => {
    it('should create a valid prompt collection', () => {
      const collection: PromptCollection = {
        id: 1,
        name: 'テストコレクション',
        description: 'テスト用のプロンプトコレクション',
        category: 'training',
        prompts: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(collection.name).toBe('テストコレクション')
      expect(collection.category).toBe('training')
      expect(collection.prompts).toHaveLength(0)
    })

    it('should handle collection without id', () => {
      const collection: PromptCollection = {
        name: 'テストコレクション',
        description: '説明',
        category: 'custom',
        prompts: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(collection.id).toBeUndefined()
      expect(collection.name).toBeDefined()
    })
  })

  describe('SavedPrompt interface', () => {
    it('should create a valid saved prompt', () => {
      const prompt: SavedPrompt = {
        id: 1,
        title: 'テストプロンプト',
        content: 'プロンプトの内容',
        description: '説明文',
        isMetaPrompt: true,
        category: 'training',
        tags: ['筋トレ', 'テスト'],
        usageCount: 5,
        lastUsed: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(prompt.title).toBe('テストプロンプト')
      expect(prompt.isMetaPrompt).toBe(true)
      expect(prompt.tags).toHaveLength(2)
      expect(prompt.usageCount).toBe(5)
    })

    it('should handle prompt without optional fields', () => {
      const prompt: SavedPrompt = {
        title: 'シンプルプロンプト',
        content: '内容',
        isMetaPrompt: false,
        category: 'custom',
        tags: [],
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(prompt.id).toBeUndefined()
      expect(prompt.description).toBeUndefined()
      expect(prompt.lastUsed).toBeUndefined()
    })

    it('should support all valid categories', () => {
      const categories: Array<SavedPrompt['category']> = [
        'training', 'nutrition', 'analysis', 'planning', 'custom'
      ]

      categories.forEach(category => {
        const prompt: SavedPrompt = {
          title: `${category}プロンプト`,
          content: '内容',
          isMetaPrompt: false,
          category,
          tags: [],
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        expect(prompt.category).toBe(category)
      })
    })
  })

  describe('MetaPromptTemplate interface', () => {
    it('should create a valid meta prompt template', () => {
      const template: MetaPromptTemplate = {
        id: 1,
        name: 'テストテンプレート',
        description: 'テンプレートの説明',
        template: '{{name}}さんのトレーニング',
        variables: [{
          name: 'name',
          type: 'text',
          description: '名前',
          required: true,
          defaultValue: 'ユーザー'
        }],
        category: 'training',
        examples: ['例1', '例2'],
        createdAt: new Date()
      }

      expect(template.name).toBe('テストテンプレート')
      expect(template.variables).toHaveLength(1)
      expect(template.variables[0].type).toBe('text')
      expect(template.examples).toHaveLength(2)
    })

    it('should handle template without id', () => {
      const template: MetaPromptTemplate = {
        name: 'IDなしテンプレート',
        description: '説明',
        template: 'テンプレート内容',
        variables: [],
        category: 'planning',
        examples: [],
        createdAt: new Date()
      }

      expect(template.id).toBeUndefined()
      expect(template.variables).toHaveLength(0)
    })
  })

  describe('PromptVariable interface', () => {
    it('should create a valid text variable', () => {
      const variable: PromptVariable = {
        name: 'userName',
        type: 'text',
        description: 'ユーザー名',
        required: true,
        defaultValue: 'ゲスト'
      }

      expect(variable.type).toBe('text')
      expect(variable.required).toBe(true)
      expect(variable.defaultValue).toBe('ゲスト')
    })

    it('should create a valid number variable', () => {
      const variable: PromptVariable = {
        name: 'weight',
        type: 'number',
        description: '重量（kg）',
        required: true,
        defaultValue: 60
      }

      expect(variable.type).toBe('number')
      expect(variable.defaultValue).toBe(60)
    })

    it('should create a valid select variable', () => {
      const variable: PromptVariable = {
        name: 'intensity',
        type: 'select',
        description: '強度',
        required: true,
        options: ['低', '中', '高'],
        defaultValue: '中'
      }

      expect(variable.type).toBe('select')
      expect(variable.options).toHaveLength(3)
      expect(variable.options).toContain('中')
    })

    it('should create a valid multiselect variable', () => {
      const variable: PromptVariable = {
        name: 'muscleGroups',
        type: 'multiselect',
        description: '筋肉群',
        required: false,
        options: ['胸', '背中', '脚', '腕', '肩'],
        defaultValue: ['胸', '腕']
      }

      expect(variable.type).toBe('multiselect')
      expect(variable.options).toHaveLength(5)
      expect(variable.defaultValue).toHaveLength(2)
    })

    it('should create a valid date variable', () => {
      const variable: PromptVariable = {
        name: 'targetDate',
        type: 'date',
        description: '目標日',
        required: false
      }

      expect(variable.type).toBe('date')
      expect(variable.defaultValue).toBeUndefined()
      expect(variable.options).toBeUndefined()
    })

    it('should handle optional fields correctly', () => {
      const variable: PromptVariable = {
        name: 'optional',
        type: 'text',
        description: 'オプション項目',
        required: false
      }

      expect(variable.defaultValue).toBeUndefined()
      expect(variable.options).toBeUndefined()
    })
  })

  describe('DEFAULT_PROMPT_COLLECTIONS', () => {
    it('should have 5 default collections', () => {
      expect(DEFAULT_PROMPT_COLLECTIONS).toHaveLength(5)
    })

    it('should have one collection for each category', () => {
      const categories = DEFAULT_PROMPT_COLLECTIONS.map(c => c.category)
      expect(categories).toContain('training')
      expect(categories).toContain('nutrition')
      expect(categories).toContain('analysis')
      expect(categories).toContain('planning')
      expect(categories).toContain('custom')
    })

    it('should have valid structure for all collections', () => {
      DEFAULT_PROMPT_COLLECTIONS.forEach(collection => {
        expect(collection.name).toBeTruthy()
        expect(collection.description).toBeTruthy()
        expect(collection.category).toBeTruthy()
        expect(collection.prompts).toEqual([])
      })
    })

    it('should have Japanese names for all collections', () => {
      DEFAULT_PROMPT_COLLECTIONS.forEach(collection => {
        expect(collection.name).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/)
        expect(collection.description).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/)
      })
    })
  })

  describe('DEFAULT_META_PROMPTS', () => {
    it('should have at least 3 default meta prompts', () => {
      expect(DEFAULT_META_PROMPTS.length).toBeGreaterThanOrEqual(3)
    })

    it('should have valid structure for all meta prompts', () => {
      DEFAULT_META_PROMPTS.forEach(prompt => {
        expect(prompt.title).toBeTruthy()
        expect(prompt.content).toBeTruthy()
        expect(prompt.isMetaPrompt).toBe(true)
        expect(prompt.category).toBeTruthy()
        expect(prompt.tags).toBeInstanceOf(Array)
        expect(prompt.usageCount).toBe(0)
      })
    })

    it('should have training category meta prompt', () => {
      const trainingPrompt = DEFAULT_META_PROMPTS.find(p => p.category === 'training')
      expect(trainingPrompt).toBeDefined()
      expect(trainingPrompt?.title).toContain('筋トレ')
    })

    it('should have nutrition category meta prompt', () => {
      const nutritionPrompt = DEFAULT_META_PROMPTS.find(p => p.category === 'nutrition')
      expect(nutritionPrompt).toBeDefined()
      expect(nutritionPrompt?.title).toContain('栄養')
    })

    it('should have analysis category meta prompt', () => {
      const analysisPrompt = DEFAULT_META_PROMPTS.find(p => p.category === 'analysis')
      expect(analysisPrompt).toBeDefined()
      expect(analysisPrompt?.title).toContain('分析')
    })

    it('should have long content for all meta prompts', () => {
      DEFAULT_META_PROMPTS.forEach(prompt => {
        expect(prompt.content.length).toBeGreaterThan(500)
        expect(prompt.content).toContain('#')
        expect(prompt.content).toContain('##')
      })
    })

    it('should have relevant tags for each prompt', () => {
      DEFAULT_META_PROMPTS.forEach(prompt => {
        expect(prompt.tags.length).toBeGreaterThan(0)
        prompt.tags.forEach(tag => {
          expect(tag).toBeTruthy()
          expect(typeof tag).toBe('string')
        })
      })
    })

    it('should have description for all prompts', () => {
      DEFAULT_META_PROMPTS.forEach(prompt => {
        expect(prompt.description).toBeTruthy()
        expect(prompt.description?.length).toBeGreaterThan(10)
      })
    })
  })

  describe('Category validation', () => {
    it('should only allow valid categories', () => {
      const validCategories = ['training', 'nutrition', 'analysis', 'planning', 'custom']
      
      validCategories.forEach(category => {
        const collection: PromptCollection = {
          name: 'Test',
          description: 'Test',
          category: category as any,
          prompts: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
        expect(validCategories).toContain(collection.category)
      })
    })
  })

  describe('Usage tracking', () => {
    it('should track usage count', () => {
      const prompt: SavedPrompt = {
        title: 'Test',
        content: 'Content',
        isMetaPrompt: false,
        category: 'custom',
        tags: [],
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Simulate usage
      prompt.usageCount++
      prompt.lastUsed = new Date()

      expect(prompt.usageCount).toBe(1)
      expect(prompt.lastUsed).toBeInstanceOf(Date)
    })

    it('should handle multiple usage updates', () => {
      const prompt: SavedPrompt = {
        title: 'Test',
        content: 'Content',
        isMetaPrompt: false,
        category: 'custom',
        tags: [],
        usageCount: 10,
        lastUsed: new Date('2025-01-01'),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      }

      const originalUsageCount = prompt.usageCount
      const originalLastUsed = prompt.lastUsed

      // Simulate new usage
      prompt.usageCount++
      prompt.lastUsed = new Date()
      prompt.updatedAt = new Date()

      expect(prompt.usageCount).toBe(originalUsageCount + 1)
      expect(prompt.lastUsed.getTime()).toBeGreaterThan(originalLastUsed.getTime())
      expect(prompt.updatedAt.getTime()).toBeGreaterThan(prompt.createdAt.getTime())
    })
  })
})