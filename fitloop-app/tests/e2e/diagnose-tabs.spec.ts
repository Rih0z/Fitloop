import { test, expect } from '@playwright/test';

const DEPLOYED_URL = 'https://6af06d79.fitloop.pages.dev';
const DEBUG_URL = `${DEPLOYED_URL}?debug=true`;

test.describe('Diagnose Tab Visibility Issue', () => {
  test('check normal page load without debug mode', async ({ page }) => {
    console.log('🔍 Testing normal page load...');
    
    // Navigate to the deployed site
    await page.goto(DEPLOYED_URL);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'test-results/01-initial-load.png', 
      fullPage: true 
    });
    
    // Wait for any loading to complete
    await page.waitForLoadState('networkidle');
    
    // Check for authentication modal
    const authModal = page.locator('[role="dialog"], .modal, [data-testid="auth-modal"]');
    const isAuthModalVisible = await authModal.isVisible().catch(() => false);
    
    if (isAuthModalVisible) {
      console.log('❌ Auth modal is blocking the view');
      await page.screenshot({ 
        path: 'test-results/02-auth-modal-visible.png', 
        fullPage: true 
      });
    }
    
    // Check for tab bar
    const tabBar = page.locator('nav, .tab-bar, [role="tablist"], [data-testid="tab-bar"]');
    const isTabBarVisible = await tabBar.isVisible().catch(() => false);
    
    console.log(`Tab bar visible: ${isTabBarVisible}`);
    
    // Check for specific tab buttons
    const tabButtons = page.locator('button[role="tab"], .tab-button, [data-testid*="tab"]');
    const tabCount = await tabButtons.count();
    
    console.log(`Found ${tabCount} tab buttons`);
    
    // Log page structure
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    console.log('Page structure preview:', bodyHTML.substring(0, 500));
  });

  test('check page with debug mode enabled', async ({ page }) => {
    console.log('🔍 Testing with debug mode...');
    
    // Navigate with debug mode
    await page.goto(DEBUG_URL);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/03-debug-mode.png', 
      fullPage: true 
    });
    
    // Check for tab bar visibility
    const tabBar = page.locator('nav, .tab-bar, [role="tablist"]');
    await expect(tabBar).toBeVisible({ timeout: 10000 });
    
    // Check for tab buttons
    const tabButtons = page.locator('button[role="tab"], .tab-button');
    const tabCount = await tabButtons.count();
    
    console.log(`Found ${tabCount} tab buttons in debug mode`);
    
    // Check each tab
    for (let i = 0; i < tabCount; i++) {
      const tab = tabButtons.nth(i);
      const isVisible = await tab.isVisible();
      const text = await tab.textContent();
      console.log(`Tab ${i + 1}: "${text}" - Visible: ${isVisible}`);
    }
    
    // Check for main content area
    const mainContent = page.locator('main, .main-content, [role="main"]');
    const isMainVisible = await mainContent.isVisible().catch(() => false);
    console.log(`Main content visible: ${isMainVisible}`);
  });

  test('detailed element inspection', async ({ page }) => {
    console.log('🔍 Performing detailed element inspection...');
    
    await page.goto(DEBUG_URL);
    await page.waitForLoadState('networkidle');
    
    // Get all elements with potential tab functionality
    const selectors = [
      'nav',
      '.tab-bar',
      '[role="tablist"]',
      '[role="tab"]',
      '.tab-button',
      '.TabBar',
      'button[aria-selected]',
      '[data-testid*="tab"]',
      '.fixed.bottom-0', // Fixed bottom navigation
      '.mobile-nav',
      '.bottom-navigation'
    ];
    
    for (const selector of selectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        console.log(`✅ Found ${count} elements matching: ${selector}`);
        
        // Get computed styles of first element
        const styles = await elements.first().evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            display: computed.display,
            visibility: computed.visibility,
            opacity: computed.opacity,
            position: computed.position,
            bottom: computed.bottom,
            zIndex: computed.zIndex,
            height: computed.height,
            width: computed.width
          };
        });
        
        console.log(`   Styles:`, styles);
      }
    }
    
    // Check console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });
    
    // Take final diagnostic screenshot
    await page.screenshot({ 
      path: 'test-results/04-element-inspection.png', 
      fullPage: true 
    });
  });

  test('mobile viewport test', async ({ page }) => {
    console.log('🔍 Testing mobile viewport...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(DEBUG_URL);
    await page.waitForLoadState('networkidle');
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: 'test-results/05-mobile-view.png', 
      fullPage: true 
    });
    
    // Check for mobile navigation
    const mobileNav = page.locator('.mobile-nav, .tab-bar-modern, nav');
    const isMobileNavVisible = await mobileNav.isVisible().catch(() => false);
    
    console.log(`Mobile navigation visible: ${isMobileNavVisible}`);
    
    // Scroll to bottom to ensure tab bar is in view
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'test-results/06-mobile-scrolled.png', 
      fullPage: true 
    });
  });

  test('generate diagnostic report', async ({ page }) => {
    console.log('📊 Generating diagnostic report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      url: DEPLOYED_URL,
      findings: [],
      recommendations: []
    };
    
    // Test normal mode
    await page.goto(DEPLOYED_URL);
    await page.waitForLoadState('networkidle');
    
    const authModalExists = await page.locator('[role="dialog"], .modal').isVisible().catch(() => false);
    if (authModalExists) {
      report.findings.push('Authentication modal is blocking the main UI');
      report.recommendations.push('Use debug mode URL parameter (?debug=true) to bypass authentication');
    }
    
    // Test debug mode
    await page.goto(DEBUG_URL);
    await page.waitForLoadState('networkidle');
    
    const tabBarInDebug = await page.locator('nav, .tab-bar, [role="tablist"]').isVisible().catch(() => false);
    if (tabBarInDebug) {
      report.findings.push('Tab bar is visible in debug mode');
    } else {
      report.findings.push('Tab bar is NOT visible even in debug mode');
      report.recommendations.push('Check CSS styles for display:none or visibility:hidden');
      report.recommendations.push('Verify TabBar component is being rendered');
    }
    
    // Check for JavaScript errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    if (errors.length > 0) {
      report.findings.push(`Found ${errors.length} JavaScript errors`);
      report.recommendations.push('Fix JavaScript errors that might prevent proper rendering');
    }
    
    console.log('\n📋 DIAGNOSTIC REPORT:');
    console.log('====================');
    console.log('Findings:');
    report.findings.forEach(f => console.log(`- ${f}`));
    console.log('\nRecommendations:');
    report.recommendations.forEach(r => console.log(`- ${r}`));
    
    // Save report
    await page.evaluate((reportData) => {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'tab-diagnostic-report.json';
      a.click();
    }, report);
  });
});