export const translations = {
  ja: {
    appName: 'FitLoop',
    aiSupported: 'AI対応',
    promptTab: 'プロンプト',
    profileTab: 'プロフィール', 
    libraryTab: 'ライブラリ',
    helpTab: '使い方',
    aiPrompt: 'AI プロンプト',
    promptDescription: 'お使いのAIツール（Claude、Gemini等）にコピー&ペーストしてください',
    copy: 'コピー',
    copied: 'コピー済み',
    saveMessage: 'プロンプトをテンプレートとして保存しました',
    updateMessage: 'プロンプトを更新しました',
    howToUse: '使い方',
    usage: '使い方',
    trainingCycle: 'トレーニングサイクル',
    session: 'セッション',
    trainingCycleDescription: 'で1サイクルです。サイクル完了後、トレーニングメニューが自動的に再構成されます。',
    usageSteps: [
      '「プロフィール」タブで情報を入力',
      '「プロンプト」タブでプロンプトをコピー',
      'Claude・Gemini・ChatGPTに貼り付けて実行',
      'AIの応答を「AI応答」エリアに貼り付け',
      '自動的に次のセッションのプロンプトが生成されます'
    ],
    meta: 'META',
    timesUsed: '回使用',
    unused: '未使用',
    noPromptsFound: 'プロンプトが見つかりませんでした',
    aiResponse: 'AIレスポンス',
    aiResponseDescription: 'AIからの回答をここに貼り付けてください',
    paste: '貼り付け',
    responsePlaceholder: 'Claude、Gemini、ChatGPTからの回答をここに貼り付けてください',
    aiServiceGuide: 'AI生成機能について',
    aiServiceDescription: 'ユーザー数増加に伴い、将来的にワンクリックAI生成機能を実装予定です。現在は以下の外部AIサービスをご利用ください：',
    dataImport: 'データインポート',
    aiDataImport: 'AIデータインポート',
    importFromAI: 'AIツールからデータをインポート',
    importDescription: 'Claude、Gemini、ChatGPTなどのAIツールを使用して、現在のフィットネス状況を効率的に収集・インポートできます',
    importPrompt: 'インポートプロンプト',
    importPromptDescription: 'このプロンプトをAIツールにコピー&ペーストして、フィットネス情報を入力してください',
    importJsonData: 'JSONデータをインポート',
    importJsonDescription: 'AIツールから出力されたJSONデータを貼り付けてください',
    importComplete: 'インポート完了',
    importCompleteDescription: 'データが正常にインポートされ、プロフィールが更新されました',
    importInProgress: 'データを処理中...',
    importError: 'インポートエラー',
    importValidationError: 'データの検証に失敗しました',
    importNewData: '新しいデータをインポート',
    startFitnessJourney: 'フィットネスジャーニーを始めましょう',
    profileStep1Title: 'お名前を教えてください',
    profileStep1Description: 'トレーニングメニューをパーソナライズするために使用します',
    nameInputPlaceholder: 'お名前',
    next: '次へ',
    profileStep3Title: 'トレーニング環境を選択',
    profileStep3Description: 'お持ちの器具や環境に合わせてメニューを最適化します',
    back: '戻る',
    start: '開始',
    profileComplete: 'プロフィール設定完了',
    profileCompleteDescription: 'プロンプトタブでトレーニングを開始できます',
    name: '名前',
    goals: '目標',
    environment: '環境',
    editProfile: 'プロフィールを編集',
    currentSession: '現在のセッション',
    cycle: 'サイクル',
    promptLibrary: 'プロンプトライブラリ',
    metaPromptsOnly: 'METAプロンプトのみ',
    searchPlaceholder: 'プロンプトを検索...',
    allCategories: 'すべてのカテゴリ',
    categories: {
      training: 'トレーニング',
      nutrition: '栄養',
      analysis: '分析',
      planning: 'プランニング',
      custom: 'カスタム'
    },
    edit: '編集',
    editPrompt: 'プロンプトを編集',
    editPlaceholder: 'プロンプトの内容を編集...',
    cancel: 'キャンセル',
    save: '保存',
    loadingFailed: 'データの読み込みに失敗しました',
    profileUpdateFailed: 'プロフィールの更新に失敗しました',
    clipboardAccessFailed: 'クリップボードへのアクセスに失敗しました',
    promptPlaceholder: 'プロフィールを設定すると、ここにプロンプトが表示されます',
    goalOptions: {
      buildMuscle: '筋肉を大きくしたい',
      improveStamina: '体力・持久力向上',
      stayHealthy: '健康維持・改善',
      lookBetter: '見た目を良くしたい',
      loseWeight: 'ダイエット・減量',
      improveSports: 'スポーツパフォーマンス向上'
    },
    otherGoalsLabel: 'その他の目標（任意）',
    otherGoalsPlaceholder: '具体的な目標があれば入力してください',
    environments: {
      gym: 'ジム（フル装備）',
      gymDesc: 'バーベル、ダンベル、マシン等が利用可能',
      homeDumbbell: '自宅（ダンベル）',
      homeDumbbellDesc: 'ダンベルとベンチがある環境',
      bodyweight: '自重のみ',
      bodyweightDesc: '器具を使わないトレーニング',
      minimal: 'ミニマル装備',
      minimalDesc: '抵抗バンドや軽量器具のみ'
    },
    detailsLabel: '詳細・補足（任意）',
    detailsPlaceholder: '利用可能な器具や制限事項など'
  },
  en: {
    appName: 'FitLoop',
    aiSupported: 'AI Ready',
    promptTab: 'Prompt',
    profileTab: 'Profile',
    libraryTab: 'Library', 
    helpTab: 'How to Use',
    aiPrompt: 'AI Prompt',
    promptDescription: 'Copy and paste this into your AI tool (Claude, Gemini, etc.)',
    copy: 'Copy',
    copied: 'Copied',
    saveMessage: 'Prompt saved as template',
    updateMessage: 'Prompt updated',
    howToUse: 'How to Use',
    usage: 'Usage',
    trainingCycle: 'Training Cycle',
    session: ' sessions',
    trainingCycleDescription: ' make 1 cycle. After cycle completion, the training menu is automatically reconstructed.',
    usageSteps: [
      'Enter your information in the "Profile" tab',
      'Copy the prompt from the "Prompt" tab',
      'Paste it into Claude AI and execute',
      'Paste Claude\'s response into the "AI Response" area',
      'The next session prompt will be automatically generated'
    ],
    meta: 'META',
    timesUsed: ' times used',
    unused: 'Unused',
    noPromptsFound: 'No prompts found',
    aiResponse: 'AI Response',
    aiResponseDescription: 'Paste the AI response here',
    paste: 'Paste',
    responsePlaceholder: 'Paste the AI response here',
    startFitnessJourney: 'Start Your Fitness Journey',
    profileStep1Title: 'What\'s your name?',
    profileStep1Description: 'We\'ll use this to personalize your training',
    nameInputPlaceholder: 'Your name',
    next: 'Next',
    profileStep3Title: 'Select Your Training Environment',
    profileStep3Description: 'We\'ll optimize your workouts based on available equipment',
    back: 'Back',
    start: 'Start',
    profileComplete: 'Profile Complete',
    profileCompleteDescription: 'You can now start training from the Prompt tab',
    name: 'Name',
    goals: 'Goals',
    environment: 'Environment',
    editProfile: 'Edit Profile',
    currentSession: 'Current Session',
    cycle: 'Cycle',
    promptLibrary: 'Prompt Library',
    metaPromptsOnly: 'META Prompts Only',
    searchPlaceholder: 'Search prompts...',
    allCategories: 'All Categories',
    categories: {
      training: 'Training',
      nutrition: 'Nutrition',
      analysis: 'Analysis',
      planning: 'Planning',
      custom: 'Custom'
    },
    edit: 'Edit',
    editPrompt: 'Edit Prompt',
    editPlaceholder: 'Edit prompt content...',
    cancel: 'Cancel',
    save: 'Save',
    loadingFailed: 'Failed to load data',
    profileUpdateFailed: 'Failed to update profile',
    clipboardAccessFailed: 'Failed to access clipboard',
    promptPlaceholder: 'Set up your profile to see your prompt here',
    goalOptions: {
      buildMuscle: 'Build Muscle',
      improveStamina: 'Improve Stamina',
      stayHealthy: 'Stay Healthy',
      lookBetter: 'Look Better',
      loseWeight: 'Lose Weight',
      improveSports: 'Improve Sports Performance'
    },
    otherGoalsLabel: 'Other Goals (Optional)',
    otherGoalsPlaceholder: 'Enter any specific goals you have',
    environments: {
      gym: 'Gym (Full Equipment)',
      gymDesc: 'Access to barbells, dumbbells, machines',
      homeDumbbell: 'Home (Dumbbells)',
      homeDumbbellDesc: 'Dumbbells and bench available',
      bodyweight: 'Bodyweight Only',
      bodyweightDesc: 'No equipment training',
      minimal: 'Minimal Equipment',
      minimalDesc: 'Resistance bands or light equipment only'
    },
    detailsLabel: 'Details (Optional)',
    detailsPlaceholder: 'Available equipment or limitations'
  }
} as const

export type TranslationKey = keyof typeof translations.ja
export type Language = keyof typeof translations