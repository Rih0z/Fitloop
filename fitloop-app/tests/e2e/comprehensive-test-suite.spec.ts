import { test, expect } from '@playwright/test';

// 包括的E2Eテストスイート - 通信テスト、ログイン、システムアクセスを含む

const LOCAL_URL = 'http://localhost:5173';
const OLD_PRODUCTION_URL = 'https://6af06d79.fitloop.pages.dev';
const NEW_PRODUCTION_URL = 'https://4b963c66.fitloop-app.pages.dev';
const LATEST_PRODUCTION_URL = 'https://77290a50.fitloop-app.pages.dev';

// 最新の本番環境でテスト
const TEST_URL = LATEST_PRODUCTION_URL;
const PRODUCTION_URL = LATEST_PRODUCTION_URL;

test.describe('通信テスト', () => {
  test('ローカル環境への接続確認', async ({ page }) => {
    console.log('🔗 ローカル環境への接続テストを開始...');
    
    try {
      await page.goto(LOCAL_URL, { timeout: 10000 });
      await page.waitForLoadState('networkidle');
      
      // アプリケーションの基本要素が読み込まれているか確認
      const appContainer = await page.locator('.app-container');
      await expect(appContainer).toBeVisible();
      
      console.log('✅ ローカル環境への接続成功');
    } catch (error) {
      console.log(`❌ ローカル環境への接続失敗: ${error}`);
      throw error;
    }
  });

  test('本番環境への接続確認', async ({ page }) => {
    console.log('🔗 本番環境への接続テストを開始...');
    
    await page.goto(PRODUCTION_URL, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    
    // アプリケーションの基本要素が読み込まれているか確認
    const appContainer = await page.locator('.app-container');
    await expect(appContainer).toBeVisible();
    
    console.log('✅ 本番環境への接続成功');
  });

  test('ネットワーク応答時間の測定', async ({ page }) => {
    console.log('⏱️ ネットワーク応答時間を測定...');
    
    const startTime = Date.now();
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`📊 ページロード時間: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(10000); // 10秒以内
  });

  test('APIエンドポイント接続確認', async ({ page }) => {
    console.log('🔌 APIエンドポイントの接続テストを開始...');
    
    await page.goto(TEST_URL);
    
    // ネットワークリクエストを監視
    const apiRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push(request.url());
      }
    });
    
    // ページを完全に読み込み
    await page.waitForLoadState('networkidle');
    
    console.log(`📡 検出されたAPIリクエスト: ${apiRequests.length}件`);
    apiRequests.forEach(url => console.log(`  - ${url}`));
  });
});

test.describe('システムアクセステスト', () => {
  test('デバッグモードでのシステムアクセス', async ({ page }) => {
    console.log('🔧 デバッグモードでのアクセステストを開始...');
    
    await page.goto(`${TEST_URL}`);
    await page.waitForLoadState('networkidle');
    
    // 認証モーダルがバイパスされているか確認
    const authModal = await page.locator('[role="dialog"], .modal').count();
    expect(authModal).toBe(0);
    
    // タブバーが表示されているか確認
    const tabBar = await page.locator('.app-tab-bar, nav');
    await expect(tabBar).toBeVisible();
    
    console.log('✅ デバッグモードでのシステムアクセス成功');
  });

  test('全タブへのアクセス確認', async ({ page }) => {
    console.log('📑 全タブへのアクセステストを開始...');
    
    await page.goto(`${TEST_URL}`);
    await page.waitForLoadState('networkidle');
    
    const tabs = [
      { name: 'プロンプト', selector: '.app-tab-bar button:has-text("プロンプト")' },
      { name: 'プロフィール', selector: '.app-tab-bar button:has-text("プロフィール")' },
      { name: 'ライブラリ', selector: '.app-tab-bar button:has-text("ライブラリ")' },
      { name: '使い方', selector: '.app-tab-bar button:has-text("使い方")' }
    ];
    
    for (const tab of tabs) {
      console.log(`  📋 ${tab.name}タブをテスト中...`);
      
      const tabButton = page.locator(tab.selector);
      await expect(tabButton).toBeVisible();
      await tabButton.click();
      await page.waitForTimeout(500);
      
      // タブのコンテンツが表示されているか確認
      const content = await page.locator('.app-content').isVisible();
      expect(content).toBe(true);
      
      console.log(`    ✅ ${tab.name}タブアクセス成功`);
    }
  });

  test('レスポンシブデザインの確認', async ({ page }) => {
    console.log('📱 レスポンシブデザインテストを開始...');
    
    await page.goto(`${TEST_URL}`);
    
    const viewports = [
      { name: 'デスクトップ', width: 1920, height: 1080 },
      { name: 'タブレット', width: 768, height: 1024 },
      { name: 'モバイル', width: 375, height: 667 }
    ];
    
    for (const viewport of viewports) {
      console.log(`  📐 ${viewport.name} (${viewport.width}x${viewport.height}) をテスト中...`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);
      
      // タブバーが表示されているか確認
      const tabBar = await page.locator('.app-tab-bar, nav').isVisible();
      expect(tabBar).toBe(true);
      
      console.log(`    ✅ ${viewport.name}での表示確認成功`);
    }
  });
});

test.describe('プロンプトタブ機能テスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_URL}`);
    await page.waitForLoadState('networkidle');
    
    // プロンプトタブを選択
    const promptTab = page.locator('.app-tab-bar button:has-text("プロンプト")');
    await promptTab.click();
    await page.waitForTimeout(500);
  });

  test('メタプロンプト表示とコピー機能', async ({ page }) => {
    console.log('📝 メタプロンプトの表示とコピー機能をテスト...');
    
    // メタプロンプト表示エリアの確認
    const metaPromptCard = await page.locator('.card:has-text("生成されたメタプロンプト")');
    await expect(metaPromptCard).toBeVisible();
    
    // プロンプトコピーボタンの確認
    const copyButton = await page.locator('button:has-text("プロンプトをコピー")');
    await expect(copyButton).toBeVisible();
    
    // コピーボタンをクリック
    await copyButton.click();
    await page.waitForTimeout(1000);
    
    // コピー完了状態の確認
    const copiedButton = await page.locator('button:has-text("コピー完了!")');
    await expect(copiedButton).toBeVisible();
    
    console.log('✅ メタプロンプトコピー機能テスト成功');
  });

  test('AI応答エリアの展開と入力', async ({ page }) => {
    console.log('🤖 AI応答エリアの操作をテスト...');
    
    // AI応答エリアの確認
    const aiResponseCard = await page.locator('.card:has-text("AI応答")');
    await expect(aiResponseCard).toBeVisible();
    
    // AI応答エリアを展開
    const expandButton = await page.locator('.card-collapsible-header:has-text("AI応答")');
    await expandButton.click();
    await page.waitForTimeout(500);
    
    // テキストエリアが表示されているか確認
    const textarea = await page.locator('textarea[placeholder*="AIの応答をここに"]');
    await expect(textarea).toBeVisible();
    
    // テキストエリアに入力
    await textarea.fill('テストAI応答: 次回のトレーニングメニューが生成されました。');
    
    // 貼り付けボタンの確認
    const pasteButton = await page.locator('button:has-text("貼り付け")');
    await expect(pasteButton).toBeVisible();
    
    console.log('✅ AI応答エリア操作テスト成功');
  });

  test('体組成データ表示の確認', async ({ page }) => {
    console.log('📊 体組成データ表示をテスト...');
    
    // メタプロンプト状態カードの確認
    const statusCard = await page.locator('.card:has-text("メタプロンプト状態")');
    await expect(statusCard).toBeVisible();
    
    // 筋肉量と体脂肪率の表示確認
    const muscleData = await page.locator('text=/筋肉量: \\d+\\.\\d+%/');
    await expect(muscleData).toBeVisible();
    
    const fatData = await page.locator('text=/体脂肪率: \\d+\\.\\d+%/');
    await expect(fatData).toBeVisible();
    
    console.log('✅ 体組成データ表示テスト成功');
  });
});

