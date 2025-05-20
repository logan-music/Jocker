const axios = require("axios");
const cheerio = require("cheerio");

// Telegram config
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// Scraper functions
async function scrapePassionPredict() {
  try {
    const { data } = await axios.get("https://www.passionpredict.com/");
    const $ = cheerio.load(data);
    let tips = [];

    $("div.p-3").each((i, el) => {
      const match = $(el).find("h4").text().trim();
      const tip = $(el).find("p").first().text().trim();
      if (match && tip) {
        tips.push({ match, tip });
      }
    });

    return tips;
  } catch (err) {
    console.log("Error scraping PassionPredict:", err.message);
    return [];
  }
}

async function scrapeLegitPredict() {
  try {
    const { data } = await axios.get("https://legitpredict.com/");
    const $ = cheerio.load(data);
    let tips = [];

    $("table.table tbody tr").each((i, el) => {
      const match = $(el).find("td").eq(0).text().trim();
      const tip = $(el).find("td").eq(1).text().trim();
      if (match && tip) {
        tips.push({ match, tip });
      }
    });

    return tips;
  } catch (err) {
    console.log("Error scraping LegitPredict:", err.message);
    return [];
  }
}

async function scrapeBetGenuine() {
  try {
    const { data } = await axios.get("https://betgenuine.com/");
    const $ = cheerio.load(data);
    let tips = [];

    $("table tbody tr").each((i, el) => {
      const match = $(el).find("td").eq(0).text().trim();
      const tip = $(el).find("td").eq(2).text().trim();
      if (match && tip) {
        tips.push({ match, tip });
      }
    });

    return tips;
  } catch (err) {
    console.log("Error scraping BetGenuine:", err.message);
    return [];
  }
}

// Compare tips
function findCommonTips(allTips) {
  const map = new Map();

  allTips.forEach(({ source, tips }) => {
    tips.forEach(({ match, tip }) => {
      const key = `${match.toLowerCase()}|${tip.toLowerCase()}`;
      if (!map.has(key)) {
        map.set(key, { match, tip, sources: new Set([source]) });
      } else {
        map.get(key).sources.add(source);
      }
    });
  });

  const results = [];
  for (let entry of map.values()) {
    if (entry.sources.size >= 2) {
      results.push({
        match: entry.match,
        tip: entry.tip,
        sources: [...entry.sources],
      });
    }
  }

  return results;
}

// Telegram sender
async function sendToTelegram(tip) {
  const msg = `**Mechi:** ${tip.match}\n**Tip:** ${tip.tip}\n**Sources:** ${tip.sources.join(", ")}`;
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: CHAT_ID,
      text: msg,
      parse_mode: "Markdown",
    });
    console.log("Sent:", msg);
  } catch (err) {
    console.error("Telegram Error:", err.message);
  }
}

// Main function
async function main() {
  console.log("Running scraping cycle at", new Date().toLocaleString());

  const [passion, legit, genuine] = await Promise.all([
    scrapePassionPredict(),
    scrapeLegitPredict(),
    scrapeBetGenuine(),
  ]);

  const allTips = [
    { source: "PassionPredict", tips: passion },
    { source: "LegitPredict", tips: legit },
    { source: "BetGenuine", tips: genuine },
  ];

  const common = findCommonTips(allTips);

  if (common.length === 0) {
    console.log("Hakuna mechi zinazojirudia.");
  } else {
    for (let tip of common) {
      await sendToTelegram(tip);
    }
  }
}

// Run immediately, then every 10 minutes
main();
setInterval(main, 10 * 60 * 1000);

// Dummy HTTP server to prevent Render warning
const http = require("http");
const PORT = 3000;
http.createServer((req, res) => {
  res.write("Betting bot is alive");
  res.end();
}).listen(PORT, () => {
  console.log(`Dummy server running on port ${PORT}`);
});
