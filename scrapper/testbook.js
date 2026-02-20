const axios = require("axios");
const db = require("../db/init");
const API_URL =
  "https://api.testbook.com/api/v2_1/live-panel/all?type=tests&skip=0&limit=12&language=English";

async function scrapeTestbook() {
  try {
    const response = await axios.get(API_URL);

    const liveTests = response.data.data.liveTests;

    // filter ONLY free tests
    const freeTests = liveTests.filter(test => test.isFree === true);

    console.log("Free tests found:", freeTests.length);

    freeTests.forEach(test => {
     const title = test.title;
  const exam = test.specificExams?.[0]?.title || "Unknown";
  const link = `https://testbook.com/test-series/${test.id}`;

  const query = `
    INSERT OR IGNORE INTO free_tests (platform, exam, title, link)
    VALUES (?, ?, ?, ?)
  `;

  db.run(query, ["Testbook", exam, title, link]);
    console.log("Testbook run successfully");
    });

  } catch (error) {
    console.error("Error:", error.message);
  }
}

scrapeTestbook();