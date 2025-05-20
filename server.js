const axios = require('axios');
const cheerio = require('cheerio');
const TelegramBot = require('node-telegram-bot-api');

const TELEGRAM_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const bot = new TelegramBot(TELEGRAM_TOKEN);

console.log("Bot started...");

async function scrapePassionPredict() {
  try {
    const { data } = await axios.get('https://passionpredict.com/');
    const $ = cheerio.load(data);
    const matches = [];

    $('table tbody tr').each((_, el) => {
      const teams = $(el).find('td').eq(0).text().trim();
      const tip = $(el).find('td').eq(1).text().trim();
      if (teams && tip) {
        matches.push({ teams, tip, source: 'PassionPredict' });
      }
    });

    return matches;
  } catch (err) {
    console.error('Error scraping PassionPredict:', err.message);
    return [];
  }
}

async function scrapeBetGenuine() {
  try {
    const { data } = await axios.get('https://betgenuine.com/');
    const $ = cheerio.load(data);
    const matches = [];

    $('.match-card').each((_, el) => {
      const teams = $(el).find('.match-title').text().trim();
      const tip = $(el).find('.match-tip').text().trim();

      if (teams && tip) {
        matches.push({ teams, tip, source: 'BetGenuine' });
      }
    });

    return matches;
  } catch (err) {
    console.error('Error scraping BetGenuine:', err.message);
    return [];
  }
}

async function scrapeLegitPredict() {
  try {
    const { data } = await axios.get('https://legitpredict.com/');
    const $ = cheerio.load(data);
    const matches = [];

    $('table tbody tr').each((_, el) => {
      const teams = $(el).find('td').eq(0).text().trim();
      const tip = $(el).find('td').eq(1).text().trim();
      if (teams && tip) {
        matches.push({ teams, tip, source: 'LegitPredict' });
      }
    });

    return matches;
  } catch (err) {
    console.error('Error scraping LegitPredict:', err.message);
    return [];
  }
}

function normalizeText(text) {
  return text.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
}

async function main() {
  console.log("Running scraping cycle at", new Date().toLocaleString());

  const results = await Promise.all([
    scrapePassionPredict(),
    scrapeBetGenuine(),
    scrapeLegitPredict()
  ]);

  const allMatches = results.flat();
  const grouped = {};

  for (const match of allMatches) {
    const key = normalizeText(match.teams + match.tip);
    if (!grouped[key]) {
      grouped[key] = { teams: match.teams, tip: match.tip, sources: [] };
    }
    if (!grouped[key].sources.includes(match.source)) {
      grouped[key].sources.push(match.source);
    }
  }

  const repeatedTips = Object.values(grouped).filter(m => m.sources.length >= 2);

  if (repeatedTips.length === 0) {
    console.log("Hakuna mechi zinazojirudia.");
    return;
  }

  for (const match of repeatedTips) {
    const msg = `**Mechi:** ${match.teams}\n**Tip:** ${match.tip}\n**Sources:** ${match.sources.join(', ')}`;
    await bot.sendMessage(CHAT_ID, msg, { parse_mode: 'Markdown' });
    console.log("Sent:", msg);
  }
}

// Run now and every 10 minutes
main();
setInterval(main, 10 * 60 * 1000);
