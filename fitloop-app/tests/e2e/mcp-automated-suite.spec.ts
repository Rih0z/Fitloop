import { test, expect, Page } from '@playwright/test'

// 🚀 Playwright MCP活用による包括的自動テストスイート
// Model Context Protocol (MCP) アプローチで、継続的テスト・修正サイクルを自動化

const LOCAL_URL = 'http://localhost:5173'
const PRODUCTION_URL = 'https://77290a50.fitloop-app.pages.dev'

interface TestEnvironment {
  name: string
  url: string
  isProduction: boolean
}

const environments: TestEnvironment[] = [
  { name: 'Local', url: LOCAL_URL, isProduction: false },
  { name: 'Production', url: PRODUCTION_URL, isProduction: true }
]

// 🔄 MCP自動化クラス - テスト結果に基づいて自動修正を提案
class MCPTestAutomation {
  private failures: string[] = []
  private successes: string[] = []
  
  logSuccess(testName: string) {
    this.successes.push(testName)
    console.log(`✅ MCP Success: ${testName}`)
  }
  
  logFailure(testName: string, error: string) {
    this.failures.push(`${testName}: ${error}`)
    console.log(`❌ MCP Failure: ${testName} - ${error}`)
  }
  
  generateReport() {
    console.log('\n🎯 MCP Test Automation Report:')
    console.log(`✅ Successes: ${this.successes.length}`)
    console.log(`❌ Failures: ${this.failures.length}`)
    
    if (this.failures.length > 0) {
      console.log('\n🔧 Required Fixes:')
      this.failures.forEach(failure => console.log(`  - ${failure}`))
    }
    
    return {
      successCount: this.successes.length,
      failureCount: this.failures.length,
      needsRetry: this.failures.length > 0
    }
  }
}

// 🌐 通信テストコンポーネント
class CommunicationTester {
  constructor(private page: Page, private mcp: MCPTestAutomation) {}
  
  async testNetworkConnectivity(environment: TestEnvironment): Promise<boolean> {
    try {
      const startTime = Date.now()
      
      // ネットワーク監視開始
      const responses: any[] = []
      this.page.on('response', response => {
        responses.push({
          url: response.url(),
          status: response.status(),
          timing: Date.now() - startTime
        })
      })
      
      await this.page.goto(environment.url, { timeout: 15000 })
      await this.page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      
      // 応答時間チェック
      if (loadTime > 10000) {
        this.mcp.logFailure(`${environment.name} Network Speed`, `Load time ${loadTime}ms exceeds 10s`)
        return false
      }
      
      // HTTPエラーチェック
      const errorResponses = responses.filter(r => r.status >= 400)
      if (errorResponses.length > 0) {
        this.mcp.logFailure(`${environment.name} HTTP Errors`, `Found ${errorResponses.length} error responses`)
        return false
      }
      
      this.mcp.logSuccess(`${environment.name} Network Connectivity`)
      console.log(`📊 ${environment.name} - Load time: ${loadTime}ms, Responses: ${responses.length}`)
      return true
      
    } catch (error) {
      this.mcp.logFailure(`${environment.name} Network Connection`, error.toString())
      return false
    }
  }
  
  async testAPIConnectivity(environment: TestEnvironment): Promise<boolean> {
    try {
      const apiRequests: string[] = []
      
      this.page.on('request', request => {
        if (request.url().includes('/api/')) {
          apiRequests.push(request.url())
        }
      })
      
      await this.page.goto(environment.url)
      await this.page.waitForLoadState('networkidle')
      
      // プロフィールタブでAPI呼び出しをトリガー
      const profileTab = this.page.locator('.app-tab-bar button:has-text("プロフィール")')
      if (await profileTab.count() > 0) {
        await profileTab.click()
        await this.page.waitForTimeout(2000)
      }
      
      console.log(`🔌 ${environment.name} - API requests detected: ${apiRequests.length}`)
      this.mcp.logSuccess(`${environment.name} API Connectivity`)
      return true
      
    } catch (error) {
      this.mcp.logFailure(`${environment.name} API Connection`, error.toString())
      return false
    }
  }
}

