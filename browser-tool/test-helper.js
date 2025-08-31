#!/usr/bin/env node

/**
 * Fast Direct Playwright Helper
 * Usage: node test-helper.js <url> [action]
 */

const { chromium } = require('playwright');

async function testPage(url, action = 'screenshot') {
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    
    try {
        console.log(`🌐 Loading: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
        
        switch(action) {
            case 'screenshot':
                await page.screenshot({ 
                    path: `test-${Date.now()}.png`,
                    fullPage: true 
                });
                console.log('📸 Screenshot saved');
                break;
                
            case 'content':
                const content = await page.content();
                console.log('📄 Page HTML length:', content.length);
                break;
                
            case 'title':
                const title = await page.title();
                console.log('📝 Page title:', title);
                break;
                
            case 'check':
                const isLoaded = await page.isVisible('body');
                console.log('✅ Page loaded:', isLoaded);
                break;
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await browser.close();
    }
}

// CLI usage
if (require.main === module) {
    const [url, action] = process.argv.slice(2);
    if (!url) {
        console.log('Usage: node test-helper.js <url> [screenshot|content|title|check]');
        process.exit(1);
    }
    testPage(url, action);
}

module.exports = { testPage };