import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
const root=resolve('docs/demos/computer-assets');
const read=name=>JSON.parse(readFileSync(join(root,`data/${name}.json`),'utf8'));
test('asset portfolio contains IT and office categories with ten complete synthetic records each',()=>{
 const schema=read('schema'),rows=read('assets'),manifest=read('manifest');
 assert.equal(schema.length,13);assert.equal(rows.length,130);assert.equal(manifest.dataMode,'synthetic');
 assert.equal(schema.filter(t=>t.group==='it').length,8);assert.equal(schema.filter(t=>t.group==='office').length,5);
 assert.equal(new Set(rows.map(r=>r.id)).size,130);assert.equal(new Set(rows.map(r=>r.asset_number)).size,130);
 for(const type of schema){
  const records=rows.filter(r=>r.type===type.id);assert.equal(records.length,10);
  assert.equal(new Set(type.fields.map(f=>f.key)).size,type.fields.length);
  for(const r of records){for(const f of type.fields)assert.ok(Object.hasOwn(r,f.key),`${type.id} missing ${f.key}`);for(const column of type.columns.filter(c=>!['id','actions'].includes(c.key)))assert.ok(Object.hasOwn(r,column.key),`${type.id} missing table field ${column.key}`);assert.match(r.asset_number,/^DEMO-/);assert.match(r.division_id,/^หน่วยงานตัวอย่าง/);assert.ok(r.year<=manifest.referenceYear);}
 }
 for(const type of schema.filter(t=>['personal_computer','computer_laptop'].includes(t.id)))for(const key of ['cpu_socket','ram_type','storage_type','monitor_size_id','os_software_id','pc_user','note_description'])assert.ok(type.fields.some(f=>f.key===key));
 for(const type of schema.filter(t=>t.group==='office')){
  for(const key of ['asset_name','purchase_price','location','warranty_end'])assert.ok(type.fields.some(f=>f.key===key));
  assert.ok(!type.fields.some(f=>f.key==='cpu_socket'));
 }
});
test('public computer template has no source connections or Blade directives',()=>{
 function walk(dir){for(const f of readdirSync(dir,{withFileTypes:true})){const path=join(dir,f.name);if(f.isDirectory()){walk(path);continue;}assert.match(f.name,/\.(html|css|js|json|txt|woff2?)$/);if(/\.(html|json|js)$/.test(f.name)&&!path.includes(`${join('vendor','')}`)){const text=readFileSync(path,'utf8');assert.doesNotMatch(text,/pcd\.go\.th|กรมควบคุมมลพิษ|@extends\(|@section\(|\{\{\s*(asset|route)\(|10\.5\.|password\s*[:=]/i);}}}
 walk(root);
});
