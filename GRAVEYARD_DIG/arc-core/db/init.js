const Database = require("better-sqlite3");
const db = new Database("db/arc.db");

db.exec(`
CREATE TABLE IF NOT EXISTS users(
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  role TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS sessions(
  token TEXT PRIMARY KEY,
  user_id TEXT,
  expires INTEGER
);

CREATE TABLE IF NOT EXISTS agents(
  id TEXT PRIMARY KEY,
  state TEXT,
  retries INTEGER,
  task TEXT
);

CREATE TABLE IF NOT EXISTS workflows(
  id TEXT PRIMARY KEY,
  definition TEXT,
  state TEXT,
  pointer INTEGER
);
`);

db.close();
console.log("DB INIT OK");
