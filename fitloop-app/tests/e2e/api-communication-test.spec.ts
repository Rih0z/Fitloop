import { test, expect } from '@playwright/test';

// バックエンドAPIとの通信テスト

const LOCAL_URL = 'http://localhost:5173';
const PRODUCTION_URL = 'https://6af06d79.fitloop.pages.dev';
const LOCAL_API_URL = 'http://localhost:3000/api';
const PRODUCTION_API_URL = 'https://fitloop-backend.example.com/api'; // 実際のAPIエンドポイントに変更

test.describe('バックエンドAPI通信テスト', () => {
  test('APIエンドポイントの生存確認', async ({ request }) => {
    console.log('🔌 APIエンドポイントの生存確認を開始...');
    
    const endpoints = [
      '/health',
      '/api/health',
      '/api/v1/health',
      '/status'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`  📡 テスト中: ${PRODUCTION_API_URL}${endpoint}`);
        
        const response = await request.get(`${PRODUCTION_API_URL}${endpoint}`, {
          timeout: 10000,
          ignoreHTTPSErrors: true
        });
        
        console.log(`    ステータス: ${response.status()}`);
        
        if (response.ok()) {
          console.log(`    ✅ ${endpoint} - OK`);
          break;
        }
      } catch (error) {
        console.log(`    ❌ ${endpoint} - エラー: ${error}`);
      }
    }
  });

  test('プロフィールAPI通信テスト', async ({ page, request }) => {
    console.log('👤 プロフィールAPI通信テストを開始...');
    
    await page.goto(`${PRODUCTION_URL}?debug=true`);
    await page.waitForLoadState('networkidle');
    
    // ネットワークリクエストを監視
    const profileRequests: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('/profile') || request.url().includes('/user')) {
        profileRequests.push({
          method: request.method(),
          url: request.url(),
          headers: request.headers(),
          postData: request.postData()
        });
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/profile') || response.url().includes('/user')) {
        console.log(`📤 プロフィールAPI応答: ${response.status()} - ${response.url()}`);
      }
    });
    
    // プロフィールタブに移動してデータを入力
    const profileTab = page.locator('.app-tab-bar button:has-text("プロフィール")');
    await profileTab.click();
    await page.waitForTimeout(1000);
    
    // 基本情報を入力
    const nameInput = page.locator('input[placeholder="山田太郎"]');
    if (await nameInput.count() > 0) {
      await nameInput.fill('API通信テスト');
      await page.waitForTimeout(500);
    }
    
    const ageInput = page.locator('input[placeholder="30"]');
    if (await ageInput.count() > 0) {
      await ageInput.fill('25');
      await page.waitForTimeout(500);
    }
    
    // AIデータインポートボタンをクリック（API呼び出しをトリガー）
    const aiImportButton = page.locator('button:has-text("AIデータインポート")');
    if (await aiImportButton.count() > 0) {
      await aiImportButton.click();
      await page.waitForTimeout(2000);
    }
    
    console.log(`📊 検出されたプロフィールAPIリクエスト: ${profileRequests.length}件`);
    profileRequests.forEach((req, index) => {
      console.log(`  ${index + 1}. ${req.method} ${req.url}`);
    });
    
    console.log('✅ プロフィールAPI通信テスト完了');
  });

  test('プロンプトAPI通信テスト', async ({ page }) => {
    console.log('📝 プロンプトAPI通信テストを開始...');
    
    await page.goto(`${PRODUCTION_URL}?debug=true`);
    await page.waitForLoadState('networkidle');
    
    // ネットワークリクエストを監視
    const promptRequests: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('/prompt') || request.url().includes('/ai')) {
        promptRequests.push({
          method: request.method(),
          url: request.url(),
          headers: request.headers(),
          postData: request.postData()
        });
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/prompt') || response.url().includes('/ai')) {
        console.log(`📤 プロンプトAPI応答: ${response.status()} - ${response.url()}`);
      }
    });
    
    // プロンプトタブの操作
    const promptTab = page.locator('.app-tab-bar button:has-text("プロンプト")');
    await promptTab.click();
    await page.waitForTimeout(1000);
    
    // メタプロンプトのコピー
    const copyButton = page.locator('button:has-text("プロンプトをコピー")');
    if (await copyButton.count() > 0) {
      await copyButton.click();
      await page.waitForTimeout(1000);
    }
    
    // AI応答エリアを展開
    const aiResponseHeader = page.locator('.card-collapsible-header:has-text("AI応答")');
    if (await aiResponseHeader.count() > 0) {
      await aiResponseHeader.click();
      await page.waitForTimeout(500);
      
      // AI応答を入力
      const textarea = page.locator('textarea');
      if (await textarea.count() > 0) {
        await textarea.fill('API通信テスト用のAI応答データです。');
        await page.waitForTimeout(1000);
      }
    }
    
    // 記録入力ボタンをクリック（API呼び出しをトリガー）
    const recordButton = page.locator('button:has-text("記録入力")');
    if (await recordButton.count() > 0) {
      await recordButton.click();
      await page.waitForTimeout(2000);
    }
    
    console.log(`📊 検出されたプロンプトAPIリクエスト: ${promptRequests.length}件`);
    promptRequests.forEach((req, index) => {
      console.log(`  ${index + 1}. ${req.method} ${req.url}`);
    });
    
    console.log('✅ プロンプトAPI通信テスト完了');
  });

  test('ワークアウトAPI通信テスト', async ({ page }) => {
    console.log('💪 ワークアウトAPI通信テストを開始...');
    
    await page.goto(`${PRODUCTION_URL}?debug=true`);
    await page.waitForLoadState('networkidle');
    
    // ネットワークリクエストを監視
    const workoutRequests: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('/workout') || request.url().includes('/exercise') || request.url().includes('/menu')) {
        workoutRequests.push({
          method: request.method(),
          url: request.url(),
          headers: request.headers(),
          postData: request.postData()
        });
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/workout') || response.url().includes('/exercise') || response.url().includes('/menu')) {
        console.log(`📤 ワークアウトAPI応答: ${response.status()} - ${response.url()}`);
      }
    });
    
    // ライブラリタブの操作
    const libraryTab = page.locator('.app-tab-bar button:has-text("ライブラリ")');
    await libraryTab.click();
    await page.waitForTimeout(1000);
    
    // 新規メニュー作成ボタンをクリック
    const createMenuButton = page.locator('button:has-text("新規メニュー作成")');
    if (await createMenuButton.count() > 0) {
      await createMenuButton.click();
      await page.waitForTimeout(1000);
    }
    
    // 検索機能をテスト
    const searchInput = page.locator('input[placeholder="メニューを検索..."]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('胸筋');
      await page.waitForTimeout(1000);
    }
    
    // メニューのコピー機能をテスト
    const copyMenuButton = page.locator('.card-interactive button').nth(1);
    if (await copyMenuButton.count() > 0) {
      await copyMenuButton.click();
      await page.waitForTimeout(1000);
    }
    
    console.log(`📊 検出されたワークアウトAPIリクエスト: ${workoutRequests.length}件`);
    workoutRequests.forEach((req, index) => {
      console.log(`  ${index + 1}. ${req.method} ${req.url}`);
    });
    
    console.log('✅ ワークアウトAPI通信テスト完了');
  });
});

