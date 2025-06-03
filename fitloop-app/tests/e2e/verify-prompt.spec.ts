import { test, expect } from '@playwright/test';

test('verify prompt display in debug mode', async ({ page }) => {
  // Navigate to the new deployment with debug mode
  await page.goto('https://c65f8076.fitloop-app.pages.dev?debug=true');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Check that we're on the prompt tab by default
  const promptTab = page.locator('button:has-text("Prompt")');
  await expect(promptTab).toBeVisible();
  
  // Wait for prompt to be generated
  await page.waitForTimeout(2000);
  
  // Check for prompt content
  const promptArea = page.locator('pre');
  await expect(promptArea).toBeVisible();
  
  const promptContent = await promptArea.textContent();
  console.log('Prompt content length:', promptContent?.length);
  console.log('Prompt preview:', promptContent?.substring(0, 200));
  
  // Check that it's not the placeholder text
  expect(promptContent).not.toContain('プロフィールを設定すると、ここにプロンプトが表示されます');
  
  // Check that it contains demo user info
  expect(promptContent).toContain('デモユーザー');
  expect(promptContent).toContain('筋肉を大きくしたい');
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/prompt-display-working.png', fullPage: true });
  
  console.log('✅ Prompt is displaying correctly in debug mode');
});