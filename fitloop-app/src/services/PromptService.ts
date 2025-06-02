import type { IPromptService } from '../interfaces/IPromptService'
import type { UserProfile } from '../models/user'
import type { Context } from '../models/context'
import { 
  META_PROMPT_TEMPLATE, 
  META_PROMPT_EXERCISES, 
  SESSION_TITLES, 
  extractMetadata 
} from '../lib/metaPromptTemplate'

export class PromptService implements IPromptService {
  generateFullPrompt(profile: UserProfile, context: Context, language: string): string {
    const sessionNumber = context.sessionNumber
    const sessionTitle = SESSION_TITLES[sessionNumber as keyof typeof SESSION_TITLES] || SESSION_TITLES[1]
    const exercises = META_PROMPT_EXERCISES[sessionNumber as keyof typeof META_PROMPT_EXERCISES] || META_PROMPT_EXERCISES[1]
    const lastSession = context.sessionNumber > 1 ? context.sessionNumber - 1 : 8
    const lastSessionTitle = SESSION_TITLES[lastSession as keyof typeof SESSION_TITLES]
    const lastDate = new Date().toLocaleDateString('ja-JP')
    
    // Format exercises for the template
    const exercisesText = exercises.map((ex: any, i: number) => 
      `${i + 1}. **${ex.name}**\n   - ${ex.sets}セット x ${ex.targetReps}\n   - 推奨重量: ${ex.weight}${ex.unit}\n   - セット間${ex.rest}秒休憩`
    ).join('\n\n')
    
    // Prepare JSON data for metadata
    const exercisesJSON = JSON.stringify(exercises.map((ex: any) => ({
      name: ex.name,
      targetWeight: ex.weight,
      targetReps: ex.targetReps,
      targetSets: ex.sets,
      lastPerformance: null
    })), null, 2)
    
    const muscleBalanceJSON = JSON.stringify({
      pushUpperBody: "normal",
      pullUpperBody: "normal",
      lowerBodyFront: "normal",
      lowerBodyBack: "normal",
      core: "normal"
    }, null, 2)
    
    const recommendationsJSON = JSON.stringify([
      "基礎筋力の構築に焦点を当てる",
      "正しいフォームの習得を優先"
    ], null, 2)
    
    // Include user info at the beginning
    const userInfoSection = `## ユーザー情報
- 名前: ${profile.name}
- 目標: ${profile.goals}
- 環境: ${profile.environment}

`
    
    // Get language instruction
    const languageInstruction = this.getLanguageInstruction(language)
    
    // Replace placeholders in template
    let prompt = META_PROMPT_TEMPLATE
      .replace(/{{languageInstruction}}/g, languageInstruction)
      .replace(/{{lastSession}}/g, `セッション${lastSession}（${lastSessionTitle}） - ${lastDate}実施`)
      .replace(/{{nextSession}}/g, `セッション${sessionNumber}（${sessionTitle}）`)
      .replace(/{{currentSession}}/g, `セッション${sessionNumber}: ${sessionTitle}`)
      .replace(/{{exercises}}/g, exercisesText)
      .replace(/{{sessionNumber}}/g, sessionNumber.toString())
      .replace(/{{sessionName}}/g, sessionTitle)
      .replace(/{{date}}/g, new Date().toISOString().split('T')[0])
      .replace(/{{exercisesJSON}}/g, exercisesJSON)
      .replace(/{{muscleBalanceJSON}}/g, muscleBalanceJSON)
      .replace(/{{recommendationsJSON}}/g, recommendationsJSON)
      .replace(/{{nextSessionNumber}}/g, (sessionNumber % 8 + 1).toString())
      .replace(/{{cycleProgress}}/g, `${sessionNumber}/8`)
      .replace(/{{pushUpperBodyStatus}}/g, '標準')
      .replace(/{{pullUpperBodyStatus}}/g, '標準')
      .replace(/{{lowerBodyFrontStatus}}/g, '標準')
      .replace(/{{lowerBodyBackStatus}}/g, '標準')
      .replace(/{{coreStatus}}/g, '標準')
    
    // Insert user info after the main title
    const titleEnd = prompt.indexOf('\n\n## 🔄')
    prompt = prompt.slice(0, titleEnd + 2) + userInfoSection + prompt.slice(titleEnd + 2)
    
    return prompt
  }

  extractMetadata(text: string): any {
    return extractMetadata(text)
  }

  getSessionTitle(sessionNumber: number): string {
    const sessionIndex = ((sessionNumber - 1) % 8) + 1
    return SESSION_TITLES[sessionIndex as keyof typeof SESSION_TITLES] || SESSION_TITLES[1]
  }

  private getLanguageInstruction(language: string): string {
    return language === 'en' ? 'Please respond in English only.' : '回答は必ず日本語でお願いします。'
  }
}