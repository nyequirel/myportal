import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHmac } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(scryptCallback);
export const token = () => randomBytes(32).toString('hex');
export const digest = (value, secret) => createHmac('sha256', secret).update(value).digest('hex');
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64, { N: 32768, maxmem: 64 * 1024 * 1024 });
  return `${salt}:${hash.toString('hex')}`;
}
export async function checkPassword(password, stored) {
  const [salt, expected] = stored.split(':');
  const actual = await scrypt(password, salt, 64, { N: 32768, maxmem: 64 * 1024 * 1024 });
  return timingSafeEqual(actual, Buffer.from(expected, 'hex'));
}
export function validPassword(password) {
  return typeof password === 'string' && password.length >= 12 && password.length <= 128;
}
export function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}
export function validEmail(value) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
