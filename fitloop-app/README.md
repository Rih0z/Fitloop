# FitLoop - AI-Powered Fitness Training App

FitLoop is a progressive fitness training application that generates personalized workout prompts for use with Claude AI. The app follows an 8-session training cycle that automatically adapts based on your progress.

## 🌐 Live URLs

- **Production App**: https://fitloop-app.pages.dev
- **Backend API**: https://fitloop-backend.riho-dare.workers.dev/api

## ✨ Features

- **8-Session Training Cycles**: Automatically progresses through scientifically designed workout sessions
- **Personalized Prompts**: Generates training prompts based on your profile and goals
- **Copy-Paste Workflow**: Simple interaction with Claude AI
- **Progress Tracking**: Records all training sessions with timestamps
- **Multi-language Support**: Available in English and Japanese
- **Dark Mode**: Eye-friendly interface for any time of day
- **Mobile Responsive**: Works seamlessly on all devices

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

## 📱 How to Use

1. **Set Up Profile**: Enter your name, fitness goals, and training environment
2. **Copy Training Prompt**: The app generates a personalized prompt for your current session
3. **Paste in Claude**: Use the prompt with Claude AI to get your workout plan
4. **Complete Training**: Follow Claude's guidance for your workout
5. **Record Results**: Paste Claude's response back into the app
6. **Automatic Progression**: App advances to the next session automatically

## 🏋️ Training Sessions

The app cycles through 8 different training sessions:

1. **胸・三頭筋** (Chest & Triceps)
2. **背中・二頭筋** (Back & Biceps)
3. **脚・コア** (Legs & Core)
4. **肩・前腕** (Shoulders & Forearms)
5. **全身サーキット** (Full Body Circuit)
6. **上半身複合** (Upper Body Compound)
7. **下半身・腹筋** (Lower Body & Abs)
8. **機能的全身** (Functional Full Body)

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

## 📝 Documentation

- [Architecture Overview](./docs/ORCHESTRATION_ARCHITECTURE.md)
- [Development Guide](./docs/CLAUDE.md)
- [Refactoring Notes](./docs/REFACTORING.md)

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