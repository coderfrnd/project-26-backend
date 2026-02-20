const express = require("express");
const router = express.Router();
const db = require("../db/init");

router.post("/free-tests", (req, res) => {
  const tests = req.body;
    //  console.log(tests)
  // 1️⃣ must be array
  if (!Array.isArray(tests)) {
    return res.status(400).json({ error: "Expected an array of tests" });
  }

  let inserted = 0;
  let skipped = 0;

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO free_tests (platform, exam, title, link)
    VALUES (?, ?, ?, ?)
  `);

  tests.forEach((test) => {
    const { platform, exam, title, link } = test;

    // 2️⃣ validation (THIS IS KEY)
    if (!platform || !exam || !title || !link) {
      skipped++;
      return;
    }

    stmt.run(platform, exam, title, link);
    inserted++;
  });

  stmt.finalize();

  res.json({
    message: "Free tests processed",
    total: tests.length,
    inserted,
    skipped,
  });
});


// ✅ GET all free tests
router.get("/free-tests", (req, res) => {
  const { platform, exam } = req.query;

  let query = "SELECT * FROM free_tests WHERE 1=1";
  const params = [];

  if (platform) {
    query += " AND platform = ?";
    params.push(platform);
  }

  if (exam) {
    query += " AND exam = ?";
    params.push(exam);
  }

  query += " ORDER BY created_at DESC";

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});



module.exports = router;