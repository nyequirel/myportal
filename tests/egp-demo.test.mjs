import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = new URL('../docs/demos/egp/',import.meta.url);
const json = name => JSON.parse(readFileSync(new URL(`data/${name}.json`,root),'utf8'));
test('public E-GP sample is bounded, anonymized and has no source connection data', () => {
  const announcements = json('announcements'), queues = json('queues');
  assert.equal(announcements.length,100); assert.equal(queues.length,10);
  assert.equal(new Set(announcements.map(a => a.announce_id)).size,100);
  assert.equal(new Set(queues.map(q => q.queue_id)).size,10);
  assert.equal(json('manifest').announcementCount,100); assert.equal(json('manifest').queueCount,10);
  for (const a of announcements) { assert.match(a.projectId,/^DEMO-\d{4}$/); assert.equal(a.link,''); assert.match(a.department_sub_name,/^หน่วยงานตัวอย่าง \d+$/); }
  for (const q of queues) assert.match(q.department_sub_name,/^หน่วยงานตัวอย่าง \d+$/);
  const contents = JSON.stringify([announcements,queues]);
  assert.doesNotMatch(contents,/กรม|ควบคุมมลพิษ|\bpcd\b|https?:\/\/|\b\d{1,3}(?:\.\d{1,3}){3}\b|password|smtp|departmentid|departmentsubid/i);
});
test('100 announcements cover every populated source type without fabricating absent types', () => {
  const rows = json('announcements'), manifest = json('manifest');
  assert.deepEqual([...new Set(rows.map(a=>a.anounceType))].sort(),['15','B0','D0','D1','P0','W0','W1']);
  assert.equal(manifest.announcementTypeCount,7);
  assert.equal(manifest.announcementTypes.reduce((total,t)=>total+t.sampleCount,0),100);
  for (const type of manifest.announcementTypes) {
    assert.equal(rows.filter(a=>a.anounceType===type.code).length,type.sampleCount);
    assert.equal(type.sourceCount>0,type.sampleCount>0);
    assert.ok(type.sampleCount<=type.sourceCount);
  }
  assert.deepEqual(manifest.announcementTypes.filter(t=>t.sourceCount===0).map(t=>t.code).sort(),['D2','W2']);
});
test('E-GP public copy contains static assets only and links to its portfolio entry', () => {
  function inspect(directory) {
    for (const entry of readdirSync(directory,{withFileTypes:true})) {
      const path = join(directory,entry.name);
      if (entry.isDirectory()) { inspect(path); continue; }
      assert.match(entry.name,/\.(html|css|js|json|woff2|txt)$/);
      if (entry.name.endsWith('.html')) assert.doesNotMatch(readFileSync(path,'utf8'),/<\?php|pcd|กรม|public-api\.php|backend\/|10\.5\.|<img\b/i);
    }
  }
  inspect(fileURLToPath(root));
  const portfolio = JSON.parse(readFileSync(new URL('../docs/data/portfolio.json',import.meta.url),'utf8'));
  const project = portfolio.projects.find(p => p.id === 'egp-integration');
  assert.equal(project.published,true); assert.equal(new URL(project.demoUrl).pathname,'/myportal/demos/egp/');
});