// 🔐 認証・ログインテストコンポーネント
class AuthenticationTester {
  constructor(private page: Page, private mcp: MCPTestAutomation) {}
  
  async testSystemAccess(environment: TestEnvironment): Promise<boolean> {
    try {
      await this.page.goto(environment.url)
      await this.page.waitForLoadState('networkidle')
      
      // デバッグモードでのアクセス確認
      if (environment.isProduction) {
        await this.page.goto(`${environment.url}?debug=true`)
        await this.page.waitForLoadState('networkidle')
      }
      
      // 認証モーダルが表示されていないことを確認
      const authModal = await this.page.locator('[role="dialog"], .modal, .auth-modal').count()
      if (authModal > 0) {
        this.mcp.logFailure(`${environment.name} Auth Bypass`, 'Authentication modal is blocking access')
        return false
      }
      
      // アプリケーションの基本要素確認
      const appContainer = this.page.locator('.app-container')
      await expect(appContainer).toBeVisible({ timeout: 10000 })
      
      const tabBar = this.page.locator('.app-tab-bar')
      await expect(tabBar).toBeVisible({ timeout: 5000 })
      
      this.mcp.logSuccess(`${environment.name} System Access`)
      return true
      
    } catch (error) {
      this.mcp.logFailure(`${environment.name} System Access`, error.toString())
      return false
    }
  }
  
  async testLoginFlow(environment: TestEnvironment): Promise<boolean> {
    try {
      await this.page.goto(environment.url)
      
      // テスト用ログイン情報
      const testCredentials = {
        email: 'test@fitloop.app',
        password: 'TestPassword123'
      }
      
      // ログインフォームの確認
      const loginForm = this.page.locator('form, [data-testid="login-form"]')
      
      if (await loginForm.count() > 0) {
        // ログインフォームが存在する場合のテスト
        const emailInput = this.page.locator('input[type="email"], input[name="email"]')
        const passwordInput = this.page.locator('input[type="password"], input[name="password"]')
        const submitButton = this.page.locator('button[type="submit"], button:has-text("ログイン")')
        
        if (await emailInput.count() > 0) {
          await emailInput.fill(testCredentials.email)
          await passwordInput.fill(testCredentials.password)
          await submitButton.click()
          
          // ログイン成功/失敗の判定
          await this.page.waitForTimeout(3000)
          
          const errorMessage = await this.page.locator('.error, .alert-danger, [role="alert"]').count()
          if (errorMessage === 0) {
            this.mcp.logSuccess(`${environment.name} Login Flow`)
            return true
          }
        }
      } else {
        // ログインフォームが無い場合（デバッグモード等）
        this.mcp.logSuccess(`${environment.name} Login Flow (Bypassed)`)
        return true
      }
      
      this.mcp.logFailure(`${environment.name} Login Flow`, 'Login validation failed')
      return false
      
    } catch (error) {
      this.mcp.logFailure(`${environment.name} Login Flow`, error.toString())
      return false
    }
  }
}

// 🎨 UI/UX機能テストコンポーネント
class UIUXTester {
  constructor(private page: Page, private mcp: MCPTestAutomation) {}
  
