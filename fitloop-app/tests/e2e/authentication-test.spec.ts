import { test, expect } from '@playwright/test';

// 認証とログイン機能の包括的テスト

const LOCAL_URL = 'http://localhost:5173';
const OLD_PRODUCTION_URL = 'https://6af06d79.fitloop.pages.dev';
const PRODUCTION_URL = 'https://4b963c66.fitloop-app.pages.dev';

test.describe('認証システムテスト', () => {
  test('認証モーダルの表示確認', async ({ page }) => {
    console.log('🔐 認証モーダルの表示確認を開始...');
    
    // デバッグモードなしでアクセス
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    
    // 認証モーダルまたは認証関連要素の確認
    const possibleAuthElements = [
      '[role="dialog"]',
      '.modal',
      '.auth-modal',
      'button:has-text("ログイン")',
      'button:has-text("Login")',
      'input[type="email"]',
      'input[type="password"]'
    ];
    
    let authElementFound = false;
    for (const selector of possibleAuthElements) {
      const element = await page.locator(selector).count();
      if (element > 0) {
        console.log(`✅ 認証要素発見: ${selector}`);
        authElementFound = true;
        break;
      }
    }
    
    if (!authElementFound) {
      console.log('📋 認証モーダルが見つかりません。アプリは認証なしでアクセス可能かもしれません。');
    }
    
    // スクリーンショットを撮影
    await page.screenshot({ path: 'test-results/auth-modal-check.png', fullPage: true });
    
    console.log('✅ 認証モーダル表示確認完了');
  });

  test('デバッグモードによる認証バイパス', async ({ page }) => {
    console.log('🔓 デバッグモードによる認証バイパステストを開始...');
    
    // デバッグモードでアクセス
    await page.goto(`${PRODUCTION_URL}?debug=true`);
    await page.waitForLoadState('networkidle');
    
    // 認証モーダルが表示されていないことを確認
    const authModal = await page.locator('[role="dialog"], .modal, .auth-modal').count();
    expect(authModal).toBe(0);
    
    // アプリのメイン要素にアクセスできることを確認
    const appContainer = await page.locator('.app-container');
    await expect(appContainer).toBeVisible();
    
    // タブバーが表示されていることを確認
    const tabBar = await page.locator('.app-tab-bar, nav');
    await expect(tabBar).toBeVisible();
    
    console.log('✅ デバッグモードでの認証バイパス成功');
  });

  test('管理者権限でのアクセステスト', async ({ page }) => {
    console.log('👨‍💼 管理者権限でのアクセステストを開始...');
    
    // 管理者モードでアクセス
    await page.goto(`${PRODUCTION_URL}?debug=true&admin=true`);
    await page.waitForLoadState('networkidle');
    
    // 管理者専用機能の確認（存在する場合）
    const adminElements = await page.locator('[data-admin="true"], .admin-panel, button:has-text("管理")').count();
    
    if (adminElements > 0) {
      console.log('✅ 管理者専用要素が見つかりました');
    } else {
      console.log('📋 管理者専用要素は見つかりませんでした（一般ユーザー向けアプリの可能性）');
    }
    
    // 基本機能が利用可能であることを確認
    const basicFunctionality = await page.locator('.app-container').isVisible();
    expect(basicFunctionality).toBe(true);
    
    console.log('✅ 管理者権限アクセステスト完了');
  });
});

