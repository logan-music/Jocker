const puppeteer = require("puppeteer");
const fs = require("fs");

const PHONE = "618306398";      // ← badilisha na namba yako ya simu
const PASSWORD = "na3#"; // ← badilisha na password yako

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  await page.goto("https://www.betpawa.co.tz/login", { waitUntil: "networkidle2" });

  await page.type('input[name="phoneNumber"]', PHONE);
  await page.type('input[name="password"]', PASSWORD);

  await page.click('button[data-test-id="login-button"]');

  // Subiri redirect na uthibitishe kama umeingia kwa kuangalia balance
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  const loggedIn = await page.evaluate(() => {
    return !!document.querySelector('[data-test-id="header-balance"]');
  });

  if (loggedIn) {
    console.log("✅ Login successful!");

    const cookies = await page.cookies();
    fs.writeFileSync("cookies.json", JSON.stringify(cookies, null, 2));
    console.log("✅ Cookies saved to cookies.json");
  } else {
    console.log("❌ Login failed. Check credentials.");
  }

  await browser.close();
})();