const axios = require('axios');
const cheerio = require('cheerio');
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const TELEGRAM_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';
const CHAT_ID = 'YOUR_CHAT_ID';

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

async function scrapePassionPredict() {
  try {
    const { data } = await axios.get('https://passionpredict.com/');
    const $ = cheerio.load(data);
    const tips = [];

    $('table tbody tr').each((_, el) => {
      const time = $(el).find('td').eq(0).text().trim();
      const teams = $(el).find('td').eq(1).text().trim();
      const tip = $(el).find('td').eq(2).text().trim();
      if (teams && tip) {
        tips.push({ match: `${teams} (${time})`, tip });
      }
    });

    return { source: 'PassionPredict', tips };
  } catch (err) {
    console.error('Error scraping PassionPredict:', err.message);
    return { source: 'PassionPredict', tips: [] };
  }
}

async function scrapeLegitPredict() {
  try {
    const { data } = await axios.get('https://legitpredict.com/');
    const $ = cheerio.load(data);
    const tips = [];

    $('.match-table tr').each((_, el) => {
      const time = $(el).find('td').eq(0).text().trim();
      const teams = $(el).find('td').eq(1).text().trim();
      const tip = $(el).find('td').eq(2).text().trim();
      if (teams && tip) {
        tips.push({ match: `${teams} (${time})`, tip });
      }
    });

    return { source: 'LegitPredict', tips };
  } catch (err) {
    console.error('Error scraping LegitPredict:', err.message);
    return { source: 'LegitPredict', tips: [] };
  }
}

function findMatchingTips(sources) {
  const map = {};
  sources.forEach(({ source, tips }) => {
    tips.forEach(({ match, tip }) => {
      const key = `${match}|${tip}`;
      if (!map[key]) map[key] = { match, tip, sources: [] };
      map[key].sources.push(source);
    });
  });

  return Object.values(map).filter(item => item.sources.length >= 2);
}

async function sendTipsToTelegram(tips) {
  if (!tips.length) {
    console.log('Hakuna mechi zinazojirudia.');
    return;
  }

  for (const { match, tip, sources } of tips) {
    const msg = `**Mechi:** ${match}\n**Tip:** ${tip}\n**Sources:** ${sources.join(', ')}`;
    await bot.sendMessage(CHAT_ID, msg, { parse_mode: 'Markdown' });
    console.log('Sent:', msg);
  }
}

async function run() {
  console.log('Running scraping cycle at', new Date().toLocaleString());

  const [passion, legit] = await Promise.all([
    scrapePassionPredict(),
    scrapeLegitPredict()
  ]);

  const filtered = findMatchingTips([passion, legit]);
  await sendTipsToTelegram(filtered);
}

setInterval(run, 10 * 60 * 1000); // kila dakika 10
run();

const app = express();
app.get('/', (_, res) => res.send('Betting Bot is running.'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is live on port ${PORT}`));