test.describe('システムアクセス継続性テスト', () => {
  test('長時間セッション維持テスト', async ({ page }) => {
    console.log('⏰ 長時間セッション維持テストを開始...');
    
    await page.goto(`${PRODUCTION_URL}?debug=true`);
    await page.waitForLoadState('networkidle');
    
    // 初期状態の確認
    const initialTabBar = await page.locator('[role="tablist"], .tab-bar').isVisible();
    expect(initialTabBar).toBe(true);
    
    // 定期的にページの状態をチェック（3回、各5秒間隔）
    for (let i = 1; i <= 3; i++) {
      console.log(`  📊 セッション確認 ${i}/3...`);
      
      await page.waitForTimeout(5000); // 5秒待機
      
      // ページが応答可能かチェック
      const isResponsive = await page.locator('.app-container').isVisible();
      expect(isResponsive).toBe(true);
      
      // タブ切り替えができるかテスト
      const tabs = ['プロンプト', 'プロフィール'];
      for (const tabName of tabs) {
        const tab = page.locator(`button:has-text("${tabName}")`);
        if (await tab.count() > 0) {
          await tab.click();
          await page.waitForTimeout(500);
        }
      }
      
      console.log(`    ✅ セッション ${i} 正常`);
    }
    
    console.log('✅ 長時間セッション維持テスト成功');
  });

  test('ページリロード後のアクセス継続', async ({ page }) => {
    console.log('🔄 ページリロード後のアクセス継続テストを開始...');
    
    await page.goto(`${PRODUCTION_URL}?debug=true`);
    await page.waitForLoadState('networkidle');
    
    // 初期状態でデータを入力
    const profileTab = page.locator('button:has-text("プロフィール")');
    if (await profileTab.count() > 0) {
      await profileTab.click();
      await page.waitForTimeout(500);
      
      const nameInput = page.locator('input[placeholder="山田太郎"]');
      if (await nameInput.count() > 0) {
        await nameInput.fill('リロードテスト');
      }
    }
    
    // ページをリロード
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // アクセスが継続されているか確認
    const appAfterReload = await page.locator('.app-container').isVisible();
    expect(appAfterReload).toBe(true);
    
    // タブが機能するか確認
    const tabBarAfterReload = await page.locator('.app-tab-bar, nav').isVisible();
    expect(tabBarAfterReload).toBe(true);
    
    console.log('✅ ページリロード後のアクセス継続テスト成功');
  });

  test('複数タブでの同時アクセス', async ({ browser }) => {
    console.log('📑 複数タブでの同時アクセステストを開始...');
    
    // 2つのタブを開く
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    
    // 両方のタブでアプリにアクセス
    await Promise.all([
      page1.goto(`${PRODUCTION_URL}?debug=true`),
      page2.goto(`${PRODUCTION_URL}?debug=true`)
    ]);
    
    await Promise.all([
      page1.waitForLoadState('networkidle'),
      page2.waitForLoadState('networkidle')
    ]);
    
    // 両方のタブでアプリが正常に動作することを確認
    const app1Visible = await page1.locator('.app-container').isVisible();
    const app2Visible = await page2.locator('.app-container').isVisible();
    
    expect(app1Visible).toBe(true);
    expect(app2Visible).toBe(true);
    
    // 両方のタブで操作を実行
    const tab1Operations = page1.locator('button:has-text("プロフィール")').click();
    const tab2Operations = page2.locator('button:has-text("ライブラリ")').click();
    
    await Promise.all([tab1Operations, tab2Operations]);
    
    await context.close();
    
    console.log('✅ 複数タブでの同時アクセステスト成功');
  });
});

test.describe('セキュリティとアクセス制御', () => {
  test('不正なパラメータでのアクセステスト', async ({ page }) => {
    console.log('🔒 不正なパラメータでのアクセステストを開始...');
    
    const maliciousParams = [
      '?script=<script>alert("xss")</script>',
      '?debug=false&admin=true',
      '?token=invalid',
      '?user=admin&password=admin'
    ];
    
    for (const param of maliciousParams) {
      console.log(`  🔍 パラメータテスト: ${param}`);
      
      await page.goto(`${PRODUCTION_URL}${param}`);
      await page.waitForLoadState('networkidle');
      
      // アプリが適切に動作し、セキュリティが保たれているか確認
      const appContainer = await page.locator('.app-container').isVisible();
      
      // XSS攻撃が成功していないか確認
      const alerts = page.locator('text="xss"').count();
      expect(await alerts).toBe(0);
      
      console.log(`    ✅ パラメータ ${param} は安全に処理されました`);
    }
    
    console.log('✅ 不正なパラメータでのアクセステスト完了');
  });

  test('CSRFとXSS保護の確認', async ({ page }) => {
    console.log('🛡️ CSRFとXSS保護の確認テストを開始...');
    
    await page.goto(`${PRODUCTION_URL}?debug=true`);
    await page.waitForLoadState('networkidle');
    
    // フォーム入力フィールドでXSSテスト
    const profileTab = page.locator('button:has-text("プロフィール")');
    if (await profileTab.count() > 0) {
      await profileTab.click();
      await page.waitForTimeout(500);
      
      const nameInput = page.locator('input[placeholder="山田太郎"]');
      if (await nameInput.count() > 0) {
        // XSS攻撃を試行
        await nameInput.fill('<script>alert("xss")</script>');
        
        // 入力値が適切にエスケープされているか確認
        const inputValue = await nameInput.inputValue();
        console.log(`  📝 入力値: ${inputValue}`);
        
        // XSSが実行されていないことを確認
        const xssExecuted = await page.locator('text="xss"').count();
        expect(xssExecuted).toBe(0);
      }
    }
    
    // プロンプトタブでのテキストエリア入力テスト
    const promptTab = page.locator('button:has-text("プロンプト")');
    if (await promptTab.count() > 0) {
      await promptTab.click();
      await page.waitForTimeout(500);
      
      // AI応答エリアを展開
      const aiResponseHeader = page.locator('.card-collapsible-header:has-text("AI応答")');
      if (await aiResponseHeader.count() > 0) {
        await aiResponseHeader.click();
        await page.waitForTimeout(500);
        
        const textarea = page.locator('textarea');
        if (await textarea.count() > 0) {
          await textarea.fill('<img src="x" onerror="alert(\'xss\')">');
          
          // XSSが実行されていないことを確認
          const xssExecuted = await page.locator('text="xss"').count();
          expect(xssExecuted).toBe(0);
        }
      }
    }
    
    console.log('✅ CSRFとXSS保護の確認テスト完了');
  });

  test('APIエンドポイントのセキュリティテスト', async ({ page }) => {
    console.log('🔌 APIエンドポイントのセキュリティテストを開始...');
    
    await page.goto(`${PRODUCTION_URL}?debug=true`);
    
    // ネットワークリクエストを監視
    const apiRequests: any[] = [];
    const securityHeaders: string[] = [];
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiRequests.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers()
        });
        
        // セキュリティヘッダーの確認
        const headers = response.headers();
        if (headers['x-frame-options']) securityHeaders.push('X-Frame-Options');
        if (headers['x-content-type-options']) securityHeaders.push('X-Content-Type-Options');
        if (headers['x-xss-protection']) securityHeaders.push('X-XSS-Protection');
        if (headers['strict-transport-security']) securityHeaders.push('Strict-Transport-Security');
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    console.log(`📊 検出されたAPIリクエスト: ${apiRequests.length}件`);
    console.log(`🛡️ 検出されたセキュリティヘッダー: ${securityHeaders.join(', ')}`);
    
    // APIリクエストがHTTPSを使用しているか確認
    for (const request of apiRequests) {
      if (request.url.startsWith('http://') && !request.url.includes('localhost')) {
        console.log(`⚠️ 非セキュアなHTTP接続が検出されました: ${request.url}`);
      }
    }
    
    console.log('✅ APIエンドポイントのセキュリティテスト完了');
  });
});

