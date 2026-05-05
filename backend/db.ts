import Database from 'better-sqlite3';
import path from 'path';

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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    called_at DATETIME,
    completed_at DATETIME,
    counter_id INTEGER,
    FOREIGN KEY (counter_id) REFERENCES counters(id)
  );
`);

// Insert default admin if not exists (password: admin123)
// Note: In a real app we'd hash it properly, but for the first run I'll use a pre-hashed version
// Hash for 'admin123' using bcryptjs (simulated for initialization)
const adminHash = '$2a$10$r9I1W0Y6F.lGub7Q/U.Z2e9u4Wzq1k3gK4XQZpXU/8J6Q1E.y.WmW'; // common bcrypt hash for testing
const staffHash = '$2a$10$r9I1W0Y6F.lGub7Q/U.Z2e9u4Wzq1k3gK4XQZpXU/8J6Q1E.y.WmW';

const insertAdmin = db.prepare('INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)');
insertAdmin.run('admin', adminHash, 'admin');
insertAdmin.run('staff1', staffHash, 'staff');

// Insert default counters
const insertCounter = db.prepare('INSERT OR IGNORE INTO counters (id, name) VALUES (?, ?)');
for (let i = 1; i <= 5; i++) {
  insertCounter.run(i, `Counter ${i}`);
}

export default db;
