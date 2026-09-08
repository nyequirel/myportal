import { apiBase, api, element, status } from './shared.js';
import { projectPath } from './project-data.js';
const $ = selector => document.querySelector(selector);
let data, dirty = false, deleteTarget;
$('.verified-badge').hidden = true;
const profileFields = ['name', 'nameTh', 'headline', 'role', 'bio', 'about', 'location', 'email', 'githubUrl'];
function markDirty() { dirty = true; $('#save-note').textContent = 'มีการแก้ไขที่ยังไม่ได้บันทึก'; }
function updateProjectLinks() {
  for (const editor of document.querySelectorAll('.project-editor')) {
    const project = data.projects.find(p => p.id === editor.dataset.id);
    const link = editor.querySelector('.project-permalink');
    link.hidden = !project?.published;
    if (project) editor.querySelector('legend').textContent = project.title;
  }
}
function projectEditor(project) {
  const editor = element('fieldset', 'project-editor'); editor.dataset.id = project.id;
  const legend = element('legend', '', project.title || 'ผลงานใหม่'); editor.append(legend);
  const permalink = element('a', 'project-permalink', 'เปิดหน้าผลงาน / แชร์ลิงก์ ↗');
  permalink.href = projectPath(project.id); permalink.target = '_blank'; permalink.rel = 'noopener noreferrer'; permalink.hidden = !project.published; editor.append(permalink);
  for (const [name, label, type, max] of [['title', 'ชื่อผลงาน', 'text', 120], ['category', 'ประเภท', 'text', 80], ['description', 'รายละเอียด', 'textarea', 1000], ['tags', 'เทคโนโลยี (คั่นด้วยจุลภาค)', 'text', 320], ['githubUrl', 'GitHub repository', 'url', 500], ['demoUrl', 'ลิงก์เว็บไซต์ / Demo', 'url', 500]]) {
    const id = `${project.id}-${name}`; const fieldLabel = element('label', '', label); fieldLabel.htmlFor = id;
    const input = element(type === 'textarea' ? 'textarea' : 'input'); input.id = id; input.name = name;
    if (type !== 'textarea') input.type = type; else input.rows = 3;
    input.maxLength = max; input.required = ['title', 'category'].includes(name); input.value = name === 'tags' ? project.tags.join(', ') : project[name]; editor.append(fieldLabel, input);
  }
  const details = element('details', 'project-extra'); details.append(element('summary', '', 'รายละเอียดสำหรับนำเสนอโปรเจกต์'));
  for (const [name, label, max] of [['responsibility', 'บทบาทของฉัน', 200], ['period', 'ช่วงเวลาดำเนินงาน', 100], ['overview', 'ภาพรวมโปรเจกต์', 3000], ['problem', 'โจทย์และเป้าหมาย', 3000], ['solution', 'แนวทางและวิธีดำเนินงาน', 3000], ['outcome', 'ผลลัพธ์และสิ่งที่ได้เรียนรู้', 2000]]) {
    const fieldLabel = element('label', '', label); fieldLabel.htmlFor = `${project.id}-${name}`;
    const input = element(max > 200 ? 'textarea' : 'input'); input.id = fieldLabel.htmlFor; input.name = name; input.maxLength = max;
    if (input.tagName === 'TEXTAREA') input.rows = 4; else input.type = 'text';
    input.value = project[name] || ''; details.append(fieldLabel, input);
  }
  details.append(element('p', 'field-hint', 'เว้นส่วนที่ยังไม่มีข้อมูลได้ หัวข้อนั้นจะไม่แสดงบนหน้าผลงาน ลิงก์แต่ละผลงานจะคงเดิมเมื่อเปลี่ยนชื่อ'));
  editor.append(details);
  const label = element('label', '', 'สีหน้าปก'); label.htmlFor = `${project.id}-color`; const select = element('select'); select.name = 'color'; select.id = label.htmlFor;
  for (const [value, name] of [['mint', 'เขียวมิ้นต์'], ['peach', 'พีช'], ['lavender', 'ลาเวนเดอร์']]) { const option = element('option', '', name); option.value = value; option.selected = project.color === value; select.append(option); }
  editor.append(label, select);
  const checks = element('div', 'check-row');
  for (const [name, label] of [['published', 'เผยแพร่'], ['featured', 'ผลงานแนะนำ'], ['sample', 'ตัวอย่าง']]) { const wrapper = element('label', 'checkbox-label'); const input = element('input'); input.type = 'checkbox'; input.name = name; input.checked = project[name]; wrapper.append(input, document.createTextNode(label)); checks.append(wrapper); }
  const remove = element('button', 'text-button danger-text', 'นำผลงานออก'); remove.type = 'button'; remove.addEventListener('click', () => { deleteTarget = editor; $('#delete-dialog').showModal(); });
  editor.append(checks, remove); return editor;
}
function collect() {
  const profile = Object.fromEntries(profileFields.map(name => [name, $(`#${name}`).value.trim()])); profile.skills = $('#skills').value.split(',').map(s => s.trim()).filter(Boolean);
  const projects = [...document.querySelectorAll('.project-editor')].map(editor => { const p = { id: editor.dataset.id }; editor.querySelectorAll('input,textarea,select').forEach(input => { p[input.name] = input.type === 'checkbox' ? input.checked : input.value.trim(); }); p.tags = p.tags.split(',').map(s => s.trim()).filter(Boolean); return p; });
  return { profile, projects };
}
$('#portfolio-form').addEventListener('input', markDirty);
$('#portfolio-form').addEventListener('submit', async event => { event.preventDefault(); $('#save').disabled = true; try { const next = collect(); await api('/api/admin/portfolio', next, 'PUT'); data = next; dirty = false; updateProjectLinks(); $('#save-note').textContent = 'บันทึกข้อมูลเรียบร้อยแล้ว'; status($('#admin-status'), 'บันทึกโปรไฟล์และผลงานเรียบร้อยแล้ว'); } catch (error) { status($('#admin-status'), error.message, true); if (error.status === 401) location.assign('login.html'); } finally { $('#save').disabled = false; } });
$('#add-project').addEventListener('click', () => { if (document.querySelectorAll('.project-editor').length >= 50) return status($('#admin-status'), 'เพิ่มได้สูงสุด 50 ผลงาน', true); const editor = projectEditor({ id: crypto.randomUUID(), title: '', category: 'Web application', description: '', tags: [], githubUrl: '', demoUrl: '', published: false, featured: false, sample: false, color: 'mint' }); $('#project-editors').append(editor); editor.querySelector('input').focus(); markDirty(); });
$('#cancel-delete').addEventListener('click', () => $('#delete-dialog').close());
$('#confirm-delete').addEventListener('click', () => { deleteTarget?.remove(); $('#delete-dialog').close(); markDirty(); });
$('#export').addEventListener('click', () => {
  if (dirty) return status($('#admin-status'), 'กรุณาบันทึกการเปลี่ยนแปลงก่อนส่งออกไฟล์', true);
  const publicData = { profile: data.profile, projects: data.projects.filter(p => p.published) };
  const url = URL.createObjectURL(new Blob([JSON.stringify(publicData, null, 2) + '\n'], { type: 'application/json' })); const link = element('a'); link.href = url; link.download = 'portfolio.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  status($('#admin-status'), 'ส่งออกข้อมูลที่เผยแพร่แล้ว นำ portfolio.json ไปแทนไฟล์ docs/data/portfolio.json ใน repository');
});
$('#logout').addEventListener('click', async () => { try { await api('/api/auth/logout', {}); dirty = false; location.replace('login.html'); } catch (error) { status($('#admin-status'), error.message, true); } });
window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
try {
  if (apiBase() !== location.origin) location.replace('login.html');
  else { data = await api('/api/admin/portfolio'); profileFields.forEach(name => { $(`#${name}`).value = data.profile[name]; }); $('#skills').value = data.profile.skills.join(', '); $('#project-editors').replaceChildren(...data.projects.map(projectEditor)); $('#portfolio-form').hidden = false; $('.verified-badge').hidden = false; status($('#admin-status'), ''); }
} catch (error) { if (error.status === 401) location.replace('login.html'); else { $('.verified-badge').hidden = true; status($('#admin-status'), error.message, true); } }
