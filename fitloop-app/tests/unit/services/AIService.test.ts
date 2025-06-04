import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import 'fake-indexeddb/auto'
import { AIService } from '../../../src/services/AIService'
import { db } from '../../../src/lib/db'
import type { AIRequest, AIResponse } from '../../../src/interfaces/IAIService'

// Mock navigator.clipboard
const mockClipboard = {
  writeText: vi.fn()
}

describe('AIService', () => {
  let service: AIService
  let originalClipboard: any

  beforeEach(async () => {
    // Clear database
    await db.aiUsageStats.clear()
    
    // Store original clipboard and set up mock
    originalClipboard = navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true
    })
    
    // Reset mocks
    vi.clearAllMocks()
    
    // Get service instance
    service = AIService.getInstance()
  })

  afterEach(() => {
    // Restore original clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true
    })
  })

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const instance1 = AIService.getInstance()
      const instance2 = AIService.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('generateResponse', () => {
    it('should generate response for Claude provider', async () => {
      const request: AIRequest = {
        prompt: 'Test prompt',
        systemPrompt: 'System prompt',
        provider: 'claude'
      }
      
      mockClipboard.writeText.mockResolvedValue(undefined)
      
      const response = await service.generateResponse(request)
      
      expect(response.provider).toBe('claude')
      expect(response.content).toContain('プロンプトがクリップボードにコピーされました')
      expect(response.timestamp).toBeInstanceOf(Date)
      expect(response.usage).toBeDefined()
      expect(mockClipboard.writeText).toHaveBeenCalledWith('System: System prompt\n\nTest prompt')
    })

    it('should use claude as default provider', async () => {
      const request: AIRequest = {
        prompt: 'Test prompt'
      }
      
      mockClipboard.writeText.mockResolvedValue(undefined)
      
      const response = await service.generateResponse(request)
      
      expect(response.provider).toBe('claude')
    })

    it('should handle ChatGPT provider error', async () => {
      const request: AIRequest = {
        prompt: 'Test prompt',
        provider: 'chatgpt'
      }
      
      const response = await service.generateResponse(request)
      
      expect(response.provider).toBe('chatgpt')
      expect(response.error).toBe('ChatGPT integration not yet implemented')
      expect(response.content).toBe('')
    })

    it('should handle Gemini provider error', async () => {
      const request: AIRequest = {
        prompt: 'Test prompt',
        provider: 'gemini'
      }
      
      const response = await service.generateResponse(request)
      
      expect(response.provider).toBe('gemini')
      expect(response.error).toBe('Gemini integration not yet implemented')
      expect(response.content).toBe('')
    })

    it('should handle clipboard write errors', async () => {
      const request: AIRequest = {
        prompt: 'Test prompt',
        provider: 'claude'
      }
      
      mockClipboard.writeText.mockRejectedValue(new Error('Clipboard error'))
      
      const response = await service.generateResponse(request)
      
      expect(response.provider).toBe('claude')
      expect(response.error).toBe('Clipboard error')
      expect(response.content).toBe('')
    })

    it('should build prompt without system prompt', async () => {
      const request: AIRequest = {
        prompt: 'User prompt only',
        provider: 'claude'
      }
      
      mockClipboard.writeText.mockResolvedValue(undefined)
      
      await service.generateResponse(request)
      
      expect(mockClipboard.writeText).toHaveBeenCalledWith('User prompt only')
    })

    it('should record usage stats', async () => {
      const request: AIRequest = {
        prompt: 'Test prompt',
        provider: 'claude'
      }
      
      mockClipboard.writeText.mockResolvedValue(undefined)
      
      await service.generateResponse(request)
      
      const stats = await db.aiUsageStats.toArray()
      expect(stats).toHaveLength(1)
      expect(stats[0].provider).toBe('claude')
      expect(stats[0].requests).toBe(1)
      expect(stats[0].tokens).toBeGreaterThan(0)
    })

    it('should update existing usage stats', async () => {
      // Add initial stats
      await db.aiUsageStats.add({
        provider: 'claude',
        requests: 5,
        tokens: 100,
        lastUsed: new Date()
      })
      
      const request: AIRequest = {
        prompt: 'Test prompt',
        provider: 'claude'
      }
      
      mockClipboard.writeText.mockResolvedValue(undefined)
      
      await service.generateResponse(request)
      
      const stats = await db.aiUsageStats.toArray()
      expect(stats).toHaveLength(1)
      expect(stats[0].requests).toBe(6)
      expect(stats[0].tokens).toBeGreaterThan(100)
    })
  })

  describe('getAvailableProviders', () => {
    it('should return list of providers', async () => {
      const providers = await service.getAvailableProviders()
      
      expect(providers).toHaveLength(3)
      expect(providers[0]).toEqual({
        name: 'claude',
        displayName: 'Claude',
        available: true
      })
      expect(providers[1]).toEqual({
        name: 'chatgpt',
        displayName: 'ChatGPT',
        available: false
      })
      expect(providers[2]).toEqual({
        name: 'gemini',
        displayName: 'Gemini',
        available: false
      })
    })
  })

  describe('getUsageStats', () => {
    it('should return empty stats when no data', async () => {
      const stats = await service.getUsageStats()
      
      expect(stats.totalRequests).toBe(0)
      expect(stats.totalTokens).toBe(0)
      expect(stats.byProvider.claude.requests).toBe(0)
      expect(stats.byProvider.chatgpt.requests).toBe(0)
      expect(stats.byProvider.gemini.requests).toBe(0)
      expect(stats.lastUsed).toBeInstanceOf(Date)
    })

    it('should aggregate usage stats', async () => {
      const date1 = new Date('2025-06-01')
      const date2 = new Date('2025-06-02')
      const date3 = new Date('2025-06-03')
      
      await db.aiUsageStats.bulkAdd([
        { provider: 'claude', requests: 5, tokens: 100, lastUsed: date1 },
        { provider: 'chatgpt', requests: 3, tokens: 50, lastUsed: date2 },
        { provider: 'gemini', requests: 2, tokens: 30, lastUsed: date3 }
      ])
      
      const stats = await service.getUsageStats()
      
      expect(stats.totalRequests).toBe(10)
      expect(stats.totalTokens).toBe(180)
      expect(stats.byProvider.claude.requests).toBe(5)
      expect(stats.byProvider.claude.tokens).toBe(100)
      expect(stats.byProvider.chatgpt.requests).toBe(3)
      expect(stats.byProvider.chatgpt.tokens).toBe(50)
      expect(stats.byProvider.gemini.requests).toBe(2)
      expect(stats.byProvider.gemini.tokens).toBe(30)
      // Check that lastUsed is the most recent date (should be date3 or later)
      expect(stats.lastUsed.getTime()).toBeGreaterThanOrEqual(date3.getTime())
    })

    it('should handle missing provider data gracefully', async () => {
      await db.aiUsageStats.add({
        provider: 'claude' as any,
        requests: undefined as any,
        tokens: undefined as any,
        lastUsed: new Date()
      })
      
      const stats = await service.getUsageStats()
      
      expect(stats.totalRequests).toBe(0)
      expect(stats.totalTokens).toBe(0)
    })
  })

  describe('checkAvailability', () => {
    it('should return true', async () => {
      const available = await service.checkAvailability()
      expect(available).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock database error
      vi.spyOn(db.aiUsageStats, 'where').mockImplementation(() => {
        throw new Error('Database error')
      })
      
      const request: AIRequest = {
        prompt: 'Test prompt',
        provider: 'claude'
      }
      
      mockClipboard.writeText.mockResolvedValue(undefined)
      
      // Should not throw, but log error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const response = await service.generateResponse(request)
      
      expect(response.provider).toBe('claude')
      expect(consoleSpy).toHaveBeenCalledWith('Failed to record usage stats:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })
})