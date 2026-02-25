const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Database: ensure file and schema exist
const dbDir = path.join(__dirname, 'database');
const dbPath = path.join(dbDir, 'app.db');
if (!fs.existsSync(dbPath)) {
  const schemaPath = path.join(dbDir, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const dbInit = new Database(dbPath);
    dbInit.exec(schema);
    dbInit.close();
  }
}
const db = new Database(dbPath);

// Seed demo user if no users exist (for first run)
const userCount = db.prepare('SELECT COUNT(*) as n FROM users').get().n;
if (userCount === 0) {
  const hash = bcrypt.hashSync('demo123', 10);
  db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('demo', hash);
  console.log('Seeded demo user: demo / demo123');
}

// Passport: authenticate username/password against database (open-source component)
passport.use(
  new LocalStrategy((username, password, done) => {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) return done(null, false);
    if (!bcrypt.compareSync(password, user.password_hash)) return done(null, false);
    return done(null, { id: user.id, username: user.username });
  })
);
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(id);
  done(null, user || null);
});

app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'threat-modeling-demo-secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login.html');
}

// Routes
app.get('/', (req, res) => {
  if (req.isAuthenticated()) res.redirect('/motd.html');
  else res.redirect('/login.html');
});

app.post(
  '/login',
  passport.authenticate('local', { failureRedirect: '/login.html?error=1', successRedirect: '/motd.html' })
);

app.post('/logout', (req, res) => {
  req.logout(() => {});
  res.redirect('/login.html');
});

// Message of the day (from database)
app.get('/api/motd', requireAuth, (req, res) => {
  const row = db.prepare('SELECT id, message, updated_at FROM message_of_the_day WHERE id = 1').get();
  res.json(row || { message: '' });
});

// Comments (stored in database)
app.get('/api/comments', requireAuth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT c.id, c.comment_text, c.created_at, u.username
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.message_id = 1
       ORDER BY c.created_at ASC`
    )
    .all();
  res.json(rows);
});

app.post('/api/comments', requireAuth, (req, res) => {
  const { comment_text } = req.body || {};
  if (!comment_text || !String(comment_text).trim()) {
    return res.status(400).json({ error: 'Comment text required' });
  }
  db.prepare(
    'INSERT INTO comments (message_id, user_id, comment_text) VALUES (1, ?, ?)'
  ).run(req.user.id, String(comment_text).trim());
  res.redirect('/motd.html');
});

app.listen(PORT, () => console.log('Server at http://localhost:' + PORT));
