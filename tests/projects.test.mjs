import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validatePortfolio } from '../server/validation.mjs';
import { projectPath } from '../docs/assets/project-data.js';

const fixture = () => JSON.parse(readFileSync(new URL('./fixtures/portfolio.json', import.meta.url), 'utf8'));
test('existing project records still validate without case-study fields', () => {
  const data = fixture(); const result = validatePortfolio(data);
  for (const field of ['overview', 'responsibility', 'period', 'problem', 'solution', 'outcome']) assert.equal(result.projects[0][field], '');
  assert.equal(result.projects[0].id, data.projects[0].id);
});
test('case-study fields are retained and bounded', () => {
  const data = fixture(); Object.assign(data.projects[0], { overview: 'ภาพรวม', responsibility: 'Developer', period: '2026', problem: 'โจทย์', solution: 'วิธีดำเนินงาน', outcome: 'ผลลัพธ์' });
  assert.equal(validatePortfolio(data).projects[0].solution, 'วิธีดำเนินงาน');
  data.projects[0].solution = 'x'.repeat(3001); assert.throws(() => validatePortfolio(data));
  data.projects[0].solution = { invalid: true }; assert.throws(() => validatePortfolio(data));
});
test('permalinks preserve project identity and encode URL delimiters', () => {
  assert.equal(projectPath('sample-web'), 'project.html?id=sample-web');
  const url = new URL(projectPath('a&b#c'), 'https://example.test/mypublic/');
  assert.equal(url.pathname, '/mypublic/project.html'); assert.equal(url.searchParams.get('id'), 'a&b#c'); assert.equal(url.searchParams.size, 1); assert.equal(url.hash, '');
});
