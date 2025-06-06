# FitLoop - メタプロンプト駆動型フィットネスアプリ

FitLoopは「プロンプトがプロンプトを生み出す」革新的なメタプロンプトシステムを採用したAI筋トレサポートアプリケーション。UI/UX仕様書に完全準拠し、モダンなデザインシステムで構築された次世代フィットネスアプリ。

## 🌐 Live URLs

- **Production App**: https://fitloop-app.pages.dev
- **Backend API**: https://fitloop-backend.riho-dare.workers.dev/api

## ✨ 主要機能

- **メタプロンプトシステム**: プロンプトがプロンプトを生成する革新的な仕組み
- **4タブ構成**: ホーム、プロフィール、ライブラリ、使い方ガイド
- **美しいUI/UX**: 仕様書準拠のモダンデザインシステム
- **完全パーソナライズ**: 個人の目標・環境・経験に合わせたカスタマイズ
- **外部AI連携**: Claude、ChatGPT、Geminiとのシームレスなコピー&ペースト
- **自動進化**: トレーニング記録に基づいて継続的に最適化
- **ダークモード**: 目に優しい夜間モード完全対応
- **レスポンシブ**: モバイルファーストのユニバーサルデザイン
- **多言語対応**: 日本語・英語サポート

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd fitloop-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build & Deploy

```bash
# Build for production
npm run build

# Run tests
npm test

# Deploy to Cloudflare Pages
npm run deploy
```

## 💻 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Storage**: IndexedDB (Dexie.js)
- **Backend**: Cloudflare Workers (Hono)
- **Hosting**: Cloudflare Pages
- **Testing**: Vitest + React Testing Library

## 📱 使用方法

1. **プロフィール設定**: 基本情報、目標、環境を折りたたみ式セクションで設定
2. **メタプロンプト生成**: AIが最適なトレーニングプロンプトを自動生成
3. **外部AI実行**: 生成されたプロンプトを外部AIサービス（Claude、ChatGPT、Gemini）にコピー&ペースト
4. **トレーニング実施**: AIの指示に従ってトレーニングを実行
5. **結果フィードバック**: AIの応答を貼り付けて次回のプロンプトを自動改善
6. **継続的進化**: アプリが学習し、使うほど最適化されるパーソナルトレーナー

## 🏗️ アーキテクチャ

### UI/UXデザインシステム
- **カラーパレット**: Primary Blue (#3B82F6)、Primary Purple (#8B5CF6)
- **タイポグラフィ**: Inter フォントファミリー
- **スペーシング**: 4px基準の一貫したスペーシングシステム
- **アニメーション**: fadeIn、slideDown、pulse、spin
- **コンポーネント**: 折りたたみ可能セクション、グラデーションボタン

### 技術スタック詳細
- **状態管理**: React Context + カスタムフック
- **ルーティング**: シングルページアプリケーション（SPA）
- **データ永続化**: IndexedDB（Dexie.js）
- **アイコン**: Lucide React
- **アニメーション**: CSS-in-JS + Tailwind CSS

## 🔒 Security

- All user inputs are sanitized
- No sensitive data is stored on servers
- Frontend-only architecture for privacy
- Secure API communication with CORS protection

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test tests/unit/services/PromptService.test.ts
```

## 📝 ドキュメント

- [UI/UXデザイン仕様書](./docs/UI_UX_DESIGN.md)
- [ユーザーエクスペリエンスフロー](./docs/USER_EXPERIENCE_FLOW.md)
- [UXデザインガイド](./docs/UX_DESIGN.md)
- [開発ガイド](./docs/CLAUDE.md)
- [リファクタリングノート](./docs/REFACTORING.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Run tests to ensure quality (`npm test`)
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with Claude AI assistance
- Designed for the fitness community
- Inspired by progressive overload training principles

---

**Made with ❤️ for fitness enthusiasts worldwide**