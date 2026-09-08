import { apiBase, api, status } from './shared.js';
const $ = selector => document.querySelector(selector);
let countdown, remaining = 0;
function setCountdown(seconds) {
  clearInterval(countdown); remaining = seconds;
  const update = () => { $('#resend').disabled = remaining > 0; $('#resend').textContent = remaining > 0 ? `ส่งใหม่ใน ${remaining} วินาที` : 'ส่งรหัสอีกครั้ง'; };
  update(); countdown = setInterval(() => { remaining = Math.max(0, remaining - 1); update(); if (!remaining) clearInterval(countdown); }, 1000);
}
function showOtp(email, retryAfter = 60) {
  $('#login-form').hidden = true; $('#otp-form').hidden = false;
  $('#step-one').classList.remove('current'); $('#step-two').classList.add('current');
  $('#auth-title').textContent = 'ตรวจสอบอีเมลของคุณ'; $('#auth-subtitle').textContent = `ส่งรหัสยืนยันไปที่ ${email} แล้ว`;
  $('#password').value = ''; $('#code').value = ''; $('#code').focus(); setCountdown(retryAfter);
}
async function submitting(form, action) {
  const button = form.querySelector('[type="submit"]'); button.disabled = true; status($('#auth-status'), 'กำลังดำเนินการ...');
  try { await action(); } catch (error) { status($('#auth-status'), error.message, true); if (error.restart) { $('#otp-form').hidden = true; $('#login-form').hidden = false; $('#auth-title').textContent = 'เข้าสู่ระบบอีกครั้ง'; $('#auth-subtitle').textContent = 'กรุณายืนยันรหัสผ่านเพื่อขอรหัสใหม่'; $('#step-one').classList.add('current'); $('#step-two').classList.remove('current'); } }
  finally { button.disabled = false; }
}
$('#toggle-password').addEventListener('click', () => { const show = $('#password').type === 'password'; $('#password').type = show ? 'text' : 'password'; $('#toggle-password').textContent = show ? 'ซ่อน' : 'แสดง'; $('#toggle-password').setAttribute('aria-label', show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'); $('#toggle-password').setAttribute('aria-pressed', String(show)); });
$('#login-form').addEventListener('submit', event => { event.preventDefault(); submitting(event.currentTarget, async () => { const result = await api('/api/auth/login', { email: $('#email').value, password: $('#password').value }); status($('#auth-status'), ''); showOtp(result.email, result.retryAfter); }); });
$('#otp-form').addEventListener('submit', event => { event.preventDefault(); submitting(event.currentTarget, async () => { await api('/api/auth/verify', { code: $('#code').value }); location.replace('admin.html'); }); });
$('#resend').addEventListener('click', async () => { $('#resend').disabled = true; try { const result = await api('/api/auth/resend', {}); setCountdown(result.retryAfter); status($('#auth-status'), 'ส่งรหัสใหม่แล้ว กรุณาใช้รหัสล่าสุด'); } catch (error) { status($('#auth-status'), error.message, true); setCountdown(error.retryAfter || 0); if (error.restart) { $('#otp-form').hidden = true; $('#login-form').hidden = false; $('#auth-title').textContent = 'เข้าสู่ระบบอีกครั้ง'; $('#auth-subtitle').textContent = 'กรุณายืนยันรหัสผ่านเพื่อขอรหัสใหม่'; } } });
$('#restart').addEventListener('click', async () => { try { await api('/api/auth/logout', {}); location.reload(); } catch (error) { status($('#auth-status'), error.message, true); } });
try {
  const base = apiBase();
  if (base && base === location.origin) { const result = await api('/api/auth/status'); if (result.authenticated) location.replace('admin.html'); else if (result.pending) showOtp(result.email, result.retryAfter); }
  else {
    $('#setup-note').hidden = false; $('#login-form').querySelectorAll('input, button').forEach(node => { node.disabled = true; });
    if (base) { $('#setup-note').querySelector('strong').textContent = 'เข้าสู่ระบบผ่านพื้นที่จัดการของคุณ'; $('#setup-note').querySelector('p').textContent = 'ระบบจะเปิดหน้าจัดการที่เชื่อมต่ออีเมลไว้แล้ว เพื่อยืนยันตัวตนและดูแลผลงานของคุณ'; $('#backend-link').hidden = false; $('#backend-link').href = `${base}/login.html`; $('#login-form').hidden = true; }
  }
} catch { $('#setup-note').hidden = false; $('#login-form').querySelectorAll('input, button').forEach(node => { node.disabled = true; }); }
