/**
 * Seed script: creates demo user and ensures MOTD exists.
 * Run: node database/seed.js
 */
const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'app.db');
const db = new Database(dbPath);

// Create schema if not exists (so seed can run standalone)
db.exec(`
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
  INSERT OR IGNORE INTO message_of_the_day (id, message) VALUES (1, 'Welcome. This is the message of the day.');
`);

const username = 'demo';
const password = 'demo123';
const hash = bcrypt.hashSync(password, 10);

const stmt = db.prepare(
  'INSERT OR REPLACE INTO users (id, username, password_hash) VALUES (1, ?, ?)'
);
stmt.run(username, hash);
console.log('Seed done. User: demo / demo123');
db.close();
