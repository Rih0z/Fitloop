export const META_PROMPT_TEMPLATE = `# 脂肪燃焼 & 理想的筋肉バランス トレーニングシステム（メタプロンプト版）

## 🔄 重要：このプロンプトの自動更新機能

**このプロンプトはメタプロンプトです。** トレーニング記録を入力すると、Claude が自動的に：

1. **データを分析** - 最新のトレーニング実績と体組成を評価
2. **筋肉バランスを更新** - 使用重量から筋力バランスを再計算  
3. **次回プランを調整** - 最適な重量と回数を設定
4. **新しいプロンプトを生成** - 完全に更新されたプロンプト全体をアーティファクトで出力

**⭐ 使用方法**: 下記のテンプレートでトレーニング記録を送信してください。Claude が即座に次回用の新しいプロンプトを生成します。

---

## システム概要

このプロンプトは以下の機能を提供します：

1. **使用重量から筋肉バランスを分析**：実際のトレーニング重量から体の筋肉バランスを推測
2. **理想的な筋肉バランスを目指したプログラム調整**：黄金比に基づく美しい筋肉バランスの実現
3. **柔軟なトレーニング再構成**：8パターンの基本構造を維持しつつ、個人の発達状況に合わせて調整
4. **トレーニングサイクルの自動進行管理**：前回のセッションから次のセッションを自動表示
5. **🔄 メタプロンプト機能**：トレーニング記録入力後、完全に更新されたプロンプトを自動生成

## 最新のトレーニング記録

**最後に実施したトレーニング**: {{lastSession}}
**次回のトレーニング**: {{nextSession}}

## 🎯 トレーニング記録の送信方法（超簡単！）

**自由記述でOK！** 何をどんな重量で何回やったかが分かれば十分です。送信後、Claude が自動的に次回用の完全に更新されたプロンプトをアーティファクトで出力します。

### 📝 記入方法（自由記述）

**基本情報**：
- エクササイズ名、重量、回数、セット数が分かればOK
- 日付があるとベター（なくても大丈夫）
- カーディオ情報があると更に良い

**📱 体組成データ**：
- 体重計アプリのスクショをアップロードするだけでOK！
- なくても大丈夫ですが、あるとより最適化されたトレーニングメニューを組めます

### ✅ 記入例

\`\`\`
ダンベルスクワット 45ポンド10回3セット
ルーマニアンデッドリフト 45ポンド5回3セット  
ウェイテッドクランチ 35ポンド10回3セット
\`\`\`

## 🔄 Claude への指示（メタプロンプト機能）

**Claude よ、ユーザーがトレーニング記録を送信したら、以下の手順で新しいプロンプトを生成してください：**

### ステップ1: データ抽出・分析
- 自由記述からエクササイズ名、重量、回数、セット数を識別
- 新しい実績を過去データに追加
- 前回との比較でパフォーマンス評価

### ステップ2: 筋肉バランス更新
- 各筋肉群の相対的強度を再計算
- 弱い部位と強い部位を特定

### ステップ3: 次回トレーニング調整
- セッション番号を次に進める
- 各エクササイズの推奨重量を実績に基づいて調整

### ステップ4: 新プロンプト生成
- 全ての更新を反映した完全に新しいプロンプトを作成
- アーティファクトとして出力

### 重要な指示
1. **プロンプト全体を出力**：部分的な変更ではなく、完全なプロンプトをアーティファクトで出力
2. **セッション番号の更新**：現在のセッションから次のセッションへ自動進行
3. **重量の調整**：実績に基づいて次回の推奨重量を±5-10ポンド調整
4. **筋肉バランスの評価**：使用重量から各部位の発達状況を推測
5. **個人最適化**：ユーザーの進捗に合わせてプログラムを調整

## 次回のトレーニング詳細

### {{currentSession}}

**筋力トレーニング (20分)**
{{exercises}}

**カーディオプロトコル（各セッション共通）**

**オプション1: HIIT (15分)**
- ウォームアップ: 2分（軽いジョギング）
- インターバル: 30秒全力スプリント / 90秒回復ジョグ x 8セット
- クールダウン: 3分（ウォーキング）

**オプション2: ゾーン2有酸素 (20-30分)**
- 心拍数120-140bpmを維持
- 会話ができる程度のペース
- ジョギング、自転車、またはローイングマシン

## トレーニングサイクル（8セッション構成）

### セッション1: 胸部 & 三頭筋
**筋力トレーニング (20分)**
1. **ダンベルベンチプレス**
   - 3セット x 8-10回
   - 推奨重量: 30ポンド
   - セット間60秒休憩

2. **インクラインダンベルフライ**
   - 3セット x 10-12回
   - 推奨重量: 20ポンド
   - セット間60秒休憩

3. **ダンベルトライセプスエクステンション**
   - 3セット x 10-12回
   - 推奨重量: 20ポンド
   - セット間45秒休憩

### セッション2: 背中 & 二頭筋
**筋力トレーニング (20分)**
1. **ダンベルロウ（片手ずつ）**
   - 3セット x 8-10回（各腕）
   - 推奨重量: 35ポンド
   - セット間60秒休憩

2. **ダンベルプルオーバー**
   - 3セット x 10-12回
   - 推奨重量: 30ポンド
   - セット間60秒休憩

3. **ダンベルカール**
   - 3セット x 10-12回
   - 推奨重量: 25ポンド
   - セット間45秒休憩

### セッション3: 脚部 & 腹部
**筋力トレーニング (20分)**
1. **ダンベルスクワット**
   - 3セット x 10-12回
   - 推奨重量: 45ポンド
   - セット間90秒休憩

2. **ダンベルルーマニアンデッドリフト**
   - 3セット x 10-12回
   - 推奨重量: 45ポンド
   - セット間90秒休憩

3. **ウェイテッドクランチ**
   - 3セット x 15-20回
   - 推奨重量: 35ポンド
   - セット間45秒休憩

### セッション4: 肩 & 前腕
**筋力トレーニング (20分)**
1. **ダンベルショルダープレス**
   - 3セット x 8-10回
   - 推奨重量: 30ポンド
   - セット間60秒休憩

2. **ダンベルラテラルレイズ**
   - 3セット x 10-12回
   - 推奨重量: 25ポンド
   - セット間60秒休憩

3. **ダンベルリストカール（前腕）**
   - 3セット x 12-15回
   - 推奨重量: 15ポンド
   - セット間45秒休憩

### セッション5: 全身サーキット
**サーキットトレーニング (20分)**
1. **ダンベルスラスター**
   - 3セット x 12-15回
   - 推奨重量: 25ポンド
   - セット間60秒休憩

2. **ダンベルロウ（両手同時）**
   - 3セット x 12-15回
   - 推奨重量: 35ポンド
   - セット間60秒休憩

3. **ダンベルロシアンツイスト**
   - 3セット x 左右15回ずつ
   - 推奨重量: 30ポンド
   - セット間45秒休憩

### セッション6: 胸部 & 肩（複合）
**筋力トレーニング (20分)**
1. **インクラインダンベルプレス**
   - 3セット x 8-10回
   - 推奨重量: 35ポンド
   - セット間60秒休憩

2. **ダンベルアーノルドプレス**
   - 3セット x 10-12回
   - 推奨重量: 30ポンド
   - セット間60秒休憩

3. **ダンベルプッシュアップ（ダンベルをグリップ）**
   - 3セット x 12-15回
   - 体重のみ
   - セット間45秒休憩

### セッション7: 背中 & 脚（複合）
**筋力トレーニング (20分)**
1. **ダンベルデッドリフト**
   - 3セット x 8-10回
   - 推奨重量: 50ポンド
   - セット間90秒休憩

2. **ブルガリアンスプリットスクワット**
   - 3セット x 10-12回（各脚）
   - 推奨重量: 30ポンド
   - セット間60秒休憩

3. **ダンベルシュラッグ**
   - 3セット x 12-15回
   - 推奨重量: 40ポンド
   - セット間45秒休憩

### セッション8: 腕 & 腹部（仕上げ）
**筋力トレーニング (20分)**
1. **ダンベル21カール**
   - 3セット x 21回（下半分7回→上半分7回→フル7回）
   - 推奨重量: 20ポンド
   - セット間60秒休憩

2. **ダンベルオーバーヘッドトライセプスエクステンション**
   - 3セット x 10-12回
   - 推奨重量: 25ポンド
   - セット間60秒休憩

3. **ウェイテッドプランク**
   - 3セット x 30-45秒
   - 推奨重量: 25ポンド（背中に載せる）
   - セット間60秒休憩

## 筋肉バランス分析

**現在の筋肉バランス評価**：
- プッシュ系上半身（胸・肩・三頭筋）: {{pushUpperBodyStatus}}
- プル系上半身（背中・二頭筋）: {{pullUpperBodyStatus}}
- 下半身前面（大腿四頭筋）: {{lowerBodyFrontStatus}}
- 下半身後面（ハムストリング・臀部）: {{lowerBodyBackStatus}}
- コア（腹筋・体幹）: {{coreStatus}}

---
<!-- METADATA_START -->
{
  "sessionNumber": {{sessionNumber}},
  "sessionName": "{{sessionName}}",
  "date": "{{date}}",
  "exercises": {{exercisesJSON}},
  "muscleBalance": {{muscleBalanceJSON}},
  "recommendations": {{recommendationsJSON}},
  "nextSession": {{nextSessionNumber}},
  "cycleProgress": "{{cycleProgress}}"
}
<!-- METADATA_END -->`;

