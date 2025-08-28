const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newContext().then(c => c.newPage());
  
  // Navigate to test page
  console.log('Navigating to test UI page...');
  await page.goto('http://localhost:4569/test-ui');
  await page.waitForLoadState('networkidle');
  
  // Take screenshot
  await page.screenshot({ 
    path: 'test-ui-full.png',
    fullPage: true 
  });
  console.log('✅ Screenshot saved: test-ui-full.png');
  
  // Test filter panel
  console.log('\nTesting filter panel...');
  const filterButton = await page.locator('button:has-text("Filters")').first();
  await filterButton.click();
  console.log('✅ Filter panel opened');
  
  // Wait a moment for animation
  await page.waitForTimeout(500);
  
  // Take screenshot with filter panel open
  await page.screenshot({ 
    path: 'test-ui-filter-panel.png',
    fullPage: false 
  });
  console.log('✅ Screenshot with filter panel: test-ui-filter-panel.png');
  
  await browser.close();
  console.log('\n✅ Test complete!');
})();