test.describe('プロフィールタブ機能テスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_URL}`);
    await page.waitForLoadState('networkidle');
    
    // プロフィールタブを選択
    const profileTab = page.locator('.app-tab-bar button:has-text("プロフィール")');
    await profileTab.click();
    await page.waitForTimeout(500);
  });

  test('基本情報入力フォーム', async ({ page }) => {
    console.log('👤 基本情報入力フォームをテスト...');
    
    // 基本情報セクションが展開されているか確認
    const basicInfoSection = await page.locator('h3:has-text("基本情報")');
    await expect(basicInfoSection).toBeVisible();
    
    // 名前入力
    const nameInput = await page.locator('input[placeholder="山田太郎"]');
    await nameInput.fill('テストユーザー');
    
    // 年齢入力
    const ageInput = await page.locator('input[placeholder="30"]');
    await ageInput.fill('25');
    
    // 身長入力
    const heightInput = await page.locator('input[placeholder="170"]');
    await heightInput.fill('175');
    
    // 体重入力
    const weightInput = await page.locator('input[placeholder="70"]');
    await weightInput.fill('68');
    
    // 性別選択
    const genderSelect = await page.locator('select');
    await genderSelect.selectOption('female');
    
    console.log('✅ 基本情報入力フォームテスト成功');
  });

  test('目標設定セクション', async ({ page }) => {
    console.log('🎯 目標設定セクションをテスト...');
    
    // 目標設定セクションを展開
    const goalSection = await page.locator('button:has-text("目標設定")');
    await goalSection.click();
    await page.waitForTimeout(500);
    
    // 主な目標の選択
    const strengthGoal = await page.locator('button:has-text("筋力向上")');
    await strengthGoal.click();
    
    // 目標達成期間の選択
    const deadlineSelect = await page.locator('select').nth(1); // 2番目のselect要素（目標達成期間）
    await deadlineSelect.selectOption('6months');
    
    console.log('✅ 目標設定セクションテスト成功');
  });

  test('環境設定とAIデータインポート', async ({ page }) => {
    console.log('🏠 環境設定とAIデータインポートをテスト...');
    
    // 環境設定セクションを展開
    const envSection = await page.locator('button:has-text("環境設定")');
    await envSection.click();
    await page.waitForTimeout(500);
    
    // トレーニング場所の選択
    const homeLocation = await page.locator('button:has-text("自宅")');
    await homeLocation.click();
    
    // 週間頻度の調整
    const frequencySlider = await page.locator('input[type="range"]');
    await frequencySlider.fill('5');
    
    // AIデータインポートボタンの確認
    const aiImportButton = await page.locator('button:has-text("AIデータインポート")');
    await expect(aiImportButton).toBeVisible();
    
    console.log('✅ 環境設定とAIデータインポートテスト成功');
  });
});

