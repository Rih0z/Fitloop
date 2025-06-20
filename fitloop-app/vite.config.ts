/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 🛡️ Security Headers for Development
const securityHeaders = {
  'X-XSS-Protection': '1; mode=block',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()'
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 🛡️ Security Headers Plugin
    {
      name: 'security-headers',
      configureServer(server) {
        server.middlewares.use((_req, res, next) => {
          Object.entries(securityHeaders).forEach(([key, value]) => {
            res.setHeader(key, value)
          })
          next()
        })
      }
    }
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      all: true,
      include: [
        'src/**/*.{ts,tsx}',
        'src/orchestration/**/*.{ts,tsx}'
      ],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/test/**',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts'
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100
      }
    }
  },
})
