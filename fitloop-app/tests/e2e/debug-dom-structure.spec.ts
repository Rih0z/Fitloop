import { test, expect } from '@playwright/test';

// DOM構造をデバッグするためのテスト

const PRODUCTION_URL = 'https://6af06d79.fitloop.pages.dev';

test.describe('DOM構造デバッグ', () => {
  test('ページの実際のDOM構造を調査', async ({ page }) => {
    console.log('🔍 DOM構造を調査中...');
    
    await page.goto(`${PRODUCTION_URL}?debug=true`);
    await page.waitForLoadState('networkidle');
    
    // 全体のHTML構造を調査
    const bodyHTML = await page.locator('body').innerHTML();
    console.log('📄 Body HTML:');
    console.log(bodyHTML.substring(0, 2000)); // 最初の2000文字を表示
    
    // スクリーンショットを撮影
    await page.screenshot({ path: 'test-results/dom-structure-debug.png', fullPage: true });
    
    // app-containerの確認
    const appContainer = await page.locator('.app-container').count();
    console.log(`📦 .app-container の数: ${appContainer}`);
    
    // ナビゲーション要素を幅広く検索
    const navElements = {
      nav: await page.locator('nav').count(),
      '.app-tab-bar': await page.locator('.app-tab-bar').count(),
      '.tab-bar': await page.locator('.tab-bar').count(),
      '.bottom-nav': await page.locator('.bottom-nav').count(),
      '.navigation': await page.locator('.navigation').count(),
      'footer': await page.locator('footer').count(),
      '.fixed.bottom-0': await page.locator('.fixed.bottom-0').count(),
      '[class*="tab"]': await page.locator('[class*="tab"]').count(),
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
      'button:has-text("ヘルプ")': await page.locator('button:has-text("ヘルプ")').count(),
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
    
    // すべてのnavの内容を確認
    const allNavs = await page.locator('nav').all();
    console.log(`🧭 nav要素の数: ${allNavs.length}`);
    for (let i = 0; i < allNavs.length; i++) {
      const navHTML = await allNavs[i].innerHTML();
      const classList = await allNavs[i].getAttribute('class');
      console.log(`  nav ${i + 1} (class: ${classList}):`);
      console.log(`    ${navHTML.substring(0, 500)}`);
    }
    
    // DOM要素の可視性チェック
    const visibilityCheck = {
      '.app-container': await page.locator('.app-container').isVisible(),
      'nav': await page.locator('nav').first().isVisible(),
      'button': await page.locator('button').first().isVisible(),
    };
    
    console.log('👁️ 要素の可視性:');
    Object.entries(visibilityCheck).forEach(([selector, isVisible]) => {
      console.log(`  ${selector}: ${isVisible}`);
    });
    
    console.log('✅ DOM構造調査完了');
  });

  test('CSS スタイルの確認', async ({ page }) => {
    console.log('🎨 CSS スタイルを確認中...');
    
    await page.goto(`${PRODUCTION_URL}?debug=true`);
    await page.waitForLoadState('networkidle');
    
    // タブバー候補のスタイルを確認
    const candidates = ['nav', '.app-tab-bar', '.fixed.bottom-0'];
    
    for (const selector of candidates) {
      const elements = await page.locator(selector).all();
      if (elements.length > 0) {
        console.log(`🎨 ${selector} のスタイル:`);
        for (let i = 0; i < elements.length; i++) {
          const styles = await elements[i].evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
              display: computed.display,
              position: computed.position,
              bottom: computed.bottom,
              zIndex: computed.zIndex,
              visibility: computed.visibility,
              opacity: computed.opacity,
              height: computed.height,
              width: computed.width
            };
          });
          console.log(`  ${selector}[${i}]:`, styles);
        }
      }
    }
    
    console.log('✅ CSS スタイル確認完了');
  });

  test('ページロード順序の確認', async ({ page }) => {
    console.log('⏳ ページロード順序を確認中...');
    
    // ロード状態を段階的にチェック
    await page.goto(`${PRODUCTION_URL}?debug=true`);
    
    console.log('📍 DOMContentLoaded後の要素数:');
    await page.waitForLoadState('domcontentloaded');
    console.log(`  nav: ${await page.locator('nav').count()}`);
    console.log(`  button: ${await page.locator('button').count()}`);
    
    console.log('📍 load後の要素数:');
    await page.waitForLoadState('load');
    console.log(`  nav: ${await page.locator('nav').count()}`);
    console.log(`  button: ${await page.locator('button').count()}`);
    
    console.log('📍 networkidle後の要素数:');
    await page.waitForLoadState('networkidle');
    console.log(`  nav: ${await page.locator('nav').count()}`);
    console.log(`  button: ${await page.locator('button').count()}`);
    
    // 追加待機して再チェック
    await page.waitForTimeout(2000);
    console.log('📍 2秒追加待機後の要素数:');
    console.log(`  nav: ${await page.locator('nav').count()}`);
    console.log(`  button: ${await page.locator('button').count()}`);
    
    console.log('✅ ページロード順序確認完了');
  });
});