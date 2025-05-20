const axios = require('axios');
const cheerio = require('cheerio');
const TelegramBot = require('node-telegram-bot-api');

const TELEGRAM_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const bot = new TelegramBot(TELEGRAM_TOKEN);

function normalizeTeams(team1, team2) {
  return [team1.toLowerCase(), team2.toLowerCase()].sort().join(' vs ');
}

async function scrapeForebet() {
  try {
    const url = 'https://www.forebet.com/en/football-tips-and-predictions-for-today';
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const matches = [];

    $('.bet-tips-wrap').each((i, el) => {
      const teams = $(el).find('.bet-tips-team').map((i, e) => $(e).text().trim()).get();
      const prediction = $(el).find('.bet-tips-prediction').text().trim();

      if (teams.length === 2 && prediction) {
        matches.push({
          source: 'Forebet',
          teams,
          prediction,
          key: normalizeTeams(teams[0], teams[1])
        });
      }
    });

    return matches;
  } catch (error) {
    console.error('Error scraping Forebet:', error.message);
    return [];
  }
}

async function scrapePassionPrediction() {
  try {
    const url = 'https://www.passionprediction.com/';
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const matches = [];

    $('.list-group-item').each((i, el) => {
      const teamsText = $(el).find('h3').text().trim();
      const teams = teamsText.split(' vs ').map(t => t.trim());
      const prediction = $(el).find('.prediction').text().trim();

      if (teams.length === 2 && prediction) {
        matches.push({
          source: 'PassionPrediction',
          teams,
          prediction,
          key: normalizeTeams(teams[0], teams[1])
        });
      }
    });

    return matches;
  } catch (error) {
    console.error('Error scraping PassionPrediction:', error.message);
    return [];
  }
}

function partialMatch(pred1, pred2) {
  pred1 = pred1.toLowerCase();
  pred2 = pred2.toLowerCase();

  if (pred1 === pred2) return true;

  if (pred1.includes('btts') && pred2.includes('both teams')) return true;
  if (pred2.includes('btts') && pred1.includes('both teams')) return true;

  if (pred1.includes('over') && pred2.includes('over')) return true;
  if (pred1.includes('under') && pred2.includes('under')) return true;

  if (pred1.includes('draw') && pred2.includes('draw')) return true;

  return false;
}

async function main() {
  console.log('Running scraping cycle at', new Date().toLocaleString());

  const forebetMatches = await scrapeForebet();
  const passionMatches = await scrapePassionPrediction();

  const forebetMap = new Map();
  for (const m of forebetMatches) {
    forebetMap.set(m.key, m);
  }

  const matchedPredictions = [];

  for (const pm of passionMatches) {
    if (forebetMap.has(pm.key)) {
      const fm = forebetMap.get(pm.key);
      if (partialMatch(fm.prediction, pm.prediction)) {
        matchedPredictions.push({
          teams: fm.teams,
          prediction: fm.prediction,
          sources: ['Forebet', 'PassionPrediction']
        });
      }
    }
  }

  if (matchedPredictions.length === 0) {
    console.log('Hakuna mechi zinazojirudia.');
    return;
  }

  for (const match of matchedPredictions) {
    const message = `[Matched Prediction]\n${match.teams.join(' vs ')}\nPrediction: ${match.prediction}\nSources: ${match.sources.join(', ')}`;
    await bot.sendMessage(CHAT_ID, message);
    console.log('Sent:', message);
    await new Promise(r => setTimeout(r, 1000)); // Avoid spamming too fast
  }
}

// Run immediately, then repeat every 1 minute
main();
setInterval(main, 60 * 1000);
