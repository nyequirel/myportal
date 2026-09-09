import {chromium,expect} from '@playwright/test';
import express from 'express';
import {once} from 'node:events';
import {resolve} from 'node:path';
import {readFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
import {openStore} from '../server/store.mjs';
import {createApp} from '../server/app.mjs';
const schema=JSON.parse(readFileSync('docs/demos/computer-assets/data/schema.json','utf8'));
const records=JSON.parse(readFileSync('docs/demos/computer-assets/data/assets.json','utf8'));
const db=openStore(':memory:');
const backend=await createApp({db,secret:'computer-demo-browser'.repeat(5),appUrl:'http://127.0.0.1:4186',sendCode:async()=>{}});
const server=backend.listen(4186,'127.0.0.1');await once(server,'listening');
const app=express();app.get('/api/portfolio',(_,res)=>res.sendFile(resolve('docs/data/portfolio.json')));app.use('/myportal',express.static(resolve('docs')));
const staticServer=app.listen(4187,'127.0.0.1');await once(staticServer,'listening');
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'chrome'}:{})});
mkdirSync('.artifacts',{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],unsafe=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(`${m.text()} ${m.location().url}`);});page.on('request',r=>{if(r.method()!=='GET'||!r.url().startsWith('http://127.0.0.1:'))unsafe.push(r.url());});
 for(const base of ['http://127.0.0.1:4186/demos/computer-assets/','http://127.0.0.1:4187/myportal/demos/computer-assets/']){
  await page.goto(base);await expect(page.locator('.type-card')).toHaveCount(8);await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'.artifacts/computer-assets-dashboard.png',fullPage:true});
  await page.goto(`${base}inventory.html`);await expect(page.locator('#tableSummary')).toContainText('80 รายการ');await expect(page.locator('#output tr')).toHaveCount(10);
  await page.locator('#nextPage').click();await expect(page.locator('#tableSummary')).toContainText('หน้า 2 / 8');
  for(const type of schema){
   await page.locator('#typeFilter').selectOption(type.id);await expect(page.locator('#tableSummary')).toContainText('10 รายการ');await expect(page.locator('#da-table th')).toHaveCount(type.columns.length);
   const record=records.find(r=>r.type===type.id);
   await page.locator(`[data-edit="${record.id}"]`).click();await expect(page.locator('#assetModal')).toBeVisible();
   for(const f of type.fields)await expect(page.locator(`[name="${f.key}"]`)).toHaveValue(String(record[f.key]));
   if(type.id==='personal_computer'){await page.waitForFunction(()=>getComputedStyle(document.querySelector('#assetModal')).opacity==='1');await page.screenshot({path:'.artifacts/computer-assets-details.png',fullPage:true});}
   await page.locator('#assetModal [data-bs-dismiss]').last().click();await expect(page.locator('#assetModal')).toBeHidden();
  }
  await page.locator('#typeFilter').selectOption('personal_computer');await page.locator('[data-edit="asset-001"]').click();await page.locator('#edit-pc_name').fill('<img src=x onerror=alert(1)>');await page.locator('#edit-ram_gb').fill('64');await page.locator('#edit-status').selectOption('replace');await page.locator('#saveAsset').click();await expect(page.locator('#assetModal')).toBeHidden();await expect(page.locator('#output')).toContainText('<img src=x onerror=alert(1)>');assert.equal(await page.locator('#output img').count(),0);
  await page.reload();await page.locator('#search').fill(records[0].asset_number);await expect(page.locator('#output tr')).toHaveCount(1);await page.locator('[data-edit]').click();await expect(page.locator('#edit-ram_gb')).toHaveValue('64');await page.locator('#assetModal [data-bs-dismiss]').last().click();
  await page.locator('#search').fill('no-such-item');await expect(page.locator('#output')).toContainText('ไม่พบครุภัณฑ์');await page.locator('#search').fill('');
  await page.locator('#addAsset').click();await page.locator('#edit-asset_number').fill(records[0].asset_number);await page.locator('#edit-division_id').fill('หน่วยงานตัวอย่าง 1');await page.locator('#saveAsset').click();await expect(page.locator('#formMessage')).toContainText('มีอยู่แล้ว');
  await page.locator('#edit-asset_number').fill('DEMO-NEW');await page.locator('#edit-pc_name').fill('=1+1');await page.locator('#saveAsset').click();await expect(page.locator('#assetModal')).toBeHidden();await expect(page.locator('#tableSummary')).toContainText('รวมทั้งหมด 81');
  await page.locator('#search').fill('DEMO-NEW');const downloadPromise=page.waitForEvent('download');await page.locator('#exportCsv').click();const download=await downloadPromise;const csv=readFileSync(await download.path(),'utf8');assert.ok(csv.includes("'=1+1"));assert.ok(csv.includes('DEMO-NEW'));assert.ok(!csv.includes(records[0].asset_number));
  await page.goto(`${base}reports.html`);await expect(page.locator('#reportTable tbody tr')).toHaveCount(81);await page.locator('#replacementOnly').check();await expect(page.locator('#reportTable tbody tr')).toHaveCount(17);await page.locator('#statusFilter').selectOption('dispose');await expect(page.locator('#reportTable tbody')).toContainText('ไม่พบรายการ');
  await page.goto(`${base}activity.html`);await expect(page.locator('.activity-entry')).toHaveCount(2);
  for(const width of [390,820]){await page.setViewportSize({width,height:844});for(const file of ['index','inventory','reports','activity']){await page.goto(`${base}${file}.html`);await page.waitForFunction(()=>document.body.dataset.ready==='true');await page.evaluate(()=>document.fonts.ready);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${file} overflows at ${width}`);if(width===390)await page.screenshot({path:`.artifacts/computer-assets-${file}-mobile.png`,fullPage:true});}}
  await page.setViewportSize({width:390,height:844});await page.locator('#menuToggle').click();await expect(page.locator('#sidebarMenu')).toHaveClass(/open/);await page.locator('#menuToggle').click();
  await page.locator('#resetDemo').click();await expect(page.locator('#activityList')).toContainText('ยังไม่มี');await page.setViewportSize({width:1440,height:1000});
 }
 await page.goto('http://127.0.0.1:4187/myportal/project.html?id=computer-assets');await expect(page.locator('#project-title')).toHaveText('ระบบครุภัณฑ์คอมพิวเตอร์');await expect(page.getByRole('heading',{name:'ผลลัพธ์และสิ่งที่ได้เรียนรู้',exact:true})).toHaveCount(0);
 assert.deepEqual(errors,[]);assert.deepEqual(unsafe,[]);
 console.log('Computer assets: all eight original field sets, filters/pagination, details, edits, duplicate prevention, CSV escaping/filtering, reports, history, reset, mobile/tablet, CSP and GitHub subpath passed.');
}finally{await browser.close();await new Promise(r=>server.close(r));await new Promise(r=>staticServer.close(r));db.close();}
