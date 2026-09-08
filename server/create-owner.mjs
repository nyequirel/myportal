import { openStore } from './store.mjs';
import { hashPassword, validPassword, validEmail, normalizeEmail } from './security.mjs';
const email = normalizeEmail(process.env.OWNER_EMAIL);
const password = process.env.OWNER_PASSWORD;
if (!validEmail(email) || !validPassword(password)) {
  console.error('Set OWNER_EMAIL and OWNER_PASSWORD (12–128 characters) in server/.env, then run this command again.');
  process.exitCode = 1;
} else {
  const db = openStore();
  const existing = db.prepare('SELECT id FROM owner WHERE id=1').get();
  if (existing && !process.argv.includes('--reset')) {
    console.error('Owner already exists. Use npm run owner:create -- --reset to replace credentials and revoke all sessions.');
    process.exitCode = 1;
  } else {
    const hashed = await hashPassword(password);
    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare('INSERT OR REPLACE INTO owner (id, email, password) VALUES (1, ?, ?)').run(email, hashed);
      db.exec('DELETE FROM sessions; DELETE FROM challenges; COMMIT;');
      console.log('Owner saved. Remove OWNER_PASSWORD from server/.env. Existing sessions have been revoked.');
    } catch (error) { db.exec('ROLLBACK'); throw error; }
  }
  db.close();
}
