const puppeteer = require("puppeteer");
const axios = require("axios");

// Telegram credentials
const BOT_TOKEN = "7501645118:AAHuL5xMbPY3WZXJVnidijR9gqoyyCS0BzY";
const CHAT_ID = "6978133426";

// BetPawa login details
const PHONE_NUMBER = "618306398"; // Bila +255
const PASSWORD = "na3#"; // badilisha hii

// Helper function: Send message to Telegram
async function sendTelegramMessage(message) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: CHAT_ID,
      text: message
    });
  } catch (err) {
    console.error("Telegram Error:", err.message);
  }
}

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto("https://www.betpawa.co.tz/login", {
    waitUntil: "networkidle2",
  });

  try {
    // Andika namba ya simu
    await page.waitForSelector("input[type='tel']");
    await page.type("input[type='tel']", PHONE_NUMBER, { delay: 100 });

    // Bonyeza "Next" au "Continue"
    await page.click("button[type='submit']");
    await page.waitForTimeout(2000);

    // Andika password
    await page.waitForSelector("input[type='password']", { timeout: 5000 });
    await page.type("input[type='password']", PASSWORD, { delay: 100 });

    // Submit password
    await page.click("button[type='submit']");
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    // Check kama login imefanikiwa
    const isLoggedIn = await page.evaluate(() => {
      return !!document.querySelector("[data-test-id='header-balance']");
    });

    if (isLoggedIn) {
      await sendTelegramMessage("✅ Login successful on BetPawa!");

      // Save cookies
      const cookies = await page.cookies();
      const fs = require("fs");
      fs.writeFileSync("cookies.json", JSON.stringify(cookies, null, 2));
    } else {
      await sendTelegramMessage("❌ Login failed! Check phone number or password.");
    }
  } catch (err) {
    console.error("Login process failed:", err);
    await sendTelegramMessage("❌ Error during login: " + err.message);
  }

  await browser.close();
})();