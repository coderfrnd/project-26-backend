import axios from "axios";
import db from "../db/init.js"; // your SQLite connection

const TR_URL = "https://www.testranking.in/_next/data/JQQe2_huOf7qS2tpstHws/en-US/free-test.json";

function cleanTitle(title) {
  return title.replace(/\s+/g, " ").trim();
}

async function fetchTestRanking() {
  try {
    const { data } = await axios.get(TR_URL);
    const subcats = data.pageProps.subcategorisList || [];

    const tests = [];

    subcats.forEach((subcat) => {
      const platform = "testranking";
      const catSlug = subcat.cat_slug;

      subcat.categories.forEach((cat) => {
        const title = cleanTitle(cat.category_label || cat.category_name);
        const exam = (cat.category_label || cat.category_name)
          .toLowerCase()
          .replace(/\s+/g, "-"); // slug for exam
        const link = `https://www.testranking.in/${catSlug}/${cat.category_name}`;

        tests.push({ platform, exam, title, link });
      });
    });

    return tests;
  } catch (err) {
    console.error("Error fetching TestRanking data:", err.message);
    return [];
  }
}
// let tests = await fetchTestRanking();
// tests.forEach((t) => console.log(t));
async function saveTestsToDB() {
  const tests = await fetchTestRanking();
  if (tests.length === 0) return;

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO free_tests (platform, exam, title, link)
    VALUES (?, ?, ?, ?)
  `);

  tests.forEach((t) => stmt.run(t.platform, t.exam, t.title, t.link));

  stmt.finalize((err) => {
    if (err) console.error("Error inserting TestRanking tests:", err.message);
    else console.log(`Inserted ${tests.length} TestRanking tests ✅`);
  });
}

// Run
saveTestsToDB();