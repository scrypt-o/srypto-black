#!/usr/bin/env node

/**
 * Ultra-Fast Puppeteer Test Helper
 * Usage: node quick-test.js <url>
 */

const puppeteer = require('puppeteer');

async function quickTest(url) {
    console.log(`⚡ Quick testing: ${url}`);
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });
    
    const page = await browser.newPage();
    
    try {
        const start = Date.now();
        
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 });
        
        const title = await page.title();
        const isLoaded = await page.$('body') !== null;
        const loadTime = Date.now() - start;
        
        console.log(`✅ Title: ${title}`);
        console.log(`✅ Loaded: ${isLoaded}`);
        console.log(`⚡ Time: ${loadTime}ms`);
        
        // Quick screenshot
        await page.screenshot({ 
            path: `quick-${Date.now()}.png`,
            type: 'png',
            clip: { x: 0, y: 0, width: 1200, height: 800 }
        });
        console.log('📸 Screenshot saved');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await browser.close();
    }
}

if (require.main === module) {
    const url = process.argv[2];
    if (!url) {
        console.log('Usage: node quick-test.js <url>');
        process.exit(1);
    }
    quickTest(url);
}

module.exports = { quickTest };