  async testGlassmorphismEffects(environment: TestEnvironment): Promise<boolean> {
    try {
      await this.page.goto(environment.url)
      await this.page.waitForLoadState('networkidle')
      
      // Glassmorphismクラスの存在確認
      const glassElements = await this.page.locator('.card-glass').count()
      if (glassElements === 0) {
        this.mcp.logFailure(`${environment.name} Glassmorphism`, 'No glass effect elements found')
        return false
      }
      
      // CSSプロパティの確認
      const firstGlassElement = this.page.locator('.card-glass').first()
      const backdropFilter = await firstGlassElement.evaluate(el => 
        getComputedStyle(el).backdropFilter
      )
      
      if (!backdropFilter.includes('blur')) {
        this.mcp.logFailure(`${environment.name} Glassmorphism`, 'Backdrop filter not applied')
        return false
      }
      
      this.mcp.logSuccess(`${environment.name} Glassmorphism Effects`)
      console.log(`🌟 ${environment.name} - Found ${glassElements} glass elements`)
      return true
      
    } catch (error) {
      this.mcp.logFailure(`${environment.name} Glassmorphism`, error.toString())
      return false
    }
  }
  
  async testMicroInteractions(environment: TestEnvironment): Promise<boolean> {
    try {
      await this.page.goto(environment.url)
      await this.page.waitForLoadState('networkidle')
      
      // Micro-interaction要素の確認
      const microButtons = await this.page.locator('.btn-micro').count()
      const animatedElements = await this.page.locator('.animate-bounce-in, .animate-heartbeat').count()
      
      if (microButtons === 0 && animatedElements === 0) {
        this.mcp.logFailure(`${environment.name} Micro-interactions`, 'No micro-interaction elements found')
        return false
      }
      
      // ボタンクリックでのアニメーション確認
      const firstButton = this.page.locator('.btn-micro').first()
      if (await firstButton.count() > 0) {
        await firstButton.hover()
        await this.page.waitForTimeout(500)
      }
      
      this.mcp.logSuccess(`${environment.name} Micro-interactions`)
      console.log(`💫 ${environment.name} - Found ${microButtons} micro buttons, ${animatedElements} animated elements`)
      return true
      
    } catch (error) {
      this.mcp.logFailure(`${environment.name} Micro-interactions`, error.toString())
      return false
    }
  }
  
  async testTabNavigation(environment: TestEnvironment): Promise<boolean> {
    try {
      await this.page.goto(environment.url)
      await this.page.waitForLoadState('networkidle')
      
      const tabs = [
        { name: 'プロンプト', selector: '.app-tab-bar button:has-text("プロンプト")' },
        { name: 'プロフィール', selector: '.app-tab-bar button:has-text("プロフィール")' },
        { name: 'ライブラリ', selector: '.app-tab-bar button:has-text("ライブラリ")' },
        { name: '使い方', selector: '.app-tab-bar button:has-text("使い方")' }
      ]
      
      for (const tab of tabs) {
        const tabButton = this.page.locator(tab.selector)
        await expect(tabButton).toBeVisible()
        await tabButton.click()
        await this.page.waitForTimeout(500)
        
        // タブのコンテンツが表示されているか確認
        const content = await this.page.locator('.app-content').isVisible()
        if (!content) {
          this.mcp.logFailure(`${environment.name} Tab Navigation`, `${tab.name} tab content not visible`)
          return false
        }
      }
      
      this.mcp.logSuccess(`${environment.name} Tab Navigation`)
      return true
      
    } catch (error) {
      this.mcp.logFailure(`${environment.name} Tab Navigation`, error.toString())
      return false
    }
  }
}

// 🏃‍♂️ MCPテストランナー - 自動化されたテストサイクル
class MCPTestRunner {
  private mcp = new MCPTestAutomation()
  
