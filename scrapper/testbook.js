const axios = require("axios");
const { db, classifyExam } = require("../db/init");

const API_URL = "https://api.testbook.com/api/v2_1/live-panel/all?type=tests&skip=0&limit=12&language=English";

async function scrapeTestbook() {
  try {
    const response = await axios.get(API_URL);
    const liveTests = response.data.data.liveTests;

    // Filter ONLY free tests
    const freeTests = liveTests.filter(test => test.isFree === true);
    console.log("Free tests found:", freeTests.length);

    // 1. Updated SQL Query (Added category and 5th ?)
    const query = `
      INSERT OR IGNORE INTO free_tests (platform, exam, category, title, link)
      VALUES (?, ?, ?, ?, ?)
    `;

    freeTests.forEach(test => {
      const title = test.title;
      const exam = test.specificExams?.[0]?.title || "Unknown";
      const link = `https://testbook.com/free-live-tests-and-quizzes/`;

      // 2. RUN THE CLASSIFIER
      const category = classifyExam(exam, title);

      // 3. PASS ALL 5 PARAMETERS TO DB
      db.run(query, ["Testbook", exam, category, title, link], (err) => {
        if (err) console.error("❌ DB Insert Error:", err.message);
      });
    });

    console.log("✅ Testbook data processed successfully");

  } catch (error) {
    console.error("❌ Error scraping Testbook:", error.message);
  }
}

scrapeTestbook();