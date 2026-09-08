import {chromium,expect} from '@playwright/test';
import express from 'express';
import {once} from 'node:events';
import {resolve} from 'node:path';
import {mkdirSync,readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {openStore} from '../server/store.mjs';
import {createApp} from '../server/app.mjs';
const db=openStore(':memory:');
const sourceSamples=JSON.parse(readFileSync('docs/demos/egp/data/announcements.json','utf8'));
const backend=await createApp({db,secret:'egp-browser-check'.repeat(8),appUrl:'http://127.0.0.1:4183',sendCode:async()=>{}});
const server=backend.listen(4183,'127.0.0.1');await once(server,'listening');
const app=express();app.get('/api/portfolio',(_,res)=>res.sendFile(resolve('docs/data/portfolio.json')));app.use('/myportal',express.static(resolve('docs')));
const staticServer=app.listen(4184,'127.0.0.1');await once(staticServer,'listening');
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'chrome'}:{})});
mkdirSync('.artifacts',{recursive:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[],badResponses=[],unsafeRequests=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',msg=>{if(msg.type()==='error')errors.push(`${msg.text()} ${msg.location().url}`);});
 page.on('response',r=>{if(r.status()>=400)badResponses.push(`${r.status()} ${r.url()}`);});
 page.on('request',r=>{if(r.method()!=='GET'||!r.url().startsWith('http://127.0.0.1:'))unsafeRequests.push(`${r.method()} ${r.url()}`);});
 for(const base of ['http://127.0.0.1:4183/demos/egp/','http://127.0.0.1:4184/myportal/demos/egp/']) {
  await page.goto(base);await expect(page.locator('#totalCount')).toHaveText('100');await expect(page.locator('#queueCount')).toHaveText('10');
  await page.evaluate(async()=>{
    const announcements=await (await fetch('data/announcements.json')).json();
    const queues=await (await fetch('data/queues.json')).json();
    sessionStorage.setItem('procureflow-demo-v1',JSON.stringify({datasetVersion:'previous-version',announcements:announcements.slice(0,1),queues,logs:[]}));
  });
  await page.reload();await expect(page.locator('#totalCount')).toHaveText('100');
  await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.evaluate(()=>[...document.fonts].some(font=>font.family==='Font Awesome 5 Free'&&font.status==='loaded')),true,'Icon font must load');
  await page.screenshot({path:'.artifacts/egp-dashboard-desktop.png',fullPage:true});
  await page.goto(`${base}announce.html`);await expect(page.locator('#announce-table tbody tr')).toHaveCount(10);
  await expect(page.locator('#announceTypeFilter option')).toHaveCount(8);
  for(const [code,count] of [['15',15],['B0',11],['D0',14],['D1',1],['P0',20],['W0',20],['W1',19]]){
    await page.locator('#announceTypeFilter').selectOption(code);
    await expect(page.locator('#announcementSummary')).toContainText(`${count} รายการ ·`);
    await expect(page.locator('[data-edit]')).toHaveCount(Math.min(10,count));
  }
  await page.locator('#announceTypeFilter').selectOption('');
  await page.locator('#announcementNext').click();await expect(page.locator('#announcementSummary')).toContainText('หน้า 2 / 10');
  await page.locator('#announcementSearch').fill('zzzz-no-match');await expect(page.locator('#announce-table tbody')).toContainText('ไม่พบประกาศ');
  const first=sourceSamples[0];
  await page.locator('#announcementSearch').fill(first.projectId);await expect(page.locator('[data-edit]')).toHaveCount(1);
  await expect(page.locator('.announcement-description')).toHaveText(first.description);
  await expect(page.locator('#announce-table a').filter({hasText:'เปิด'})).toHaveAttribute('href',first.link);
  await expect(page.locator('#announce-table a').filter({hasText:'สาระสำคัญของสัญญา'})).toHaveAttribute('href',first.contract_link);
  await page.locator('[data-edit]').click();await expect(page.locator('#announceModal')).toBeVisible();
  await expect(page.locator('#description')).toHaveValue(first.description);
  await expect(page.locator('#projectId')).toHaveValue(first.projectId);
  await expect(page.locator('#documentLink')).toHaveValue(first.link);
  await expect(page.locator('#sourceDocumentLinks a')).toHaveCount(2);
  await page.screenshot({path:'.artifacts/egp-source-details.png',fullPage:true});
  await page.locator('#announceTitle').fill('ทดสอบแก้ไข <img src=x onerror=alert(1)>');await page.locator('#saveBtn').click();await expect(page.locator('#announceModal')).toBeHidden();
  await expect(page.locator('#announce-table tbody')).toContainText('<img src=x onerror=alert(1)>');assert.equal(await page.locator('#announce-table img').count(),0);
  await page.reload();await expect(page.locator('#announce-table tbody')).toContainText('ทดสอบแก้ไข');
  await page.locator('#addNewBtn').click();await expect(page.locator('#pageStatus')).toContainText('จำกัด 100');
  await page.locator('[data-delete]').first().click();await expect(page.locator('#announcementSummary')).toContainText('99 / 100');
  await page.locator('#addNewBtn').click();await page.locator('#announceTitle').fill('ประกาศเพิ่มใหม่');await page.locator('#description').fill('รายละเอียดทดสอบ');await page.locator('#saveBtn').click();await expect(page.locator('#announcementSummary')).toContainText('100 / 100');
  await page.locator('#resetDemo').click();await expect(page.locator('#announce-table tbody')).not.toContainText('ทดสอบแก้ไข');
  await page.locator('#announcementPageSize').selectOption('100');await expect(page.locator('#announce-table tbody tr')).toHaveCount(100);
  for(const row of sourceSamples){
    const tr=page.locator(`tr:has([data-edit="${row.announce_id}"])`);
    await expect(tr.locator('.announcement-description')).toHaveText(row.description);
    assert.equal(await tr.locator('a').count(),Number(Boolean(row.link))+Number(Boolean(row.contract_link)));
  }
  await page.goto(`${base}sync.html`);await expect(page.locator('#autoQueueMeta')).toContainText('10 queue');
  await page.locator('#automaticQueueStatus').selectOption('failed');await expect(page.locator('#automaticQueueBody')).toContainText('ไม่มีคิว');
  await page.locator('#automaticQueueStatus').selectOption('');await page.locator('[data-queue-detail]').first().click();await expect(page.locator('#automaticQueueDetailSource')).toContainText('queue_id');await page.locator('#automaticQueueDetailModal [data-dismiss]').last().click();
  await page.locator('#automaticQueueNext').click();await expect(page.locator('#automaticQueueSummary')).toContainText('หน้า 2 / 2');
  await page.locator('#backfillStartDate').fill('2026-08-01');await page.locator('#createBackfillBtn').click();await expect(page.locator('#queueBody tr')).toHaveCount(10);
  await page.locator('#startSyncBtn').click();await expect(page.locator('#autoRunning')).toHaveText('1');await page.locator('#stopSyncBtn').click();await expect(page.locator('#autoRunning')).toHaveText('0');
  await page.locator('#startSyncBtn').click();await expect(page.locator('#autoCompleted')).toHaveText('10',{timeout:15000});await expect(page.locator('#autoQueueMeta')).toContainText('10 queue');
  await page.goto(`${base}email-report.html`);await expect(page.locator('#summaryTotal')).toHaveText('100');
  await page.locator('#reportFrequency').selectOption('weekly');await expect(page.locator('#weekdayGroup')).toBeVisible();
  await page.locator('#reportSubject').fill('รายงานทดสอบ {date}');await page.locator('#saveReportButton').click();await expect(page.locator('#emailReportStatus')).toContainText('บันทึก');
  await page.reload();await expect(page.locator('#reportSubject')).toHaveValue('รายงานทดสอบ {date}');await page.locator('#maxItems').fill('5');await page.locator('#sendNowButton').click();await expect(page.locator('#reportPreview')).toBeVisible();await expect(page.locator('#reportPreviewBody li')).toHaveCount(5);await page.locator('#reportPreview [data-dismiss]').last().click();
  await page.locator('#testEmail').fill('test@example.test');await page.locator('#testEmailButton').click();await expect(page.locator('#reportPreviewBody')).toContainText('test@example.test');await page.locator('#reportPreview [data-dismiss]').last().click();await expect(page.locator('#emailLogTable tbody tr')).toHaveCount(2);
  for(const width of [390,820]) {
   await page.setViewportSize({width,height:844});
   for(const file of ['index.html','announce.html','sync.html','email-report.html']) {
    await page.goto(`${base}${file}`);await page.waitForFunction(()=>document.body.dataset.ready==='true');await page.evaluate(()=>document.fonts.ready);
    await expect(page.locator('#loadError')).toBeEmpty();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${width}px overflow on ${file}`);
    if(width===390)await page.screenshot({path:`.artifacts/egp-${file.replace('.html','')}-mobile.png`,fullPage:true});
   }
  }
  await page.setViewportSize({width:1440,height:1000});await page.locator('#resetDemo').click();
 }
 await page.goto('http://127.0.0.1:4184/myportal/project.html?id=egp-integration');await expect(page.locator('#project-title')).toHaveText('ระบบเชื่อมโยงข้อมูลจัดซื้อจัดจ้างภาครัฐ');
 assert.deepEqual(errors,[]);assert.deepEqual(badResponses,[]);assert.deepEqual(unsafeRequests,[]);
 console.log('E-GP checks passed: CSP backend + GitHub subpath; 100/10 limits; search, pagination, CRUD, escaping, reset, queue filters/start/stop/complete, email preview, session persistence, mobile/tablet, no external or mutation requests.');
}finally{await browser.close();await new Promise(r=>server.close(r));await new Promise(r=>staticServer.close(r));db.close();}
