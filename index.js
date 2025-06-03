const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Load cookies from JSON
  const cookies = JSON.parse(fs.readFileSync('cookies.json', 'utf8')).cookies;
  await page.setCookie(...cookies);

  // Go to BetPawa
  await page.goto('https://www.betpawa.co.tz/', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  // Check login state (adjust selector to confirm you're logged in)
  try {
    await page.waitForSelector('.user-balance', { timeout: 10000 });
    console.log('✅ Logged in successfully.');
  } catch (err) {
    console.error('❌ Failed to login. Check cookies.');
    await browser.close();
    return;
  }

  // === PLACEHOLDER: Hapa ndo tutaweka logic ya kuchambua mechi na kuweka bet ===
  console.log('🤖 Ready for match analysis and betting logic...');

  await browser.close();
})();