test.describe('API応答とエラーハンドリングテスト', () => {
  test('API応答時間の測定', async ({ page }) => {
    console.log('⏱️ API応答時間の測定を開始...');
    
    await page.goto(`${PRODUCTION_URL}?debug=true`);
    
    const apiTimes: {[key: string]: number} = {};
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        const timing = response.timing();
        const totalTime = timing.responseEnd - timing.requestStart;
        apiTimes[response.url()] = totalTime;
        
        console.log(`📡 API応答時間: ${totalTime}ms - ${response.url()}`);
        
        // 3秒以上かかるAPIをワーニング
        if (totalTime > 3000) {
          console.log(`⚠️ 遅いAPI応答が検出されました: ${totalTime}ms`);
        }
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // 各タブを巡回してAPI呼び出しをトリガー
    const tabs = ['プロンプト', 'プロフィール', 'ライブラリ', 'ヘルプ'];
    for (const tabName of tabs) {
      const tab = page.locator(`.app-tab-bar button:has-text("${tabName}")`);
      if (await tab.count() > 0) {
        await tab.click();
        await page.waitForTimeout(1000);
      }
    }
    
    console.log(`📊 測定されたAPI応答: ${Object.keys(apiTimes).length}件`);
    
    console.log('✅ API応答時間の測定完了');
  });

  test('ネットワークエラーハンドリング', async ({ page, context }) => {
    console.log('🌐 ネットワークエラーハンドリングテストを開始...');
    
    // ネットワークエラーをシミュレート
    await context.route('**/api/**', route => {
      route.abort('failed');
    });
    
    await page.goto(`${PRODUCTION_URL}?debug=true`);
    await page.waitForLoadState('networkidle');
    
    // エラー処理が適切に行われているか確認
    const errorMessages: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errorMessages.push(msg.text());
      }
    });
    
    // プロフィール操作でAPIエラーをトリガー
    const profileTab = page.locator('button:has-text("プロフィール")');
    if (await profileTab.count() > 0) {
      await profileTab.click();
      await page.waitForTimeout(1000);
      
      const aiImportButton = page.locator('button:has-text("AIデータインポート")');
      if (await aiImportButton.count() > 0) {
        await aiImportButton.click();
        await page.waitForTimeout(2000);
      }
    }
    
    // エラー表示の確認
    const errorIndicators = await page.locator('.error, .alert-error, [role="alert"]').count();
    console.log(`🚨 エラーインジケータ: ${errorIndicators}件`);
    
    // アプリケーションがクラッシュしていないことを確認
    const appStillRunning = await page.locator('.app-container').isVisible();
    expect(appStillRunning).toBe(true);
    
    console.log(`📋 コンソールエラー: ${errorMessages.length}件`);
    
    console.log('✅ ネットワークエラーハンドリングテスト完了');
  });

  test('APIレスポンスの形式確認', async ({ page }) => {
    console.log('📋 APIレスポンスの形式確認テストを開始...');
    
    await page.goto(`${PRODUCTION_URL}?debug=true`);
    
    const responseData: any[] = [];
    
    page.on('response', async response => {
      if (response.url().includes('/api/') && response.status() === 200) {
        try {
          const contentType = response.headers()['content-type'];
          
          if (contentType && contentType.includes('application/json')) {
            const jsonData = await response.json();
            responseData.push({
              url: response.url(),
              status: response.status(),
              contentType: contentType,
              data: jsonData
            });
            
            console.log(`📦 JSON応答: ${response.url()}`);
            console.log(`  Content-Type: ${contentType}`);
            console.log(`  データ構造: ${Object.keys(jsonData).join(', ')}`);
          }
        } catch (error) {
          console.log(`❌ JSON解析エラー: ${response.url()} - ${error}`);
        }
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // 各機能を使ってAPI呼び出しをトリガー
    const tabs = ['プロンプト', 'プロフィール', 'ライブラリ'];
    for (const tabName of tabs) {
      const tab = page.locator(`.app-tab-bar button:has-text("${tabName}")`);
      if (await tab.count() > 0) {
        await tab.click();
        await page.waitForTimeout(1000);
      }
    }
    
    console.log(`📊 解析されたAPIレスポンス: ${responseData.length}件`);
    
    console.log('✅ APIレスポンスの形式確認テスト完了');
  });

  test('CORS設定の確認', async ({ page }) => {
    console.log('🔄 CORS設定の確認テストを開始...');
    
    await page.goto(`${PRODUCTION_URL}?debug=true`);
    
    const corsHeaders: {[key: string]: any} = {};
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        const headers = response.headers();
        if (headers['access-control-allow-origin'] || headers['access-control-allow-methods'] || headers['access-control-allow-headers']) {
          corsHeaders[response.url()] = {
            'access-control-allow-origin': headers['access-control-allow-origin'],
            'access-control-allow-methods': headers['access-control-allow-methods'],
            'access-control-allow-headers': headers['access-control-allow-headers'],
            'access-control-allow-credentials': headers['access-control-allow-credentials']
          };
          
          console.log(`🔄 CORS設定確認: ${response.url()}`);
          console.log(`  Origin: ${headers['access-control-allow-origin']}`);
          console.log(`  Methods: ${headers['access-control-allow-methods']}`);
          console.log(`  Headers: ${headers['access-control-allow-headers']}`);
        }
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // クロスオリジンリクエストをシミュレート
    await page.evaluate(() => {
      fetch('/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(() => {
        // エラーは無視（CORS確認が目的）
      });
    });
    
    await page.waitForTimeout(2000);
    
    console.log(`📊 CORS設定が確認されたAPI: ${Object.keys(corsHeaders).length}件`);
    
    console.log('✅ CORS設定の確認テスト完了');
  });
});

