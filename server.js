const axios = require("axios");
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
const tough = require("tough-cookie");
const fs = require("fs");

// Load cookies from cookies.json
const cookies = require("./cookies.json");
const jar = new tough.CookieJar();

(async () => {
  for (const cookie of cookies) {
    await jar.setCookie(`${cookie.name}=${cookie.value}`, "https://www.betpawa.co.tz");
  }

  const client = axios.create({ jar });
  axiosCookieJarSupport(client);

  const res = await client.get("https://www.betpawa.co.tz");
  console.log("Page loaded, status:", res.status);
})();