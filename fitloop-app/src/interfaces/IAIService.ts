export interface AIProvider {
  name: 'claude' | 'chatgpt' | 'gemini';
  displayName: string;
  available: boolean;
}

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  provider?: AIProvider['name'];
}

export interface AIResponse {
  content: string;
  provider: AIProvider['name'];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  timestamp: Date;
  error?: string;
}

export interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  byProvider: Record<AIProvider['name'], {
    requests: number;
    tokens: number;
  }>;
  lastUsed: Date;
}

export interface IAIService {
  generateResponse(request: AIRequest): Promise<AIResponse>;
  getAvailableProviders(): Promise<AIProvider[]>;
  getUsageStats(): Promise<UsageStats>;
  checkAvailability(): Promise<boolean>;
}