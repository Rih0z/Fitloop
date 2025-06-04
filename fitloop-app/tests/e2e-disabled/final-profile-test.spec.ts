import { test, expect } from '@playwright/test';

test('test profile setup with fixed database', async ({ page }) => {
  console.log('🔍 Testing profile setup with database version fix...\n');
  
  // Enable console logging
  page.on('console', msg => {
    console.log(`Browser ${msg.type()}: ${msg.text()}`);
  });
  
  // Clear indexedDB first
  await page.evaluate(() => {
    return new Promise((resolve) => {
      const deleteRequest = indexedDB.deleteDatabase('FitLoopDB');
      deleteRequest.onsuccess = () => resolve(true);
      deleteRequest.onerror = () => resolve(false);
      deleteRequest.onblocked = () => {
        setTimeout(() => resolve(false), 1000);
      };
    });
  });
  
  console.log('🗑️ Cleared old database');
  
  // Navigate with debug mode
  await page.goto('https://5fb4dfab.fitloop-app.pages.dev?debug=true');
  await page.waitForLoadState('networkidle');
  
  // Take initial screenshot
  await page.screenshot({ path: 'test-results/01-fresh-start.png', fullPage: true });
  
  // Go to Profile tab
  console.log('📋 Navigating to Profile tab...');
  const profileTab = page.locator('button:has-text("Profile")');
  await profileTab.click();
  await page.waitForTimeout(1000);
  
  // Fill profile - should be in edit mode by default since no profile exists
  const nameInput = page.locator('input[type="text"]').first();
  await nameInput.fill('テスト花子');
  
  console.log('📝 Filled name: テスト花子');
  
  // Select first goal
  const goalButtons = page.locator('button').filter({ hasText: '筋肉' });
  if (await goalButtons.count() > 0) {
    await goalButtons.first().click();
    console.log('🎯 Selected first goal');
  }
  
  await page.screenshot({ path: 'test-results/02-before-save.png', fullPage: true });
  
  // Save profile
  const saveButton = page.locator('button:has-text("保存")');
  await saveButton.click();
  await page.waitForTimeout(3000); // Wait for save and reload
  
  console.log('💾 Saved profile, waiting for reload...');
  
  await page.screenshot({ path: 'test-results/03-after-save.png', fullPage: true });
  
  // Go to Prompt tab
  const promptTab = page.locator('button:has-text("Prompt")');
  await promptTab.click();
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'test-results/04-prompt-check.png', fullPage: true });
  
  // Check prompt content
  const promptArea = page.locator('pre').first();
  const promptContent = await promptArea.textContent();
  
  console.log(`\nPrompt content length: ${promptContent?.length || 0}`);
  console.log(`Contains user name: ${promptContent?.includes('テスト花子') ? 'YES' : 'NO'}`);
  console.log(`Contains placeholder: ${promptContent?.includes('プロフィールを設定すると') ? 'YES' : 'NO'}`);
  
  if (promptContent?.includes('テスト花子')) {
    console.log('✅ SUCCESS: Profile-based prompt generated correctly!');
  } else if (promptContent?.includes('デモユーザー')) {
    console.log('⚠️ WARNING: Still showing demo prompt instead of user profile');
  } else if (promptContent?.includes('プロフィールを設定すると')) {
    console.log('❌ ERROR: Still showing placeholder text');
  }
});