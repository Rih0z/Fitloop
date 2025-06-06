// Data Import Prompt Generator for FitLoop
// Generates comprehensive prompts for AI tools to extract user fitness data

export interface ImportDataStructure {
  // 基本プロフィール
  profile: {
    name: string
    age?: number
    gender?: 'male' | 'female' | 'other'
    height?: number // cm
    weight?: number // kg
    bodyFatPercentage?: number
    muscleMass?: number
  }
  
  // フィットネス経験
  experience: {
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    yearsTraining?: number
    previousPrograms?: string[]
    injuries?: string[]
    limitations?: string[]
  }
  
  // 現在の習慣
  currentHabits: {
    workoutFrequency?: number // per week
    workoutDuration?: number // minutes
    preferredTime?: 'morning' | 'afternoon' | 'evening' | 'flexible'
    currentActivities?: string[]
    restDays?: number
  }
  
  // 環境・器具
  environment: {
    location: 'home' | 'gym' | 'outdoor' | 'mixed'
    availableEquipment?: string[]
    spaceConstraints?: string
    timeConstraints?: string
  }
  
  // 目標設定
  goals: {
    primary: string
    secondary?: string[]
    targetWeight?: number
    targetBodyFat?: number
    specificGoals?: string[]
    timeline?: string
  }
  
  // 現在のアプリ使用状況
  currentApps: {
    fitnessApps?: Array<{
      name: string
      usage: string
      data?: any
    }>
    nutritionApps?: Array<{
      name: string
      usage: string
      data?: any
    }>
    wearableDevices?: Array<{
      name: string
      data?: any
    }>
  }
  
  // 栄養・食事
  nutrition: {
    dietType?: string
    restrictions?: string[]
    dailyCalories?: number
    proteinIntake?: number
    mealsPerDay?: number
    supplements?: string[]
  }
  
  // 健康状態
  health: {
    conditions?: string[]
    medications?: string[]
    sleepHours?: number
    stressLevel?: 'low' | 'moderate' | 'high'
    energyLevel?: 'low' | 'moderate' | 'high'
  }
  
  // 過去のデータ
  historicalData?: {
    weightHistory?: Array<{ date: string; weight: number }>
    performanceHistory?: Array<{ date: string; exercise: string; weight: number; reps: number }>
    bodyMeasurements?: any
  }
}

