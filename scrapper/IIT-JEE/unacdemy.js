const axios = require("axios");
const { db, classifyExam } = require("../../db/init"); // Matches your export style

// Note: If this URL stops working, Unacademy updated their Build ID (the random string)
const UNACADEMY_URL = "https://unacademy.com/_next/data/tQgq4fhAbBZ_OnuJWHfA4/goal/-/TMUVD/test-series.json?goalSlug=-&goalUID=TMUVD";

async function scrapeUnacademy() {
  try {
    console.log("🚀 Starting Unacademy Scrape...");

    const { data } = await axios.get(UNACADEMY_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    // Drilling into the JSON structure you provided
    const results = data?.pageProps?.fallbackData?.testSeriesData?.results || [];

    if (results.length === 0) {
      console.log("⚠️ No tests found on Unacademy. Check if the URL/BuildID is still valid.");
      return;
    }

    // Prepare the SQL statement
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO free_tests (platform, exam, category, title, link)
      VALUES (?, ?, ?, ?, ?)
    `);

    let freeCount = 0;

    results.forEach((test) => {
      // Logic: isSpecial = True is usually the Free tier on Unacademy
      if (test.isSpecial === true) {
        const platform = "Unacademy";
        const examName = "IIT-JEE"; 
        const title = test.name;
        const link = test.permalink;

        // ✅ Use your DB's built-in classifier
        const category = classifyExam(examName, title);
           console.log(`📌 Unacademy Test: ${title} | Classified as: ${category}`);
        stmt.run(platform, examName, category, title, link);
        freeCount++;
      }
    });

    stmt.finalize((err) => {
      if (err) {
        console.error("❌ Error finalizing Unacademy insert:", err.message);
      } else {
        console.log(`✅ Processed ${results.length} series. Inserted ${freeCount} FREE Unacademy tests.`);
      }
    });

  } catch (error) {
    console.error("❌ Unacademy Scrape Failed:", error.message);
  }
}

// Run it
scrapeUnacademy();