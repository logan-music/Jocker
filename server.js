// betting-bot/server.js const axios = require("axios"); const cheerio = require("cheerio"); const express = require("express");

const BOT_TOKEN = "your_bot_token_here"; const CHAT_ID = "your_chat_id_here"; const TELEGRAM_API = https://api.telegram.org/bot${BOT_TOKEN}/sendMessage;

const sources = [ scrapePassionPredict, scrapeLegitPredict, scrapeBetGenuine, scrapeBettingVoice, scrapeGoodSport, scrapeBankerPredict, scrapeFocusPredict, scrapeSupaTips, ];

async function scrapePassionPredict() { try { const res = await axios.get("https://www.passionpredict.com/"); const $ = cheerio.load(res.data); const tips = []; $(".match_card").each((i, el) => { const match = $(el).find(".match_title").text().trim(); const tip = $(el).find(".match_tip").text().trim(); if (match && tip) tips.push({ match, tip }); }); return { source: "PassionPredict", tips }; } catch (err) { console.error("Error scraping PassionPredict:", err.message); return { source: "PassionPredict", tips: [] }; } }

async function scrapeLegitPredict() { try { const res = await axios.get("https://legitpredict.com/"); const $ = cheerio.load(res.data); const tips = []; $(".match-card").each((i, el) => { const match = $(el).find(".teams").text().trim(); const tip = $(el).find(".tip").text().trim(); if (match && tip) tips.push({ match, tip }); }); return { source: "LegitPredict", tips }; } catch (err) { console.error("Error scraping LegitPredict:", err.message); return { source: "LegitPredict", tips: [] }; } }

async function scrapeBetGenuine() { try { const res = await axios.get("https://betgenuine.com/"); const $ = cheerio.load(res.data); const tips = []; $(".elementor-post").each((i, el) => { const match = $(el).find(".elementor-post__title").text().trim(); const tip = $(el).find(".entry-summary").text().trim().split("Tip:")[1]; if (match && tip) tips.push({ match, tip: tip.trim() }); }); return { source: "BetGenuine", tips }; } catch (err) { console.error("Error scraping BetGenuine:", err.message); return { source: "BetGenuine", tips: [] }; } }

async function scrapeBettingVoice() { try { const res = await axios.get("https://bettingvoice.com/"); const $ = cheerio.load(res.data); const tips = []; $(".elementor-post").each((i, el) => { const match = $(el).find(".elementor-post__title").text().trim(); const tip = $(el).find(".elementor-post__excerpt").text().trim().split("Tip:")[1]; if (match && tip) tips.push({ match, tip: tip.trim() }); }); return { source: "BettingVoice", tips }; } catch (err) { console.error("Error scraping BettingVoice:", err.message); return { source: "BettingVoice", tips: [] }; } }

async function scrapeGoodSport() { try { const res = await axios.get("https://good-sport.co/"); const $ = cheerio.load(res.data); const tips = []; $(".elementor-post").each((i, el) => { const match = $(el).find(".elementor-post__title").text().trim(); const tip = $(el).find(".elementor-post__excerpt").text().trim().split("Tip:")[1]; if (match && tip) tips.push({ match, tip: tip.trim() }); }); return { source: "GoodSport", tips }; } catch (err) { console.error("Error scraping GoodSport:", err.message); return { source: "GoodSport", tips: [] }; } }

async function scrapeBankerPredict() { try { const res = await axios.get("https://bankerpredict.com/"); const $ = cheerio.load(res.data); const tips = []; $(".elementor-post").each((i, el) => { const match = $(el).find(".elementor-post__title").text().trim(); const tip = $(el).find(".elementor-post__excerpt").text().trim().split("Tip:")[1]; if (match && tip) tips.push({ match, tip: tip.trim() }); }); return { source: "BankerPredict", tips }; } catch (err) { console.error("Error scraping BankerPredict:", err.message); return { source: "BankerPredict", tips: [] }; } }

async function scrapeFocusPredict() { try { const res = await axios.get("https://focuspredict.com/"); const $ = cheerio.load(res.data); const tips = []; $(".elementor-post").each((i, el) => { const match = $(el).find(".elementor-post__title").text().trim(); const tip = $(el).find(".elementor-post__excerpt").text().trim().split("Tip:")[1]; if (match && tip) tips.push({ match, tip: tip.trim() }); }); return { source: "FocusPredict", tips }; } catch (err) { console.error("Error scraping FocusPredict:", err.message); return { source: "FocusPredict", tips: [] }; } }

async function scrapeSupaTips() { try { const res = await axios.get("https://www.supatips.com/"); const $ = cheerio.load(res.data); const tips = []; $(".elementor-post").each((i, el) => { const match = $(el).find(".elementor-post__title").text().trim(); const tip = $(el).find(".elementor-post__excerpt").text().trim().split("Tip:")[1]; if (match && tip) tips.push({ match, tip: tip.trim() }); }); return { source: "SupaTips", tips }; } catch (err) { console.error("Error scraping SupaTips:", err.message); return { source: "SupaTips", tips: [] }; } }

async function sendTelegram(message) { await axios.post(TELEGRAM_API, { chat_id: CHAT_ID, text: message, parse_mode: "Markdown", }); }

function startServer() { const app = express(); app.get("/", (req, res) => res.send("Bot is alive")); app.listen(3000, () => console.log("Dummy server running on port 3000")); }

async function scrapeAndSend() { console.log("Running scraping cycle at", new Date().toLocaleString()); const allResults = await Promise.all(sources.map((fn) => fn()));

const allTips = {}; allResults.forEach(({ source, tips }) => { tips.forEach(({ match, tip }) => { const key = match + "|" + tip; if (!allTips[key]) allTips[key] = { match, tip, sources: [] }; allTips[key].sources.push(source); }); });

const filtered = Object.values(allTips).filter((x) => x.sources.length >= 2); if (!filtered.length) { console.log("Hakuna mechi zinazojirudia."); return; }

for (const m of filtered) { const message = **Mechi:** ${m.match}\n**Tip:** ${m.tip}\n**Sources:** ${m.sources.join(", ")}; await sendTelegram(message); console.log("Sent:", message); } }

startServer(); scrapeAndSend(); setInterval(scrapeAndSend, 10 * 60 * 1000);

