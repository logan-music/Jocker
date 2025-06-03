const puppeteer = require('puppeteer');
const fs = require('fs');

// Load cookies from file
const cookies = require('./cookies.json');

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // kwa test, tunataka tuone kila kitu
    args: ['--start-maximized']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  // Apply cookies
  await page.setCookie(...cookies.cookies);

  // Open BetPawa homepage
  await page.goto('https://www.betpawa.co.tz', { waitUntil: 'networkidle2' });

  // Angalia kama imeingia vizuri (unaweza kubadili selector)
  await page.waitForTimeout(5000);

  // For now, just stay there
})();