test.describe('APIセキュリティテスト', () => {
  test('認証ヘッダーの確認', async ({ page }) => {
    console.log('🔒 認証ヘッダーの確認テストを開始...');
    
    await page.goto(`${PRODUCTION_URL}?debug=true`);
    
    const authHeaders: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        const headers = request.headers();
        if (headers['authorization'] || headers['x-api-key'] || headers['bearer']) {
          authHeaders.push({
            url: request.url(),
            method: request.method(),
            authorization: headers['authorization'] ? '***REDACTED***' : undefined,
            apiKey: headers['x-api-key'] ? '***REDACTED***' : undefined,
            bearer: headers['bearer'] ? '***REDACTED***' : undefined
          });
          
          console.log(`🔑 認証ヘッダー検出: ${request.method()} ${request.url()}`);
        }
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // 認証が必要な操作を実行
    const profileTab = page.locator('button:has-text("プロフィール")');
    if (await profileTab.count() > 0) {
      await profileTab.click();
      await page.waitForTimeout(1000);
      
      const aiImportButton = page.locator('button:has-text("AIデータインポート")');
      if (await aiImportButton.count() > 0) {
        await aiImportButton.click();
        await page.waitForTimeout(2000);
      }
    }
    
    console.log(`🔑 認証ヘッダーが検出されたリクエスト: ${authHeaders.length}件`);
    
    console.log('✅ 認証ヘッダーの確認テスト完了');
  });

  test('HTTPSの使用確認', async ({ page }) => {
    console.log('🔐 HTTPSの使用確認テストを開始...');
    
    await page.goto(`${PRODUCTION_URL}?debug=true`);
    
    const httpRequests: string[] = [];
    const httpsRequests: string[] = [];
    
    page.on('request', request => {
      if (request.url().startsWith('http://') && !request.url().includes('localhost')) {
        httpRequests.push(request.url());
        console.log(`⚠️ 非セキュアHTTP接続: ${request.url()}`);
      } else if (request.url().startsWith('https://')) {
        httpsRequests.push(request.url());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // 各機能を使って通信をトリガー
    const tabs = ['プロンプト', 'プロフィール', 'ライブラリ'];
    for (const tabName of tabs) {
      const tab = page.locator(`.app-tab-bar button:has-text("${tabName}")`);
      if (await tab.count() > 0) {
        await tab.click();
        await page.waitForTimeout(1000);
      }
    }
    
    console.log(`🔒 HTTPS接続: ${httpsRequests.length}件`);
    console.log(`⚠️ HTTP接続: ${httpRequests.length}件`);
    
    // 本番環境では全てHTTPSであることを確認
    if (PRODUCTION_URL.startsWith('https://')) {
      expect(httpRequests.length).toBe(0);
    }
    
    console.log('✅ HTTPSの使用確認テスト完了');
  });
});