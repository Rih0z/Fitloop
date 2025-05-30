# FitLoop データモデル設計書

## 1. データモデル概要

FitLoopのデータモデルは、ユーザーの好み、欲求、気持ちを中心に設計されています。AIが提案するのではなく、ユーザーが必要とするものを提供するという原則に基づいています。

## 2. コアエンティティ

### 2.1 User (ユーザー)

```typescript
interface User {
  id: string;                    // UUID
  apiKey: string;               // ハッシュ化されたAPIキー
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;  // ユーザーの好み
  metadata: {
    timezone?: string;
    language?: string;
    [key: string]: any;
  };
}
```

### 2.2 UserPreferences (ユーザーの好み・欲求)

```typescript
interface UserPreferences {
  userId: string;
  
  // 目的・ゴール
  goals: {
    primary: string;           // 主要な目的（自由記述）
    secondary?: string[];      // 副次的な目的
    idealPhysique?: string;    // 理想の体型
  };
  
  // トレーニング環境
  environment: {
    description: string;       // 環境の自由記述
    equipment: string[];       // 利用可能な器具
    constraints?: string[];    // 制約事項
  };
  
  // 個人の好み
  preferences: {
    trainingStyle?: string;    // トレーニングスタイル
    intensity?: 'low' | 'medium' | 'high';
    timeAvailable?: number;    // 利用可能時間（分）
    frequency?: number;        // 週あたりの頻度
  };
  
  // 現在の気持ち・モチベーション
  currentMood: {
    motivation: number;        // 1-10のスケール
    energy: number;           // 1-10のスケール
    stress: number;           // 1-10のスケール
    notes?: string;           // 自由記述
    updatedAt: Date;
  };
}
```

### 2.3 Context (コンテキスト)

```typescript
interface Context {
  id: string;
  userId: string;
  sessionId?: string;          // 現在のAIセッションID
  
  // 現在の状態
  currentState: {
    phase: 'planning' | 'training' | 'rest' | 'review';
    cycleNumber: number;       // 現在のサイクル番号
    sessionNumber: number;     // サイクル内のセッション番号
    lastActivity: Date;
  };
  
  // 身体測定データ
  measurements: {
    weight?: number;           // kg
    bodyFatPercentage?: number;
    muscleMass?: number;
    measurements?: {
      chest?: number;
      waist?: number;
      arms?: number;
      [key: string]: number | undefined;
    };
    lastUpdated: Date;
  };
  
  // パフォーマンスデータ
  performance: {
    exercises: ExercisePerformance[];
    trends: {
      strength: 'improving' | 'stable' | 'declining';
      endurance: 'improving' | 'stable' | 'declining';
      overall: 'improving' | 'stable' | 'declining';
    };
  };
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.4 ExercisePerformance (エクササイズ実績)

```typescript
interface ExercisePerformance {
  exerciseName: string;
  date: Date;
  sets: {
    weight: number;            // ポンドまたはkg
    reps: number;
    rpe?: number;             // 主観的運動強度 (1-10)
  }[];
  notes?: string;
  muscleGroups: string[];      // 対象筋肉群
}
```

### 2.5 PromptTemplate (プロンプトテンプレート)

```typescript
interface PromptTemplate {
  id: string;
  type: 'training' | 'import' | 'export' | 'analysis';
  name: string;
  description: string;
  
  // テンプレート本体
  template: string;
  
  // 必要な変数
  variables: {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required: boolean;
    description?: string;
  }[];
  
