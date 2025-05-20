const axios = require('axios');
const cheerio = require('cheerio');

// Telegram Bot Credentials (weka zako mwenyewe)
const BOT_TOKEN = 'YOUR_BOT_TOKEN';
const CHAT_ID = 'YOUR_CHAT_ID';

// Utility: Tuma ujumbe Telegram
async function sendTelegramMessage(message) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await axios.post(url, {
    chat_id: CHAT_ID,
    text: message,
    parse_mode: 'Markdown'
  });
}

// Scraper Functions
async function scrapeSite(name, url, selector, extractFunc) {
  try {
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    const tips = [];

    $(selector).each((i, el) => {
      const tip = extractFunc($(el));
      if (tip) tips.push(tip);
    });

    return { source: name, tips };
  } catch (err) {
    console.error(`Error scraping ${name}:`, err.message);
    return { source: name, tips: [] };
  }
}

// Define All Sites
async function getAllTips() {
  return Promise.all([
    scrapeSite('PassionPredict', 'https://passionpredict.com/', 'div.prediction', el => el.text().trim()),
    scrapeSite('LegitPredict', 'https://legitpredict.com/', 'div.match-tips', el => el.text().trim()),
    scrapeSite('BetGenuine', 'https://betgenuine.com/', 'div.tip-card', el => el.text().trim()),
    scrapeSite('BettingVoice', 'https://bettingvoice.com/', 'div.tip-entry', el => el.text().trim()),
    scrapeSite('GoodSport', 'https://good-sport.co/', 'div.prediction-item', el => el.text().trim()),
    scrapeSite('BankerPredict', 'https://bankerpredict.com/', 'div.tip-container', el => el.text().trim()),
    scrapeSite('FocusPredict', 'https://focuspredict.com/', 'div.game-card', el => el.text().trim()),
    scrapeSite('SupaTips', 'https://www.supatips.com/', 'div.tip-card', el => el.text().trim())
  ]);
}

// Compare Tips and Send Alerts
function findCommonTips(allTips) {
  const map = {};
  for (const { source, tips } of allTips) {
    for (const tip of tips) {
      const key = tip.toLowerCase();
      if (!map[key]) map[key] = { tip, sources: [] };
      map[key].sources.push(source);
    }
  }

  return Object.values(map).filter(t => t.sources.length > 1);
}

// Scheduler
async function runBot() {
  console.log('Running scraping cycle at', new Date().toLocaleString());
  const allTips = await getAllTips();
  const repeatedTips = findCommonTips(allTips);

  if (repeatedTips.length === 0) {
    console.log('Hakuna mechi zinazojirudia.');
    return;
  }

  for (const item of repeatedTips) {
    const msg = `**Tip:** ${item.tip}\n**Sources:** ${item.sources.join(', ')}`;
    await sendTelegramMessage(msg);
    console.log('Sent:', msg);
  }
}

// Dummy Server for Render Uptime
require('http')
  .createServer((req, res) => res.end('Bot is running'))
  .listen(process.env.PORT || 3000, () => console.log('Bot started...'));

// Run every 10 minutes
setInterval(runBot, 10 * 60 * 1000);
runBot();
