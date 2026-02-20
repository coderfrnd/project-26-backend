const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// create database file inside db folder
const dbPath = path.join(__dirname, "database.sqlite");

// connect (or create if not exists)
console.log("USING DB FILE 👉", dbPath);
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error connecting to database", err);
  } else {
    console.log("Connected to SQLite database");
  }
});

// create table
db.run(`
 CREATE TABLE IF NOT EXISTS free_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    exam TEXT NOT NULL,
    title TEXT NOT NULL,
    link TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`
  )


// For deleteing all null entries (if any)
// db.run(`
//   DELETE FROM free_tests
//   WHERE platform IS NULL
//     AND exam IS NULL
//     AND title IS NULL
//     AND link IS NULL
// `);
module.exports = db;