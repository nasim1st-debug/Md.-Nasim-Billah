import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const db = new Database('queue.db');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff' -- 'admin' or 'staff'
  );

  CREATE TABLE IF NOT EXISTS counters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'closed', -- 'open' or 'closed'
    current_token_id INTEGER,
    FOREIGN KEY (current_token_id) REFERENCES tokens(id)
  );

  CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting', -- 'waiting', 'calling', 'completed', 'skipped'
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    called_at DATETIME,
    completed_at DATETIME,
    counter_id INTEGER,
    FOREIGN KEY (counter_id) REFERENCES counters(id)
  );
`);

// Migration for existing databases
try {
  db.exec("ALTER TABLE tokens ADD COLUMN location TEXT");
} catch (err: any) {
  // Ignore error if column already exists
}

// Insert default accounts reliably
const salt = bcrypt.genSaltSync(10);
const passwordHash = bcrypt.hashSync('admin123', salt);

// Synchronize default accounts
// Use REPLACE INTO to ensure the credentials are always reset to default on start during development
const setUser = db.prepare('INSERT OR REPLACE INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)');

// Assuming ID 1 is admin, ID 2 is staff1 based on previous runs
// We use hardcoded IDs for defaults to ensure consistency
const checkAdmin = db.prepare("SELECT id FROM users WHERE username = 'admin'").get() as any;
const checkStaff = db.prepare("SELECT id FROM users WHERE username = 'staff1'").get() as any;

setUser.run(checkAdmin?.id || 1, 'admin', passwordHash, 'admin');
setUser.run(checkStaff?.id || 2, 'staff1', passwordHash, 'staff');

// Insert default counters if they don't exist
const countCounters = db.prepare('SELECT COUNT(*) as count FROM counters').get() as any;
if (countCounters.count === 0) {
  const insertCounter = db.prepare('INSERT INTO counters (name) VALUES (?)');
  for (let i = 1; i <= 5; i++) {
    insertCounter.run(`Counter ${i}`);
  }
}

export default db;
