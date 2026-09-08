import { element, safeUrl, externalLink, status } from './shared.js';
import { loadPortfolio, projectPath } from './project-data.js';

const $ = selector => document.querySelector(selector);
const id = new URLSearchParams(location.search).get('id');

function story(title, text, number) {
  const section = element('section', 'story-section');
  section.append(element('p', 'eyebrow muted', number), element('h2', '', title), element('p', 'story-copy', text));
  return section;
}

function render(project, data) {
  document.title = `${project.title} — ${data.profile.name}`;
  $('meta[name="description"]').content = project.description;
  document.querySelectorAll('[data-name]').forEach(node => { node.textContent = data.profile.name; });
  $('#project-title').textContent = project.title;
  $('#breadcrumb-title').textContent = project.title;
  $('#cover-title').textContent = project.title;
  $('#project-category').textContent = project.category;
  $('#project-description').textContent = project.description;
  $('#project-cover').classList.add(['mint', 'peach', 'lavender'].includes(project.color) ? project.color : 'mint');
  $('#sample-note').hidden = !project.sample;
  const sections = [['ภาพรวมโปรเจกต์', project.overview || project.description], ['โจทย์และเป้าหมาย', project.problem], ['แนวทางและวิธีดำเนินงาน', project.solution], ['ผลลัพธ์และสิ่งที่ได้เรียนรู้', project.outcome]].filter(([, text]) => typeof text === 'string' && text.trim());
  $('#project-story').replaceChildren(...sections.map(([title, text], i) => story(title, text, String(i + 1).padStart(2, '0'))));
  const metadata = $('#project-metadata');
  for (const [label, value] of [['ประเภท', project.category], ['บทบาทของฉัน', project.responsibility], ['ช่วงเวลาดำเนินงาน', project.period]]) {
    if (value) metadata.append(element('dt', '', label), element('dd', '', value));
  }
  $('#project-tags').replaceChildren(...project.tags.map(tag => element('span', 'tag', tag)));
  if (!project.tags.length) $('#project-tags').append(element('span', 'muted', 'ยังไม่ได้ระบุ'));
  if (safeUrl(project.githubUrl, true)) $('#project-links').append(externalLink('ดูโค้ดบน GitHub ↗', project.githubUrl, 'button primary'));
  if (safeUrl(project.demoUrl)) $('#project-links').append(externalLink('เปิดเว็บไซต์ / Demo ↗', project.demoUrl, 'button light'));
  if (!$('#project-links').children.length) $('#project-links').append(element('p', 'muted', 'ยังไม่ได้เพิ่มลิงก์ GitHub หรือ Demo'));
  const related = data.projects.filter(p => p.published === true && p.id !== project.id).slice(0, 3);
  if (related.length) {
    $('#related-section').hidden = false;
    $('#related-projects').replaceChildren(...related.map(p => {
      const link = element('a', 'related-project'); link.href = projectPath(p.id);
      link.append(element('span', 'eyebrow muted', p.category), element('h3', '', `${p.title} ↗`), element('p', '', p.description)); return link;
    }));
  }
  $('#project-detail').hidden = false;
}

$('#copy-link').addEventListener('click', async () => {
  const url = new URL(projectPath(id), location.href).href;
  try { await navigator.clipboard.writeText(url); $('#share-status').textContent = 'คัดลอกลิงก์แล้ว'; }
  catch { $('#share-label').hidden = false; $('#share-url').hidden = false; $('#share-url').value = url; $('#share-url').focus(); $('#share-url').select(); $('#share-status').textContent = 'เลือกและคัดลอกลิงก์จากช่องด้านล่างได้เลย'; }
});

try {
  const { data, fallback } = await loadPortfolio();
  const project = data.projects.find(p => p.id === id && p.published === true);
  if (!project) { document.title = 'ไม่พบผลงาน — MyPublic'; $('#project-not-found').hidden = false; status($('#project-status'), ''); }
  else { render(project, data); status($('#project-status'), fallback ? 'กำลังแสดงข้อมูลฉบับสำรอง เนื่องจากยังเชื่อมต่อข้อมูลล่าสุดไม่ได้' : ''); }
} catch (error) { status($('#project-status'), error.message || 'โหลดรายละเอียดไม่สำเร็จ กรุณาลองใหม่', true); }
