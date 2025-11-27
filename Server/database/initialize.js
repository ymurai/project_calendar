
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(__dirname + '/calendar.db');

db.serialize(() => {
  // Create events table
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_date DATE NOT NULL UNIQUE,
    content TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert initial data
  const stmt = db.prepare("INSERT OR IGNORE INTO events (event_date, content) VALUES (?, ?)");
  stmt.run('2025-07-30', 'Gemini CLIのセットアップ');
  stmt.finalize();
});

db.close();
