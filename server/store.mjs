import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export function openStore(filename = resolve(root, 'server/data/portfolio.sqlite')) {
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS owner (id INTEGER PRIMARY KEY CHECK(id=1), email TEXT NOT NULL, password TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS challenges (owner_id INTEGER PRIMARY KEY, token TEXT NOT NULL, code TEXT NOT NULL,
      expires INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, resend_at INTEGER NOT NULL, sends INTEGER NOT NULL DEFAULT 1, delivered INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS portfolio (id INTEGER PRIMARY KEY CHECK(id=1), content TEXT NOT NULL);
  `);
  db.prepare('INSERT OR IGNORE INTO portfolio (id, content) VALUES (1, ?)')
    .run(readFileSync(resolve(root, 'docs/data/portfolio.json'), 'utf8'));
  return db;
}
