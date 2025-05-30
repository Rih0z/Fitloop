# FitLoop フロントエンド専用アーキテクチャ設計書

## 1. システム概要

FitLoopは完全にフロントエンドで動作するシステムです。ユーザーのコンテキストをローカルに保存し、AIサービス（Claude、ChatGPT、Gemini等）で使用するプロンプトを提供します。

### 1.1 基本コンセプト
- **完全ローカル動作**: すべてのデータはユーザーのブラウザ/デバイスに保存
- **プロンプト提供**: ユーザーがAIにコピー&ペーストするプロンプトを生成
- **インポート支援**: AIからの出力を解析してローカルデータを更新

## 2. アーキテクチャ構成

```
┌─────────────────────────────────────────────────────────┐
│                  ユーザーのブラウザ                       │
├─────────────────────────────────────────────────────────┤
│                    FitLoop Web App                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │              UI コンポーネント                    │   │
│  │  ・ダッシュボード                               │   │
│  │  ・プロンプト表示/コピー                        │   │
│  │  ・データ入力フォーム                           │   │
│  │  ・履歴表示                                     │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │              ビジネスロジック                    │   │
│  │  ・プロンプト生成エンジン                       │   │
│  │  ・データ解析                                   │   │
│  │  ・コンテキスト管理                             │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │            ローカルストレージ                    │   │
│  │  ・IndexedDB（メインデータ）                    │   │
│  │  ・LocalStorage（設定）                         │   │
│  │  ・SessionStorage（一時データ）                 │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           ↓ コピー&ペースト
┌─────────────────────────────────────────────────────────┐
│           外部AIサービス（Claude、ChatGPT等）            │
└─────────────────────────────────────────────────────────┘
```

## 3. 技術スタック

### 3.1 フレームワーク選択

**Option 1: React (推奨)**
```json
{
  "framework": "React 18",
  "bundler": "Vite",
  "stateManagement": "Zustand",
  "storage": "Dexie.js (IndexedDB wrapper)",
  "ui": "Tailwind CSS + shadcn/ui",
  "deployment": "Vercel / Netlify / GitHub Pages"
}
```

**Option 2: Vue.js**
```json
{
  "framework": "Vue 3",
  "bundler": "Vite", 
  "stateManagement": "Pinia",
  "storage": "localForage",
  "ui": "Tailwind CSS + Headless UI"
}
```

### 3.2 プログレッシブウェブアプリ（PWA）機能
- オフライン対応
- ホーム画面に追加
- プッシュ通知（オプション）

## 4. データ管理（ローカルストレージ）

### 4.1 IndexedDB スキーマ

```typescript
// Dexie.js を使用した例
import Dexie, { Table } from 'dexie';

interface UserProfile {
  id?: number;
  name: string;
  goals: string;
  environment: string;
  preferences: {
    intensity: 'low' | 'medium' | 'high';
    frequency: number;
    timeAvailable: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface Context {
  id?: number;
  cycleNumber: number;
  sessionNumber: number;
  lastActivity: Date;
  measurements?: {
    weight?: number;
    bodyFatPercentage?: number;
    [key: string]: any;
  };
  performance: any[];
}

interface GeneratedPrompt {
  id?: number;
  type: string;
  content: string;
  metadata: any;
  createdAt: Date;
  used: boolean;
}

interface TrainingSession {
  id?: number;
  date: Date;
  exercises: any[];
  notes: string;
  aiResponse?: string;
}

class FitLoopDatabase extends Dexie {
  profile!: Table<UserProfile>;
  context!: Table<Context>;
  prompts!: Table<GeneratedPrompt>;
  sessions!: Table<TrainingSession>;

  constructor() {
    super('FitLoopDB');
    this.version(1).stores({
      profile: '++id',
      context: '++id',
      prompts: '++id, type, createdAt',
      sessions: '++id, date'
    });
  }
}

export const db = new FitLoopDatabase();
```

### 4.2 ストレージ戦略

```typescript
// データ永続化マネージャー
class StorageManager {
  // プロファイル（1つのみ）
  async saveProfile(profile: UserProfile) {
    await db.profile.clear();
    return await db.profile.add(profile);
  }

  async getProfile(): Promise<UserProfile | undefined> {
    return await db.profile.toCollection().first();
  }

  // コンテキスト（現在の状態）
  async updateContext(context: Partial<Context>) {
    const current = await this.getContext();
    if (current) {
      return await db.context.update(current.id!, context);
    } else {
      return await db.context.add(context as Context);
    }
  }

  // プロンプト履歴
  async savePrompt(prompt: GeneratedPrompt) {
    return await db.prompts.add(prompt);
  }

  // エクスポート機能
  async exportAllData() {
    const data = {
      profile: await db.profile.toArray(),
      context: await db.context.toArray(),
      prompts: await db.prompts.toArray(),
      sessions: await db.sessions.toArray(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  // インポート機能
  async importData(jsonData: string) {
    const data = JSON.parse(jsonData);
    await db.transaction('rw', db.profile, db.context, db.prompts, db.sessions, async () => {
      // 既存データをクリア
      await Promise.all([
        db.profile.clear(),
        db.context.clear(),
        db.prompts.clear(),
        db.sessions.clear()
      ]);
      // 新しいデータを追加
      if (data.profile) await db.profile.bulkAdd(data.profile);
      if (data.context) await db.context.bulkAdd(data.context);
      if (data.prompts) await db.prompts.bulkAdd(data.prompts);
      if (data.sessions) await db.sessions.bulkAdd(data.sessions);
    });
  }
}
```

