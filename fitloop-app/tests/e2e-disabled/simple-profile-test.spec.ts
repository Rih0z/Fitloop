import { test, expect } from '@playwright/test';

test('simple profile setup test', async ({ page }) => {
  console.log('🔍 Testing simple profile setup...\n');
  
  // Enable console logging for debugging
  page.on('console', msg => {
    if (msg.type() === 'log' && msg.text().includes('Prompt generation')) {
      console.log(`🔍 ${msg.text()}`);
    }
  });
  
  // Navigate with debug mode and fresh session
  await page.goto('https://5fb4dfab.fitloop-app.pages.dev?debug=true&t=' + Date.now());
  await page.waitForLoadState('networkidle');
  
  // Check initial prompt state
  console.log('📋 Checking initial prompt state...');
  const promptTab = page.locator('button:has-text("Prompt")');
  await promptTab.click();
  await page.waitForTimeout(1000);
  
  const initialPromptArea = page.locator('pre').first();
  const initialContent = await initialPromptArea.textContent();
  console.log(`Initial prompt: ${initialContent?.substring(0, 100)}...`);
  
  // Go to Profile tab
  console.log('📋 Going to Profile tab...');
  const profileTab = page.locator('button:has-text("Profile")');
  await profileTab.click();
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'test-results/profile-page.png', fullPage: true });
  
  // Check current profile state
  const profileContent = await page.textContent('body');
  console.log(`Profile page contains edit mode: ${profileContent?.includes('保存') ? 'YES' : 'NO'}`);
  
  // Try to find and fill name input
  const nameInput = page.locator('input[type="text"]').first();
  if (await nameInput.isVisible()) {
    await nameInput.clear();
    await nameInput.fill('プロフィールテスト');
    console.log('📝 Filled name input');
    
    // Try to save
    const saveButton = page.locator('button:has-text("保存")');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      console.log('💾 Clicked save button');
      await page.waitForTimeout(2000);
    }
  }
  
  // Return to Prompt tab
  console.log('🔄 Returning to Prompt tab...');
  await promptTab.click();
  await page.waitForTimeout(2000);
  
  // Check final prompt state
  const finalPromptArea = page.locator('pre').first();
  const finalContent = await finalPromptArea.textContent();
  
  console.log(`\nFinal prompt length: ${finalContent?.length || 0}`);
  console.log(`Contains test name: ${finalContent?.includes('プロフィールテスト') ? 'YES' : 'NO'}`);
  console.log(`Contains demo user: ${finalContent?.includes('デモユーザー') ? 'YES' : 'NO'}`);
  console.log(`Contains placeholder: ${finalContent?.includes('プロフィールを設定すると') ? 'YES' : 'NO'}`);
  
  await page.screenshot({ path: 'test-results/final-prompt.png', fullPage: true });
  
  if (finalContent?.includes('プロフィールテスト')) {
    console.log('✅ SUCCESS: Profile was saved and prompt updated!');
  } else {
    console.log('❌ ISSUE: Profile was not properly reflected in prompt');
  }
});