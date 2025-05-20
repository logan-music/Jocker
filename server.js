// ====== CONFIGURATION ====== const TELEGRAM_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN'; const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID';

// ====== DEPENDENCIES ====== const axios = require('axios'); const cheerio = require('cheerio'); const http = require('http');

// ====== SCRAPERS ====== async function scrapePassionPredict() { try { const { data } = await axios.get('https://passionpredict.com/'); const $ = cheerio.load(data); const tips = [];

$('table tbody tr').each((_, el) => {
  const time = $(el).find('td').eq(0).text().trim();
  const teams = $(el).find('td').eq(1).text().trim();
  const tip = $(el).find('td').eq(2).text().trim();

  if (teams && tip) {
    tips.push({ match: `${teams} (${time})`, tip });
  }
});

return { source: 'PassionPredict', tips };

} catch (err) { console.error('Error scraping PassionPredict:', err.message); return { source: 'PassionPredict', tips: [] }; } }

async function scrapeLegitPredict() { try { const { data } = await axios.get('https://legitpredict.com/'); const $ = cheerio.load(data); const tips = [];

$('table tbody tr').each((_, el) => {
  const time = $(el).find('td').eq(0).text().trim();
  const teams = $(el).find('td').eq(1).text().trim();
  const tip = $(el).find('td').eq(2).text().trim();

  if (teams && tip) {
    tips.push({ match: `${teams} (${time})`, tip });
  }
});

return { source: 'LegitPredict', tips };

} catch (err) { console.error('Error scraping LegitPredict:', err.message); return { source: 'LegitPredict', tips: [] }; } }

// ====== FIND COMMON TIPS ====== function findCommonTips(allTips) { const map = new Map();

allTips.forEach(({ source, tips }) => { tips.forEach(({ match, tip }) => { const key = ${match.toLowerCase()}|${tip.toLowerCase()};

if (!map.has(key)) {
    map.set(key, { match, tip, sources: new Set() });
  }

  map.get(key).sources.add(source);
});

});

const results = []; for (let entry of map.values()) { if (entry.sources.size >= 2) { results.push({ match: entry.match, tip: entry.tip, sources: [...entry.sources], }); } }

return results; }

// ====== TELEGRAM SENDER ====== async function sendTelegramMessage(message) { try { await axios.post(https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage, { chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown', }); } catch (err) { console.error('Failed to send message:', err.message); } }

// ====== MAIN LOGIC ====== async function runScraper() { console.log('Running scraping cycle at', new Date().toLocaleString());

const scrapers = [scrapePassionPredict, scrapeLegitPredict]; const allTips = await Promise.all(scrapers.map(fn => fn())); const commonTips = findCommonTips(allTips);

if (commonTips.length === 0) { console.log('Hakuna mechi zinazojirudia.'); return; }

for (const tip of commonTips) { const message = **Mechi:** ${tip.match}\n**Tip:** ${tip.tip}\n**Sources:** ${tip.sources.join(', ')}; await sendTelegramMessage(message); console.log('Sent:', message); } }

// ====== RUN INTERVAL ====== runScraper(); setInterval(runScraper, 10 * 60 * 1000); // Kila dakika 10

// ====== DUMMY SERVER FOR RENDER ====== const PORT = process.env.PORT || 3000; http.createServer((req, res) => { res.writeHead(200); res.end("Betting bot is running!"); }).listen(PORT, () => { console.log(Dummy server running on port ${PORT}); });