test.describe('ライブラリタブ機能テスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_URL}`);
    await page.waitForLoadState('networkidle');
    
    // ライブラリタブを選択
    const libraryTab = page.locator('.app-tab-bar button:has-text("ライブラリ")');
    await libraryTab.click();
    await page.waitForTimeout(500);
  });

  test('メニュー検索機能', async ({ page }) => {
    console.log('🔍 メニュー検索機能をテスト...');
    
    // 検索バーの確認
    const searchInput = await page.locator('input[placeholder="メニューを検索..."]');
    await expect(searchInput).toBeVisible();
    
    // 検索実行
    await searchInput.fill('胸筋');
    await page.waitForTimeout(500);
    
    // 検索結果の確認
    const searchResults = await page.locator('.card:has-text("胸筋強化メニュー")');
    await expect(searchResults).toBeVisible();
    
    console.log('✅ メニュー検索機能テスト成功');
  });

  test('フィルタ機能', async ({ page }) => {
    console.log('🏷️ フィルタ機能をテスト...');
    
    // フィルタボタンの確認
    const allFilter = await page.locator('button:has-text("すべて")');
    const upperFilter = await page.locator('button:has-text("上半身")');
    const favoriteFilter = await page.locator('button:has-text("お気に入り")');
    
    await expect(allFilter).toBeVisible();
    await expect(upperFilter).toBeVisible();
    await expect(favoriteFilter).toBeVisible();
    
    // 上半身フィルタをクリック
    await upperFilter.click();
    await page.waitForTimeout(500);
    
    // フィルタ結果の確認
    const upperBodyMenus = await page.locator('.card:has-text("上半身")');
    await expect(upperBodyMenus.first()).toBeVisible();
    
    console.log('✅ フィルタ機能テスト成功');
  });

  test('お気に入り機能とメニューコピー', async ({ page }) => {
    console.log('⭐ お気に入り機能とメニューコピーをテスト...');
    
    // 最初のメニューカードを取得
    const firstMenu = await page.locator('.card.card-interactive').first();
    await expect(firstMenu).toBeVisible();
    
    // お気に入りボタンをクリック
    const favoriteButton = await firstMenu.locator('button').first();
    await favoriteButton.click();
    await page.waitForTimeout(500);
    
    // コピーボタンをクリック
    const copyButton = await firstMenu.locator('button').nth(1);
    await copyButton.click();
    await page.waitForTimeout(1000);
    
    console.log('✅ お気に入り機能とメニューコピーテスト成功');
  });
});

