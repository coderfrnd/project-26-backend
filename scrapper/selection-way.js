import axios from "axios";
import {db,classifyExam} from "../db/init.js"; // your SQLite connection

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
        const link = `https://www.testranking.in/free-mock-test/${cat.category_name}`;

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

  // 1. Updated SQL to include 'category' and a 5th placeholder '?'
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO free_tests (platform, exam, category, title, link)
    VALUES (?, ?, ?, ?, ?)
  `);

  tests.forEach((t) => {
    // 2. Pass the exam slug and title into your classifier
    const category = classifyExam(t.exam, t.title);

    // 3. Add the category to the run parameters
    stmt.run(t.platform, t.exam, category, t.title, t.link);
  });

  stmt.finalize((err) => {
    if (err) {
      console.error("❌ Error inserting TestRanking tests:", err.message);
    } else {
      console.log(`🚀 Successfully processed ${tests.length} tests into the database!`);
    }
  });
}

// Run
saveTestsToDB();