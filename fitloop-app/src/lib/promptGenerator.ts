import type { UserProfile } from '../models/user'
import type { Context, ExercisePerformance } from '../models/context'

export type PromptType = 'training' | 'measurement' | 'history' | 'analysis'

export interface PromptTemplate {
  type: PromptType
  template: string
}

interface Exercise {
  name: string
  sets: number
  weight: number
  unit: string
  targetReps: string
}

const PROMPT_TEMPLATES = {
  training: {
    session: `
# {{userName}}さんの筋トレプログラム - セッション{{sessionNumber}}

## 現在の状況
- トレーニングサイクル: {{cycleNumber}}/8
- 前回のトレーニング: {{lastTrainingDate}}
- 目標: {{goals}}

## 本日のトレーニング内容: {{sessionTitle}}
{{#exercises}}
### {{name}}
- セット数: {{sets}}
- 推奨重量: {{weight}}{{unit}}
- 目標回数: {{targetReps}}
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
    
    import: {
      training: `
以下の筋トレ記録をJSON形式に整理してください。

【記録】
{{rawData}}

【出力形式】
必ず以下のJSON形式で出力してください：
\`\`\`json
{
  "type": "training_session",
  "date": "YYYY-MM-DD",
  "exercises": [
    {
      "name": "エクササイズ名",
      "sets": [
        {
          "weight": 数値,
          "weightUnit": "kg" または "lbs",
          "reps": 数値,
          "rpe": 数値（1-10、オプション）
        }
      ]
    }
  ],
  "notes": "メモ"
}
\`\`\`
`,
      measurement: `
体組成計のスクリーンショットまたは測定データから、以下の情報を抽出してJSON形式で出力してください。

【入力データ】
{{rawData}}

【出力形式】
\`\`\`json
{
  "type": "body_measurement",
  "date": "YYYY-MM-DD",
  "measurements": {
    "weight": { "value": 数値, "unit": "kg" },
    "bodyFatPercentage": 数値,
    "muscleMass": { "value": 数値, "unit": "kg" }
  }
}
\`\`\`
`,
    },
  },
}

export class PromptGenerator {
  generateTrainingPrompt(context: Context, profile: UserProfile): string {
    const template = PROMPT_TEMPLATES.training.session
    const data = this.prepareTrainingData(context, profile)
    return this.render(template, data)
  }

  generateImportPrompt(type: 'training' | 'measurement', rawData: string): string {
    const template = PROMPT_TEMPLATES.training.import[type]
    return this.render(template, { rawData })
  }

  private prepareTrainingData(context: Context, profile: UserProfile) {
    const lastPerformance = context.performance[context.performance.length - 1]
    const lastTrainingDate = lastPerformance 
      ? lastPerformance.date.toISOString().split('T')[0]
      : '初回'

    return {
      userName: profile.name,
      sessionNumber: context.sessionNumber,
      cycleNumber: context.cycleNumber,
      lastTrainingDate,
      goals: profile.goals,
      sessionTitle: this.getSessionTitle(context.sessionNumber),
      exercises: this.getExercisesForSession(context.sessionNumber),
      advice: this.generateAdvice(context, context.performance),
    }
  }

  private getSessionTitle(sessionNumber: number): string {
    const titles: Record<number, string> = {
      1: '胸・三頭筋',
      2: '背中・二頭筋',
      3: '肩・前腕',
      4: '脚・臀部',
      5: '全身サーキット',
      6: '胸・背中',
      7: '腕・腹筋',
      8: '全身',
    }
    const sessionIndex = ((sessionNumber - 1) % 8) + 1
    return titles[sessionIndex] || titles[1]
  }

  private render(template: string, data: any): string {
    let result = template

    // {{variable}} の置換
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, data[key] || '')
    })

    // {{#array}} ... {{/array}} の処理
    const arrayRegex = /{{#(\w+)}}([\s\S]*?){{\/\1}}/g
    result = result.replace(arrayRegex, (_match, key, content) => {
      const array = data[key]
      if (!Array.isArray(array)) return ''

      return array.map(item => {
        let itemContent = content
        Object.keys(item).forEach(itemKey => {
          const itemRegex = new RegExp(`{{${itemKey}}}`, 'g')
          itemContent = itemContent.replace(itemRegex, item[itemKey] || '')
        })
        return itemContent
      }).join('\n')
    })

    return result
  }

  private getExercisesForSession(sessionNumber: number): Exercise[] {
    const sessionPlans: Record<number, Exercise[]> = {
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
      3: [ // 肩・前腕
        { name: 'ダンベルショルダープレス', sets: 3, weight: 20, unit: 'kg', targetReps: '8-10' },
        { name: 'ダンベルラテラルレイズ', sets: 3, weight: 8, unit: 'kg', targetReps: '10-12' },
        { name: 'リストカール', sets: 3, weight: 10, unit: 'kg', targetReps: '12-15' }
      ],
      4: [ // 脚・臀部
        { name: 'ダンベルスクワット', sets: 3, weight: 40, unit: 'kg', targetReps: '10-12' },
        { name: 'ルーマニアンデッドリフト', sets: 3, weight: 40, unit: 'kg', targetReps: '8-10' },
        { name: 'カーフレイズ', sets: 3, weight: 30, unit: 'kg', targetReps: '15-20' }
      ],
      5: [ // 全身サーキット
        { name: 'ダンベルスラスター', sets: 3, weight: 20, unit: 'kg', targetReps: '12-15' },
        { name: 'ダンベルロウ', sets: 3, weight: 25, unit: 'kg', targetReps: '12-15' },
        { name: 'ロシアンツイスト', sets: 3, weight: 15, unit: 'kg', targetReps: '15回(左右)' }
      ],
      6: [ // 胸・背中
        { name: 'ダンベルベンチプレス', sets: 3, weight: 45, unit: 'kg', targetReps: '6-8' },
        { name: 'ベントオーバーロウ', sets: 3, weight: 35, unit: 'kg', targetReps: '8-10' },
        { name: 'プルオーバー', sets: 3, weight: 20, unit: 'kg', targetReps: '10-12' }
      ],
      7: [ // 腕・腹筋
        { name: 'クローズグリップベンチプレス', sets: 3, weight: 35, unit: 'kg', targetReps: '8-10' },
        { name: 'ハンマーカール', sets: 3, weight: 15, unit: 'kg', targetReps: '10-12' },
        { name: 'ウェイテッドクランチ', sets: 3, weight: 10, unit: 'kg', targetReps: '15-20' }
      ],
      8: [ // 全身
        { name: 'デッドリフト', sets: 3, weight: 60, unit: 'kg', targetReps: '5-6' },
        { name: 'オーバーヘッドプレス', sets: 3, weight: 30, unit: 'kg', targetReps: '8-10' },
        { name: 'チンアップ', sets: 3, weight: 0, unit: 'kg', targetReps: '最大回数' }
      ]
    }

    const sessionIndex = ((sessionNumber - 1) % 8) + 1
    return sessionPlans[sessionIndex] || sessionPlans[1]
  }

  private generateAdvice(_context: Context, recentSessions: ExercisePerformance[]): string {
    if (recentSessions.length < 2) {
      return '初回のトレーニングです。無理せず、フォームを意識して行いましょう。'
    }

    return '前回から順調に進歩しています。今回も集中して取り組みましょう。'
  }
}