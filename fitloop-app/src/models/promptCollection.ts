export interface PromptCollection {
  id?: number
  name: string
  description: string
  category: 'training' | 'nutrition' | 'analysis' | 'planning' | 'custom'
  prompts: SavedPrompt[]
  createdAt: Date
  updatedAt: Date
}

export interface SavedPrompt {
  id?: number
  title: string
  content: string
  description?: string
  isMetaPrompt: boolean
  category: 'training' | 'nutrition' | 'analysis' | 'planning' | 'custom'
  tags: string[]
  usageCount: number
  lastUsed?: Date
  isFavorite?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MetaPromptTemplate {
  id?: number
  name: string
  description: string
  template: string
  variables: PromptVariable[]
  category: 'training' | 'nutrition' | 'analysis' | 'planning' | 'custom'
  examples: string[]
  createdAt: Date
}

export interface PromptVariable {
  name: string
  type: 'text' | 'number' | 'select' | 'multiselect' | 'date'
  description: string
  required: boolean
  defaultValue?: any
  options?: string[]
}

export const DEFAULT_PROMPT_COLLECTIONS: Omit<PromptCollection, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: "筋トレメタプロンプト集",
    description: "筋力トレーニングに特化したプロンプトを生成するメタプロンプト集",
    category: "training",
    prompts: []
  },
  {
    name: "栄養管理メタプロンプト集", 
    description: "食事とサプリメントに関するプロンプトを生成するメタプロンプト集",
    category: "nutrition",
    prompts: []
  },
  {
    name: "体組成分析メタプロンプト集",
    description: "体重、体脂肪率、筋肉量などの分析プロンプトを生成するメタプロンプト集", 
    category: "analysis",
    prompts: []
  },
  {
    name: "トレーニング計画メタプロンプト集",
    description: "長期的なトレーニングプランを作成するプロンプトを生成するメタプロンプト集",
    category: "planning", 
    prompts: []
  },
  {
    name: "カスタムプロンプト集",
    description: "ユーザーが保存したカスタムプロンプト集",
    category: "custom",
    prompts: []
  }
]