export const generateDataImportPrompt = (): string => {
  return `# FitLoop データインポート支援システム

## あなたの役割
あなたは専門的なフィットネスデータ分析AIです。ユーザーの現在のフィットネス状況を詳細に収集し、FitLoopアプリで活用できる形式でJSONデータとして出力してください。

## 重要な指示
1. **段階的に情報を収集** - 一度にすべてを聞かず、自然な会話で進めてください
2. **スクリーンショット分析** - 提供された画像から正確にデータを読み取ってください
3. **完了確認** - すべての情報収集が終わったら必ずユーザーに確認してください
4. **JSON出力** - 最終的に構造化されたJSONデータを出力してください

## 収集する情報カテゴリ

### 1. 基本プロフィール
「まず基本的な情報から教えてください」
- 名前（ニックネームでも可）
- 年齢
- 性別
- 身長・体重
- 体脂肪率（分かる場合）

### 2. フィットネス経験
「運動・トレーニング経験について聞かせてください」
- 運動経験レベル（初心者/中級者/上級者/エキスパート）
- トレーニング歴（年数）
- 過去に行ったプログラム
- 怪我の経歴や身体的制限

### 3. 現在の運動習慣
「現在の運動習慣について教えてください」
- 週の運動頻度
- 1回の運動時間
- 好む運動時間帯
- 現在行っている活動
- 休息日の設定

### 4. 環境・器具
「運動環境について教えてください」
- 主な運動場所（自宅/ジム/屋外/複数）
- 利用可能な器具・設備
- スペースの制約
- 時間的制約

### 5. 目標設定
「あなたの目標について詳しく聞かせてください」
- 主要目標
- 副次的目標
- 目標体重・体脂肪率
- 具体的な達成したいこと
- 目標達成期限

### 6. 現在使用中のアプリ・デバイス
「現在使用しているフィットネス関連のアプリやデバイスがあれば教えてください」
**スクリーンショットがあれば一緒に共有してください**
- フィットネスアプリ（MyFitnessPal、Strava、Nike Training Club等）
- 栄養管理アプリ
- ウェアラブルデバイス（Apple Watch、Fitbit等）
- 各アプリの使用状況とデータ

### 7. 栄養・食事
「食事や栄養について教えてください」
- 食事スタイル（一般的/ベジタリアン/ケト等）
- 食事制限やアレルギー
- 1日のカロリー摂取量（分かる場合）
- タンパク質摂取量
- 食事回数
- サプリメント使用

### 8. 健康状態
「健康状態について教えてください」
- 既往歴や現在の健康状態
- 服用中の薬
- 平均睡眠時間
- ストレスレベル
- エネルギーレベル

### 9. 過去のデータ（任意）
「もし記録があれば共有してください」
- 体重の変化記録
- 過去のトレーニング記録
- 体組成の変化
- その他測定データ

## スクリーンショット分析指示

ユーザーがスクリーンショットを提供した場合：
1. **正確にデータを読み取る** - 数値、日付、グラフの値等を正確に抽出
2. **アプリ名を特定** - どのアプリからのデータか明確にする
3. **データの意味を解釈** - 単なる数値だけでなく、トレンドや傾向も分析
4. **不明な点は質問** - 読み取れない部分があれば確認する

## 会話の進め方

### ステップ1: 導入
「FitLoopアプリへのデータインポートをお手伝いします！あなたの現在のフィットネス状況を詳しく教えてください。まずは基本的な情報から始めましょう。」

### ステップ2: 段階的収集
- 1つずつカテゴリを進める
- 自然な会話で情報を引き出す
- 不明な点は遠慮なく質問する
- スクリーンショットがあれば積極的に分析

### ステップ3: 確認
「情報収集が完了しました。以下の内容で間違いありませんか？」
- 収集した主要情報を要約
- 不足や修正があれば対応

### ステップ4: 完了確認
**重要**: 必ずユーザーに「すべての情報提供が完了しましたか？」と確認してください。
ユーザーが「完了した」「はい」「大丈夫です」等の肯定的な回答をした場合のみ、次のステップに進んでください。

### ステップ5: JSON出力
ユーザーが完了を確認したら、以下の形式でJSONを出力してください：

\`\`\`json
{
  "profile": {
    "name": "収集した名前",
    "age": 収集した年齢,
    "gender": "male/female/other",
    "height": 身長（cm）,
    "weight": 体重（kg）,
    "bodyFatPercentage": 体脂肪率,
    "muscleMass": 筋肉量
  },
  "experience": {
    "level": "beginner/intermediate/advanced/expert",
    "yearsTraining": 年数,
    "previousPrograms": ["プログラム1", "プログラム2"],
    "injuries": ["怪我1", "怪我2"],
    "limitations": ["制限1", "制限2"]
  },
  "currentHabits": {
    "workoutFrequency": 週間頻度,
    "workoutDuration": 運動時間（分）,
    "preferredTime": "morning/afternoon/evening/flexible",
    "currentActivities": ["活動1", "活動2"],
    "restDays": 休息日数
  },
  "environment": {
    "location": "home/gym/outdoor/mixed",
    "availableEquipment": ["器具1", "器具2"],
    "spaceConstraints": "スペース制約",
    "timeConstraints": "時間制約"
  },
  "goals": {
    "primary": "主要目標",
    "secondary": ["副次目標1", "副次目標2"],
    "targetWeight": 目標体重,
    "targetBodyFat": 目標体脂肪率,
    "specificGoals": ["具体的目標1", "具体的目標2"],
    "timeline": "期限"
  },
  "currentApps": {
    "fitnessApps": [
      {
        "name": "アプリ名",
        "usage": "使用状況",
        "data": "抽出データ"
      }
    ],
    "nutritionApps": [
      {
        "name": "アプリ名",
        "usage": "使用状況",
        "data": "抽出データ"
      }
    ],
    "wearableDevices": [
      {
        "name": "デバイス名",
        "data": "抽出データ"
      }
    ]
  },
  "nutrition": {
    "dietType": "食事スタイル",
    "restrictions": ["制限1", "制限2"],
    "dailyCalories": カロリー,
    "proteinIntake": タンパク質,
    "mealsPerDay": 食事回数,
    "supplements": ["サプリ1", "サプリ2"]
  },
  "health": {
    "conditions": ["健康状態1", "健康状態2"],
    "medications": ["薬1", "薬2"],
    "sleepHours": 睡眠時間,
    "stressLevel": "low/moderate/high",
    "energyLevel": "low/moderate/high"
  },
  "historicalData": {
    "weightHistory": [
      {"date": "YYYY-MM-DD", "weight": 体重}
    ],
    "performanceHistory": [
      {"date": "YYYY-MM-DD", "exercise": "種目", "weight": 重量, "reps": 回数}
    ],
    "bodyMeasurements": {}
  },
  "importDate": "2025-06-04",
  "dataQuality": "complete/partial/basic",
  "notes": "追加メモや特記事項"
}
\`\`\`

## 重要な注意事項

1. **データの正確性**: スクリーンショットから読み取る数値は正確に
2. **プライバシー保護**: 個人情報は慎重に扱う
3. **段階的アプローチ**: 一度にすべてを聞かない
4. **柔軟な対応**: ユーザーが提供できない情報があっても問題ない
5. **完了確認**: 必ずユーザーの完了確認を得る
6. **JSON形式**: 最終出力は必ず有効なJSON形式で

## 開始メッセージ

「こんにちは！FitLoopアプリへのデータインポートをサポートします。

あなたの現在のフィットネス状況を詳しく教えていただき、アプリで最適なトレーニングプランを作成するためのデータを収集します。

もしフィットネスアプリや体組成計のスクリーンショットがあれば、一緒に共有してください。画像からデータを読み取って、より正確な情報を取得できます。

それでは、まず基本的な情報から教えてください。お名前（ニックネームでも構いません）と年齢を教えていただけますか？」

---

**このプロンプトをコピーして、Claude、Gemini、ChatGPT等のAIツールに貼り付けてください。AIがあなたの情報を収集し、最終的にJSONデータを出力します。**`
}

