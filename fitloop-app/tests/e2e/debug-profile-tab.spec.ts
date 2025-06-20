import { test, expect } from '@playwright/test';

// ProfileTabのDOM構造をデバッグするためのテスト

const LOCAL_URL = 'http://localhost:5173';

test.describe('ProfileTab構造デバッグ', () => {
  test('ProfileTabの実際の構造を調査', async ({ page }) => {
    console.log('🔍 ProfileTabの構造を調査中...');
    
    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');
    
    // プロフィールタブに移動
    const profileTab = page.locator('.app-tab-bar button:has-text("プロフィール")');
    await profileTab.click();
    await page.waitForTimeout(1000);
    
    // スクリーンショットを撮影
    await page.screenshot({ path: 'test-results/profile-tab-debug.png', fullPage: true });
    
    // プロフィールタブのHTML構造を取得
    const profileContent = await page.locator('.app-content').innerHTML();
    console.log('📄 ProfileTab HTML:');
    console.log(profileContent.substring(0, 1500));
    
    // セクション要素を検索
    const sectionElements = {
      '.card': await page.locator('.card').count(),
      '[class*="card"]': await page.locator('[class*="card"]').count(),
      'h3:has-text("基本情報")': await page.locator('h3:has-text("基本情報")').count(),
      'h3:has-text("目標設定")': await page.locator('h3:has-text("目標設定")').count(),
      'h3:has-text("環境設定")': await page.locator('h3:has-text("環境設定")').count(),
      'button:has-text("基本情報")': await page.locator('button:has-text("基本情報")').count(),
      'button:has-text("目標設定")': await page.locator('button:has-text("目標設定")').count(),
      'button:has-text("環境設定")': await page.locator('button:has-text("環境設定")').count(),
    };
    
    console.log('📋 セクション要素の数:');
    Object.entries(sectionElements).forEach(([selector, count]) => {
      console.log(`  ${selector}: ${count}`);
    });
    
    // 基本情報セクション要素を詳しく調査
    const basicInfoElement = await page.locator('h3:has-text("基本情報")').first();
    if (await basicInfoElement.count() > 0) {
      const parentCard = await basicInfoElement.locator('..').locator('..'); // 親の親要素
      const parentCardClass = await parentCard.getAttribute('class');
      console.log(`📦 基本情報の親要素クラス: ${parentCardClass}`);
      
      // 親要素のHTML構造を取得
      const parentHTML = await parentCard.innerHTML();
      console.log('📦 基本情報セクションHTML:');
      console.log(parentHTML.substring(0, 800));
    }
    
    // フォーム要素を検索
    const formElements = {
      'input': await page.locator('input').count(),
      'input[placeholder="山田太郎"]': await page.locator('input[placeholder="山田太郎"]').count(),
      'input[placeholder="30"]': await page.locator('input[placeholder="30"]').count(),
      'select': await page.locator('select').count(),
      'button:has-text("筋力向上")': await page.locator('button:has-text("筋力向上")').count(),
    };
    
    console.log('📝 フォーム要素の数:');
    Object.entries(formElements).forEach(([selector, count]) => {
      console.log(`  ${selector}: ${count}`);
    });
    
    // CollapsibleSectionが展開されているかチェック
    const expandedSections = await page.locator('[class*="animate-slideDown"]').count();
    console.log(`📂 展開されたセクション数: ${expandedSections}`);
    
    console.log('✅ ProfileTab構造調査完了');
  });

  test('セクションの展開と操作をテスト', async ({ page }) => {
    console.log('🔧 セクションの展開操作をテスト中...');
    
    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');
    
    // プロフィールタブに移動
    const profileTab = page.locator('.app-tab-bar button:has-text("プロフィール")');
    await profileTab.click();
    await page.waitForTimeout(1000);
    
    // セクションのヘッダーボタンを探す
    const sectionHeaders = ['基本情報', '目標設定', '環境設定'];
    
    for (const sectionName of sectionHeaders) {
      console.log(`🔍 ${sectionName}セクションをテスト中...`);
      
      // セクションヘッダーボタンを探す
      const headerButton = page.locator(`button:has-text("${sectionName}")`);
      const headerCount = await headerButton.count();
      
      console.log(`  ヘッダーボタン "${sectionName}": ${headerCount}個`);
      
      if (headerCount > 0) {
        // セクションをクリックして展開
        await headerButton.click();
        await page.waitForTimeout(500);
        
        // 展開後のコンテンツを確認
        const isExpanded = await page.locator(`button:has-text("${sectionName}") ~ div`).isVisible();
        console.log(`  ${sectionName}セクション展開状態: ${isExpanded}`);
      }
    }
    
    console.log('✅ セクション展開操作テスト完了');
  });
});