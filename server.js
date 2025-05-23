// BetPawa Odds Scraper - Node.js version using Axios and Cookie jar const axios = require("axios"); const tough = require("tough-cookie"); const { wrapper } = require("axios-cookiejar-support");

const jar = new tough.CookieJar();

// Paste your latest cookies here const cookies = [ { name: "x-pawa-token", value: "c8206c6dd1f6cdca-9002f4b3ba54fbbf", domain: ".betpawa.co.tz", path: "/" }, { name: "__cf_bm", value: "pdpRSQmaLD7tnluJmTs7uDez_gNHjDCNnrFget_hR6g-1747986371-1.0.1.1-xIfbtalybGdipGuqxP0rG9132NmNQsfzoI28WPPjBPTOjeLVkqtof2oNE1FiTwAO2HhqJBNzWW3_qQhc.5GDzMpPbctmvAhZX4ZXjGbLYxU", domain: ".www.betpawa.co.tz", path: "/" } ];

(async () => { for (const cookie of cookies) { await jar.setCookie(${cookie.name}=${cookie.value}, "https://www.betpawa.co.tz"); }

const client = wrapper(axios.create({ jar }));

try { const response = await client.get("https://www.betpawa.co.tz/api/livescore/matches");

const matches = response.data;

// Filter for matches with odds below 1.50
const filtered = matches.filter(match => {
  if (!match.odds) return false;
  return Object.values(match.odds).some(o => parseFloat(o) < 1.50);
});

console.log("Mechi zenye odds chini ya 1.50:");
filtered.forEach(match => {
  console.log(`\n${match.homeTeam} vs ${match.awayTeam}`);
  console.log("Odds:", match.odds);
});

} catch (error) { console.error("Error fetching matches:", error.response ? error.response.data : error); } })();

