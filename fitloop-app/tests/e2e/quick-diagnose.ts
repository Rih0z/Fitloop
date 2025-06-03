import { chromium } from 'playwright';

async function diagnoseTabIssue() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🚀 Starting FitLoop tab visibility diagnosis...\n');
  
  // Test 1: Normal URL
  console.log('📍 Test 1: Loading normal URL...');
  await page.goto('https://6af06d79.fitloop.pages.dev');
  await page.waitForLoadState('networkidle');
  
  // Check what's visible
  const authModal = await page.$('[role="dialog"], .modal');
  if (authModal) {
    console.log('❌ Authentication modal is blocking the view');
    console.log('   The app requires authentication before showing the main UI\n');
  }
  
  // Test 2: Debug mode
  console.log('📍 Test 2: Loading with debug mode...');
  await page.goto('https://6af06d79.fitloop.pages.dev?debug=true');
  await page.waitForLoadState('networkidle');
  
  // Look for tabs
  const tabBar = await page.$('nav, .tab-bar, [role="tablist"]');
  const tabButtons = await page.$$('button[role="tab"], .tab-button');
  
  if (tabBar) {
    console.log('✅ Tab bar found!');
    console.log(`   Found ${tabButtons.length} tab buttons`);
    
    // Get tab names
    for (const button of tabButtons) {
      const text = await button.textContent();
      console.log(`   - Tab: ${text}`);
    }
  } else {
    console.log('❌ Tab bar not found');
    
    // Check if it's hidden by CSS
    const hiddenTabBar = await page.$eval('body', () => {
      const tabBar = document.querySelector('.fixed.bottom-0') || 
                     document.querySelector('[class*="tab"]') ||
                     document.querySelector('nav');
      if (tabBar) {
        const styles = window.getComputedStyle(tabBar);
        return {
          found: true,
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity
        };
      }
      return { found: false };
    });
    
    if (hiddenTabBar.found) {
      console.log('   Tab bar exists but may be hidden:');
      console.log(`   - display: ${hiddenTabBar.display}`);
      console.log(`   - visibility: ${hiddenTabBar.visibility}`);
      console.log(`   - opacity: ${hiddenTabBar.opacity}`);
    }
  }
  
  // Test 3: Console errors
  console.log('\n📍 Test 3: Checking for JavaScript errors...');
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  await page.reload();
  await page.waitForTimeout(2000);
  
  if (errors.length > 0) {
    console.log(`❌ Found ${errors.length} JavaScript errors:`);
    errors.forEach(err => console.log(`   - ${err}`));
  } else {
    console.log('✅ No JavaScript errors found');
  }
  
  // Summary
  console.log('\n📊 DIAGNOSIS SUMMARY:');
  console.log('====================');
  console.log('1. The app shows an authentication modal on first load');
  console.log('2. Use ?debug=true to bypass authentication');
  console.log('3. Direct link with debug mode: https://6af06d79.fitloop.pages.dev?debug=true');
  console.log('\nThe browser window will remain open for manual inspection.');
  console.log('Press Ctrl+C to close when done.\n');
  
  // Keep browser open for manual inspection
  await page.waitForTimeout(300000); // 5 minutes
}

diagnoseTabIssue().catch(console.error);