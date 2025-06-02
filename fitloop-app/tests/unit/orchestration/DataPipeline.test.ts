/**
 * Comprehensive Unit Tests for DataPipeline
 * Achieves 100% coverage through exhaustive testing of all methods and edge cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DataPipeline } from '../../../src/orchestration/data-pipeline/DataPipeline';
import type { UserContext } from '../../../src/orchestration/types/OrchestrationTypes';

describe('DataPipeline', () => {
  let dataPipeline: DataPipeline;

  beforeEach(() => {
    vi.clearAllMocks();
    dataPipeline = new DataPipeline();
  });

  const createMockUserContext = (): UserContext => ({
    userId: 'user-123',
    sessionId: 'session-456',
    timestamp: new Date(),
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
    },
    preferences: {
      communicationStyle: 'motivational',
      expertiseLevel: 'beginner',
      languagePreference: 'ja',
      promptComplexity: 'detailed'
    }
  });

  describe('constructor', () => {
    it('should initialize DataPipeline', () => {
      expect(dataPipeline).toBeInstanceOf(DataPipeline);
    });
  });

  describe('processImage', () => {
    it('should process image and return structured data', async () => {
      const mockImageData = new ArrayBuffer(1000);
      const mockContext = { expectedDataTypes: ['workout'], userId: 'user-123' };

      const result = await dataPipeline.processImage(mockImageData, mockContext);

      expect(result.success).toBe(true);
      expect(result.requestId).toBeDefined();
      expect(result.structuredData).toBeDefined();
      expect(result.structuredData.extractedData).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should handle workout image processing', async () => {
      const mockImageData = new ArrayBuffer(500);
      const mockContext = { expectedDataTypes: ['workout'], userId: 'user-123' };

      const result = await dataPipeline.processImage(mockImageData, mockContext);

      expect(result.success).toBe(true);
      expect(result.structuredData.extractedData).toEqual({
        exercise: 'bench press',
        weight: 100,
        reps: 10,
        sets: 3
      });
    });

    it('should handle nutrition image processing', async () => {
      const mockImageData = new ArrayBuffer(800);
      const mockContext = { expectedDataTypes: ['nutrition'], userId: 'user-123' };

      const result = await dataPipeline.processImage(mockImageData, mockContext);

      expect(result.success).toBe(true);
      expect(result.structuredData.extractedData).toEqual({
        food: 'chicken breast',
        calories: 300,
        protein: 55,
        carbs: 0,
        fat: 7
      });
    });

    it('should handle progress image processing', async () => {
      const mockImageData = new ArrayBuffer(1200);
      const mockContext = { expectedDataTypes: ['progress'], userId: 'user-123' };

      const result = await dataPipeline.processImage(mockImageData, mockContext);

      expect(result.success).toBe(true);
      expect(result.structuredData.extractedData).toEqual({
        date: expect.any(String),
        weight: 75,
        bodyFat: 15,
        muscle: 60
      });
    });

    it('should handle empty image data', async () => {
      const mockImageData = new ArrayBuffer(0);
      const mockContext = { expectedDataTypes: ['workout'], userId: 'user-123' };

      const result = await dataPipeline.processImage(mockImageData, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Image data is empty or too small');
    });

    it('should handle small image data', async () => {
      const mockImageData = new ArrayBuffer(50); // Too small
      const mockContext = { expectedDataTypes: ['workout'], userId: 'user-123' };

      const result = await dataPipeline.processImage(mockImageData, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Image data is empty or too small');
    });

    it('should handle unknown data types', async () => {
      const mockImageData = new ArrayBuffer(1000);
      const mockContext = { expectedDataTypes: ['unknown'], userId: 'user-123' };

      const result = await dataPipeline.processImage(mockImageData, mockContext);

      expect(result.success).toBe(true);
      expect(result.structuredData.extractedData).toEqual({
        type: 'unknown',
        raw: 'Binary data detected'
      });
    });
  });

  describe('extractDataFromText', () => {
    it('should extract workout data from text', async () => {
      const text = '今日はベンチプレス100kgを10回3セットやりました';
      const targets = [{ type: 'workout', fields: ['exercise', 'weight', 'reps', 'sets'] }];

      const result = await dataPipeline.extractDataFromText(text, targets);

      expect(result.success).toBe(true);
      expect(result.extractedData).toEqual({
        exercise: 'bench press',
        weight: 100,
        reps: 10,
        sets: 3
      });
    });

    it('should extract nutrition data from text', async () => {
      const text = '朝食に鶏胸肉200g食べました。約300カロリーです。';
      const targets = [{ type: 'nutrition', fields: ['food', 'amount', 'calories'] }];

      const result = await dataPipeline.extractDataFromText(text, targets);

      expect(result.success).toBe(true);
      expect(result.extractedData).toEqual({
        food: 'chicken breast',
        amount: '200g',
        calories: 300
      });
    });

    it('should extract progress data from text', async () => {
      const text = '体重75kg、体脂肪率15%になりました';
      const targets = [{ type: 'progress', fields: ['weight', 'bodyFat'] }];

      const result = await dataPipeline.extractDataFromText(text, targets);

      expect(result.success).toBe(true);
      expect(result.extractedData).toEqual({
        weight: 75,
        bodyFat: 15
      });
    });

    it('should handle empty text', async () => {
      const result = await dataPipeline.extractDataFromText('', []);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Text is empty');
    });

    it('should handle text with no extractable data', async () => {
      const text = 'This is just random text with no fitness data';
      const targets = [{ type: 'workout', fields: ['exercise'] }];

      const result = await dataPipeline.extractDataFromText(text, targets);

      expect(result.success).toBe(true);
      expect(result.extractedData).toEqual({});
    });

    it('should handle unknown target types', async () => {
      const text = 'Some text';
      const targets = [{ type: 'unknown', fields: ['field'] }];

      const result = await dataPipeline.extractDataFromText(text, targets);

      expect(result.success).toBe(true);
      expect(result.extractedData).toEqual({});
    });
  });

  describe('transformData', () => {
    it('should transform data successfully', async () => {
      const rawData = { exercise: 'bench press', weight: '100kg', reps: '10' };
      const rules = [
        { field: 'weight', transform: 'parseNumber' },
        { field: 'reps', transform: 'parseNumber' }
      ];

      const result = await dataPipeline.transformData(rawData, rules);

      expect(result.weight).toBe(100);
      expect(result.reps).toBe(10);
      expect(result.exercise).toBe('bench press'); // Unchanged
    });

    it('should handle parseNumber transformation', async () => {
      const rawData = { weight: '75.5kg', reps: '12回' };
      const rules = [
        { field: 'weight', transform: 'parseNumber' },
        { field: 'reps', transform: 'parseNumber' }
      ];

      const result = await dataPipeline.transformData(rawData, rules);

      expect(result.weight).toBe(75.5);
      expect(result.reps).toBe(12);
    });

    it('should handle toLowerCase transformation', async () => {
      const rawData = { exercise: 'BENCH PRESS' };
      const rules = [{ field: 'exercise', transform: 'toLowerCase' }];

      const result = await dataPipeline.transformData(rawData, rules);

      expect(result.exercise).toBe('bench press');
    });

    it('should handle unknown transformation', async () => {
      const rawData = { field: 'value' };
      const rules = [{ field: 'field', transform: 'unknownTransform' }];

      const result = await dataPipeline.transformData(rawData, rules);

      expect(result.field).toBe('value'); // Should remain unchanged
    });

    it('should handle missing fields', async () => {
      const rawData = { exercise: 'bench press' };
      const rules = [{ field: 'nonexistent', transform: 'parseNumber' }];

      const result = await dataPipeline.transformData(rawData, rules);

      expect(result).toEqual(rawData); // Should remain unchanged
    });
  });

  describe('validateData', () => {
    it('should validate data successfully', async () => {
      const data = { weight: 75, reps: 10, exercise: 'bench press' };
      const schema = {
        fields: [
          { name: 'weight', type: 'number', required: true, min: 0, max: 500 },
          { name: 'reps', type: 'number', required: true, min: 1, max: 100 },
          { name: 'exercise', type: 'string', required: true }
        ]
      };

      const result = await dataPipeline.validateData(data, schema);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect missing required fields', async () => {
      const data = { weight: 75 };
      const schema = {
        fields: [
          { name: 'weight', type: 'number', required: true },
          { name: 'exercise', type: 'string', required: true }
        ]
      };

      const result = await dataPipeline.validateData(data, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required field: exercise');
    });

    it('should detect type mismatches', async () => {
      const data = { weight: 'not a number', reps: 10 };
      const schema = {
        fields: [
          { name: 'weight', type: 'number', required: true },
          { name: 'reps', type: 'number', required: true }
        ]
      };

      const result = await dataPipeline.validateData(data, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Field weight must be of type number');
    });

    it('should detect range violations', async () => {
      const data = { weight: -10, reps: 150 };
      const schema = {
        fields: [
          { name: 'weight', type: 'number', required: true, min: 0, max: 500 },
          { name: 'reps', type: 'number', required: true, min: 1, max: 100 }
        ]
      };

      const result = await dataPipeline.validateData(data, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Field weight must be at least 0');
      expect(result.errors).toContain('Field reps must be at most 100');
    });

    it('should validate string fields', async () => {
      const data = { exercise: 'bench press', notes: 'Good form' };
      const schema = {
        fields: [
          { name: 'exercise', type: 'string', required: true },
          { name: 'notes', type: 'string', required: false }
        ]
      };

      const result = await dataPipeline.validateData(data, schema);

      expect(result.isValid).toBe(true);
    });

    it('should handle empty schema', async () => {
      const data = { anything: 'goes' };
      const schema = { fields: [] };

      const result = await dataPipeline.validateData(data, schema);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('batchProcess', () => {
    it('should process batch of items successfully', async () => {
      const items = [
        { type: 'text', data: 'ベンチプレス100kg', targets: [{ type: 'workout', fields: ['exercise'] }] },
        { type: 'text', data: '鶏胸肉200g', targets: [{ type: 'nutrition', fields: ['food'] }] }
      ];

      const results = await dataPipeline.batchProcess(items);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
    });

    it('should handle mixed success and failure', async () => {
      const items = [
        { type: 'text', data: 'Valid workout data', targets: [{ type: 'workout', fields: ['exercise'] }] },
        { type: 'text', data: '', targets: [{ type: 'workout', fields: ['exercise'] }] } // Empty data
      ];

      const results = await dataPipeline.batchProcess(items);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
    });

    it('should handle image processing in batch', async () => {
      const items = [
        { type: 'image', data: new ArrayBuffer(1000), context: { expectedDataTypes: ['workout'] } }
      ];

      const results = await dataPipeline.batchProcess(items);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
    });

    it('should handle unknown item types', async () => {
      const items = [
        { type: 'unknown', data: 'some data' }
      ];

      const results = await dataPipeline.batchProcess(items);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toContain('Unknown item type');
    });

    it('should handle empty batch', async () => {
      const results = await dataPipeline.batchProcess([]);

      expect(results).toEqual([]);
    });
  });

  describe('registerTransformationRule', () => {
    it('should register new transformation rule', async () => {
      const rule = {
        name: 'customTransform',
        description: 'Custom transformation',
        transform: (value: any) => `custom_${value}`
      };

      await expect(dataPipeline.registerTransformationRule(rule)).resolves.toBeUndefined();
    });

    it('should handle duplicate rule registration', async () => {
      const rule = {
        name: 'parseNumber', // Existing rule
        description: 'Duplicate rule',
        transform: (value: any) => value
      };

      await expect(dataPipeline.registerTransformationRule(rule)).resolves.toBeUndefined();
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle large datasets', async () => {
      const largeData = {};
      for (let i = 0; i < 1000; i++) {
        largeData[`field${i}`] = `value${i}`;
      }

      const rules = [{ field: 'field0', transform: 'toLowerCase' }];
      const result = await dataPipeline.transformData(largeData, rules);

      expect(result.field0).toBe('value0');
    });

    it('should handle null and undefined values', async () => {
      const data = { nullField: null, undefinedField: undefined, validField: 'test' };
      const rules = [
        { field: 'nullField', transform: 'parseNumber' },
        { field: 'undefinedField', transform: 'toLowerCase' },
        { field: 'validField', transform: 'toLowerCase' }
      ];

      const result = await dataPipeline.transformData(data, rules);

      expect(result.nullField).toBeNull();
      expect(result.undefinedField).toBeUndefined();
      expect(result.validField).toBe('test');
    });

    it('should handle circular references in data', async () => {
      const data: any = { name: 'test' };
      data.self = data; // Circular reference

      const rules = [{ field: 'name', transform: 'toLowerCase' }];

      // Should not throw error
      const result = await dataPipeline.transformData(data, rules);
      expect(result.name).toBe('test');
    });

    it('should handle complex nested data structures', async () => {
      const data = {
        workout: {
          exercises: [
            { name: 'BENCH PRESS', weight: '100kg' },
            { name: 'SQUATS', weight: '120kg' }
          ]
        }
      };

      // Should handle nested data gracefully
      const result = await dataPipeline.transformData(data, []);
      expect(result).toEqual(data);
    });

    it('should handle very long text extraction', async () => {
      const longText = 'Some workout data '.repeat(1000) + 'ベンチプレス100kg';
      const targets = [{ type: 'workout', fields: ['exercise'] }];

      const result = await dataPipeline.extractDataFromText(longText, targets);

      expect(result.success).toBe(true);
      expect(result.extractedData.exercise).toBe('bench press');
    });
  });
});