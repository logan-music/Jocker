const puppeteer = require("puppeteer");
const axios = require("axios");

// Telegram credentials
const TELEGRAM_BOT_TOKEN = "7501645118:AAHuL5xMbPY3WZXJVnidijR9gqoyyCS0BzY";
const CHAT_ID = "6978133426";

// User credentials
const PHONE_NUMBER = "618306398"; // namba yako bila "+"
const PASSWORD = "na3#";

const sendTelegramMessage = async (message) => {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: CHAT_ID,
      text: message,
    });
  } catch (err) {
    console.error("Telegram error:", err.message);
  }
};

(async () => {
  const browser =
