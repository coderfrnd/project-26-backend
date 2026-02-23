import { db, classifyExam } from "../../db/init.js";

const hardcodedData = [
  {
    platform: "cracku",
    exam: "IBPS SO Prelims",
    category: "Banking", // Manual or skip if using classifyExam
    title: "IBPS SO Prelims Free Mock Test 2026",
    link: "https://cracku.in/ibps-so-prelims-mock-test",
  },
  {
    platform: "guidely",
    exam: "SSC CGL",
    category: "SSC",
    title: "SSC CGL CHSL Live Test Series 118+ Tests",
    link: "https://guidely.in/1389/ssc-cgl-2025-tier-i-online-test-series",
  },
   {
    platform: "Adda247",
    exam: "SSC CGL",
    category: "SSC",
    title: "SSC CGL CHSL Free Mock Test 2025",
    link: "https://www.adda247.com/ssc-cgl/mock-test?srsltid=AfmBOoprcNJ1Xyy8bOLdnkx3941cDMLDspx4Lj5BrcsAdC1XqOP2asvF",
  },
 {
    platform: "SelfStudys",
    exam: "Jee-Previous Year Papers",
    category: "IIT-JEE",
    title: "JEE Previous Year Papers Free Mock Test 2025",
    link: "https://www.selfstudys.com/books/jee-previous-year-paper",
  } 
];

export async function saveHardcodedTests() {
  console.log("🔄 Syncing hardcoded mock tests...");

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO free_tests (platform, exam, category, title, link)
    VALUES (?, ?, ?, ?, ?)
  `);

  hardcodedData.forEach((test) => {
    // If you want to use your AI classifier for these too:
    const category = test.category || classifyExam(test.exam, test.title);
    
    stmt.run(test.platform, test.exam, category, test.title, test.link);
  });

  stmt.finalize((err) => {
    if (err) console.error("❌ Error inserting hardcoded tests:", err.message);
    else console.log(`🚀 Synced ${hardcodedData.length} hardcoded tests ✅`);
  });
}

// Auto-run if this file is imported
saveHardcodedTests();