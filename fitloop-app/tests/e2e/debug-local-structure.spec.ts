import { test, expect } from '@playwright/test';

// ローカル環境のDOM構造をデバッグするためのテスト

const LOCAL_URL = 'http://localhost:5173';

test.describe('ローカル環境DOM構造デバッグ', () => {
  test('ローカル環境のページ構造を調査', async ({ page }) => {
    console.log('🔍 ローカル環境のDOM構造を調査中...');
    
    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');
    
    // 全体のHTML構造を調査
    const bodyHTML = await page.locator('body').innerHTML();
    console.log('📄 ローカル環境 Body HTML:');
    console.log(bodyHTML.substring(0, 1500)); // 最初の1500文字を表示
    
    // スクリーンショットを撮影
    await page.screenshot({ path: 'test-results/local-dom-structure-debug.png', fullPage: true });
    
    // app-containerの確認
    const appContainer = await page.locator('.app-container').count();
    console.log(`📦 .app-container の数: ${appContainer}`);
    
    // ナビゲーション要素を幅広く検索
    const navElements = {
      nav: await page.locator('nav').count(),
      '.app-tab-bar': await page.locator('.app-tab-bar').count(),
      '.tab-bar': await page.locator('.tab-bar').count(),
      'header': await page.locator('header').count(),
      '.app-header': await page.locator('.app-header').count(),
    };
    
    console.log('🧭 ナビゲーション要素の数:');
    Object.entries(navElements).forEach(([selector, count]) => {
      console.log(`  ${selector}: ${count}`);
    });
    
    // ボタン要素を検索
    const buttonElements = {
      'button': await page.locator('button').count(),
      'button:has-text("プロンプト")': await page.locator('button:has-text("プロンプト")').count(),
      'button:has-text("プロフィール")': await page.locator('button:has-text("プロフィール")').count(),
      'button:has-text("ライブラリ")': await page.locator('button:has-text("ライブラリ")').count(),
      'button:has-text("使い方")': await page.locator('button:has-text("使い方")').count(),
    };
    
    console.log('🔘 ボタン要素の数:');
    Object.entries(buttonElements).forEach(([selector, count]) => {
      console.log(`  ${selector}: ${count}`);
    });
    
    // すべてのボタンのテキストを取得
    const allButtons = await page.locator('button').all();
    console.log('🔘 すべてのボタンのテキスト:');
    for (let i = 0; i < allButtons.length; i++) {
      const text = await allButtons[i].textContent();
      const classList = await allButtons[i].getAttribute('class');
      console.log(`  ${i + 1}. "${text}" (class: ${classList})`);
    }
    
    // CSS クラスの確認
    const cssClasses = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const classes = new Set<string>();
      elements.forEach(el => {
        if (el.className) {
          el.className.split(' ').forEach(cls => {
            if (cls.includes('tab') || cls.includes('nav') || cls.includes('app')) {
              classes.add(cls);
            }
          });
        }
      });
      return Array.from(classes);
    });
    
    console.log('🎨 関連CSSクラス:');
    cssClasses.forEach(cls => console.log(`  ${cls}`));
    
    console.log('✅ ローカル環境DOM構造調査完了');
  });

  test('ローカル環境でタブバーをテスト', async ({ page }) => {
    console.log('🔧 ローカル環境でタブバーをテスト中...');
    
    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');
    
    // タブバーが存在するか確認
    const tabBarSelectors = [
      '.app-tab-bar',
      'nav',
      '[class*="tab-bar"]',
      '.fixed.bottom-0',
      '.grid.grid-cols-4'
    ];
    
    let foundTabBar = null;
    for (const selector of tabBarSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`✅ タブバー発見: ${selector} (${count}個)`);
        foundTabBar = selector;
        break;
      }
    }
    
    if (foundTabBar) {
      // タブボタンをクリックしてテスト
      const tabs = ['プロンプト', 'プロフィール', 'ライブラリ', '使い方'];
      
      for (const tabName of tabs) {
        const tabButton = page.locator(`${foundTabBar} button:has-text("${tabName}")`);
        const count = await tabButton.count();
        
        if (count > 0) {
          console.log(`🔘 タブボタン "${tabName}" をクリック`);
          await tabButton.click();
          await page.waitForTimeout(500);
          
          // アクティブ状態の確認
          const isActive = await tabButton.evaluate(btn => btn.classList.contains('text-blue-500'));
          console.log(`  アクティブ状態: ${isActive}`);
        } else {
          console.log(`❌ タブボタン "${tabName}" が見つかりません`);
        }
      }
    } else {
      console.log('❌ タブバーが見つかりませんでした');
    }
    
    console.log('✅ ローカル環境タブバーテスト完了');
  });
});