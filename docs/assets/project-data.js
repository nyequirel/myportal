import { apiBase } from './shared.js';

// Shared by the listing and detail page, so both use the same public data source.
export async function loadPortfolio() {
  const base = apiBase();
  if (base) {
    try {
      const response = await fetch(`${base}/api/portfolio`, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error('API unavailable');
      const data = await response.json();
      if (!data.profile || !Array.isArray(data.projects)) throw new Error('Invalid data');
      return { data, fallback: false };
    } catch { /* Use the published static snapshot when the API cannot be reached. */ }
  }
  const response = await fetch('data/portfolio.json');
  if (!response.ok) throw new Error('โหลดข้อมูลผลงานไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
  return { data: await response.json(), fallback: !!base };
}

export function projectPath(id) {
  return `project.html?${new URLSearchParams({ id })}`;
}