## 5. プロンプト生成システム

### 5.1 プロンプトテンプレートエンジン

```typescript
// プロンプトテンプレート
const PROMPT_TEMPLATES = {
  training: {
    session: `
# {{userName}}さんの筋トレプログラム - セッション{{sessionNumber}}

## 現在の状況
- トレーニングサイクル: {{cycleNumber}}/8
- 前回のトレーニング: {{lastTrainingDate}}
- 目標: {{goals}}

## 本日のトレーニング内容
{{#exercises}}
### {{name}}
- セット数: {{sets}}
- 推奨重量: {{weight}}{{unit}}
- 目標回数: {{targetReps}}
- 前回実績: {{lastPerformance}}
{{/exercises}}

## 記録してください
トレーニング後、以下の形式で結果を入力してください：
\`\`\`
エクササイズ名: 重量 x 回数 x セット数
例: ベンチプレス: 60kg x 10回 x 3セット
\`\`\`

## アドバイス
{{advice}}
`,
    
    import: `
# データインポート用プロンプト

以下の情報をAIに伝えて、構造化されたデータとして出力してもらってください。

## 依頼内容
「以下のトレーニング記録を、JSONフォーマットで整理してください」

## あなたのトレーニング記録
{{rawData}}

## 出力形式
\`\`\`json
{
  "date": "YYYY-MM-DD",
  "exercises": [
    {
      "name": "エクササイズ名",
      "sets": [
        {"weight": 数値, "reps": 数値, "unit": "kg"}
      ]
    }
  ],
  "notes": "メモ"
}
\`\`\`
`,
    
    analysis: `
# トレーニング分析リクエスト

## 分析対象期間
{{startDate}} から {{endDate}} まで

## トレーニングデータ
{{trainingData}}

## 分析してほしい項目
1. 各筋肉群の発達バランス
2. 重量の進歩率
3. トレーニング頻度の適切性
4. 改善提案

結果は箇条書きでお願いします。
`
  }
};

// プロンプト生成クラス
class PromptGenerator {
  constructor(private templates = PROMPT_TEMPLATES) {}

  async generateTrainingPrompt(context: Context, profile: UserProfile): Promise<string> {
    const template = this.templates.training.session;
    const data = await this.prepareTrainingData(context, profile);
    return this.render(template, data);
  }

  async generateImportPrompt(rawData: string): Promise<string> {
    const template = this.templates.training.import;
    return this.render(template, { rawData });
  }

