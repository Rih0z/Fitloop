import { test, expect } from '@playwright/test';

test('verify debug mode shows tabs', async ({ page }) => {
  // Navigate to the new deployment with debug mode
  await page.goto('https://b3481896.fitloop-app.pages.dev?debug=true');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/debug-mode-fixed.png', fullPage: true });
  
  // Check for tab bar
  const tabBar = await page.$('nav');
  const isTabBarVisible = await tabBar?.isVisible() ?? false;
  
  console.log('Tab bar visible:', isTabBarVisible);
  
  // Check for specific tabs
  const tabs = await page.$$('nav button');
  console.log('Number of tabs found:', tabs.length);
  
  // Get tab text
  for (const tab of tabs) {
    const text = await tab.textContent();
    console.log('Tab:', text?.trim());
  }
  
  // Check that auth modal is NOT shown
  const authModal = await page.$('[role="dialog"]');
  const isAuthModalVisible = await authModal?.isVisible() ?? false;
  console.log('Auth modal visible:', isAuthModalVisible);
  
  expect(isTabBarVisible).toBe(true);
  expect(tabs.length).toBeGreaterThan(0);
  expect(isAuthModalVisible).toBe(false);
});