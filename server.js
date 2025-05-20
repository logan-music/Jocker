const axios = require('axios');
const cheerio = require('cheerio');
const TelegramBot = require('node-telegram-bot-api');

const TELEGRAM_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const bot = new TelegramBot(TELEGRAM_TOKEN);

console.log("Bot started...");

async function scrapeForebet() {
  try {
    const { data } = await axios.get('https://www.forebet.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    const matches = [];

    $('.rcnt tr').each((_, el) => {
      const teams = $(el).find('td.tnms').text().trim().replace(/\s+/g, ' ');
      const tip = $(el).find('td.profit div').first().text().trim();

      if (teams && tip) {
        matches.push({ teams, tip });
      }
    });

    return matches;
  } catch (err) {
    console.error('Error scraping Forebet:', err.message);
    return [];
  }
}

async function scrapePassionPrediction() {
  try {
    const { data } = await axios.get('https://passionpredict.com/');

    const $ = cheerio.load(data);
    const matches = [];

    $('table tbody tr').each((_, el) => {
      const teams = $(el).find('td').eq(0).text().trim();
      const tip = $(el).find('td').eq(1).text().trim();

      if (teams && tip) {
        matches.push({ teams, tip });
      }
    });

    return matches;
  } catch (err) {
    console.error('Error scraping PassionPrediction:', err.message);
    return [];
  }
}

async function main() {
  console.log("Running scraping cycle at", new Date().toLocaleString());

  const [forebet, passion] = await Promise.all([
    scrapeForebet(),
    scrapePassionPrediction()
  ]);

  // Cross check matches from both
  const repeatedTips = [];

  forebet.forEach(fbMatch => {
    passion.forEach(psMatch => {
      if (fbMatch.teams.toLowerCase() === psMatch.teams.toLowerCase() &&
          fbMatch.tip.toLowerCase() === psMatch.tip.toLowerCase()) {
        repeatedTips.push({
          teams: fbMatch.teams,
          tip: fbMatch.tip,
          sources: ['Forebet', 'PassionPrediction']
        });
      }
    });
  });

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

// Run mara moja, kisha kila dakika 10
main();
setInterval(main, 10 * 60 * 1000);
