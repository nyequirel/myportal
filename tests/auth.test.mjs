import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { createApp } from '../server/app.mjs';
import { openStore } from '../server/store.mjs';
import { hashPassword, checkPassword } from '../server/security.mjs';

const email = 'owner@example.test', password = 'A-long-test-password!';
const passwordHash = await hashPassword(password);
async function fixture(t, options = {}) {
  const store = openStore(':memory:');
  store.prepare('UPDATE portfolio SET content=? WHERE id=1').run(readFileSync(new URL('./fixtures/portfolio.json', import.meta.url), 'utf8'));
  store.prepare('INSERT INTO owner (id,email,password) VALUES(1,?,?)').run(email, passwordHash);
  let time = Date.now(); const mail = [];
  const app = await createApp({ db: store, secret: 'test-secret'.repeat(8), appUrl: 'http://localhost:3000', now: () => time, sendCode: async (to, code) => { if (options.failMail) throw new Error('SMTP unavailable'); mail.push({ to, code }); } });
  const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(async () => { await new Promise(resolve => server.close(resolve)); store.close(); });
  const jar = new Map();
  async function request(path, body, method, extraHeaders = {}) {
    const headers = { cookie: [...jar].map(([k,v]) => `${k}=${v}`).join('; '), ...extraHeaders };
    if (body !== undefined) { headers.origin ??= 'http://localhost:3000'; headers['Content-Type'] ??= 'application/json'; }
    const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`, { method: method || (body === undefined ? 'GET' : 'POST'), headers, body: body === undefined ? undefined : JSON.stringify(body) });
    for (const cookie of response.headers.getSetCookie()) { const [entry] = cookie.split(';'); const [key, value] = entry.split('='); if (value) jar.set(key, value); else jar.delete(key); }
    const text = await response.text(); let data; try { data = JSON.parse(text); } catch { data = text; }
    return { status: response.status, data, headers: response.headers };
  }
  const login = () => request('/api/auth/login', { email, password });
  const verify = () => request('/api/auth/verify', { code: mail.at(-1).code });
  return { db: store, request, login, verify, mail, jar, advance: ms => { time += ms; } };
}
test('passwords use salted scrypt hashes and reject wrong passwords', async () => {
  const second = await hashPassword(password); assert.notEqual(passwordHash, second); assert.ok(!passwordHash.includes(password));
  assert.equal(await checkPassword(password, passwordHash), true); assert.equal(await checkPassword('incorrect', passwordHash), false);
});
test('public pages and data work, private storage and admin API are not public', async t => {
  const f = await fixture(t);
  for (const path of ['/', '/login.html', '/admin.html', '/assets/style.css', '/api/portfolio']) assert.equal((await f.request(path)).status, 200);
  for (const path of ['/server/.env', '/server/data/portfolio.sqlite', '/server/data/outbox/latest-email.txt', '/sample_template/.env']) assert.equal((await f.request(path)).status, 404);
  assert.equal((await f.request('/api/admin/portfolio')).status, 401);
  assert.equal((await f.request('/api/admin/portfolio', {}, 'PUT')).status, 401);
});
test('password alone never authenticates; email OTP unlocks admin; logout revokes session', async t => {
  const f = await fixture(t); assert.equal((await f.login()).status, 200);
  assert.equal(f.mail.length, 1); assert.equal(f.mail[0].to, email); assert.match(f.mail[0].code, /^\d{6}$/);
  assert.equal((await f.request('/api/admin/portfolio')).status, 401);
  assert.equal((await f.request('/api/auth/status')).data.authenticated, false);
  assert.equal(f.jar.has('mp_session'), false);
  const raw = f.db.prepare('SELECT * FROM challenges').get(); assert.notEqual(raw.code, f.mail[0].code); assert.notEqual(raw.token, f.jar.get('mp_pending'));
  const verified = await f.verify(); assert.equal(verified.status, 200);
  assert.match(verified.headers.getSetCookie().join(' '), /HttpOnly/); assert.match(verified.headers.getSetCookie().join(' '), /SameSite=Strict/);
  assert.equal((await f.request('/api/admin/portfolio')).status, 200);
  const session = f.jar.get('mp_session'); assert.notEqual(f.db.prepare('SELECT token FROM sessions').get().token, session);
  await f.request('/api/auth/logout', {}); f.jar.set('mp_session', session);
  assert.equal((await f.request('/api/admin/portfolio')).status, 401);
});
test('wrong password and unknown email do not send a code', async t => {
  const f = await fixture(t);
  const wrong = await f.request('/api/auth/login', { email, password: 'wrong' });
  const unknown = await f.request('/api/auth/login', { email: 'unknown@example.test', password });
  assert.equal(wrong.status, 401); assert.deepEqual(wrong.data, unknown.data); assert.equal(f.mail.length, 0);
});
test('OTP requires original pending cookie and cannot be reused', async t => {
  const f = await fixture(t); await f.login(); const pending = f.jar.get('mp_pending');
  f.jar.delete('mp_pending'); assert.equal((await f.verify()).status, 401);
  f.jar.set('mp_pending', pending); assert.equal((await f.verify()).status, 200);
  f.jar.delete('mp_session'); f.jar.set('mp_pending', pending); assert.equal((await f.verify()).status, 401);
});
test('five wrong OTPs lock challenge even when correct code is subsequently supplied', async t => {
  const f = await fixture(t); await f.login(); const wrong = f.mail[0].code === '000000' ? '111111' : '000000';
  for (let i = 0; i < 5; i++) assert.equal((await f.request('/api/auth/verify', { code: wrong })).status, 401);
  assert.equal((await f.verify()).status, 401); assert.equal((await f.request('/api/admin/portfolio')).status, 401);
});
test('expired OTP and sessions are rejected', async t => {
  const f = await fixture(t); await f.login(); f.advance(600001); assert.equal((await f.verify()).status, 401);
  await f.login(); await f.verify(); f.advance(8 * 3600000 + 1); assert.equal((await f.request('/api/admin/portfolio')).status, 401);
});
test('resend cooldown enforced, old code invalidated, expiry and attempts preserved', async t => {
  const f = await fixture(t); await f.login(); const old = f.mail[0].code;
  assert.equal((await f.request('/api/auth/resend', {})).status, 429);
  const wrong = old === '000000' ? '111111' : '000000'; await f.request('/api/auth/verify', { code: wrong });
  const before = f.db.prepare('SELECT * FROM challenges').get(); f.advance(60001);
  assert.equal((await f.request('/api/auth/resend', {})).status, 200);
  const after = f.db.prepare('SELECT * FROM challenges').get(); assert.equal(after.expires, before.expires); assert.equal(after.attempts, before.attempts);
  // Random codes can coincidentally repeat; a changed code must reject the old one.
  if (old !== f.mail.at(-1).code) assert.equal((await f.request('/api/auth/verify', { code: old })).status, 401);
  assert.equal((await f.verify()).status, 200);
});
test('a new password login replaces the earlier pending challenge', async t => {
  const f = await fixture(t); await f.login(); const oldToken = f.jar.get('mp_pending'), oldCode = f.mail[0].code;
  await f.login(); const newToken = f.jar.get('mp_pending'); f.jar.set('mp_pending', oldToken);
  assert.equal((await f.request('/api/auth/verify', { code: oldCode })).status, 401);
  f.jar.set('mp_pending', newToken); assert.equal((await f.verify()).status, 200);
});
test('SMTP failure does not leave a usable challenge', async t => {
  const f = await fixture(t, { failMail: true }); assert.equal((await f.login()).status, 503);
  assert.equal(f.db.prepare('SELECT count(*) AS n FROM challenges').get().n, 0); assert.equal(f.jar.has('mp_pending'), false);
});
test('password brute force is throttled persistently in database', async t => {
  const f = await fixture(t);
  for (let i = 0; i < 8; i++) await f.request('/api/auth/login', { email, password: 'wrong' });
  assert.equal((await f.login()).status, 429); f.advance(900001); assert.equal((await f.login()).status, 200);
});
test('cross-origin mutations and non-JSON bodies are blocked', async t => {
  const f = await fixture(t);
  assert.equal((await f.request('/api/auth/login', { email, password }, 'POST', { origin: 'https://evil.example' })).status, 403);
  assert.equal((await f.request('/api/auth/login', { email, password }, 'POST', { 'Content-Type': 'text/plain' })).status, 403);
  assert.equal(f.mail.length, 0);
});
test('admin saves persist and drafts stay out of public API', async t => {
  const f = await fixture(t); await f.login(); await f.verify(); const data = (await f.request('/api/admin/portfolio')).data;
  data.profile.name = 'Updated owner'; data.projects[0].published = false; data.projects[0].description = 'private draft';
  data.projects[0].solution = 'private implementation notes'; data.projects[1].outcome = 'public project outcome';
  assert.equal((await f.request('/api/admin/portfolio', data, 'PUT')).status, 200);
  assert.equal((await f.request('/api/admin/portfolio')).data.projects.length, 3);
  assert.equal((await f.request('/api/admin/portfolio')).data.projects[0].solution, 'private implementation notes');
  const publicData = (await f.request('/api/portfolio')).data; assert.equal(publicData.profile.name, 'Updated owner');
  assert.equal(publicData.projects.length, 2); assert.ok(!JSON.stringify(publicData).includes('private draft'));
  assert.ok(!JSON.stringify(publicData).includes('private implementation notes')); assert.equal(publicData.projects[0].outcome, 'public project outcome');
  assert.ok(!JSON.stringify(publicData).includes(passwordHash));
});
test('unsafe project URLs and duplicate IDs are rejected', async t => {
  const f = await fixture(t); await f.login(); await f.verify(); const data = (await f.request('/api/admin/portfolio')).data;
  data.projects[0].demoUrl = 'javascript:alert(1)'; assert.equal((await f.request('/api/admin/portfolio', data, 'PUT')).status, 400);
  data.projects[0].demoUrl = ''; data.projects[0].githubUrl = 'https://github.com.evil.example/user/repo'; assert.equal((await f.request('/api/admin/portfolio', data, 'PUT')).status, 400);
  data.projects[0].githubUrl = ''; data.projects[1].id = data.projects[0].id; assert.equal((await f.request('/api/admin/portfolio', data, 'PUT')).status, 400);
});
test('SQLite content survives closing and reopening the store', () => {
  const directory = mkdtempSync(join(tmpdir(), 'mypublic-test-')); const path = join(directory, 'test.sqlite');
  try { let db = openStore(path); db.prepare('UPDATE portfolio SET content=? WHERE id=1').run('{"persisted":true}'); db.close(); db = openStore(path); assert.equal(db.prepare('SELECT content FROM portfolio').get().content, '{"persisted":true}'); db.close(); }
  finally { assert.equal(dirname(resolve(directory)), resolve(tmpdir())); assert.ok(basename(directory).startsWith('mypublic-test-')); rmSync(directory, { recursive: true, force: true }); }
});
