import { test, expect } from '@playwright/test';

test('test clipboard functionality', async ({ page, context }) => {
  console.log('🔍 Testing clipboard functionality...\n');
  
  // Grant clipboard permissions
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  
  // Enable console logging
  page.on('console', msg => {
    console.log(`Browser ${msg.type()}: ${msg.text()}`);
  });
  
  // Navigate with debug mode
  await page.goto('https://cdb80310.fitloop-app.pages.dev?debug=true');
  await page.waitForLoadState('networkidle');
  
  // Wait for prompt to be generated
  await page.waitForTimeout(2000);
  
  // Check prompt content
  const promptArea = page.locator('pre').first();
  const promptContent = await promptArea.textContent();
  console.log(`Prompt content length: ${promptContent?.length || 0}`);
  
  // Find all buttons on the page
  const allButtons = await page.locator('button').allTextContents();
  console.log('All button texts:', allButtons);
  
  // Try different selectors for copy button
  const copyButton = page.locator('button').filter({ hasText: /copy|コピー/i }).first();
  const copyButtonVisible = await copyButton.isVisible().catch(() => false);
  console.log(`Copy button found: ${copyButtonVisible}`);
  
  if (!copyButtonVisible) {
    // Try icon-based selector
    const iconButton = page.locator('button:has(svg)').first();
    if (await iconButton.isVisible()) {
      console.log('Found button with icon, clicking...');
      await iconButton.click();
    }
  } else {
    // Listen for clipboard errors
    await page.evaluate(() => {
      window.addEventListener('unhandledrejection', event => {
        console.error('Unhandled rejection:', event.reason);
      });
    });
    
    // Click copy button
    await copyButton.click();
    console.log('Clicked copy button');
  }
  
  // Wait a bit
  await page.waitForTimeout(1000);
  
  // Check if button text changed to "コピー済み"
  const buttonText = await copyButton.textContent();
  console.log(`Button text after click: ${buttonText}`);
  
  // Try manual clipboard test
  const clipboardTest = await page.evaluate(async () => {
    try {
      // Test if clipboard API is available
      if (!navigator.clipboard) {
        return { error: 'Clipboard API not available' };
      }
      
      // Try to write to clipboard
      await navigator.clipboard.writeText('Test clipboard');
      
      // Try to read from clipboard
      const text = await navigator.clipboard.readText();
      
      return { 
        success: true, 
        canWrite: true,
        canRead: true,
        readText: text
      };
    } catch (error) {
      return { 
        error: error.message,
        errorName: error.name,
        canWrite: false
      };
    }
  });
  
  console.log('\nClipboard API test:', clipboardTest);
  
  // Check clipboard content using Playwright API
  const clipboardContent = await page.evaluate(() => navigator.clipboard.readText()).catch(err => null);
  console.log(`\nClipboard content via page.evaluate: ${clipboardContent ? 'Has content' : 'Empty/Error'}`);
  
  // Alternative: Use Playwright's clipboard API
  const clipboardText = await page.evaluate(() => {
    const selection = window.getSelection();
    const range = document.createRange();
    const pre = document.querySelector('pre');
    if (pre) {
      range.selectNodeContents(pre);
      selection.removeAllRanges();
      selection.addRange(range);
      return selection.toString();
    }
    return null;
  });
  
  console.log(`\nSelected text length: ${clipboardText?.length || 0}`);
  
  await page.screenshot({ path: 'test-results/clipboard-test.png', fullPage: true });
});