export function apiBase() {
  const configured = window.PORTFOLIO_CONFIG?.apiBaseUrl;
  if (configured) {
    const url = new URL(configured);
    if (url.protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new Error('Backend URL ต้องใช้ HTTPS');
    return url.origin;
  }
  return ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) ? location.origin : null;
}
export async function api(path, data, method = 'POST') {
  const response = await fetch(path, { method: data === undefined ? 'GET' : method, credentials: 'same-origin', headers: data === undefined ? {} : { 'Content-Type': 'application/json' }, body: data === undefined ? undefined : JSON.stringify(data) });
  let result;
  try { result = await response.json(); } catch { throw new Error('ยังไม่ได้เชื่อมต่อ backend กรุณาเปิดผ่านเซิร์ฟเวอร์ของระบบ'); }
  if (!response.ok) { const error = new Error(result.error || 'เกิดข้อผิดพลาด'); Object.assign(error, result, { status: response.status }); throw error; }
  return result;
}
export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
export function safeUrl(value, github = false) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password && (!github || url.hostname === 'github.com') ? url.href : null; } catch { return null; }
}
export function externalLink(label, url, className = 'button ghost') {
  const link = element('a', className, label);
  link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
  return link;
}
export function status(node, message, isError = false) {
  node.textContent = message; node.hidden = !message; node.classList.toggle('error', isError);
}
