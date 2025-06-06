# FitLoop Development Guide for Claude

## Overview
FitLoop is a fitness training app that generates personalized workout prompts for use with Claude AI. The app follows a copy-paste workflow where users copy prompts, paste them into Claude, and then paste Claude's responses back into the app.

## Key Features
- iOS-style tab navigation (Prompt, Profile, Settings)
- Copy-paste focused workflow (no complex buttons)
- 8-session training cycles that automatically progress
- Dark mode support
- Claude AI recommended branding

## Tech Stack
- React 18 with TypeScript
- Vite as build tool
- Tailwind CSS for styling
- Dexie.js for IndexedDB storage
- Cloudflare Pages for hosting

## File Structure
```
fitloop-app/
├── src/
│   ├── App.tsx              # Main application component with tab navigation
│   ├── App.css              # Custom animations and styles
│   ├── main.tsx             # Entry point
│   ├── index.css            # Tailwind imports
│   ├── models/
│   │   ├── user.ts          # User profile model and validation
│   │   └── context.ts       # Training context and session tracking
│   ├── lib/
│   │   ├── db.ts            # Dexie database configuration
│   │   ├── promptGenerator.ts # Basic prompt generation
│   │   └── metaPromptTemplate.ts # Exercise definitions for 8 sessions
│   └── utils/
│       └── sanitize.ts      # Input sanitization utilities
├── tests/                   # Test files (Vitest)
├── public/                  # Static assets
├── document/                # Architecture documentation
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── _redirects              # Cloudflare Pages SPA config
```

## Development Commands
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run test       # Run tests
npm run lint       # Run ESLint
npm run deploy     # Deploy to Cloudflare Pages
```

## Deployment Process
After making changes, always:
1. Build and test locally: `npm run build`
2. Deploy to Cloudflare Pages: `npm run deploy`
3. Commit and push to GitHub:
```bash
git add .
git commit -m "Description of changes"
git push
```
4. **IMPORTANT**: Always output the deployment URL at the end: https://fitloop-app.pages.dev

## Important Development Notes

### State Management
- User profile stored in IndexedDB via Dexie
- Training context tracks current session (1-8) and cycle number
- Performance data stored as array of exercise records

### Prompt Generation
- Full training prompt generated in `generateFullPrompt()` function
- Includes user info, session details, and training history
- Updates automatically when Claude's response is pasted

### Copy-Paste Workflow
1. User enters profile info in Profile tab (name, goals, environment)
2. Prompt tab shows generated training prompt with current session details
3. User copies prompt (one-tap copy button)
4. User pastes in Claude and completes training
5. User pastes Claude's response back (paste button)
6. App automatically:
   - Saves the response as training record
   - Advances to next session (1→2→...→8→1)
   - Regenerates prompt with new session data
   - After 8 sessions, starts new cycle with adjusted program

### Security Considerations
- All user inputs are sanitized
- XSS prevention via input validation
- No backend or API calls (frontend-only)

### UI/UX Guidelines
- Minimal interface focused on copy-paste
- Large text areas for long prompts
- Clear visual feedback for copy actions
- iOS-style tab navigation at bottom

## Testing
Run tests with coverage:
```bash
npm run test:coverage
```

## Common Issues & Solutions

### Build Errors
- Check TypeScript types in models/
- Ensure all imports are correct
- Run `npm run lint` to catch issues

### Deployment Issues
- Ensure `_redirects` file is copied to dist/
- Check Cloudflare Pages dashboard for errors
- Verify wrangler is configured correctly

## Future Enhancements
- Direct AI integration (when available)
- Enhanced progress tracking
- Export/import functionality
- Multi-language support

## URLs
- Production: https://fitloop-app.pages.dev
- GitHub: [Add repository URL when created]

## Contact
For questions about the codebase, refer to this document first. The app is designed to be self-contained with minimal external dependencies.

## Development Philosophy

### Ultrathink
Don't hold back. give it your all！
日本語で回答して。

## Code Quality Standards

### SOLID原則の遵守
実装は必ずSOLID原則に従っているか確認すること：

1. **Single Responsibility Principle (単一責任の原則)**
   - 各クラス・関数は一つの責任のみを持つ
   - 変更理由は一つだけであるべき

2. **Open/Closed Principle (開放閉鎖の原則)**
   - 拡張に対して開かれ、修正に対して閉じている
   - 新機能追加時に既存コードを変更しない

3. **Liskov Substitution Principle (リスコフの置換原則)**
   - 派生型は基底型と置換可能であるべき
   - インターフェースの契約を守る

4. **Interface Segregation Principle (インターフェース分離の原則)**
   - クライアントが使わないメソッドに依存させない
   - 小さく特化したインターフェースを作る

5. **Dependency Inversion Principle (依存性逆転の原則)**
   - 上位モジュールは下位モジュールに依存しない
   - 両者とも抽象に依存すべき

## Important Development Guidelines

### Deployment Checklist
- 作業が完了したらgithubに追加すること
- 作業が完了したらClaude環境でビルドしデプロイすること
- READMEにデプロイ先を記載して
- githubへのプッシュ前にセキュリティ上の問題がないか確認すること
- 実装を変更したらそれに合わせてドキュメントも更新すること
- 必ずURLが固定の本番環境にデプロイするようにして
- フロントエンドとバックエンドの通信が必ず成功するように固定のAPIを指定して

### Production URLs
- **Frontend Production URL**: https://fitloop-app.pages.dev (固定URL)
- **Backend API URL**: https://fitloop-backend.riho-dare.workers.dev/api (固定URL)

### Security Verification
Before pushing to GitHub:
1. Check for exposed API keys or secrets
2. Verify all user inputs are sanitized
3. Ensure no sensitive data in console logs
4. Review environment variables usage
5. Confirm no hardcoded credentials
6. Verify API endpoints are using production URLs
7. Check for any development/test code that should be removed

## Prompt Template Structure

The app generates training prompts based on user profile and current session. The prompt includes:

### Basic Structure
```
# 脂肪燃焼 & 理想的筋肉バランス トレーニングシステム

