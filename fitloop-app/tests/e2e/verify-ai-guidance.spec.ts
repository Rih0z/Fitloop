import { test, expect } from '@playwright/test';

test('verify AI service guidance is displayed', async ({ page }) => {
  // Navigate with debug mode
  await page.goto('https://cdb80310.fitloop-app.pages.dev?debug=true');
  await page.waitForLoadState('networkidle');
  
  // Go to AI応答 tab in the right panel
  const aiTab = page.locator('button:has-text("AI応答")');
  await aiTab.click();
  await page.waitForTimeout(500);
  
  // Check for AI guidance content
  const guidanceContent = await page.textContent('body');
  
  // Verify guidance elements
  expect(guidanceContent).toContain('AI応答の取得方法');
  expect(guidanceContent).toContain('Claude (Anthropic)');
  expect(guidanceContent).toContain('Gemini (Google)');
  expect(guidanceContent).toContain('ChatGPT (OpenAI)');
  expect(guidanceContent).toContain('ユーザー数が増加次第、AI生成機能を直接実装予定です');
  
  // Check that AI生成 button is removed
  const aiGenerateButton = page.locator('button:has-text("AI生成")');
  expect(await aiGenerateButton.count()).toBe(0);
  
  // Check placeholder text
  const textarea = page.locator('textarea');
  const placeholder = await textarea.getAttribute('placeholder');
  expect(placeholder).toContain('Claude、Gemini、ChatGPTからの応答をここに貼り付けてください');
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/ai-guidance.png', fullPage: true });
  
  console.log('✅ AI service guidance is properly displayed');
});