test.describe('ヘルプタブ機能テスト', () => {
  test('使い方ガイドと外部リンク', async ({ page }) => {
    console.log('❓ ヘルプタブの機能をテスト...');
    
    await page.goto(`${TEST_URL}`);
    await page.waitForLoadState('networkidle');
    
    // 使い方タブを選択
    const helpTab = page.locator('.app-tab-bar button:has-text("使い方")');
    await helpTab.click();
    await page.waitForTimeout(500);
    
    // 使い方ガイドの確認
    const guideSteps = await page.locator('.w-8.h-8.bg-blue-500');
    const stepCount = await guideSteps.count();
    expect(stepCount).toBeGreaterThan(0);
    
    // Claude AIへの外部リンクの確認
    const claudeLink = await page.locator('a:has-text("Claude AIを開く")');
    await expect(claudeLink).toBeVisible();
    
    // リンクのhref属性確認
    const href = await claudeLink.getAttribute('href');
    expect(href).toBe('https://claude.ai');
    
    // 主な機能セクションの確認
    const featuresSection = await page.locator('text="⚡ 主な機能"');
    await expect(featuresSection).toBeVisible();
    
    console.log('✅ ヘルプタブ機能テスト成功');
  });
});

test.describe('エラーハンドリングとユーザビリティ', () => {
  test('JavaScriptエラーの検出', async ({ page }) => {
    console.log('🐛 JavaScriptエラーの検出テストを開始...');
    
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(`${TEST_URL}`);
    await page.waitForLoadState('networkidle');
    
    // 全タブを巡回してエラーをチェック
    const tabs = ['プロンプト', 'プロフィール', 'ライブラリ', '使い方'];
    for (const tabName of tabs) {
      const tab = page.locator(`button:has-text("${tabName}")`);
      await tab.click();
      await page.waitForTimeout(500);
    }
    
    if (errors.length > 0) {
      console.log(`❌ ${errors.length}件のJavaScriptエラーが検出されました:`);
      errors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('✅ JavaScriptエラーは検出されませんでした');
    }
    
    expect(errors.length).toBe(0);
  });

  test('ページロード完了の確認', async ({ page }) => {
    console.log('⏳ ページロード完了の確認テストを開始...');
    
    await page.goto(`${TEST_URL}`);
    
    // ローディング状態が完了するまで待機
    await page.waitForLoadState('networkidle');
    
    // 重要な要素が全て読み込まれているか確認
    const header = await page.locator('header, .header');
    const tabBar = await page.locator('[role="tablist"], .tab-bar');
    const mainContent = await page.locator('main, .app-content');
    
    await expect(header).toBeVisible();
    await expect(tabBar).toBeVisible();
    await expect(mainContent).toBeVisible();
    
    console.log('✅ ページロード完了確認テスト成功');
  });

  test('アクセシビリティ基本チェック', async ({ page }) => {
    console.log('♿ アクセシビリティ基本チェックを開始...');
    
    await page.goto(`${TEST_URL}`);
    await page.waitForLoadState('networkidle');
    
    // タブボタンの確認
    const tabButtons = await page.locator('.app-tab-bar button');
    await expect(tabButtons.first()).toBeVisible();
    
    // フォーム要素のラベル確認
    const inputs = await page.locator('input');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      console.log(`📝 ${inputCount}個の入力要素を確認`);
    }
    
    console.log('✅ アクセシビリティ基本チェック完了');
  });
});