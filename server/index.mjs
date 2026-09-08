import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import nodemailer from 'nodemailer';
import { openStore, root } from './store.mjs';
import { createApp } from './app.mjs';
import { token } from './security.mjs';

const production = process.env.NODE_ENV === 'production';
const appUrl = process.env.APP_URL || 'http://localhost:3000';
const mailMode = process.env.MAIL_MODE || 'outbox';
const dataDir = resolve(root, 'server/data');
mkdirSync(dataDir, { recursive: true });
let secret = process.env.APP_SECRET;
if (production && (!secret || secret.length < 64 || new URL(appUrl).protocol !== 'https:' || mailMode !== 'smtp')) {
  throw new Error('Production requires HTTPS APP_URL, APP_SECRET of at least 64 characters, and MAIL_MODE=smtp.');
}
if (!secret) {
  const path = resolve(dataDir, '.local-secret');
  if (!existsSync(path)) writeFileSync(path, token(), { mode: 0o600, flag: 'wx' });
  secret = readFileSync(path, 'utf8').trim();
}
let transport;
if (mailMode === 'smtp') {
  if (!process.env.SMTP_HOST || !process.env.MAIL_FROM) throw new Error('Set SMTP_HOST and MAIL_FROM.');
  transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === 'true', requireTLS: process.env.SMTP_SECURE !== 'true', auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000 });
} else if (mailMode !== 'outbox') { throw new Error('MAIL_MODE must be smtp or outbox.'); }
const sendCode = async (email, code) => {
  const text = `รหัสยืนยันเข้าสู่ระบบ MyPublic ของคุณคือ ${code}\nรหัสใช้ได้ครั้งเดียว ภายใน 10 นาทีหลังเริ่มเข้าสู่ระบบ\nหากขอรหัสใหม่ ให้ใช้รหัสล่าสุดเท่านั้น\nหากไม่ได้เป็นผู้เข้าสู่ระบบ ไม่ต้องดำเนินการใด ๆ`;
  if (transport) await transport.sendMail({ from: process.env.MAIL_FROM, to: email, subject: 'รหัสยืนยันเข้าสู่ระบบ MyPublic', text });
  else {
    const directory = resolve(dataDir, 'outbox');
    mkdirSync(directory, { recursive: true });
    writeFileSync(resolve(directory, 'latest-email.txt'), `To: ${email}\n${text}`, { mode: 0o600 });
    console.log('Development email written to server/data/outbox/latest-email.txt');
  }
};
const db = openStore();
const app = await createApp({ db, secret, appUrl, sendCode, production });
const server = app.listen(Number(process.env.PORT || 3000), process.env.HOST || '127.0.0.1', () => console.log(`MyPublic: ${appUrl} | mail: ${mailMode}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => { db.close(); process.exit(0); }));
