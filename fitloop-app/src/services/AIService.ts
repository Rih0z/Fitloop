import type { 
  IAIService, 
  AIRequest, 
  AIResponse, 
  AIProvider, 
  UsageStats 
} from '../interfaces/IAIService';
import { db } from '../lib/db';

export class AIService implements IAIService {
  private static instance: AIService;
  
  private constructor() {}
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }
  
  async generateResponse(request: AIRequest): Promise<AIResponse> {
    const provider = request.provider || 'claude';
    
    try {
      // 現在はブラウザAPIを通じた実装を想定
      // 将来的には各プロバイダーのAPIを直接呼び出す
      
      const response = await this.callProviderAPI(provider, request);
      
      // 使用統計を記録
      await this.recordUsage(provider, response);
      
      return response;
    } catch (error) {
      return {
        content: '',
        provider,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  private async callProviderAPI(
    provider: AIProvider['name'], 
    request: AIRequest
  ): Promise<AIResponse> {
    // 現在はプレースホルダー実装
    // 将来的には各プロバイダーのAPIを統合
    
    switch (provider) {
      case 'claude':
        return this.callClaudeAPI(request);
      case 'chatgpt':
        return this.callChatGPTAPI(request);
      case 'gemini':
        return this.callGeminiAPI(request);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
  
  private async callClaudeAPI(request: AIRequest): Promise<AIResponse> {
    // Claude APIの実装
    // 現在はブラウザ拡張機能経由での実装を想定
    
    // プロンプトをクリップボードにコピー
    const fullPrompt = this.buildFullPrompt(request);
    await navigator.clipboard.writeText(fullPrompt);
    
    // ユーザーに手動での操作を促す
    return {
      content: 'プロンプトがクリップボードにコピーされました。Claude.aiに貼り付けて、応答をこちらに貼り付けてください。',
      provider: 'claude',
      timestamp: new Date(),
      usage: {
        promptTokens: fullPrompt.length / 4, // 概算
        completionTokens: 0,
        totalTokens: fullPrompt.length / 4
      }
    };
  }
  
  private async callChatGPTAPI(_request: AIRequest): Promise<AIResponse> {
    // ChatGPT APIの実装（将来実装）
    throw new Error('ChatGPT integration not yet implemented');
  }
  
  private async callGeminiAPI(_request: AIRequest): Promise<AIResponse> {
    // Gemini APIの実装（将来実装）
    throw new Error('Gemini integration not yet implemented');
  }
  
  private buildFullPrompt(request: AIRequest): string {
    let prompt = '';
    
    if (request.systemPrompt) {
      prompt += `System: ${request.systemPrompt}\n\n`;
    }
    
    prompt += request.prompt;
    
    return prompt;
  }
  
  async getAvailableProviders(): Promise<AIProvider[]> {
    return [
      {
        name: 'claude',
        displayName: 'Claude',
        available: true
      },
      {
        name: 'chatgpt',
        displayName: 'ChatGPT',
        available: false
      },
      {
        name: 'gemini',
        displayName: 'Gemini',
        available: false
      }
    ];
  }
  
  async getUsageStats(): Promise<UsageStats> {
    const stats = await db.aiUsageStats.toArray();
    
    if (stats.length === 0) {
      return {
        totalRequests: 0,
        totalTokens: 0,
        byProvider: {
          claude: { requests: 0, tokens: 0 },
          chatgpt: { requests: 0, tokens: 0 },
          gemini: { requests: 0, tokens: 0 }
        },
        lastUsed: new Date()
      };
    }
    
    // 統計を集計
    const aggregated = stats.reduce((acc, stat) => {
      acc.totalRequests += stat.requests || 0;
      acc.totalTokens += stat.tokens || 0;
      
      if (stat.provider && acc.byProvider[stat.provider]) {
        acc.byProvider[stat.provider].requests += stat.requests || 0;
        acc.byProvider[stat.provider].tokens += stat.tokens || 0;
      }
      
      if (!acc.lastUsed || stat.lastUsed > acc.lastUsed) {
        acc.lastUsed = stat.lastUsed;
      }
      
      return acc;
    }, {
      totalRequests: 0,
      totalTokens: 0,
      byProvider: {
        claude: { requests: 0, tokens: 0 },
        chatgpt: { requests: 0, tokens: 0 },
        gemini: { requests: 0, tokens: 0 }
      },
      lastUsed: new Date()
    } as UsageStats);
    
    return aggregated;
  }
  
  async checkAvailability(): Promise<boolean> {
    // 現在はClaudeのみ利用可能
    return true;
  }
  
  private async recordUsage(
    provider: AIProvider['name'], 
    response: AIResponse
  ): Promise<void> {
    try {
      const existingStats = await db.aiUsageStats
        .where('provider')
        .equals(provider)
        .first();
      
      if (existingStats) {
        await db.aiUsageStats.update(existingStats.id!, {
          requests: (existingStats.requests || 0) + 1,
          tokens: (existingStats.tokens || 0) + (response.usage?.totalTokens || 0),
          lastUsed: new Date()
        });
      } else {
        await db.aiUsageStats.add({
          provider,
          requests: 1,
          tokens: response.usage?.totalTokens || 0,
          lastUsed: new Date()
        });
      }
    } catch (error) {
      console.error('Failed to record usage stats:', error);
    }
  }
}