const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels = {normal:'ปกติ',replace:'ทดแทน',dispose:'จำหน่าย'};
const key = 'computer-assets-demo-v1';
const badge = value => `<span class="badge status-${Object.hasOwn(labels,value)?value:'normal'}">${esc(labels[value]||value)}</span>`;
const notice = (id,message,type='success') => { $(id).innerHTML=`<div class="alert alert-${type}" role="status">${esc(message)}</div>`; };
let state, schema, manifest;
function save(){try{sessionStorage.setItem(key,JSON.stringify(state));}catch{notice('loadError','บันทึกในแท็บไม่ได้ การเปลี่ยนแปลงจะอยู่เฉพาะหน้านี้','warning');}}
function recordActivity(action,asset){state.activities.unshift({time:new Date().toISOString(),action,asset:asset.asset_number,type:asset.type});state.activities=state.activities.slice(0,50);}
const age = row => Math.max(0,manifest.referenceYear-Number(row.year));
const replacement = row => row.status!=='dispose'&&(age(row)>=8||row.status==='replace');
const typeOf = row => schema.find(t=>t.id===row.type);
const selectOptions = (id,entries,emptyLabel) => { $(id).innerHTML=(emptyLabel?`<option value="">${esc(emptyLabel)}</option>`:'')+entries.map(([value,label])=>`<option value="${esc(value)}">${esc(label)}</option>`).join(''); };
function filtered(){
 const term=$('search')?.value.trim().toLocaleLowerCase()||'';
 const type=$('typeFilter').value,division=$('divisionFilter').value,status=$('statusFilter').value,range=$('ageFilter').value;
 return state.assets.filter(row=>(!type||row.type===type)&&(!division||row.division_id===division)&&(!status||row.status===status)&&(!range||(age(row)>=Number(range.split('-')[0])&&age(row)<=Number(range.split('-')[1])))&&Object.values(row).join(' ').toLocaleLowerCase().includes(term)&&(!$('replacementOnly')?.checked||replacement(row)));
}
function initFilters(){
 selectOptions('typeFilter',schema.map(t=>[t.id,t.name]),'ทุกประเภท');
 selectOptions('divisionFilter',[...new Set(state.assets.map(r=>r.division_id))].sort().map(v=>[v,v]),'ทุกหน่วยงาน');
 const params=new URLSearchParams(location.search);
 if(schema.some(t=>t.id===params.get('type')))$('typeFilter').value=params.get('type');
}
function exportCsv(){
 const rows=filtered();
 const fields=[['asset_number','เลขครุภัณฑ์'],['type','ประเภท'],...new Map(schema.flatMap(t=>t.fields.map(f=>[f.key,f.label]))).entries()].filter(([key],i,list)=>list.findIndex(([k])=>key===k)===i);
 const cell=value=>{let s=String(value??'');if(/^[\s]*[=+\-@\t\r]/.test(s))s=`'${s}`;return `"${s.replaceAll('"','""')}"`;};
 const content=[fields.map(([,label])=>cell(label)).join(','),...rows.map(row=>fields.map(([field])=>cell(field==='type'?typeOf(row).name:field==='status'?labels[row.status]:row[field])).join(','))].join('\r\n');
 const url=URL.createObjectURL(new Blob(['\ufeff',content],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='computer-assets-demo.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('menuToggle').addEventListener('click',()=>{$('sidebarMenu').classList.toggle('open');$('menuToggle').setAttribute('aria-expanded',String($('sidebarMenu').classList.contains('open')));});
$('resetDemo').addEventListener('click',()=>{try{sessionStorage.removeItem(key);}catch{}location.reload();});
try{
 const values=await Promise.all(['schema','assets','manifest'].map(async name=>{const response=await fetch(`data/${name}.json`);if(!response.ok)throw Error(`Missing ${name}`);return response.json();}));
 [schema,,manifest]=values;
 let saved;try{saved=JSON.parse(sessionStorage.getItem(key)||'null');}catch{}
 state=saved?.datasetVersion===manifest.datasetVersion&&Array.isArray(saved.assets)&&Array.isArray(saved.activities)?saved:{datasetVersion:manifest.datasetVersion,assets:values[1],activities:[]};
 const page=document.body.dataset.page;
 if(page==='index'){
  $('assetOverview').innerHTML=schema.map(t=>`<div class="col-6 col-lg-3"><a class="type-card" href="inventory.html?type=${t.id}"><i class="type-icon bi bi-${t.icon}"></i><h3>${esc(t.name)}</h3><strong>${state.assets.filter(r=>r.type===t.id).length} <small>รายการ</small></strong></a></div>`).join('');
  const buckets=[['ไม่เกิน 5 ปี',0,5],['6–7 ปี',6,7],['8 ปีขึ้นไป',8,999]];
  $('ageChart').innerHTML=buckets.map(([name,min,max],i)=>{const count=state.assets.filter(r=>age(r)>=min&&age(r)<=max).length;return `<div class="bar-row"><div class="bar-label"><span>${name}</span><strong>${count} รายการ</strong></div><div class="bar-track"><div class="bar-fill" id="ageBar${i}" role="img" aria-label="${name} ${count} รายการ"></div></div></div>`;}).join('');
  buckets.forEach(([,min,max],i)=>{$(`ageBar${i}`).style.width=`${state.assets.length?100*state.assets.filter(r=>age(r)>=min&&age(r)<=max).length/state.assets.length:0}%`;});
  $('referenceYear').textContent=manifest.referenceYear;
  $('statusSummary').innerHTML=Object.entries(labels).map(([status,label])=>`<div class="status-item"><span>${badge(status)}</span><strong>${state.assets.filter(r=>r.status===status).length}</strong></div>`).join('');
  const divisions=[...new Set(state.assets.map(r=>r.division_id))].sort();
  $('divisionSummary').innerHTML=`<table class="table"><thead><tr><th>หน่วยงาน</th><th>ทั้งหมด</th><th>ปกติ</th><th>ทดแทน</th><th>จำหน่าย</th></tr></thead><tbody>${divisions.map(division=>{const rows=state.assets.filter(r=>r.division_id===division);return `<tr><td>${esc(division)}</td><td>${rows.length}</td>${Object.keys(labels).map(status=>`<td>${rows.filter(r=>r.status===status).length}</td>`).join('')}</tr>`;}).join('')}</tbody></table>`;
 }
 if(page==='inventory'){
  initFilters();let currentPage=1,editingId=null;
  const modal=new bootstrap.Modal($('assetModal'));
  const commonColumns=[{key:'id',label:'#'},{key:'asset_number',label:'เลขครุภัณฑ์'},{key:'actions',label:'จัดการ'},{key:'type',label:'ประเภท'},{key:'year',label:'ปี'},{key:'pc_brand',label:'ยี่ห้อ'},{key:'pc_model',label:'รุ่น'},{key:'status',label:'สถานะ'},{key:'division_id',label:'หน่วยงาน'},{key:'division_sub_id',label:'ส่วน/ฝ่าย'},{key:'pc_user',label:'ผู้ใช้งาน'}];
  function render(){
   const rows=filtered(),sort=$('sort').value;
   rows.sort((a,b)=>sort==='asset'?a.asset_number.localeCompare(b.asset_number,'th'):sort==='division'?a.division_id.localeCompare(b.division_id,'th')||b.year-a.year:sort==='year_asc'?a.year-b.year:b.year-a.year);
   const size=Number($('pageSize').value),pages=Math.max(1,Math.ceil(rows.length/size));currentPage=Math.min(currentPage,pages);
   const type=schema.find(t=>t.id===$('typeFilter').value),columns=type?.columns||commonColumns;
   $('inventoryTitle').textContent=type?`ทะเบียน${type.name}`:'ทะเบียนครุภัณฑ์ทุกประเภท';
   document.querySelector('#da-table thead').innerHTML=`<tr>${columns.map(c=>`<th>${esc(c.label)}</th>`).join('')}</tr>`;
   $('output').innerHTML=rows.slice((currentPage-1)*size,currentPage*size).map((r,i)=>`<tr>${columns.map(c=>`<td>${c.key==='id'?(currentPage-1)*size+i+1:c.key==='actions'?`<button class="btn btn-outline-primary btn-sm" data-edit="${esc(r.id)}">รายละเอียด / แก้ไข</button>`:c.key==='status'?badge(r.status):c.key==='type'?esc(typeOf(r).name):c.key==='asset_number'?`${esc(r.asset_number)}<div class="mt-1">${badge(r.status)}</div>`:esc(r[c.key]||'—')}</td>`).join('')}</tr>`).join('')||`<tr><td colspan="${columns.length}" class="text-center py-4">ไม่พบครุภัณฑ์ตามเงื่อนไข</td></tr>`;
   $('tableSummary').textContent=`${rows.length} รายการ · หน้า ${currentPage} / ${pages} · รวมทั้งหมด ${state.assets.length}`;
   $('previousPage').disabled=currentPage===1;$('nextPage').disabled=currentPage===pages;
  }
  function fields(typeId,row){
   const type=schema.find(t=>t.id===typeId);
   $('formType').textContent=`${type.name} · ช่องข้อมูลจาก template เดิม`;
   const typeSelector=`<div class="col-12"><label class="form-label" for="edit-type">ประเภทครุภัณฑ์</label><select id="edit-type" class="form-select" ${row?'disabled':''}>${schema.map(t=>`<option value="${t.id}" ${t.id===typeId?'selected':''}>${esc(t.name)}</option>`).join('')}</select></div>`;
   $('assetFields').innerHTML=typeSelector+type.fields.map(f=>{
    const value=row?.[f.key]??(f.key==='year'?manifest.referenceYear:f.key==='status'?'normal':''),required=['asset_number','year','division_id'].includes(f.key)?'required':'';
    const numeric=['year','ram_gb','storage_gb','rated_capacity_va','rated_capacity_watt'].includes(f.key);
    let control;
    if(f.key==='status')control=`<select class="form-select" id="edit-${f.key}" name="${f.key}">${Object.entries(labels).map(([id,label])=>`<option value="${id}" ${value===id?'selected':''}>${label}</option>`).join('')}</select>`;
    else if(f.key==='note_description')control=`<textarea class="form-control" id="edit-${f.key}" name="${f.key}" rows="3" maxlength="2000">${esc(value)}</textarea>`;
    else control=`<input class="form-control" id="edit-${f.key}" name="${f.key}" type="${numeric?'number':'text'}" ${numeric?`min="${f.key==='year'?2400:0}" max="${f.key==='year'?manifest.referenceYear:100000}" step="1"`:'maxlength="250"'} value="${esc(value)}" ${required}>`;
    return `<div class="${f.key==='note_description'?'col-12':'col-md-6 col-lg-4'}"><label class="form-label" for="edit-${f.key}">${esc(f.label)} ${required?'<span class="text-danger">*</span>':''}</label>${control}</div>`;
   }).join('');
   $('edit-type').addEventListener('change',()=>fields($('edit-type').value,null));
  }
  function open(id){const row=state.assets.find(r=>r.id===id);editingId=row?.id||null;$('formMessage').textContent='';$('assetModalTitle').textContent=row?`รายละเอียด ${row.asset_number}`:'เพิ่มครุภัณฑ์ตัวอย่าง';fields(row?.type||$('typeFilter').value||schema[0].id,row);modal.show();}
  $('output').addEventListener('click',event=>{const btn=event.target.closest('[data-edit]');if(btn)open(btn.dataset.edit);});
  $('addAsset').addEventListener('click',()=>open(null));
  $('assetForm').addEventListener('submit',event=>{
   event.preventDefault();const existing=state.assets.find(r=>r.id===editingId),type=$('edit-type').value;
   const form=Object.fromEntries(new FormData($('assetForm')).entries());
   for(const key of Object.keys(form))if(typeof form[key]==='string')form[key]=form[key].trim();
   if(!form.asset_number||!form.division_id){notice('formMessage','กรุณาระบุเลขครุภัณฑ์และหน่วยงาน','warning');return;}
   if(state.assets.some(r=>r.id!==editingId&&r.asset_number.toLocaleLowerCase()===form.asset_number.toLocaleLowerCase())){notice('formMessage','เลขครุภัณฑ์นี้มีอยู่แล้ว','warning');return;}
   const row={...existing,...form,year:Number(form.year),id:existing?.id||`asset-${crypto.randomUUID()}`,type};
   if(existing)Object.assign(existing,row);else state.assets.push(row);
   recordActivity(existing?'แก้ไขข้อมูล':'เพิ่มครุภัณฑ์',row);save();
   const division=$('divisionFilter').value;selectOptions('divisionFilter',[...new Set(state.assets.map(r=>r.division_id))].sort().map(v=>[v,v]),'ทุกหน่วยงาน');$('divisionFilter').value=division;
   render();modal.hide();notice('pageMessage','บันทึกข้อมูลในแท็บนี้แล้ว');
  });
  for(const id of ['typeFilter','divisionFilter','statusFilter','ageFilter','sort','pageSize'])$(id).addEventListener('change',()=>{currentPage=1;render();});
  $('search').addEventListener('input',()=>{currentPage=1;render();});$('previousPage').addEventListener('click',()=>{currentPage--;render();});$('nextPage').addEventListener('click',()=>{currentPage++;render();});$('exportCsv').addEventListener('click',exportCsv);
  render();const id=new URLSearchParams(location.search).get('id');if(state.assets.some(r=>r.id===id))open(id);
 }
 if(page==='reports'){
  initFilters();
  function render(){const rows=filtered(),replace=rows.filter(replacement).length;
   $('reportMetrics').innerHTML=[['ตามเงื่อนไข',rows.length],['เสนอทดแทน',replace],['อายุเฉลี่ย',rows.length?(rows.reduce((n,r)=>n+age(r),0)/rows.length).toFixed(1)+' ปี':'—']].map(([label,value])=>`<div class="col-sm-4"><div class="metric-card">${label}<strong>${value}</strong></div></div>`).join('');
   document.querySelector('#reportTable tbody').innerHTML=rows.map((r,i)=>`<tr><td>${i+1}</td><td><a href="inventory.html?type=${r.type}&id=${encodeURIComponent(r.id)}">${esc(r.asset_number)}</a></td><td>${esc(typeOf(r).name)}</td><td>${esc(r.pc_brand||'')} ${esc(r.pc_model||r.software_name||'')}</td><td>${esc(r.division_id)}</td><td>${r.year}</td><td>${age(r)} ปี</td><td>${badge(r.status)}</td><td>${r.status==='dispose'?'จำหน่ายแล้ว':replacement(r)?'เสนอทดแทน':'ใช้งานต่อ'}</td></tr>`).join('')||'<tr><td colspan="9" class="text-center py-4">ไม่พบรายการตามเงื่อนไข</td></tr>';
  }
  for(const id of ['typeFilter','divisionFilter','statusFilter','ageFilter','replacementOnly'])$(id).addEventListener('change',render);
  $('exportCsv').addEventListener('click',exportCsv);$('printReport').addEventListener('click',()=>window.print());render();
 }
 if(page==='activity')$('activityList').innerHTML=state.activities.map(a=>`<article class="activity-entry"><small>${esc(new Date(a.time).toLocaleString('th-TH'))}</small><p><strong>${esc(a.action)}</strong> · ${esc(a.asset)}</p><span class="text-muted small">${esc(schema.find(t=>t.id===a.type)?.name||'')}</span></article>`).join('')||'<p class="py-4 text-center text-muted">ยังไม่มีการแก้ไขข้อมูลในแท็บนี้</p>';
 document.body.dataset.ready='true';
}catch(error){notice('loadError','โหลดเดโมไม่สำเร็จ กรุณาเปิดผ่านเว็บเซิร์ฟเวอร์หรือ GitHub Pages แล้วลองอีกครั้ง','danger');console.error(error);}