  private render(template: string, data: any): string {
    // 簡易テンプレートエンジン
    let result = template;
    
    // {{variable}} の置換
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, data[key]);
    });
    
    // {{#array}} ... {{/array}} の処理
    const arrayRegex = /{{#(\w+)}}([\s\S]*?){{\/\1}}/g;
    result = result.replace(arrayRegex, (match, key, content) => {
      const array = data[key];
      if (!Array.isArray(array)) return '';
      
      return array.map(item => {
        let itemContent = content;
        Object.keys(item).forEach(itemKey => {
          const itemRegex = new RegExp(`{{${itemKey}}}`, 'g');
          itemContent = itemContent.replace(itemRegex, item[itemKey]);
        });
        return itemContent;
      }).join('\n');
    });
    
    return result;
  }

  private async prepareTrainingData(context: Context, profile: UserProfile) {
    // 最新のセッションデータを取得
    const sessions = await db.sessions.orderBy('date').reverse().limit(5).toArray();
    
    return {
      userName: profile.name,
      sessionNumber: context.sessionNumber,
      cycleNumber: context.cycleNumber,
      lastTrainingDate: sessions[0]?.date.toLocaleDateString() || '初回',
      goals: profile.goals,
      exercises: this.getExercisesForSession(context.sessionNumber),
      advice: this.generateAdvice(context, sessions)
    };
  }

  private getExercisesForSession(sessionNumber: number) {
    // セッション番号に基づいてエクササイズを返す
    const sessionPlans = {
      1: [ // 胸・三頭筋
        { name: 'ダンベルベンチプレス', sets: 3, weight: 40, unit: 'kg', targetReps: '8-10' },
        { name: 'インクラインフライ', sets: 3, weight: 15, unit: 'kg', targetReps: '10-12' },
        { name: 'トライセプスエクステンション', sets: 3, weight: 10, unit: 'kg', targetReps: '12-15' }
      ],
      2: [ // 背中・二頭筋
        { name: 'ダンベルロウ', sets: 3, weight: 30, unit: 'kg', targetReps: '8-10' },
        { name: 'ラットプルダウン', sets: 3, weight: 40, unit: 'kg', targetReps: '10-12' },
        { name: 'バイセプスカール', sets: 3, weight: 12, unit: 'kg', targetReps: '12-15' }
      ],
      // ... 他のセッション
    };
    
    const sessionIndex = ((sessionNumber - 1) % 8) + 1;
    return sessionPlans[sessionIndex] || sessionPlans[1];
  }

  private generateAdvice(context: Context, recentSessions: TrainingSession[]): string {
    // パフォーマンストレンドに基づくアドバイス生成
    if (recentSessions.length < 2) {
      return '初回のトレーニングです。無理せず、フォームを意識して行いましょう。';
    }
    
    // 簡単な進捗分析
    return '前回から順調に進歩しています。今回も集中して取り組みましょう。';
  }
}
```

## 6. ユーザーインターフェース設計

### 6.1 主要画面構成

```typescript
// React コンポーネント構造
const AppStructure = {
  App: {
    Router: {
      Dashboard: {
        CurrentPrompt: 'プロンプト表示・コピー',
        QuickStats: '簡易統計',
        NextSession: '次回予定'
      },
      DataEntry: {
        SessionRecorder: 'トレーニング記録入力',
        ImportWizard: 'AIデータインポート',
        MeasurementInput: '身体測定入力'
      },
      History: {
        SessionList: 'セッション履歴',
        PromptHistory: 'プロンプト履歴',
        ProgressCharts: '進捗グラフ'
      },
      Settings: {
        ProfileEditor: 'プロフィール編集',
        ExportImport: 'データエクスポート/インポート',
        Preferences: '設定'
      }
    }
  }
};
```

### 6.2 プロンプト表示コンポーネント

```tsx
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const PromptDisplay: React.FC<{ prompt: string }> = ({ prompt }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">今日のプロンプト</h3>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'コピー済み' : 'コピー'}
        </button>
      </div>
      <pre className="whitespace-pre-wrap text-sm bg-white p-3 rounded border">
        {prompt}
      </pre>
      <p className="text-sm text-gray-600 mt-2">
        このプロンプトをClaude、ChatGPT、またはGeminiにコピーして使用してください
      </p>
    </div>
  );
};
```

## 7. デプロイメント

### 7.1 静的サイトホスティング

**推奨オプション:**

1. **GitHub Pages** (無料)
   ```bash
   # package.json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

2. **Vercel** (無料枠あり)
   ```bash
   # vercel.json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist"
   }
   ```

3. **Netlify** (無料枠あり)
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = "dist"
   ```

### 7.2 PWA設定

```json
// manifest.json
{
  "name": "FitLoop - AI筋トレサポート",
  "short_name": "FitLoop",
  "description": "プロンプトがプロンプトを生み出すAI筋トレアプリ",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#3B82F6",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 8. 開発手順

### 8.1 初期セットアップ

```bash
# プロジェクト作成
npm create vite@latest fitloop -- --template react-ts

# 依存関係インストール
cd fitloop
npm install dexie react-router-dom zustand lucide-react
npm install -D tailwindcss postcss autoprefixer @types/react

# Tailwind CSS設定
npx tailwindcss init -p
```

### 8.2 ディレクトリ構造

```
fitloop/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   ├── DataEntry/
│   │   ├── History/
│   │   └── Settings/
│   ├── hooks/
│   │   ├── useProfile.ts
│   │   ├── useContext.ts
│   │   └── usePrompt.ts
│   ├── lib/
│   │   ├── db.ts
│   │   ├── storage.ts
│   │   └── promptGenerator.ts
│   ├── store/
│   │   └── appStore.ts
│   ├── templates/
│   │   └── prompts/
│   └── App.tsx
├── public/
│   ├── manifest.json
│   └── icons/
└── index.html
```

## 9. セキュリティとプライバシー

### 9.1 データ保護
- すべてのデータはローカルに保存
- 外部サーバーへの送信なし
- ブラウザのセキュリティモデルに依存

### 9.2 エクスポート時の注意
```typescript
// データエクスポート時の警告表示
const exportWarning = `
エクスポートされたデータには個人情報が含まれます。
第三者と共有する際は、個人を特定できる情報を削除してください。
`;
```

## 10. 将来の拡張

### 10.1 可能な機能追加
- 音声入力対応
- 画像からのデータ抽出（OCR）
- プロンプトのカスタマイズ機能
- 複数プロファイル対応
- データ同期（オプション）