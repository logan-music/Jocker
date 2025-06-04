const puppeteer = require("puppeteer");

const PHONE = "618306398"; // bila +255
const PASSWORD = "na3#";

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto("https://www.betpawa.co.tz/login", {
      waitUntil: "networkidle2",
    });

    // Subiri input ya simu na password ionekane
    await page.waitForSelector("input[type='tel']", { timeout: 10000 });
    await page.waitForSelector("input[type='password']", { timeout: 10000 });

    // Weka simu na password
    await page.type("input[type='tel']", PHONE, { delay: 100 });
    await page.type("input[type='password']", PASSWORD, { delay: 100 });

    // Subiri button ya "LOG IN" ienable
    await page.waitForFunction(() => {
      const btn = document.querySelector("button[type='submit']");
      return btn && !btn.disabled;
    }, { timeout: 10000 });

    // Bofya login
    await page.click("button[type='submit']");

    // Subiri uingie ndani (mfano: angalia kama "account" inaonekana)
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    console.log("✅ Login successful!");

    // Fanya kitu kingine hapa kama kuchukua bets etc...

  } catch (err) {
    console.error("❌ Login process failed:", err);
  } finally {
    // Ukitaka kuendelea, usifunge browser
    // await browser.close();
  }
})();