## ユーザー情報
- 名前: [User Name]
- 目標: [User Goals] 
- 環境: [Training Environment]

## システム概要
[System overview and features]

## 最新のトレーニング記録
**最後に実施したトレーニング**: セッション[X]（[Date]実施）
**次回のトレーニング**: セッション[Y]（[Session Name]）

## 次回のトレーニング詳細
### セッション[Y]: [Session Name]
[Exercise details with sets, reps, weight recommendations]

## トレーニング後の記録方法
[Recording template for user]
```

### Session Cycle (8 sessions)
1. 胸・三頭筋
2. 背中・二頭筋  
3. 脚・コア
4. 肩・前腕
5. 全身サーキット
6. 上半身複合
7. 下半身・腹筋
8. 機能的全身

### JSON Metadata (Future Enhancement)

While not currently implemented, prompts can include JSON metadata for enhanced features:

```json
<!-- METADATA_START -->
{
  "sessionNumber": 4,
  "sessionName": "肩 & 前腕",
  "date": "2025-05-30",
  "exercises": [
    {
      "name": "ダンベルショルダープレス",
      "targetWeight": 30,
      "targetReps": "8-10",
      "targetSets": 3
    }
  ],
  "muscleBalance": {
    "pushUpperBody": "weak",
    "pullUpperBody": "strong"
  },
  "nextSession": 5,
  "cycleProgress": "4/8"
}
<!-- METADATA_END -->
```

This would enable:
- Automatic stats and graphs
- Smart warnings for muscle imbalances
- Performance predictions
- Enhanced UI with detailed analytics

## User Workflow

1. **Profile Setup**: Enter name, goals, and training environment
2. **Copy Prompt**: Generated prompt includes all user info and current session
3. **Paste to Claude**: User executes training with Claude's guidance
4. **Paste Response**: Claude's response advances to next session
5. **Automatic Progression**: App updates session number and regenerates prompt

## Meta-Prompt Concept

The ideal workflow uses a "meta-prompt" where:
- The prompt instructs Claude to analyze training results
- Claude generates an entirely new prompt with updated data
- User pastes the new prompt back to the app
- This creates a self-evolving training system

## Local Storage Structure

```typescript
// User Profile
{
  name: string,
  goals: string,
  environment: string,
  preferences: {
    intensity: 'low' | 'medium' | 'high',
    frequency: number,
    timeAvailable: number
  }
}

// Training Context  
{
  cycleNumber: number,
  sessionNumber: number,
  performance: ExercisePerformance[]
}

// Prompt History
{
  type: 'training',
  content: string,
  metadata: any,
  createdAt: Date,
  used: boolean
}
```

## Final Reminder
**After every deployment or significant change, always provide the live URL to the user:**

🌐 **FitLoop App URL**: https://fitloop-app.pages.dev