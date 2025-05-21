const axios = require('axios');
const cheerio = require('cheerio');

// Telegram Bot Credentials
const BOT_TOKEN = 'YOUR_BOT_TOKEN';  // Replace with your token
const CHAT_ID = 'YOUR_CHAT_ID';      // Replace with your chat ID

async function sendTelegramMessage(message) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await axios.post(url, {
    chat_id: CHAT_ID,
    text: message,
    parse_mode: 'Markdown'
  });
}

function formatTip(match, tip) {
  if (!match || !tip) return null;
  const m = match.replace(/\s+/g, ' ').trim();
  const t = tip.replace(/\s+/g, ' ').trim();
  return `${m} - ${t}`.toLowerCase(); // Normalize for comparison
}

async function scrapeSite(name, url, selector, extractFunc) {
  try {
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const $ = cheerio.load(res.data);
    const tips = [];

    $(selector).each((i, el) => {
      const tip = extractFunc($(el));
      if (tip) tips.push(tip);
    });

    console.log(`✔️ ${name}: ${tips.length} tips scraped`);
    return { source: name, tips };
  } catch (err) {
    console.error(`❌ Error scraping ${name}:`, err.message);
    return { source: name, tips: [] };
  }
}

async function getAllTips() {
  return Promise.all([
    scrapeSite('PassionPredict', 'https://passionpredict.com/', 'div.match-card', el => {
      const match = el.find('.fixture').text() || el.find('.teams').text();
      const tip = el.find('.bet-type').text() || el.find('.prediction').text();
      return formatTip(match, tip);
    }),

    scrapeSite('LegitPredict', 'https://legitpredict.com/', 'div.match-box', el => {
      const match = el.find('.teams').text();
      const tip = el.find('.tip').text();
      return formatTip(match, tip);
    }),

    scrapeSite('BetGenuine', 'https://betgenuine.com/', 'div.match-card', el => {
      const match = el.find('.match-title').text() || el.find('.teams').text();
      const tip = el.find('.bet-type').text() || el.find('.tip').text();
      return formatTip(match, tip);
    }),

    scrapeSite('BettingVoice', 'https://bettingvoice.com/', 'div.tip-entry', el => {
      const match = el.find('.match-info').text() || el.find('.fixture').text();
      const tip = el.find('.prediction').text() || el.find('.tip').text();
      return formatTip(match, tip);
    }),

    scrapeSite('GoodSport', 'https://good-sport.co/', 'div.prediction-item', el => {
      const match = el.find('.match-title').text() || el.find('.teams').text();
      const tip = el.find('.bet-type').text() || el.find('.prediction').text();
      return formatTip(match, tip);
    }),

    scrapeSite('BankerPredict', 'https://bankerpredict.com/', 'div.tip-container', el => {
      const match = el.find('.teams').text();
      const tip = el.find('.tip').text() || el.find('.bet').text();
      return formatTip(match, tip);
    }),

    scrapeSite('FocusPredict', 'https://focuspredict.com/', 'div.game-card', el => {
      const match = el.find('.match-info').text() || el.find('.fixture').text();
      const tip = el.find('.prediction').text() || el.find('.tip').text();
      return formatTip(match, tip);
    }),

    scrapeSite('SupaTips', 'https://www.supatips.com/', 'div.tip-card', el => {
      const match = el.find('.teams').text();
      const tip = el.find('.bet-type').text() || el.find('.tip').text();
      return formatTip(match, tip);
    })
  ]);
}

function findCommonTips(allTips) {
  const map = {};
  for (const { source, tips } of allTips) {
    for (const tip of tips) {
      if (!map[tip]) map[tip] = { tip, sources: [] };
      map[tip].sources.push(source);
    }
  }
  return Object.values(map).filter(t => t.sources.length > 1);
}

async function runBot() {
  console.log('\n--------------------------------------');
  console.log('⏱️ Running scraping cycle:', new Date().toLocaleString());

  const allTips = await getAllTips();
  const repeatedTips = findCommonTips(allTips);

  if (repeatedTips.length === 0) {
    console.log('⚠️ Hakuna mechi zinazojirudia.');
    return;
  }

  for (const item of repeatedTips) {
    const msg = `*Tip:* ${item.tip}\n*Sources:* ${item.sources.join(', ')}`;
    await sendTelegramMessage(msg);
    console.log('✅ Sent:', msg);
  }
}

// Start dummy server
require('http')
  .createServer((req, res) => res.end('Bot is running'))
  .listen(process.env.PORT || 3000, () => console.log('🚀 Bot started...'));

// Run every 10 minutes
setInterval(runBot, 10 * 60 * 1000);
runBot();