/**
 * Automated Data Pipeline System Interface
 * Handles screenshot/image analysis, OCR, data extraction, and real-time processing
 */

export interface ImageAnalysisRequest {
  requestId: string;
  userId: string;
  imageData: {
    source: 'screenshot' | 'camera' | 'upload' | 'clipboard';
    format: 'png' | 'jpg' | 'jpeg' | 'webp' | 'bmp';
    size: { width: number; height: number; };
    data: ArrayBuffer | string; // base64 encoded or binary data
    timestamp: Date;
  };
  analysisType: 'workout_data' | 'body_measurements' | 'nutrition_label' | 'exercise_form' | 'equipment' | 'general';
  priority: 'low' | 'medium' | 'high' | 'realtime';
  options: {
    performOCR: boolean;
    extractStructuredData: boolean;
    requiresValidation: boolean;
    enhanceImage: boolean;
    detectLanguage: boolean;
  };
  context: {
    expectedDataTypes: string[];
    userPreferences: any;
    sessionContext: any;
  };
  metadata: {
    deviceInfo?: any;
    location?: { lat: number; lng: number; };
    sessionId?: string;
  };
}

export interface OCRResult {
  text: string;
  confidence: number;
  boundingBoxes: {
    text: string;
    confidence: number;
    coordinates: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }[];
  detectedLanguage: string;
  orientation: number; // degrees
  processingTime: number;
  engine: string;
}

export interface ExtractedWorkoutData {
  exercises: {
    name: string;
    sets: {
      weight?: number;
      weightUnit?: 'kg' | 'lbs';
      reps?: number;
      duration?: number; // seconds
      distance?: number;
      distanceUnit?: 'km' | 'miles' | 'm' | 'ft';
      rpe?: number; // Rate of Perceived Exertion
      rest?: number; // seconds
    }[];
    muscleGroups: string[];
    equipment: string[];
    notes?: string;
  }[];
  workoutDate: Date;
  totalDuration?: number;
  totalVolume?: number;
  averageIntensity?: number;
  workoutType: 'strength' | 'cardio' | 'mixed' | 'flexibility';
  location?: string;
  trainer?: string;
}

export interface ExtractedBodyMeasurements {
  measurements: {
    weight?: { value: number; unit: 'kg' | 'lbs'; };
    bodyFat?: number; // percentage
    muscleMass?: { value: number; unit: 'kg' | 'lbs'; };
    visceralFat?: number;
    boneDensity?: number;
    metabolicAge?: number;
    bmr?: number; // Basal Metabolic Rate
    bmi?: number;
    bodyWater?: number; // percentage
    customMeasurements?: {
      name: string;
      value: number;
      unit: string;
    }[];
  };
  measurementDate: Date;
  deviceInfo?: {
    brand: string;
    model: string;
    accuracy: string;
  };
  conditions?: {
    timeOfDay: string;
    beforeAfterMeal: 'before' | 'after';
    hydrationLevel: 'low' | 'normal' | 'high';
  };
}

export interface DataValidation {
  isValid: boolean;
  confidence: number;
  issues: {
    field: string;
    issue: 'missing' | 'invalid_format' | 'out_of_range' | 'inconsistent';
    message: string;
    severity: 'low' | 'medium' | 'high';
    suggestedFix?: string;
  }[];
  suggestions: string[];
  requiresManualReview: boolean;
}

export interface StructuredDataResult {
  extractedData: ExtractedWorkoutData | ExtractedBodyMeasurements | any;
  dataType: 'workout' | 'body_measurements' | 'nutrition' | 'other';
  validation: DataValidation;
  processingSteps: {
    step: string;
    duration: number;
    success: boolean;
    output?: any;
  }[];
  alternatives?: {
    data: any;
    confidence: number;
    reasoning: string;
  }[];
  metadata: {
    processingTime: number;
    aiModel: string;
    version: string;
    timestamp: Date;
  };
}

export interface RealTimeProcessor {
  processLiveData(stream: ReadableStream, type: 'camera' | 'sensor'): AsyncIterable<{
    data: any;
    timestamp: Date;
    confidence: number;
  }>;
}

export interface ProgressTracker {
  trackProgress(userId: string, data: any): Promise<{
    progressUpdates: {
      goalId: string;
      previousValue: number;
      newValue: number;
      change: number;
      changePercentage: number;
    }[];
    achievements: {
      id: string;
      name: string;
      description: string;
      unlockedAt: Date;
    }[];
    insights: string[];
  }>;
}

export interface DataPipelineConfig {
  ocrProviders: {
    primary: 'tesseract' | 'google_vision' | 'azure_vision' | 'aws_textract';
    fallback: string[];
    languages: string[];
  };
  imageProcessing: {
    maxFileSize: number; // bytes
    supportedFormats: string[];
    enhancementEnabled: boolean;
    compressionQuality: number;
  };
  aiAnalysis: {
    primaryModel: string;
    fallbackModels: string[];
    confidenceThreshold: number;
    maxRetries: number;
  };
  validation: {
    strictMode: boolean;
    requireManualReview: boolean;
    confidenceThreshold: number;
  };
  storage: {
    retentionDays: number;
    encryptionEnabled: boolean;
    backupEnabled: boolean;
  };
}

