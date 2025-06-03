import { test, expect } from '@playwright/test';

test('debug prompt display issue', async ({ page }) => {
  console.log('🔍 Debugging prompt display issue...\n');
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'log' || msg.type() === 'error') {
      console.log(`Browser ${msg.type()}: ${msg.text()}`);
    }
  });
  
  // Navigate with debug mode
  await page.goto('https://b3481896.fitloop-app.pages.dev?debug=true');
  await page.waitForLoadState('networkidle');
  
  // Take initial screenshot
  await page.screenshot({ path: 'test-results/01-initial-state.png', fullPage: true });
  
  // Check if we need to set profile
  const profileTab = page.locator('button:has-text("Profile")');
  if (await profileTab.isVisible()) {
    console.log('📋 Navigating to Profile tab...');
    await profileTab.click();
    await page.waitForTimeout(1000);
    
    // Check if profile exists
    const profileForm = page.locator('form, [data-testid="profile-form"], input[type="text"]').first();
    if (await profileForm.isVisible()) {
      console.log('📝 Setting up profile...');
      
      // Fill profile form
      const nameInput = page.locator('input[placeholder*="名前"], input[name="name"], input').first();
      await nameInput.fill('テストユーザー');
      
      // Look for save button
      const saveButton = page.locator('button:has-text("保存"), button:has-text("Save"), button[type="submit"]');
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForTimeout(2000);
      }
    }
    
    await page.screenshot({ path: 'test-results/02-after-profile.png', fullPage: true });
  }
  
  // Navigate to Prompt tab
  const promptTab = page.locator('button:has-text("Prompt")');
  if (await promptTab.isVisible()) {
    console.log('📋 Navigating to Prompt tab...');
    await promptTab.click();
    await page.waitForTimeout(1000);
  }
  
  // Check for prompt display
  const promptArea = page.locator('textarea, pre, [data-testid="prompt-display"], .prompt-display').first();
  const isPromptVisible = await promptArea.isVisible().catch(() => false);
  
  console.log(`\nPrompt area visible: ${isPromptVisible}`);
  
  if (isPromptVisible) {
    const promptContent = await promptArea.textContent();
    console.log(`Prompt content length: ${promptContent?.length || 0} characters`);
    console.log(`Prompt preview: ${promptContent?.substring(0, 100)}...`);
  }
  
  // Check for any error messages
  const errorMessages = await page.locator('.error, [role="alert"], [class*="error"]').allTextContents();
  if (errorMessages.length > 0) {
    console.log('\n❌ Error messages found:');
    errorMessages.forEach(msg => console.log(`  - ${msg}`));
  }
  
  // Take final screenshot
  await page.screenshot({ path: 'test-results/03-prompt-tab.png', fullPage: true });
  
  // Get page structure
  const mainContent = await page.$eval('main', el => {
    return {
      innerHTML: el.innerHTML.substring(0, 500),
      childCount: el.children.length
    };
  });
  
  console.log('\n📄 Main content structure:');
  console.log(`Children: ${mainContent.childCount}`);
  console.log(`HTML preview: ${mainContent.innerHTML}...`);
  
  // Keep browser open for manual inspection
  if (process.env.DEBUG) {
    console.log('\n🔍 Browser will remain open for manual inspection...');
    await page.waitForTimeout(300000); // 5 minutes
  }
});