import { describe, it, expect } from 'vitest'
import { 
  sanitizeInput, 
  sanitizeForDisplay, 
  validateFile, 
  validateImportData 
} from '../../../src/utils/sanitize'

describe('sanitizeInput', () => {
  it('should remove HTML tags', () => {
    const input = 'Hello <script>alert("XSS")</script>World'
    const result = sanitizeInput(input)
    expect(result).toBe('Hello scriptalert("XSS")/scriptWorld')
  })

  it('should trim whitespace', () => {
    const input = '  Hello World  '
    const result = sanitizeInput(input)
    expect(result).toBe('Hello World')
  })

  it('should limit text length to 1000 characters', () => {
    const input = 'a'.repeat(1500)
    const result = sanitizeInput(input)
    expect(result).toHaveLength(1000)
  })

  it('should return empty string for null or undefined input', () => {
    expect(sanitizeInput(null as any)).toBe('')
    expect(sanitizeInput(undefined as any)).toBe('')
  })

  it('should return empty string for non-string input', () => {
    expect(sanitizeInput(123 as any)).toBe('')
    expect(sanitizeInput({} as any)).toBe('')
    expect(sanitizeInput([] as any)).toBe('')
  })

  it('should handle empty string', () => {
    expect(sanitizeInput('')).toBe('')
  })

  it('should handle normal text without modification', () => {
    const input = 'This is normal text without any issues'
    expect(sanitizeInput(input)).toBe(input)
  })
})

describe('sanitizeForDisplay', () => {
  it('should escape HTML entities', () => {
    const input = '<div>Hello & "World" \'s</div>'
    const expected = '&lt;div&gt;Hello &amp; &quot;World&quot; &#x27;s&lt;/div&gt;'
    expect(sanitizeForDisplay(input)).toBe(expected)
  })

  it('should handle empty string', () => {
    expect(sanitizeForDisplay('')).toBe('')
  })

  it('should return empty string for null or undefined', () => {
    expect(sanitizeForDisplay(null as any)).toBe('')
    expect(sanitizeForDisplay(undefined as any)).toBe('')
  })

  it('should return empty string for non-string input', () => {
    expect(sanitizeForDisplay(123 as any)).toBe('')
    expect(sanitizeForDisplay({} as any)).toBe('')
  })

  it('should handle text with multiple special characters', () => {
    const input = '&&&<<<>>>""\'\'\''
    const expected = '&amp;&amp;&amp;&lt;&lt;&lt;&gt;&gt;&gt;&quot;&quot;&#x27;&#x27;&#x27;'
    expect(sanitizeForDisplay(input)).toBe(expected)
  })

  it('should preserve normal text', () => {
    const input = 'Normal text without special characters'
    expect(sanitizeForDisplay(input)).toBe(input)
  })
})

describe('validateFile', () => {
  const createMockFile = (name: string, size: number, type = 'application/json'): File => {
    const content = new Array(size).fill('a').join('')
    const blob = new Blob([content], { type })
    const file = new File([blob], name, { type })
    Object.defineProperty(file, 'size', { 
      value: size,
      writable: false,
      configurable: true
    })
    return file
  }

  it('should accept valid JSON files', () => {
    const file = createMockFile('data.json', 1024)
    const result = validateFile(file)
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('should reject non-JSON files', () => {
    const file = createMockFile('data.txt', 1024, 'text/plain')
    const result = validateFile(file)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('JSONファイルのみアップロード可能です')
  })

  it('should reject files larger than 10MB', () => {
    const file = createMockFile('data.json', 11 * 1024 * 1024)
    const result = validateFile(file)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('ファイルサイズは10MB以下にしてください')
  })

  it('should accept files exactly at 10MB limit', () => {
    const file = createMockFile('data.json', 10 * 1024 * 1024)
    const result = validateFile(file)
    expect(result.valid).toBe(true)
  })

  it('should handle edge case file names', () => {
    const validFile = createMockFile('.json', 1024)
    expect(validateFile(validFile).valid).toBe(true)
    
    const invalidFile = createMockFile('datajson', 1024)
    expect(validateFile(invalidFile).valid).toBe(false)
  })
})

describe('validateImportData', () => {
  it('should accept valid import data', () => {
    const validData = {
      exportDate: '2024-01-01',
      profile: [],
      context: [],
      prompts: [],
      sessions: []
    }
    expect(validateImportData(validData)).toBe(true)
  })

  it('should reject data without exportDate', () => {
    const invalidData = {
      profile: [],
      context: [],
      prompts: [],
      sessions: []
    }
    expect(validateImportData(invalidData)).toBe(false)
  })

  it('should reject null or undefined data', () => {
    expect(validateImportData(null)).toBe(false)
    expect(validateImportData(undefined)).toBe(false)
  })

  it('should reject non-object data', () => {
    expect(validateImportData('string')).toBe(false)
    expect(validateImportData(123)).toBe(false)
    expect(validateImportData([])).toBe(false)
  })

  it('should reject data with non-array fields', () => {
    const invalidData = {
      exportDate: '2024-01-01',
      profile: 'not an array',
      context: [],
      prompts: [],
      sessions: []
    }
    expect(validateImportData(invalidData)).toBe(false)
  })

  it('should accept data with only required fields', () => {
    const minimalData = {
      exportDate: '2024-01-01'
    }
    expect(validateImportData(minimalData)).toBe(true)
  })

  it('should accept data with partial optional fields', () => {
    const partialData = {
      exportDate: '2024-01-01',
      profile: [],
      prompts: []
    }
    expect(validateImportData(partialData)).toBe(true)
  })

  it('should handle edge cases for array validation', () => {
    const edgeCaseData = {
      exportDate: '2024-01-01',
      profile: [],
      context: null,
      prompts: undefined,
      sessions: {}
    }
    expect(validateImportData(edgeCaseData)).toBe(false)
  })
})