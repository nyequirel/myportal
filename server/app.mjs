import express from 'express';
import { randomInt, timingSafeEqual } from 'node:crypto';
import { resolve } from 'node:path';
import { root } from './store.mjs';
import { checkPassword, hashPassword, token, digest, normalizeEmail, validEmail } from './security.mjs';
import { validatePortfolio } from './validation.mjs';

export async function createApp({ db, secret, appUrl, sendCode, production = false, now = Date.now }) {
  const app = express();
  const origin = new URL(appUrl).origin;
  const dummyPassword = await hashPassword(token());
  const hash = value => digest(value, secret);
  const cookieOptions = { httpOnly: true, secure: production, sameSite: 'strict', path: '/' };
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' https:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'" });
    if (production) res.set('Strict-Transport-Security', 'max-age=31536000');
    if (req.path.startsWith('/api/')) res.set('Cache-Control', 'no-store');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && (req.get('origin') !== origin || !req.is('application/json'))) {
      return res.status(403).json({ error: 'คำขอไม่ถูกต้อง กรุณาเปิดหน้าระบบจาก URL ที่ตั้งค่าไว้' });
    }
    next();
  });
  app.use(express.json({ limit: '100kb' }));
  function cookie(req, name) {
    return (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith(`${name}=`))?.slice(name.length + 1) || '';
  }
  function limit(key, max, window) {
    const time = now();
    db.prepare('DELETE FROM limits WHERE expires <= ?').run(time);
    const row = db.prepare(`INSERT INTO limits (key, count, expires) VALUES (?, 1, ?)
      ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count`).get(hash(key), time + window);
    return row.count <= max;
  }
  function limited(res) { return res.status(429).json({ error: 'ลองหลายครั้งเกินไป กรุณารอ 15 นาทีแล้วลองใหม่' }); }
  function pending(req) {
    const value = cookie(req, 'mp_pending');
    if (!/^[a-f0-9]{64}$/.test(value)) return undefined;
    return db.prepare('SELECT * FROM challenges WHERE token=? AND expires>? AND attempts<5').get(hash(value), now());
  }
  function authenticated(req, res, next) {
    const value = cookie(req, 'mp_session');
    if (!/^[a-f0-9]{64}$/.test(value) || !db.prepare('SELECT token FROM sessions WHERE token=? AND expires>?').get(hash(value), now())) {
      return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบและยืนยันรหัสอีเมลก่อน' });
    }
    next();
  }
  function publicPortfolio() {
    const data = JSON.parse(db.prepare('SELECT content FROM portfolio WHERE id=1').get().content);
    data.projects = data.projects.filter(project => project.published);
    return data;
  }
  app.get('/api/portfolio', (req, res) => res.set('Access-Control-Allow-Origin', '*').json(publicPortfolio()));
  app.get('/api/auth/status', (req, res) => {
    const value = cookie(req, 'mp_session');
    const authenticated = !!value && !!db.prepare('SELECT token FROM sessions WHERE token=? AND expires>?').get(hash(value), now());
    const challenge = pending(req);
    const email = db.prepare('SELECT email FROM owner WHERE id=1').get()?.email;
    res.json({ authenticated, pending: !!challenge?.delivered, email: challenge?.delivered ? `${email[0]}***@${email.split('@')[1]}` : null, retryAfter: challenge ? Math.max(0, Math.ceil((challenge.resend_at - now()) / 1000)) : 0 });
  });
  app.post('/api/auth/login', async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;
    if (!validEmail(email) || typeof password !== 'string' || password.length < 1 || password.length > 128) return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่านให้ถูกต้อง' });
    // Use socket IP, never trust a caller-supplied X-Forwarded-For header.
    if (!limit(`login-ip:${req.ip}`, 30, 900000) || !limit(`login-email:${email}`, 8, 900000)) return limited(res);
    const owner = db.prepare('SELECT * FROM owner WHERE id=1').get();
    const matches = await checkPassword(password, owner?.password || dummyPassword);
    const currentOwner = db.prepare('SELECT * FROM owner WHERE id=1').get();
    if (!owner || owner.email !== email || !matches || currentOwner?.password !== owner.password || currentOwner?.email !== owner.email) return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    if (!limit('email-delivery', 5, 900000)) return limited(res);
    const pendingToken = token();
    const code = String(randomInt(0, 1000000)).padStart(6, '0');
    db.prepare('INSERT OR REPLACE INTO challenges (owner_id, token, code, expires, attempts, resend_at, sends, delivered) VALUES (1, ?, ?, ?, 0, ?, 1, 0)')
      .run(hash(pendingToken), hash(`${pendingToken}:${code}`), now() + 600000, now() + 60000);
    try {
      await sendCode(owner.email, code);
      const updated = db.prepare('UPDATE challenges SET delivered=1 WHERE token=?').run(hash(pendingToken));
      if (!updated.changes) return res.status(409).json({ error: 'มีการเข้าสู่ระบบครั้งใหม่ กรุณาเริ่มอีกครั้ง' });
      res.cookie('mp_pending', pendingToken, { ...cookieOptions, maxAge: 600000 });
      res.json({ next: 'otp', retryAfter: 60, email: `${email[0]}***@${email.split('@')[1]}` });
    } catch {
      db.prepare('DELETE FROM challenges WHERE token=?').run(hash(pendingToken));
      res.status(503).json({ error: 'ส่งอีเมลไม่สำเร็จ กรุณาตรวจสอบการตั้งค่าอีเมลหรือลองใหม่ภายหลัง' });
    }
  });
  app.post('/api/auth/verify', (req, res) => {
    if (!limit(`verify-ip:${req.ip}`, 30, 900000)) return limited(res);
    const challenge = pending(req);
    if (!challenge?.delivered) return res.status(401).json({ error: 'รหัสหมดอายุหรือครบจำนวนครั้ง กรุณาเข้าสู่ระบบใหม่', restart: true });
    if (!limit('verify-owner', 15, 900000)) return limited(res);
    const code = req.body?.code;
    const used = db.prepare('UPDATE challenges SET attempts=attempts+1 WHERE token=? AND attempts<5 AND expires>?').run(challenge.token, now());
    if (!used.changes) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบใหม่', restart: true });
    const actual = hash(`${cookie(req, 'mp_pending')}:${typeof code === 'string' ? code : ''}`);
    if (typeof code !== 'string' || !/^\d{6}$/.test(code) || !timingSafeEqual(Buffer.from(actual), Buffer.from(challenge.code))) {
      return res.status(401).json({ error: 'รหัสยืนยันไม่ถูกต้อง', restart: challenge.attempts >= 4 });
    }
    // Synchronous conditional consumption ensures only one verification can succeed.
    const consumed = db.prepare('DELETE FROM challenges WHERE token=? AND code=?').run(challenge.token, challenge.code);
    if (!consumed.changes) return res.status(401).json({ error: 'รหัสนี้ถูกใช้แล้ว', restart: true });
    db.prepare('DELETE FROM sessions WHERE expires<=?').run(now());
    const session = token();
    db.prepare('INSERT INTO sessions (token, expires) VALUES (?, ?)').run(hash(session), now() + 8 * 3600000);
    res.clearCookie('mp_pending', cookieOptions);
    res.cookie('mp_session', session, { ...cookieOptions, maxAge: 8 * 3600000 });
    res.json({ authenticated: true });
  });
  app.post('/api/auth/resend', async (req, res) => {
    if (!limit(`resend-ip:${req.ip}`, 30, 900000)) return limited(res);
    const challenge = pending(req);
    if (!challenge?.delivered) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบใหม่', restart: true });
    if (challenge.resend_at > now()) return res.status(429).json({ error: 'กรุณารออย่างน้อย 60 วินาทีก่อนส่งรหัสใหม่', retryAfter: Math.ceil((challenge.resend_at - now()) / 1000) });
    if (challenge.sends >= 5 || !limit('email-delivery', 5, 900000)) return limited(res);
    let code, codeHash;
    do {
      code = String(randomInt(0, 1000000)).padStart(6, '0');
      codeHash = hash(`${cookie(req, 'mp_pending')}:${code}`);
    } while (codeHash === challenge.code);
    // Resending does not reset expiry or the failed attempt budget.
    db.prepare('UPDATE challenges SET code=?, resend_at=?, sends=sends+1, delivered=0 WHERE token=?')
      .run(codeHash, now() + 60000, challenge.token);
    try {
      await sendCode(db.prepare('SELECT email FROM owner WHERE id=1').get().email, code);
      const updated = db.prepare('UPDATE challenges SET delivered=1 WHERE token=? AND code=?').run(challenge.token, codeHash);
      if (!updated.changes) return res.status(409).json({ error: 'กรุณาเข้าสู่ระบบใหม่', restart: true });
      res.json({ retryAfter: 60 });
    } catch {
      db.prepare('DELETE FROM challenges WHERE token=? AND code=?').run(challenge.token, codeHash);
      res.status(503).json({ error: 'ส่งอีเมลไม่สำเร็จ กรุณาเข้าสู่ระบบใหม่', restart: true });
    }
  });
  app.post('/api/auth/logout', (req, res) => {
    db.prepare('DELETE FROM sessions WHERE token=?').run(hash(cookie(req, 'mp_session')));
    db.prepare('DELETE FROM challenges WHERE token=?').run(hash(cookie(req, 'mp_pending')));
    res.clearCookie('mp_session', cookieOptions);
    res.clearCookie('mp_pending', cookieOptions);
    res.json({ ok: true });
  });
  app.get('/api/admin/portfolio', authenticated, (req, res) => res.json(JSON.parse(db.prepare('SELECT content FROM portfolio WHERE id=1').get().content)));
  app.put('/api/admin/portfolio', authenticated, (req, res) => {
    try {
      const data = validatePortfolio(req.body);
      db.prepare('UPDATE portfolio SET content=? WHERE id=1').run(JSON.stringify(data));
      res.json({ ok: true });
    } catch (error) { res.status(400).json({ error: error.message }); }
  });
  app.use('/api', (req, res) => res.status(404).json({ error: 'ไม่พบรายการที่ร้องขอ' }));
  app.use(express.static(resolve(root, 'docs'), { dotfiles: 'deny', etag: true }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    res.status(error.type === 'entity.too.large' ? 413 : error instanceof SyntaxError ? 400 : 500)
      .json({ error: 'ไม่สามารถประมวลผลคำขอได้ กรุณาลองใหม่' });
  });
  return app;
}
