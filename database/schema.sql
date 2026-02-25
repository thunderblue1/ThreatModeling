-- DDL: Threat Modeling Sample App - SQLite
-- Run: sqlite3 database/app.db < database/schema.sql
-- Or use with PostgreSQL/MySQL by adjusting types (e.g. INTEGER -> SERIAL, TEXT -> VARCHAR)

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS message_of_the_day (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (message_id) REFERENCES message_of_the_day(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Single row for MOTD (optional seed)
INSERT OR IGNORE INTO message_of_the_day (id, message) VALUES (1, 'Welcome. This is the message of the day.');
