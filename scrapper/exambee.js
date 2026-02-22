import axios from "axios";
import * as cheerio from "cheerio";
import{ db,classifyExam} from "../db/init.js";

const BASE_URL = "https://www.ixambee.com";
const LISTING_URL = `${BASE_URL}/free-mock-tests`;

// Helper to clean messy titles
function cleanTitle(title) {
  return title.replace(/\s+/g, " ").trim();
}

// Main scraping function
async function extractFreeTests() {
  try {
    const { data } = await axios.get(LISTING_URL);
    const $ = cheerio.load(data);

    const tests = new Map(); // dedupe by URL

    $("a[href]").each((_, el) => {
      const href = $(el).attr("href")?.trim();
      if (!href) return;

      // ✅ only valid free mock test links
      if (href.startsWith("/free-mock-tests/") && href.split("/").length === 3) {
        const fullUrl = BASE_URL + href;

        const title =
          cleanTitle($(el).text()) ||
          cleanTitle(href.split("/").pop().replace(/-/g, " "));

        tests.set(fullUrl, {
          title,
          url: fullUrl,
          is_free: true,
          source: "ixambee",
        });
      }
    });

    return [...tests.values()];
  } catch (err) {
    console.error("Error fetching ixamBee tests:", err.message);
    return [];
  }
}

// Insert scraped tests into SQLite DB
// Insert scraped tests into SQLite DB
async function saveTestsToDB() {
  const tests = await extractFreeTests();
  console.log("TOTAL FREE TESTS SCRAPED:", tests.length);

  if (tests.length === 0) return;

  // 1. ADD 'category' and the 5th '?' to the SQL query
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO free_tests (platform, exam, category, title, link)
    VALUES (?, ?, ?, ?, ?)
  `);

  tests.forEach((test) => {
    let examName = test.title.split(" Mock")[0];

    if (examName.toLowerCase() === "view") {
      const parts = test.url.split("/");
      examName = parts[parts.length - 1].replace(/-/g, " ");
    }

    // 2. RUN THE CLASSIFIER HERE 
    // We pass both the examName and the full title for better accuracy
    const category = classifyExam(examName, test.title);

    // 3. ADD 'category' as the third parameter in stmt.run
    stmt.run(test.source, examName, category, test.title, test.url);
  });

  stmt.finalize((err) => {
    if (err) console.error("❌ Error inserting tests into DB:", err.message);
    else console.log(`🚀 Inserted ${tests.length} ixamBee tests into database ✅`);
  });
}

// Run scraper + save
saveTestsToDB();