export const validateImportData = (jsonString: string): { isValid: boolean; data?: ImportDataStructure; errors?: string[] } => {
  try {
    const data = JSON.parse(jsonString)
    const errors: string[] = []
    
    // 基本的なバリデーション
    if (!data.profile) {
      errors.push('プロフィール情報が不足しています')
    } else {
      if (!data.profile.name) {
        errors.push('名前が設定されていません')
      }
    }
    
    if (!data.goals || !data.goals.primary) {
      errors.push('主要目標が設定されていません')
    }
    
    if (!data.environment || !data.environment.location) {
      errors.push('運動環境が設定されていません')
    }
    
    // データクリーニング
    if (data.profile?.age && (data.profile.age < 10 || data.profile.age > 100)) {
      errors.push('年齢が有効な範囲にありません')
    }
    
    if (data.profile?.weight && (data.profile.weight < 30 || data.profile.weight > 300)) {
      errors.push('体重が有効な範囲にありません')
    }
    
    if (data.profile?.height && (data.profile.height < 100 || data.profile.height > 250)) {
      errors.push('身長が有効な範囲にありません')
    }
    
    return {
      isValid: errors.length === 0,
      data: errors.length === 0 ? data : undefined,
      errors: errors.length > 0 ? errors : undefined
    }
    
  } catch (error) {
    return {
      isValid: false,
      errors: ['JSONの形式が正しくありません']
    }
  }
}

export const convertToUserProfile = (importData: ImportDataStructure): any => {
  // ImportDataStructureを既存のUserProfileに変換
  return {
    name: importData.profile.name,
    age: importData.profile.age,
    weight: importData.profile.weight,
    height: importData.profile.height,
    experience: importData.experience?.level || 'beginner',
    goals: importData.goals.primary,
    environment: `${importData.environment.location}${importData.environment.availableEquipment ? ` - ${importData.environment.availableEquipment.join(', ')}` : ''}`,
    preferences: {
      workoutFrequency: importData.currentHabits?.workoutFrequency || 3,
      workoutDuration: importData.currentHabits?.workoutDuration || 60,
      preferredTime: importData.currentHabits?.preferredTime || 'anytime',
      equipment: importData.environment.availableEquipment || [],
      focusAreas: importData.goals.secondary || []
    }
  }
}