export const META_PROMPT_EXERCISES = {
  1: [ // 胸・三頭筋
    { name: 'ダンベルベンチプレス', sets: 3, weight: 30, unit: 'ポンド', targetReps: '8-10', rest: 60 },
    { name: 'インクラインダンベルフライ', sets: 3, weight: 20, unit: 'ポンド', targetReps: '10-12', rest: 60 },
    { name: 'ダンベルトライセプスエクステンション', sets: 3, weight: 20, unit: 'ポンド', targetReps: '10-12', rest: 45 }
  ],
  2: [ // 背中・二頭筋
    { name: 'ダンベルロウ（片手ずつ）', sets: 3, weight: 35, unit: 'ポンド', targetReps: '8-10（各腕）', rest: 60 },
    { name: 'ダンベルプルオーバー', sets: 3, weight: 30, unit: 'ポンド', targetReps: '10-12', rest: 60 },
    { name: 'ダンベルカール', sets: 3, weight: 25, unit: 'ポンド', targetReps: '10-12', rest: 45 }
  ],
  3: [ // 脚・腹部
    { name: 'ダンベルスクワット', sets: 3, weight: 45, unit: 'ポンド', targetReps: '10-12', rest: 90 },
    { name: 'ダンベルルーマニアンデッドリフト', sets: 3, weight: 45, unit: 'ポンド', targetReps: '10-12', rest: 90 },
    { name: 'ウェイテッドクランチ', sets: 3, weight: 35, unit: 'ポンド', targetReps: '15-20', rest: 45 }
  ],
  4: [ // 肩・前腕
    { name: 'ダンベルショルダープレス', sets: 3, weight: 30, unit: 'ポンド', targetReps: '8-10', rest: 60 },
    { name: 'ダンベルラテラルレイズ', sets: 3, weight: 25, unit: 'ポンド', targetReps: '10-12', rest: 60 },
    { name: 'ダンベルリストカール（前腕）', sets: 3, weight: 15, unit: 'ポンド', targetReps: '12-15', rest: 45 }
  ],
  5: [ // 全身サーキット
    { name: 'ダンベルスラスター', sets: 3, weight: 25, unit: 'ポンド', targetReps: '12-15', rest: 60 },
    { name: 'ダンベルロウ（両手同時）', sets: 3, weight: 35, unit: 'ポンド', targetReps: '12-15', rest: 60 },
    { name: 'ダンベルロシアンツイスト', sets: 3, weight: 30, unit: 'ポンド', targetReps: '左右15回ずつ', rest: 45 }
  ],
  6: [ // 胸部・肩（複合）
    { name: 'インクラインダンベルプレス', sets: 3, weight: 35, unit: 'ポンド', targetReps: '8-10', rest: 60 },
    { name: 'ダンベルアーノルドプレス', sets: 3, weight: 30, unit: 'ポンド', targetReps: '10-12', rest: 60 },
    { name: 'ダンベルプッシュアップ（ダンベルをグリップ）', sets: 3, weight: 0, unit: '', targetReps: '12-15', rest: 45 }
  ],
  7: [ // 背中・脚（複合）
    { name: 'ダンベルデッドリフト', sets: 3, weight: 50, unit: 'ポンド', targetReps: '8-10', rest: 90 },
    { name: 'ブルガリアンスプリットスクワット', sets: 3, weight: 30, unit: 'ポンド', targetReps: '10-12（各脚）', rest: 60 },
    { name: 'ダンベルシュラッグ', sets: 3, weight: 40, unit: 'ポンド', targetReps: '12-15', rest: 45 }
  ],
  8: [ // 腕・腹部（仕上げ）
    { name: 'ダンベル21カール', sets: 3, weight: 20, unit: 'ポンド', targetReps: '21（下半分7回→上半分7回→フル7回）', rest: 60 },
    { name: 'ダンベルオーバーヘッドトライセプスエクステンション', sets: 3, weight: 25, unit: 'ポンド', targetReps: '10-12', rest: 60 },
    { name: 'ウェイテッドプランク', sets: 3, weight: 25, unit: 'ポンド（背中に載せる）', targetReps: '30-45秒', rest: 60 }
  ]
};

