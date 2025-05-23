const axios = require("axios");
const tough = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");
const fs = require("fs");

// Soma cookies kutoka kwenye cookies.json
const cookies = JSON.parse(fs.readFileSync("cookies.json", "utf8"));

(async () => {
  const jar = new tough.CookieJar();
  const client = wrapper(axios.create({ jar }));

  // Set kila cookie kwenye jar
  for (const cookie of cookies.cookies) {
    await jar.setCookie(`${cookie.name}=${cookie.value}`, "https://www.betpawa.co.tz");
  }

  try {
    // Fanya request ya odds page (homepage kwa sasa)
    const res = await client.get("https://www.betpawa.co.tz/");
    console.log("Status Code:", res.status);
    console.log("Page title snippet:", res.data.substring(0, 100)); // Just a sample preview
  } catch (err) {
    console.error("Error fetching page:", err.message);
  }
})();