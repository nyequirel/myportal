function string(value, max, required = false) {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new Error('ข้อมูลข้อความไม่ถูกต้องหรือยาวเกินกำหนด');
  return value.trim();
}
function url(value, github = false) {
  const result = string(value, 500);
  if (!result) return '';
  let parsed;
  try { parsed = new URL(result); } catch { throw new Error('กรุณาระบุ URL ให้ครบถ้วน'); }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || (github && parsed.hostname !== 'github.com')) throw new Error(github ? 'ลิงก์ GitHub ต้องขึ้นต้นด้วย https://github.com/' : 'ลิงก์ต้องใช้ https://');
  return parsed.href;
}
function list(value, maxItems, maxLength) {
  if (!Array.isArray(value) || value.length > maxItems) throw new Error('จำนวนรายการเกินกำหนด');
  return value.map(item => string(item, maxLength, true));
}
export function validatePortfolio(data) {
  if (!data?.profile || !Array.isArray(data.projects) || data.projects.length > 50) throw new Error('ข้อมูลพอร์ตไม่ถูกต้อง (สูงสุด 50 ผลงาน)');
  const p = data.profile;
  const email = string(p.email, 254);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('อีเมลติดต่อไม่ถูกต้อง');
  const ids = new Set();
  return {
    profile: { name: string(p.name, 80, true), nameTh: string(p.nameTh, 120), headline: string(p.headline, 160, true), role: string(p.role, 100), bio: string(p.bio, 600), about: string(p.about, 2000), location: string(p.location, 100), email, githubUrl: url(p.githubUrl, true), skills: list(p.skills, 15, 50) },
    projects: data.projects.map(p => {
      const id = string(p.id, 80, true);
      if (!/^[a-zA-Z0-9_-]+$/.test(id) || ids.has(id)) throw new Error('รหัสผลงานไม่ถูกต้องหรือซ้ำกัน');
      ids.add(id);
      return { id, title: string(p.title, 120, true), category: string(p.category, 80, true), description: string(p.description, 1000), tags: list(p.tags, 8, 40), githubUrl: url(p.githubUrl, true), demoUrl: url(p.demoUrl), featured: p.featured === true, published: p.published === true, sample: p.sample === true, color: ['mint', 'peach', 'lavender'].includes(p.color) ? p.color : 'mint',
        overview: string(p.overview ?? '', 3000), responsibility: string(p.responsibility ?? '', 200), period: string(p.period ?? '', 100), problem: string(p.problem ?? '', 3000), solution: string(p.solution ?? '', 3000), outcome: string(p.outcome ?? '', 2000) };
    })
  };
}