export const DEFAULT_META_PROMPTS: Omit<SavedPrompt, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: "筋トレセッション最適化プロンプト生成器",
    content: `# 筋トレセッション最適化プロンプト生成器

あなたは筋力トレーニングの専門家として、ユーザーの状況に応じて最適化されたトレーニングセッションのプロンプトを生成してください。

## 入力情報
- ユーザー名: [名前を入力]
- 目標: [具体的な目標を入力]
- トレーニング環境: [利用可能な器具や場所]
- 前回のトレーニング記録: [前回の実績を入力]
- 体調や制約: [怪我、疲労度、時間制約など]

## 生成すべきプロンプトの要件
1. **個人最適化**: ユーザーの目標と環境に完全にカスタマイズ
2. **プログレッシブオーバーロード**: 前回より少しずつ負荷を上げる
3. **科学的根拠**: 最新のスポーツ科学に基づく
4. **実行可能性**: 現実的で継続可能
5. **記録と分析**: 次回のプロンプト生成のためのデータ収集

## 出力フォーマット
生成したプロンプトは以下の構造で出力してください:

\`\`\`
# [セッション名] - [日付]

## あなたの今日のトレーニング

### ウォームアップ (5-10分)
[具体的なウォームアップ手順]

### メインセット
[エクササイズ名]
- セット数: X セット
- 重量: Xkg (前回比+Xkg)
- レップ数: X-X回
- レスト: X分
- フォームポイント: [重要なポイント]

### クールダウン (5-10分)
[ストレッチと回復]

### 記録してください
1. 実際に使用した重量とレップ数
2. セット間の疲労度 (1-10)
3. フォームの調子
4. 全体的な満足度
5. 明日の体調への影響

### 次回への改善点
[コーチングポイント]
\`\`\`

## 重要な注意点
- 安全性を最優先に
- 過度な負荷は避ける
- ユーザーの声に耳を傾ける
- 楽しさも重視する

上記の形式で、入力された情報に基づいて最適化されたトレーニングプロンプトを生成してください。`,
    description: "ユーザーの状況に応じて個別最適化されたトレーニングセッションのプロンプトを生成",
    isMetaPrompt: true,
    category: "training",
    tags: ["筋トレ", "個別最適化", "プログレッシブオーバーロード"],
    usageCount: 0
  },
  {
    title: "栄養計画メタプロンプト生成器", 
    content: `# 栄養計画メタプロンプト生成器

あなたは栄養学の専門家として、ユーザーの目標と生活スタイルに最適化された栄養プロンプトを生成してください。

## 入力情報
- ユーザー名: [名前を入力]
- 体重・体脂肪率: [現在の数値]
- 目標: [減量/増量/維持/筋肉増加など]
- 活動レベル: [運動頻度と強度]
- 食事制限: [アレルギー、好み、宗教的制約など]
- 生活パターン: [勤務時間、食事タイミングなど]

## 生成すべきプロンプトの特徴
1. **科学的根拠**: 最新の栄養学研究に基づく
2. **実践可能性**: 日常生活に取り入れやすい
3. **目標特化**: 具体的な目標達成にフォーカス
4. **柔軟性**: 状況に応じて調整可能
5. **継続性**: 長期的に続けられる

## 出力フォーマット
\`\`\`
# [ユーザー名]さんの栄養戦略 - [期間]

## 目標設定
- メイン目標: [具体的目標]
- カロリー目標: [総カロリー]
- マクロ栄養素比率: タンパク質X% / 炭水化物X% / 脂質X%

## 1日の食事プラン

### 朝食 (X時頃)
[具体的なメニュー例]
- カロリー: Xkcal
- タンパク質: Xg

### 昼食 (X時頃)
[具体的なメニュー例]

### 夕食 (X時頃)  
[具体的なメニュー例]

### 間食・補食
[必要に応じて]

## サプリメント推奨
[必要に応じて科学的根拠と共に]

## 水分摂取
[1日の目標量と飲み方]

## モニタリングポイント
1. 体重の変化
2. 体調・エネルギーレベル
3. トレーニングパフォーマンス
4. 満足度

## 調整指針
[状況に応じた調整方法]
\`\`\`

上記の形式で、入力情報に基づいてパーソナライズされた栄養プロンプトを生成してください。`,
    description: "個人の目標と生活スタイルに最適化された栄養計画プロンプトを生成",
    isMetaPrompt: true,
    category: "nutrition", 
    tags: ["栄養", "食事計画", "マクロ栄養素"],
    usageCount: 0
  },
  {
    title: "体組成分析レポート生成器",
    content: `# 体組成分析レポート生成器

あなたはフィットネス分析の専門家として、体組成データから洞察に富んだ分析レポートのプロンプトを生成してください。

## 入力情報
- 測定データ: [体重、体脂肪率、筋肉量、基礎代謝など]
- 過去のデータ: [過去1-3ヶ月の推移]
- 現在のトレーニング: [頻度、内容、強度]
- 食事状況: [カロリー摂取、栄養バランス]
- 生活要因: [睡眠、ストレス、水分摂取など]

## 生成すべき分析の観点
1. **トレンド分析**: 数値の変化傾向
2. **バランス評価**: 理想的な体組成との比較
3. **原因分析**: 変化の要因特定
4. **リスク評価**: 健康面での注意点
5. **改善提案**: 具体的なアクションプラン

## 出力フォーマット
\`\`\`
# [ユーザー名]さんの体組成分析レポート - [期間]

## 📊 現在の状況
- 体重: Xkg (前回比: ±Xkg)
- 体脂肪率: X% (前回比: ±X%)
- 筋肉量: Xkg (前回比: ±Xkg)
- 基礎代謝: Xkcal

## 📈 トレンド分析
[過去データとの比較グラフ的説明]

### 良い変化
- [ポジティブな変化点]

### 注意が必要な変化  
- [改善が必要な点]

## 🎯 目標との比較
[設定目標に対する進捗状況]

## 💡 要因分析
### 変化の主な要因
1. [トレーニング要因]
2. [栄養要因] 
3. [生活習慣要因]

## ⚠️ 健康面でのアドバイス
[医学的観点からの注意点]

## 🚀 改善アクションプラン

### 即座に実行すべきこと
1. [優先度高い改善点]

### 今週中に調整すべきこと
1. [短期的改善点]

### 来月までの目標
1. [中期的目標]

## 📝 次回測定までの記録項目
- [追跡すべき項目リスト]
\`\`\`

上記の形式で、データに基づいた科学的で実用的な分析プロンプトを生成してください。`,
    description: "体組成データから洞察に富んだ分析レポートプロンプトを生成",
    isMetaPrompt: true,
    category: "analysis",
    tags: ["体組成", "分析", "レポート", "トレンド"],
    usageCount: 0
  }
]