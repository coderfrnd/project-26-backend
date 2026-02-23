const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// 1. Database Connection
const dbPath = path.join(__dirname, "database.sqlite");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Error connecting to database:", err);
  } else {
    console.log("✅ Connected to SQLite database at:", dbPath);
  }
});

/**
 * HELPER: Classifier Function
 * Use this in your scraper before inserting data!
 */
const classifyExam = (exam, title) => {
  const text = `${exam} ${title}`.toLowerCase();
    //  console.log("🔍 Classifying:", text);
  if (text.includes("ssc") || text.includes("cgl") || text.includes("chsl") || text.includes("mts")) return "SSC";
  if (text.includes("rbi") || text.includes("nabard") || text.includes("regulatory") || text.includes("sebi")) return "Regulatory Body";
  if (text.includes("sbi") || text.includes("ibps") || text.includes("clerk") || text.includes("bank")) return "Banking";
  if (text.includes("up-") || text.includes("bihar") || text.includes("delhi-police") || text.includes("dp-")) return "State Exams";
  if (text.includes("gate") || text.includes("rrb-je") || text.includes("engineering")) return "Engineering";
  if (text.includes("neet") || text.includes("aiims") || text.includes("medical")) return "Medical/NEET";
  if (text.includes("ntpc") || text.includes("alp") || text.includes("rrb")) return "Railways";
  if (text.includes("iit-jee")|| text.includes("jee") || text.includes("jee-mains")) return "IIT-JEE";
  
  return "Other"; 
};

// 2. Table Creation (With category and is_active columns)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS free_tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      exam TEXT NOT NULL,
      category TEXT,           -- ✅ Added Category Column
      title TEXT NOT NULL,
      link TEXT NOT NULL UNIQUE,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error("❌ Error creating table:", err);
    else console.log("📅 Table 'free_tests' is ready with Category support.");
  });
});

// 3. Automation Logic: Manage Test Status & Cleanup
const manageTestData = () => {
  console.log("-----------------------------------------");
  console.log("🔄 Running Database Maintenance Task...");

  db.run(`
    UPDATE free_tests 
    SET is_active = 0 
    WHERE created_at < datetime('now', '-1 day') AND is_active = 1
  `, function(err) {
    if (err) console.error("❌ Error updating status:", err);
    else console.log(`✅ ${this.changes || 0} tests marked as 'Finished'.`);
  });

  db.run(`
    DELETE FROM free_tests 
    WHERE created_at < datetime('now', '-2 days')
  `, function(err) {
    if (err) console.error("❌ Error deleting old data:", err);
    else console.log(`🗑️ ${this.changes || 0} old tests permanently deleted.`);
  });
  console.log("-----------------------------------------");
};

// 4. Scheduling
setInterval(manageTestData, 3600000);
manageTestData();

// Export both the db and the classifier for your scrapers
module.exports = { db, classifyExam };