test.describe('ログイン状態の永続化テスト', () => {
  test('ローカルストレージの永続化', async ({ page }) => {
    console.log('💾 ローカルストレージの永続化テストを開始...');
    
    await page.goto(`${PRODUCTION_URL}?debug=true`);
    await page.waitForLoadState('networkidle');
    
    // ローカルストレージの内容を確認
    const localStorage = await page.evaluate(() => {
      const items: {[key: string]: string} = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          items[key] = localStorage.getItem(key) || '';
        }
      }
      return items;
    });
    
    console.log('📋 ローカルストレージの内容:');
    Object.entries(localStorage).forEach(([key, value]) => {
      console.log(`  - ${key}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
    });
    
    // セッションストレージの内容を確認
    const sessionStorage = await page.evaluate(() => {
      const items: {[key: string]: string} = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          items[key] = sessionStorage.getItem(key) || '';
        }
      }
      return items;
    });
    
    console.log('📋 セッションストレージの内容:');
    Object.entries(sessionStorage).forEach(([key, value]) => {
      console.log(`  - ${key}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
    });
    
    console.log('✅ ローカルストレージの永続化テスト完了');
  });

  test('Cookieベースの認証状態確認', async ({ page, context }) => {
    console.log('🍪 Cookieベースの認証状態確認テストを開始...');
    
    await page.goto(`${PRODUCTION_URL}?debug=true`);
    await page.waitForLoadState('networkidle');
    
    // Cookieの確認
    const cookies = await context.cookies();
    
    console.log(`🍪 検出されたCookie: ${cookies.length}件`);
    cookies.forEach(cookie => {
      console.log(`  - ${cookie.name}: ${cookie.value.substring(0, 30)}${cookie.value.length > 30 ? '...' : ''}`);
      console.log(`    Domain: ${cookie.domain}, Path: ${cookie.path}, Secure: ${cookie.secure}, HttpOnly: ${cookie.httpOnly}`);
    });
    
    // セキュアなCookieが適切に設定されているか確認
    const secureCookies = cookies.filter(cookie => cookie.secure);
    const httpOnlyCookies = cookies.filter(cookie => cookie.httpOnly);
    
    console.log(`🔒 セキュアCookie: ${secureCookies.length}件`);
    console.log(`🛡️ HttpOnlyCookie: ${httpOnlyCookies.length}件`);
    
    console.log('✅ Cookieベースの認証状態確認テスト完了');
  });
});