export interface IDataPipeline {
  /**
   * Process image for data extraction
   */
  processImage(request: ImageAnalysisRequest): Promise<{
    ocrResult?: OCRResult;
    structuredData?: StructuredDataResult;
    analysisId: string;
    processingTime: number;
    status: 'success' | 'partial' | 'failed';
    errors?: string[];
  }>;

  /**
   * Perform OCR on image
   */
  performOCR(imageData: ArrayBuffer, options: {
    language?: string;
    enhanceImage?: boolean;
    provider?: string;
  }): Promise<OCRResult>;

  /**
   * Extract structured workout data from text/image
   */
  extractWorkoutData(input: string | ArrayBuffer, context?: any): Promise<{
    extractedData: ExtractedWorkoutData;
    validation: DataValidation;
    confidence: number;
  }>;

  /**
   * Extract body measurements from text/image
   */
  extractBodyMeasurements(input: string | ArrayBuffer, context?: any): Promise<{
    extractedData: ExtractedBodyMeasurements;
    validation: DataValidation;
    confidence: number;
  }>;

  /**
   * Validate extracted data
   */
  validateData(data: any, dataType: string, userId: string): Promise<DataValidation>;

  /**
   * Convert data to standardized format
   */
  standardizeData(data: any, targetFormat: string): Promise<{
    standardizedData: any;
    conversions: {
      field: string;
      originalValue: any;
      convertedValue: any;
      conversionRule: string;
    }[];
  }>;

  /**
   * Enhance image quality for better OCR
   */
  enhanceImage(imageData: ArrayBuffer): Promise<{
    enhancedImage: ArrayBuffer;
    enhancements: string[];
    qualityImprovement: number;
  }>;

  /**
   * Process real-time camera stream
   */
  processLiveStream(streamConfig: {
    userId: string;
    streamType: 'camera' | 'sensor';
    analysisInterval: number;
    targetData: string[];
  }): AsyncIterable<{
    frameData: any;
    extractedData?: any;
    timestamp: Date;
    confidence: number;
  }>;

  /**
   * Batch process multiple images
   */
  batchProcess(requests: ImageAnalysisRequest[]): Promise<{
    results: any[];
    successCount: number;
    failureCount: number;
    totalProcessingTime: number;
    errors: { requestId: string; error: string; }[];
  }>;

  /**
   * Update user progress based on extracted data
   */
  updateProgress(userId: string, extractedData: any, dataType: string): Promise<{
    progressUpdates: any[];
    achievements: any[];
    insights: string[];
    nextGoals: string[];
  }>;

  /**
   * Configure data pipeline settings
   */
  updateConfiguration(config: Partial<DataPipelineConfig>): Promise<void>;

  /**
   * Get processing history
   */
  getProcessingHistory(userId: string, timeRange?: { start: Date; end: Date }): Promise<{
    analyses: {
      analysisId: string;
      timestamp: Date;
      dataType: string;
      status: string;
      processingTime: number;
      confidence: number;
    }[];
    stats: {
      totalAnalyses: number;
      successRate: number;
      averageProcessingTime: number;
      averageConfidence: number;
    };
  }>;

  /**
   * Handle data correction/feedback
   */
  correctData(analysisId: string, corrections: {
    field: string;
    originalValue: any;
    correctedValue: any;
    reasoning: string;
  }[]): Promise<{
    updated: boolean;
    learningTriggered: boolean;
    modelImprovements: string[];
  }>;

  /**
   * Export data in various formats
   */
  exportData(userId: string, options: {
    format: 'json' | 'csv' | 'excel' | 'pdf';
    dataTypes: string[];
    timeRange?: { start: Date; end: Date };
    includeMetadata: boolean;
  }): Promise<{
    exportData: any;
    format: string;
    size: number;
    downloadUrl?: string;
  }>;

  /**
   * Get data quality metrics
   */
  getQualityMetrics(userId: string): Promise<{
    accuracy: number;
    completeness: number;
    consistency: number;
    timeliness: number;
    overallScore: number;
    recommendations: string[];
  }>;

  /**
   * Schedule automated data processing
   */
  scheduleProcessing(schedule: {
    userId: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    dataTypes: string[];
    notificationPreferences: any;
  }): Promise<{
    scheduleId: string;
    nextRun: Date;
    enabled: boolean;
  }>;

  /**
   * Train custom models based on user data
   */
  trainCustomModel(userId: string, trainingData: {
    inputs: any[];
    outputs: any[];
    modelType: string;
  }): Promise<{
    modelId: string;
    accuracy: number;
    trainingTime: number;
    modelSize: number;
    ready: boolean;
  }>;

  /**
   * Get pipeline performance metrics
   */
  getPerformanceMetrics(timeRange: { start: Date; end: Date }): Promise<{
    throughput: number; // requests per hour
    latency: {
      p50: number;
      p95: number;
      p99: number;
    };
    accuracy: number;
    errorRate: number;
    resourceUtilization: {
      cpu: number;
      memory: number;
      storage: number;
    };
  }>;
}