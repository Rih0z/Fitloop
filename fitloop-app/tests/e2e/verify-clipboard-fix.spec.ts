import { test, expect } from '@playwright/test';

test('verify clipboard copy functionality', async ({ page, context }) => {
  // Grant clipboard permissions
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  
  // Navigate to the new deployment
  await page.goto('https://8c31c22e.fitloop-app.pages.dev?debug=true');
  await page.waitForLoadState('networkidle');
  
  // Wait for prompt to be generated
  await page.waitForTimeout(2000);
  
  // Find and click copy button
  const copyButton = page.locator('button').filter({ hasText: /copy|コピー/i }).first();
  await copyButton.click();
  
  // Check if button shows "Copied" or "コピー済み"
  await page.waitForTimeout(500);
  const buttonText = await copyButton.textContent();
  console.log('Button text after click:', buttonText);
  
  // Try to read clipboard using evaluate
  const clipboardContent = await page.evaluate(async () => {
    try {
      return await navigator.clipboard.readText();
    } catch (err) {
      return 'Clipboard read failed: ' + err.message;
    }
  });
  
  console.log('Clipboard content (first 100 chars):', clipboardContent?.substring(0, 100));
  
  // Check if copy was successful
  if (buttonText?.includes('Copied') || buttonText?.includes('コピー済み')) {
    console.log('✅ Copy button shows success state');
  } else {
    console.log('⚠️ Copy button did not update to success state');
  }
  
  if (clipboardContent?.includes('脂肪燃焼')) {
    console.log('✅ Clipboard contains prompt content');
  } else {
    console.log('⚠️ Clipboard does not contain expected content');
  }
  
  await page.screenshot({ path: 'test-results/clipboard-fix.png', fullPage: true });
});