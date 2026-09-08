import { readdirSync, readFileSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { validatePortfolio } from '../server/validation.mjs';
function files(directory) { return readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(resolve(directory, entry.name)) : [resolve(directory, entry.name)]); }
const publicFiles = files('docs');
for (const path of [...publicFiles, ...files('server'), ...files('scripts'), ...files('tests')]) {
  if (['.js', '.mjs'].includes(extname(path))) { const result = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' }); if (result.status !== 0) throw new Error(result.stderr); }
}
for (const path of publicFiles) assert.ok(!/\.(env|sqlite|php)$/.test(path), `Private file in docs: ${path}`);
const data = JSON.parse(readFileSync('docs/data/portfolio.json', 'utf8')); validatePortfolio(data);
assert.ok(data.projects.every(project => project.published), 'Do not ship private drafts in static data.');
for (const page of ['index.html', 'project.html', 'login.html', 'admin.html']) {
  const html = readFileSync(`docs/${page}`, 'utf8'); assert.ok(html.includes('name="viewport"')); assert.ok(html.includes('lang="th"'));
  for (const match of html.matchAll(/(?:src|href)="((?:assets\/|data\/|config\.js)[^"#?]*)"/g)) assert.ok(publicFiles.includes(resolve('docs', match[1])), `Missing local asset ${match[1]}`);
}
console.log(`Syntax, public data, and local asset checks passed (${publicFiles.length} static files).`);