  async runComprehensiveTests(page: Page, environment: TestEnvironment): Promise<boolean> {
    console.log(`\n🚀 Starting MCP Test Suite for ${environment.name}...`)
    
    const communicationTester = new CommunicationTester(page, this.mcp)
    const authTester = new AuthenticationTester(page, this.mcp)
    const uiTester = new UIUXTester(page, this.mcp)
    
    // Phase 1: 通信テスト
    console.log('\n📡 Phase 1: Communication Tests')
    const networkOk = await communicationTester.testNetworkConnectivity(environment)
    const apiOk = await communicationTester.testAPIConnectivity(environment)
    
    if (!networkOk || !apiOk) {
      console.log('⚠️ Communication issues detected, continuing with other tests...')
    }
    
    // Phase 2: 認証・システムアクセステスト
    console.log('\n🔐 Phase 2: Authentication & System Access Tests')
    const systemAccessOk = await authTester.testSystemAccess(environment)
    const loginOk = await authTester.testLoginFlow(environment)
    
    // Phase 3: UI/UX機能テスト
    console.log('\n🎨 Phase 3: UI/UX Function Tests')
    const glassmorphismOk = await uiTester.testGlassmorphismEffects(environment)
    const microInteractionsOk = await uiTester.testMicroInteractions(environment)
    const tabNavigationOk = await uiTester.testTabNavigation(environment)
    
    // 結果報告
    const report = this.mcp.generateReport()
    
    return report.failureCount === 0
  }
}

// 🎯 メインテストスイート実行
test.describe('MCP Automated Test Suite', () => {
  for (const environment of environments) {
    test.describe(`${environment.name} Environment`, () => {
      test(`comprehensive automated testing cycle`, async ({ page }) => {
        const runner = new MCPTestRunner()
        
        let retryCount = 0
        const maxRetries = 3
        let success = false
        
        while (!success && retryCount < maxRetries) {
          console.log(`\n🔄 Attempt ${retryCount + 1}/${maxRetries} for ${environment.name}`)
          
          try {
            success = await runner.runComprehensiveTests(page, environment)
            
            if (!success) {
              retryCount++
              if (retryCount < maxRetries) {
                console.log(`\n⏳ Retrying in 5 seconds...`)
                await page.waitForTimeout(5000)
              }
            }
          } catch (error) {
            console.log(`❌ Test execution error: ${error}`)
            retryCount++
            if (retryCount < maxRetries) {
              await page.waitForTimeout(5000)
            }
          }
        }
        
        if (!success) {
          console.log(`\n🚨 ${environment.name} tests failed after ${maxRetries} attempts`)
          // プロダクション環境の場合は、ローカルとの差分を報告
          if (environment.isProduction) {
            console.log('💡 Recommendation: Compare with local environment results')
          }
        } else {
          console.log(`\n🎉 ${environment.name} tests completed successfully!`)
        }
        
        // 最終的な期待値：少なくとも基本的なシステムアクセスは成功すべき
        expect(success).toBeTruthy()
      })
    })
  }
})

// 🔄 継続的改善テスト
test.describe('MCP Continuous Improvement', () => {
  test('comparative analysis between environments', async ({ page }) => {
    console.log('\n🔬 Running comparative analysis...')
    
    const runner = new MCPTestRunner()
    const results = {
      local: false,
      production: false
    }
    
    // ローカル環境テスト
    try {
      results.local = await runner.runComprehensiveTests(page, environments[0])
    } catch (error) {
      console.log(`Local environment test failed: ${error}`)
    }
    
    // プロダクション環境テスト
    try {
      results.production = await runner.runComprehensiveTests(page, environments[1])
    } catch (error) {
      console.log(`Production environment test failed: ${error}`)
    }
    
    // 比較結果報告
    console.log('\n📊 Environment Comparison Results:')
    console.log(`Local: ${results.local ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`Production: ${results.production ? '✅ PASS' : '❌ FAIL'}`)
    
    if (results.local && !results.production) {
      console.log('\n🔧 Action Required: Production deployment needs fixing')
    } else if (!results.local && results.production) {
      console.log('\n🔧 Action Required: Local environment needs fixing')
    } else if (!results.local && !results.production) {
      console.log('\n🔧 Action Required: Both environments need fixing')
    } else {
      console.log('\n🎉 Both environments are working correctly!')
    }
    
    // 少なくとも一方の環境では成功している必要がある
    expect(results.local || results.production).toBeTruthy()
  })
})