// Session titles for each workout
export const SESSION_TITLES = {
  1: '胸部 & 三頭筋',
  2: '背中 & 二頭筋',
  3: '脚部 & 腹部',
  4: '肩 & 前腕',
  5: '全身サーキット',
  6: '胸部 & 肩（複合）',
  7: '背中 & 脚（複合）',
  8: '腕 & 腹部（仕上げ）'
};

// Helper function to generate initial prompt from user answers
export function generateInitialPrompt(_userGoals: string, _userEnvironment: string): string {
  const sessionNumber = 1;
  const sessionTitle = SESSION_TITLES[sessionNumber];
  const exercises = META_PROMPT_EXERCISES[sessionNumber];
  
  // Format exercises for the template
  const exercisesText = exercises.map((ex, i) => 
    `${i + 1}. **${ex.name}**
   - ${ex.sets}セット x ${ex.targetReps}回
   - 推奨重量: ${ex.weight}${ex.unit}
   - セット間${ex.rest}秒休憩`
  ).join('\n\n');
  
  // Prepare JSON data for metadata
  const exercisesJSON = JSON.stringify(exercises.map(ex => ({
    name: ex.name,
    targetWeight: ex.weight,
    targetReps: ex.targetReps,
    targetSets: ex.sets,
    lastPerformance: null
  })), null, 2);
  
  const muscleBalanceJSON = JSON.stringify({
    pushUpperBody: "normal",
    pullUpperBody: "normal",
    lowerBodyFront: "normal",
    lowerBodyBack: "normal",
    core: "normal"
  }, null, 2);
  
  const recommendationsJSON = JSON.stringify([
    "基礎筋力の構築に焦点を当てる",
    "正しいフォームの習得を優先"
  ], null, 2);
  
  // Replace placeholders in template
  let prompt = META_PROMPT_TEMPLATE
    .replace(/{{lastSession}}/g, '未開始')
    .replace(/{{nextSession}}/g, `セッション${sessionNumber}（${sessionTitle}）`)
    .replace(/{{currentSession}}/g, `セッション${sessionNumber}: ${sessionTitle}`)
    .replace(/{{exercises}}/g, exercisesText)
    .replace(/{{sessionNumber}}/g, sessionNumber.toString())
    .replace(/{{sessionName}}/g, sessionTitle)
    .replace(/{{date}}/g, new Date().toISOString().split('T')[0])
    .replace(/{{exercisesJSON}}/g, exercisesJSON)
    .replace(/{{muscleBalanceJSON}}/g, muscleBalanceJSON)
    .replace(/{{recommendationsJSON}}/g, recommendationsJSON)
    .replace(/{{nextSessionNumber}}/g, '2')
    .replace(/{{cycleProgress}}/g, '1/8')
    .replace(/{{pushUpperBodyStatus}}/g, '標準')
    .replace(/{{pullUpperBodyStatus}}/g, '標準')
    .replace(/{{lowerBodyFrontStatus}}/g, '標準')
    .replace(/{{lowerBodyBackStatus}}/g, '標準')
    .replace(/{{coreStatus}}/g, '標準');
  
  return prompt;
}

