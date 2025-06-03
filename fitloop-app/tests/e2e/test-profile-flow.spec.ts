import { test, expect } from '@playwright/test';

test('test complete profile setup flow', async ({ page }) => {
  console.log('🔍 Testing profile setup and prompt generation flow...\n');
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'log' || msg.type() === 'error') {
      console.log(`Browser ${msg.type()}: ${msg.text()}`);
    }
  });
  
  // Navigate with debug mode
  await page.goto('https://c65f8076.fitloop-app.pages.dev?debug=true');
  await page.waitForLoadState('networkidle');
  
  // Take initial screenshot
  await page.screenshot({ path: 'test-results/01-initial.png', fullPage: true });
  
  // Go to Profile tab
  console.log('📋 Navigating to Profile tab...');
  const profileTab = page.locator('button:has-text("Profile")');
  await profileTab.click();
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'test-results/02-profile-tab.png', fullPage: true });
  
  // Check if there's already a profile or if we need to create one
  const editButton = page.locator('button:has-text("編集"), button:has-text("Edit")');
  const nameInput = page.locator('input[placeholder*="名前"], input[name="name"], input[type="text"]').first();
  
  if (await editButton.isVisible()) {
    console.log('📝 Found existing profile, clicking edit...');
    await editButton.click();
    await page.waitForTimeout(500);
  }
  
  // Fill out profile form
  if (await nameInput.isVisible()) {
    console.log('📝 Filling profile form...');
    
    // Clear and fill name
    await nameInput.clear();
    await nameInput.fill('テスト太郎');
    
    // Find and select goals
    const goalButtons = page.locator('button[data-goal], .goal-option, button:has-text("筋肉"), button:has-text("体力")');
    const goalCount = await goalButtons.count();
    console.log(`Found ${goalCount} goal options`);
    
    if (goalCount > 0) {
      await goalButtons.first().click();
      await page.waitForTimeout(500);
    }
    
    // Find and select environment
    const envButtons = page.locator('button[data-env], .env-option, button:has-text("ジム"), button:has-text("自宅")');
    const envCount = await envButtons.count();
    console.log(`Found ${envCount} environment options`);
    
    if (envCount > 0) {
      await envButtons.first().click();
      await page.waitForTimeout(500);
    }
    
    await page.screenshot({ path: 'test-results/03-form-filled.png', fullPage: true });
    
    // Save profile
    const saveButton = page.locator('button:has-text("保存"), button:has-text("Save"), button[type="submit"]');
    if (await saveButton.isVisible()) {
      console.log('💾 Saving profile...');
      await saveButton.click();
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ path: 'test-results/04-after-save.png', fullPage: true });
  }
  
  // Navigate back to Prompt tab
  console.log('📋 Navigating to Prompt tab...');
  const promptTab = page.locator('button:has-text("Prompt")');
  await promptTab.click();
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'test-results/05-prompt-tab.png', fullPage: true });
  
  // Check prompt content
  const promptArea = page.locator('pre, textarea, [data-testid="prompt-display"]').first();
  const isPromptVisible = await promptArea.isVisible();
  
  console.log(`\nPrompt area visible: ${isPromptVisible}`);
  
  if (isPromptVisible) {
    const promptContent = await promptArea.textContent();
    console.log(`Prompt content length: ${promptContent?.length || 0} characters`);
    console.log(`Prompt preview: ${promptContent?.substring(0, 200)}...`);
    
    // Check if it's still showing placeholder
    if (promptContent?.includes('プロフィールを設定すると')) {
      console.log('❌ Still showing placeholder text after profile setup');
    } else if (promptContent?.includes('テスト太郎') || promptContent?.length > 1000) {
      console.log('✅ Prompt generated successfully with profile data');
    } else {
      console.log('⚠️ Prompt exists but may not contain profile data');
    }
  }
  
  // Check for any error messages
  const errorMessages = await page.locator('.error, [role="alert"], [class*="error"]').allTextContents();
  if (errorMessages.length > 0) {
    console.log('\n❌ Error messages found:');
    errorMessages.forEach(msg => console.log(`  - ${msg}`));
  }
  
  // Check localStorage/IndexedDB state
  const dbState = await page.evaluate(async () => {
    // Check if profile is in localStorage
    const profileData = localStorage.getItem('profile');
    
    // Check IndexedDB
    let dbProfile = null;
    try {
      const dbRequest = indexedDB.open('FitLoopDB', 3);
      const db = await new Promise((resolve, reject) => {
        dbRequest.onsuccess = () => resolve(dbRequest.result);
        dbRequest.onerror = () => reject(dbRequest.error);
      });
      
      if (db && db.objectStoreNames.contains('profiles')) {
        const transaction = db.transaction(['profiles'], 'readonly');
        const store = transaction.objectStore('profiles');
        const getAllRequest = store.getAll();
        
        dbProfile = await new Promise((resolve) => {
          getAllRequest.onsuccess = () => resolve(getAllRequest.result);
          getAllRequest.onerror = () => resolve(null);
        });
      }
    } catch (e) {
      console.log('DB check error:', e);
    }
    
    return {
      localStorage: profileData,
      indexedDB: dbProfile
    };
  });
  
  console.log('\n💾 Storage state:');
  console.log('localStorage profile:', dbState.localStorage ? 'exists' : 'null');
  console.log('IndexedDB profiles:', Array.isArray(dbState.indexedDB) ? `${dbState.indexedDB.length} profiles` : 'no data');
  
  await page.screenshot({ path: 'test-results/06-final-state.png', fullPage: true });
});