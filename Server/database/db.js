
const sqlite3 = require('sqlite3').verbose();

const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : __dirname + '/calendar.db';
const db = new sqlite3.Database(dbPath);

function initializeDatabase(callback) {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_date TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `, callback);
    });
}

function getAllEvents(callback) {
  db.all("SELECT * FROM events", [], callback);
}

function addEvent(event_date, content, callback) {
  db.run("INSERT INTO events (event_date, content, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)", [event_date, content], function(err) {
    if (err) {
      return callback(err);
    }
    db.get("SELECT * FROM events WHERE id = ?", [this.lastID], callback);
  });
}

function getEventById(id, callback) {
  db.get("SELECT * FROM events WHERE id = ?", [id], callback);
}

function getEventByDate(date, callback) {
  db.get("SELECT * FROM events WHERE event_date = ?", [date], callback);
}

function updateEvent(id, event_date, content, callback) {
  db.run("UPDATE events SET event_date = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [event_date, content, id], function(err) {
    if (err) {
      return callback(err);
    }
    db.get("SELECT * FROM events WHERE id = ?", [id], callback);
  });
}

function deleteEvent(id, callback) {
  db.run("DELETE FROM events WHERE id = ?", [id], function(err) {
    callback(err, { changes: this.changes });
  });
}

module.exports = {
  db,
  initializeDatabase,
  getAllEvents,
  addEvent,
  getEventById,
  getEventByDate,
  updateEvent,
  deleteEvent
};