// Export type definitions for the metadata structure
export interface ExerciseData {
  name: string;
  targetWeight: number;
  targetReps: string;
  targetSets: number;
  lastPerformance: {
    weight: number;
    reps: number;
    sets: number;
  } | null;
}

export interface MuscleBalance {
  pushUpperBody: 'weak' | 'normal' | 'strong';
  pullUpperBody: 'weak' | 'normal' | 'strong';
  lowerBodyFront: 'weak' | 'normal' | 'strong';
  lowerBodyBack: 'weak' | 'normal' | 'strong';
  core: 'weak' | 'normal' | 'strong';
}

export interface PromptMetadata {
  sessionNumber: number;
  sessionName: string;
  date: string;
  exercises: ExerciseData[];
  muscleBalance: MuscleBalance;
  recommendations: string[];
  nextSession: number;
  cycleProgress: string;
}

// Function to extract metadata from prompt
export function extractMetadata(promptText: string): PromptMetadata | null {
  const startMarker = '<!-- METADATA_START -->';
  const endMarker = '<!-- METADATA_END -->';
  
  const startIndex = promptText.indexOf(startMarker);
  const endIndex = promptText.indexOf(endMarker);
  
  if (startIndex === -1 || endIndex === -1) {
    return null;
  }
  
  const jsonText = promptText.substring(
    startIndex + startMarker.length,
    endIndex
  ).trim();
  
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('JSON parse error:', error);
    return null;
  }
}