  // メタデータ
  metadata: {
    version: string;
    author: string;
    tags: string[];
    compatibility: string[];   // 対応AI（Claude, ChatGPT等）
  };
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.6 GeneratedPrompt (生成されたプロンプト)

```typescript
interface GeneratedPrompt {
  id: string;
  userId: string;
  contextId: string;
  templateId?: string;
  
  // プロンプト内容
  content: string;
  
  // 生成時のコンテキスト
  generationContext: {
    userState: any;           // 生成時のユーザー状態
    purpose: string;          // 生成目的
    targetAI: string;         // 対象AI
  };
  
  // 使用履歴
  usage: {
    usedAt?: Date;
    aiResponse?: string;
    feedback?: {
      helpful: boolean;
      notes?: string;
    };
  };
  
  createdAt: Date;
  expiresAt?: Date;           // 有効期限
}
```

### 2.7 ImportSession (インポートセッション)

```typescript
interface ImportSession {
  id: string;
  userId: string;
  
  // インポート用プロンプト
  importPrompt: string;
  
  // インポート結果
  result?: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    data?: any;               // インポートされたデータ
    error?: string;
    processedAt?: Date;
  };
  
  // メタデータ
  metadata: {
    source: 'screenshot' | 'text' | 'file';
    aiUsed?: string;          // 使用されたAI
    originalContent?: string;  // 元のコンテンツ
  };
  
  createdAt: Date;
  expiresAt: Date;            // 24時間後に自動削除
}
```

## 3. データストレージ戦略

### 3.1 Cloudflare KV (Key-Value Store)

**用途**: 高速アクセスが必要なデータ

```typescript
// KVのキー構造
const kvKeys = {
  user: `user:${userId}`,
  context: `context:${userId}:current`,
  preferences: `preferences:${userId}`,
  promptCache: `prompt:${userId}:${promptType}`,
  session: `session:${sessionId}`,
};
```

**保存するデータ**:
- ユーザー基本情報
- 現在のコンテキスト
- 最近使用したプロンプト（キャッシュ）
- アクティブなセッション

### 3.2 Cloudflare R2 (Object Storage)

**用途**: 大容量データ、長期保存

```typescript
// R2のオブジェクトパス構造
const r2Paths = {
  userHistory: `users/${userId}/history/${date}.json`,
  screenshots: `users/${userId}/screenshots/${timestamp}.png`,
  exports: `users/${userId}/exports/${exportId}.json`,
  backups: `backups/${userId}/${date}.tar.gz`,
};
```

**保存するデータ**:
- トレーニング履歴
- スクリーンショット画像
- エクスポートデータ
- バックアップ

## 4. データアクセスパターン

### 4.1 読み取りパターン

```typescript
// 現在のコンテキスト取得（高頻度）
async function getCurrentContext(userId: string): Promise<Context> {
  const key = `context:${userId}:current`;
  const data = await KV.get(key, 'json');
  return data || createDefaultContext(userId);
}

// 履歴データ取得（低頻度）
async function getTrainingHistory(userId: string, dateRange: DateRange) {
  const prefix = `users/${userId}/history/`;
  const objects = await R2.list({ prefix });
  // フィルタリングと集約処理
}
```

### 4.2 書き込みパターン

```typescript
// コンテキスト更新（トランザクション的）
async function updateContext(userId: string, updates: Partial<Context>) {
  const key = `context:${userId}:current`;
  const current = await KV.get(key, 'json');
  const updated = { ...current, ...updates, updatedAt: new Date() };
  
  // KVに保存
  await KV.put(key, JSON.stringify(updated));
  
  // 履歴として R2 にも保存
  const historyPath = `users/${userId}/history/${new Date().toISOString()}.json`;
  await R2.put(historyPath, JSON.stringify(updated));
}
```

## 5. データ整合性とバックアップ

### 5.1 整合性保証

- **楽観的ロック**: updatedAtフィールドでバージョン管理
- **イベントソーシング**: 全ての変更を履歴として保存
- **定期的な整合性チェック**: 日次バッチ処理

### 5.2 バックアップ戦略

```typescript
// 日次バックアップ
async function dailyBackup(userId: string) {
  const userData = await collectAllUserData(userId);
  const backupPath = `backups/${userId}/${new Date().toISOString()}.json`;
  
  await R2.put(backupPath, JSON.stringify(userData), {
    customMetadata: {
      version: '1.0',
      compressed: 'false',
      encryption: 'AES-256',
    },
  });
}
```

## 6. プライバシーとセキュリティ

### 6.1 データ暗号化

- **保存時暗号化**: Cloudflare の自動暗号化を利用
- **個人情報のハッシュ化**: メールアドレス等はハッシュ化
- **APIキーの安全な保存**: bcryptでハッシュ化

### 6.2 データ削除

```typescript
// ユーザーデータの完全削除
async function deleteUserData(userId: string) {
  // KVから削除
  await KV.delete(`user:${userId}`);
  await KV.delete(`context:${userId}:current`);
  await KV.delete(`preferences:${userId}`);
  
  // R2から削除
  const userPrefix = `users/${userId}/`;
  const objects = await R2.list({ prefix: userPrefix });
  for (const object of objects.objects) {
    await R2.delete(object.key);
  }
}
```

## 7. パフォーマンス最適化

### 7.1 キャッシュ戦略

```typescript
interface CacheStrategy {
  // プロンプトキャッシュ（5分間）
  promptCache: {
    ttl: 300,
    key: (userId: string, type: string) => `prompt:${userId}:${type}`,
  };
  
  // コンテキストキャッシュ（1時間）
  contextCache: {
    ttl: 3600,
    key: (userId: string) => `context:${userId}:cache`,
  };
}
```

### 7.2 データ圧縮

- 大きなJSONデータはgzip圧縮してR2に保存
- 画像は適切なフォーマット（WebP）に変換

## 8. マイグレーション戦略

### 8.1 スキーマバージョン管理

```typescript
interface DataWithVersion {
  _version: string;
  _migrated?: Date;
  data: any;
}

// マイグレーション実行
async function migrateData(data: DataWithVersion): Promise<any> {
  const migrations = getMigrations(data._version, CURRENT_VERSION);
  return migrations.reduce((acc, migration) => migration(acc), data);
}
```