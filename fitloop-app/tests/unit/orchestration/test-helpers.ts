/**
 * Test helpers for orchestration tests
 */

export const createMockUserContext = () => ({
  userProfile: {},
  sessionHistory: [],
  currentState: {},
  preferences: { expertiseLevel: 'beginner' },
  emotionalState: {
    mood: 'good',
    energy: 'medium',
    confidence: 'medium',
    motivation: 'medium',
    stress: 'low'
  },
  environment: {
    location: 'home',
    equipment: ['dumbbells'],
    spaceConstraints: 'unlimited',
    timeAvailable: 60,
    noise_level: 'moderate'
  }
});

export const createMockAIRequest = (overrides: any = {}) => ({
  id: 'test-123',
  userId: 'user-456',
  prompt: 'Test prompt',
  requestType: 'training_guidance',
  priority: 'medium' as const,
  requirements: {},
  context: createMockUserContext(),
  fallbackStrategy: 'service_fallback' as const,
  retryPolicy: { maxRetries: 2, retryDelay: 1000, exponentialBackoff: true },
  metadata: { source: 'test', timestamp: new Date() },
  ...overrides
});

export const createMockAIServiceConfig = (overrides: any = {}) => ({
  name: 'test-ai',
  capabilities: [
    { type: 'text_generation', level: 'expert' },
    { type: 'reasoning', level: 'advanced' }
  ],
  reliability: 0.95,
  costPerToken: 0.00001,
  ...overrides
});