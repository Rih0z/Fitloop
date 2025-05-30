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
1. User enters profile info in Profile tab
2. Prompt tab shows generated training prompt
3. User copies prompt and pastes in Claude
4. User pastes Claude's response back
5. App automatically advances to next session

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