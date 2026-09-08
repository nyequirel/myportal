import { element, safeUrl, externalLink, status } from './shared.js';
import { loadPortfolio, projectPath } from './project-data.js';
let projects = [], category = 'ทั้งหมด';
const $ = selector => document.querySelector(selector);
function tags(target, values) { target.replaceChildren(...values.map(value => element('span', 'tag', value))); }
function renderProjects() {
  const term = $('#search').value.toLowerCase().trim();
  const filtered = projects.filter(p => (category === 'ทั้งหมด' || p.category === category) && `${p.title} ${p.description} ${p.tags.join(' ')}`.toLowerCase().includes(term));
  const grid = $('#projects'); grid.replaceChildren();
  $('#project-count').textContent = `${filtered.length.toString().padStart(2, '0')} PROJECTS`;
  if (!filtered.length) grid.append(element('p', 'empty-state', 'ยังไม่มีผลงานที่ตรงกับการค้นหา ลองเปลี่ยนคำค้นหรือประเภทผลงาน'));
  for (const [index, p] of filtered.entries()) {
    const card = element('article', 'project-card');
    const visual = element('a', `project-visual ${['mint', 'peach', 'lavender'].includes(p.color) ? p.color : 'mint'}`);
    visual.href = projectPath(p.id); visual.setAttribute('aria-label', `ดูรายละเอียด ${p.title}`);
    visual.append(element('span', 'project-number', String(index + 1).padStart(2, '0')));
    if (p.sample) visual.append(element('span', 'sample-badge', 'ตัวอย่าง'));
    const art = element('span', 'project-art');
    const artTop = element('span', 'mini-window-top', '• • •');
    const artBody = element('span', 'mini-window-body');
    artBody.append(element('span', 'mini-sidebar'), element('span', 'mini-heading'), element('span', 'mini-line'), element('span', 'mini-block block-one'), element('span', 'mini-block block-two'), element('span', 'mini-block block-three'));
    art.append(artTop, artBody); visual.append(art, element('span', 'visual-caption', p.category.toUpperCase()));
    const body = element('div', 'project-body'); const meta = element('div', 'project-meta');
    meta.append(element('span', 'project-category', p.category));
    if (p.featured) meta.append(element('span', 'featured-label', '✧ Featured'));
    const title = element('h3'); const titleLink = element('a', 'title-button', `${p.title} ↗`); titleLink.href = projectPath(p.id); title.append(titleLink);
    const tagList = element('div', 'tags'); tags(tagList, p.tags);
    body.append(meta, title, element('p', 'project-description', p.description), tagList); card.append(visual, body); grid.append(card);
  }
}
function render(data) {
  const p = data.profile;
  document.querySelectorAll('[data-name]').forEach(node => { node.textContent = p.name; });
  document.title = `${p.name} — Personal portfolio`;
  $('#hero-title').textContent = p.headline; $('#bio').textContent = p.bio; $('#role').textContent = p.role; $('#location').textContent = p.location;
  $('#name-th').textContent = p.nameTh || p.name; $('#about-text').textContent = p.about;
  $('#skills').replaceChildren(...p.skills.map(skill => element('span', 'skill', skill)));
  const github = safeUrl(p.githubUrl, true);
  if (github) { $('#hero-secondary').href = github; $('#hero-secondary').textContent = 'ดู GitHub ของผม ↗'; $('#hero-secondary').target = '_blank'; $('#hero-secondary').rel = 'noopener noreferrer'; }
  const contact = $('#contact-links'); contact.replaceChildren();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) { const link = element('a', 'button primary', 'ส่งอีเมลหาผม ↗'); link.href = `mailto:${p.email}`; contact.append(link); }
  if (github) contact.append(externalLink('GitHub ↗', github, 'button light'));
  if (!contact.children.length) contact.append(element('span', 'contact-pending', 'กำลังเตรียมช่องทางติดต่อ'));
  projects = data.projects.filter(project => project.published).sort((a, b) => Number(b.featured) - Number(a.featured));
  const filters = $('#filters'); filters.replaceChildren();
  for (const value of ['ทั้งหมด', ...new Set(projects.map(p => p.category))]) {
    const button = element('button', `filter${value === category ? ' active' : ''}`, value);
    button.type = 'button'; button.setAttribute('aria-pressed', String(value === category));
    button.addEventListener('click', () => { category = value; filters.querySelectorAll('button').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); }); renderProjects(); }); filters.append(button);
  }
  renderProjects();
}
$('#year').textContent = new Date().getFullYear();
$('#search').addEventListener('input', renderProjects);
try {
  const { data, fallback } = await loadPortfolio();
  render(data);
  if (fallback) status($('#portfolio-status'), 'กำลังแสดงข้อมูลฉบับสำรอง เนื่องจากยังเชื่อมต่อข้อมูลล่าสุดไม่ได้');
} catch { $('#projects').replaceChildren(element('p', 'empty-state', 'โหลดข้อมูลไม่สำเร็จ กรุณาเปิดเว็บผ่านเซิร์ฟเวอร์หรือ GitHub Pages แล้วลองอีกครั้ง')); }
