/* Portfolio demonstration. All mutations stay in this browser tab. */
'use strict';
(async () => {
  const $id = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text = (id, value) => { if ($id(id)) $id(id).textContent = value; };
  const date = value => String(value || '').slice(0, 10);
  const key = 'procureflow-demo-v1';
  const read = () => { try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch { return null; } };
  const save = () => { try { sessionStorage.setItem(key, JSON.stringify(state)); } catch { /* Still works in memory. */ } };
  const message = (id, value, type = 'info') => { $id(id).innerHTML = `<div class="alert alert-${type}" role="status">${escape(value)}</div>`; };
  const modal = id => window.jQuery(`#${id}`).modal('show');
  const options = (id, entries, emptyLabel) => {
    $id(id).innerHTML = (emptyLabel ? `<option value="">${escape(emptyLabel)}</option>` : '') + entries.map(([value,label]) => `<option value="${escape(value)}">${escape(label)}</option>`).join('');
  };
  const labels = { pending:'รอดำเนินการ', running:'กำลังทำงาน', retry_wait:'รอ retry', completed:'สำเร็จ', failed:'ล้มเหลว' };
  const colors = { pending:'secondary', running:'info', retry_wait:'warning', completed:'success', failed:'danger' };
  const badge = status => `<span class="badge badge-${colors[status] || 'secondary'}">${escape(labels[status] || status)}</span>`;
  let state;
  $id('menuToggle').addEventListener('click', () => {
    const mobile = matchMedia('(max-width: 991px)').matches;
    document.body.classList.toggle(mobile ? 'sidebar-open' : 'sidebar-collapse');
    $id('menuToggle').setAttribute('aria-expanded', String(mobile ? document.body.classList.contains('sidebar-open') : !document.body.classList.contains('sidebar-collapse')));
  });
  $id('resetDemo').addEventListener('click', () => { try { sessionStorage.removeItem(key); } catch {} location.reload(); });
  try {
    const [announcements, queues, manifest] = await Promise.all(['announcements','queues','manifest'].map(async file => {
      const response = await fetch(`data/${file}.json`);
      if (!response.ok) throw new Error('data unavailable');
      return response.json();
    }));
    if (announcements.length !== 100 || queues.length !== 10) throw new Error('invalid sample counts');
    const cached = read();
    state = cached && Array.isArray(cached.announcements) && cached.announcements.length <= 100 && Array.isArray(cached.queues) && cached.queues.length === 10 ? cached : { announcements, queues, report:null, logs:[] };
    // An interrupted simulation can be resumed after navigating to another page.
    state.queues.forEach(q => { if (q.status === 'running') q.status = 'pending'; });
    const types = [...new Map(announcements.map(a => [a.anounceType, a.type_name])).entries()];
    const methods = [...new Map(announcements.map(a => [a.methodId, a.method_name])).entries()];
    const departments = [...new Set(announcements.map(a => a.department_sub_name))].sort();
    const page = document.body.dataset.page;
    if (page === 'index') {
      text('totalCount',state.announcements.length);
      text('departmentCount',new Set(state.announcements.map(a => a.department_sub_name)).size);
      text('queueCount',state.queues.length);
      text('completedCount',state.queues.filter(q => q.status === 'completed').length);
      text('snapshotDate',`ชุดข้อมูลวันที่ ${date(manifest.snapshotDate)}`);
      $id('recentAnnouncements').innerHTML = state.announcements.slice().sort((a,b) => String(b.pubDate).localeCompare(String(a.pubDate))).slice(0,5).map(a => `<a class="recent-item" href="announce.html?record=${a.announce_id}"><small>${escape(date(a.pubDate))} · ${escape(a.department_sub_name)}</small><strong>${escape(a.title)}</strong><small>${escape(a.type_name)} · ${escape(a.projectId)}</small></a>`).join('') || 'ไม่มีประกาศในแท็บนี้ กดคืนค่าตัวอย่างเพื่อเริ่มใหม่';
    }
    if (page === 'announce') {
      let currentPage = 1;
      options('announceTypeFilter',types,'ทุกประเภทประกาศ');
      options('departmentSubFilter',departments.map(d => [d,d]),'ทุกหน่วยงานย่อย');
      options('announceType',types);
      options('methodId',methods,'ไม่ระบุ');
      function render() {
        const term = $id('announcementSearch').value.trim().toLocaleLowerCase();
        const type = $id('announceTypeFilter').value;
        const department = $id('departmentSubFilter').value;
        const filtered = state.announcements.filter(a => (!type || String(a.anounceType) === type) && (!department || a.department_sub_name === department) && `${a.title} ${a.projectId} ${a.description}`.toLocaleLowerCase().includes(term)).sort((a,b) => String(b.pubDate).localeCompare(String(a.pubDate)));
        const size = Number($id('announcementPageSize').value);
        const totalPages = Math.max(1,Math.ceil(filtered.length / size));
        currentPage = Math.min(currentPage,totalPages);
        document.querySelector('#announce-table tbody').innerHTML = filtered.slice((currentPage-1)*size,currentPage*size).map(a => `<tr><td>${a.announce_id}</td><td>${escape(a.type_name)}</td><td class="department-sub">${escape(a.department_sub_name)}</td><td>${escape(a.method_name)}</td><td class="announce-title"><strong>${escape(a.title)}</strong><div class="text-muted small">${escape(a.projectId)}</div></td><td>${escape(date(a.pubDate))}</td><td><span class="text-muted">ตัวอย่าง</span></td><td><button class="btn btn-sm btn-outline-primary mb-1" data-edit="${a.announce_id}">รายละเอียด / แก้ไข</button> <button class="btn btn-sm btn-outline-danger" data-delete="${a.announce_id}">ลบ</button></td></tr>`).join('') || '<tr><td colspan="8" class="text-center py-4">ไม่พบประกาศที่ตรงกับเงื่อนไข</td></tr>';
        text('announcementSummary',`${filtered.length} รายการ · หน้า ${currentPage} / ${totalPages} · ในเดโม ${state.announcements.length} / 100 รายการ`);
        $id('announcementPrevious').disabled = currentPage === 1;
        $id('announcementNext').disabled = currentPage === totalPages;
      }
      function edit(id) {
        const record = state.announcements.find(a => a.announce_id === id);
        if (!record && state.announcements.length >= 100) { message('pageStatus','เดโมจำกัด 100 ประกาศ กรุณาลบรายการตัวอย่างหนึ่งรายการก่อนเพิ่ม หรือเลือกแก้ไขรายการที่มีอยู่'); return; }
        $id('announceForm').reset();
        for (const [field, target] of Object.entries({announce_id:'announceId',anounceType:'announceType',methodId:'methodId',title:'announceTitle',description:'description',pubDate:'pubDate',projectId:'projectId'})) {
          if (record) $id(target).value = field === 'pubDate' ? date(record[field]) : record[field] ?? '';
        }
        if (!record) $id('pubDate').value = date(announcements[0].pubDate);
        text('announceModalTitle',record ? `รายละเอียดประกาศ ${record.projectId}` : 'เพิ่มประกาศตัวอย่าง');
        modal('announceModal');
      }
      $id('announce-table').addEventListener('click', event => {
        const editButton = event.target.closest('[data-edit]');
        const deleteButton = event.target.closest('[data-delete]');
        if (editButton) edit(Number(editButton.dataset.edit));
        if (deleteButton) {
          state.announcements = state.announcements.filter(a => a.announce_id !== Number(deleteButton.dataset.delete));
          save(); render(); message('pageStatus','ลบเฉพาะข้อมูลในแท็บนี้แล้ว กด “คืนค่าตัวอย่าง” เพื่อเรียกข้อมูลเดิมกลับมา');
        }
      });
      $id('addNewBtn').addEventListener('click', () => edit(null));
      $id('announceForm').addEventListener('submit', event => {
        event.preventDefault();
        const id = Number($id('announceId').value);
        const existing = state.announcements.find(a => a.announce_id === id);
        if (!existing && state.announcements.length >= 100) return;
        const nextId = existing ? id : Math.max(0,...state.announcements.map(a => a.announce_id)) + 1;
        const record = { announce_id:nextId,anounceType:$id('announceType').value,type_name:$id('announceType').selectedOptions[0].textContent,methodId:$id('methodId').value,method_name:$id('methodId').selectedOptions[0].textContent,title:$id('announceTitle').value.trim(),description:$id('description').value.trim(),pubDate:$id('pubDate').value,projectId:$id('projectId').value.trim() || `DEMO-${String(nextId).padStart(4,'0')}`,department_sub_name:existing?.department_sub_name || 'หน่วยงานตัวอย่างใหม่',link:'' };
        if (!record.title || !record.description) { $id('announceTitle').focus(); return; }
        if (existing) Object.assign(existing,record); else state.announcements.push(record);
        save(); render(); window.jQuery('#announceModal').modal('hide'); message('pageStatus','บันทึกข้อมูลในแท็บนี้แล้ว','success');
      });
      for (const id of ['announceTypeFilter','departmentSubFilter','announcementPageSize']) $id(id).addEventListener('change', () => { currentPage = 1; render(); });
      $id('announcementSearch').addEventListener('input', () => { currentPage = 1; render(); });
      $id('announcementPrevious').addEventListener('click', () => { currentPage--; render(); });
      $id('announcementNext').addEventListener('click', () => { currentPage++; render(); });
      render();
      const recordId = Number(new URLSearchParams(location.search).get('record'));
      if (state.announcements.some(a => a.announce_id === recordId)) edit(recordId);
    }
    if (page === 'sync') {
      let currentPage = 1, selected = [], timer = null, active = null;
      const typeName = code => types.find(([id]) => String(id) === String(code))?.[1] || code;
      const methodName = code => methods.find(([id]) => String(id) === String(code))?.[1] || code;
      const syncDepartments = [...new Set(state.queues.map(q => q.department_sub_name))].sort();
      options('departmentSub',syncDepartments.map(d => [d,d]),'ทุกหน่วยงานตัวอย่าง');
      $id('departmentSub').disabled = false;
      const dates = state.queues.map(q => date(q.announce_date)).sort();
      $id('startDate').value = dates[0]; $id('endDate').value = dates.at(-1); $id('backfillStartDate').value = dates[0];
      $id('startSyncBtn').disabled = true;
      const log = line => { text('syncLog',`${new Date().toLocaleTimeString('th-TH')} · ${line}\n${$id('syncLog').textContent}`.slice(0,6000)); };
      function render() {
        for (const [status,id] of Object.entries({pending:'autoPending',running:'autoRunning',retry_wait:'autoRetry',completed:'autoCompleted',failed:'autoFailed'})) text(id,state.queues.filter(q => q.status === status).length);
        const status = $id('automaticQueueStatus').value;
        document.querySelectorAll('[data-queue-status]').forEach(el => el.classList.toggle('active',el.dataset.queueStatus === status));
        const filtered = state.queues.filter(q => !status || q.status === status);
        const pages = Math.max(1,Math.ceil(filtered.length/5)); currentPage = Math.min(currentPage,pages);
        $id('automaticQueueBody').innerHTML = filtered.slice((currentPage-1)*5,currentPage*5).map(q => `<tr><td>${q.queue_id}</td><td>${escape(date(q.announce_date))}</td><td>${escape(q.department_sub_name)}</td><td>${escape(typeName(q.anounce_type))}</td><td>${escape(methodName(q.method_id))}</td><td>${badge(q.status)}</td><td>${escape(q.attempts)}</td><td>${escape(q.result_count)} / ${escape(q.inserted_count)}</td><td>${escape(q.finished_at || q.next_attempt_at || '—')}</td><td><button class="btn btn-sm btn-outline-info" data-queue-detail="${q.queue_id}">รายละเอียด</button></td></tr>`).join('') || '<tr><td colspan="10" class="text-center py-4">ไม่มีคิวในสถานะนี้</td></tr>';
        text('automaticQueueSummary',`${filtered.length} รายการ · หน้า ${currentPage} / ${pages}`);
        text('autoQueueMeta',`รวม ${state.queues.length} queue · สถานะจากชุดข้อมูลตัวอย่างและการจำลองในแท็บนี้`);
        $id('automaticQueuePrevious').disabled = currentPage === 1; $id('automaticQueueNext').disabled = currentPage === pages;
        $id('queueBody').innerHTML = selected.map(q => `<tr><td>${q.queue_id}</td><td>${escape(date(q.announce_date))}</td><td>${escape(typeName(q.anounce_type))}</td><td>${escape(methodName(q.method_id))}</td><td>${badge(q.status)}</td><td>DEMO-Q${String(q.queue_id).padStart(2,'0')}</td></tr>`).join('') || '<tr><td colspan="6" class="text-center py-4">เลือกช่วงวันที่แล้วกด “สร้างคิว”</td></tr>';
        text('queueSummary',`เลือก ${selected.length} / 10 queue · สำเร็จ ${selected.filter(q => q.status === 'completed').length}`);
      }
      function setBusy(busy) {
        for (const id of ['buildQueueBtn','createBackfillBtn','departmentSub','startDate','endDate','backfillStartDate']) $id(id).disabled = busy;
        $id('startSyncBtn').disabled = busy || !selected.some(q => q.status !== 'completed'); $id('stopSyncBtn').disabled = !busy;
      }
      function stop() {
        clearTimeout(timer); timer = null;
        if (active) active.status = 'pending'; active = null;
        setBusy(false); save(); render();
      }
      function step() {
        active = selected.find(q => q.status !== 'completed');
        if (!active) { stop(); log('จบการจำลอง ไม่มีการดึงหรือเพิ่มประกาศจริง'); return; }
        const q = active;
        q.status = 'running'; q.attempts = Number(q.attempts || 0) + 1; save(); render();
        timer = setTimeout(() => { q.status = 'completed'; q.finished_at = new Date().toISOString(); q.last_error = ''; q.last_http_code = 200; q.result_count = state.announcements.filter(a => a.department_sub_name === q.department_sub_name).length; q.inserted_count = 0; q.next_attempt_at = null; active = null; save(); render(); log(`จำลองคิว ${q.queue_id} สำเร็จ`); step(); },700);
      }
      $id('buildQueueBtn').addEventListener('click', () => {
        const start = $id('startDate').value, end = $id('endDate').value, department = $id('departmentSub').value;
        if (!start || !end || start > end) { message('syncMessage','กรุณาระบุวันที่เริ่มต้นและสิ้นสุดให้ถูกต้อง','warning'); return; }
        selected = state.queues.filter(q => date(q.announce_date) >= start && date(q.announce_date) <= end && (!department || q.department_sub_name === department));
        render(); setBusy(false); message('syncMessage',selected.length ? `เตรียม ${selected.length} queue จากชุดตัวอย่างแล้ว` : 'ไม่พบคิวในช่วงวันที่หรือหน่วยงานนี้','info');
      });
      $id('createBackfillBtn').addEventListener('click', () => {
        const start = $id('backfillStartDate').value;
        if (!start || !$id('backfillStartDate').checkValidity()) { message('syncMessage','กรุณาระบุวันเริ่มต้นตั้งแต่ปี 2008','warning'); return; }
        state.queues = queues.map((q,i) => { const day = new Date(`${start}T00:00:00Z`); day.setUTCDate(day.getUTCDate()+i); return {...q,announce_date:day.toISOString().slice(0,10),status:'pending',attempts:0,retry_count:0,result_count:0,inserted_count:0,finished_at:null,next_attempt_at:null,last_error:'',last_http_code:null}; });
        selected = [...state.queues]; $id('startDate').value = start; $id('endDate').value = date(state.queues.at(-1).announce_date); $id('departmentSub').value = ''; $id('automaticQueueStatus').value = ''; currentPage = 1;
        save(); render(); setBusy(false); log('แทนที่ชุดเดิมด้วยคิวตัวอย่างย้อนหลัง 10 งาน'); message('syncMessage','เตรียมคิวตัวอย่างย้อนหลัง 10 งานแล้ว กดเริ่มซิงก์เพื่อจำลอง');
      });
      $id('startSyncBtn').addEventListener('click', () => { if (timer) return; setBusy(true); log('เริ่มจำลองคิว'); step(); });
      $id('stopSyncBtn').addEventListener('click', () => { stop(); log('หยุดการจำลอง คิวที่ยังไม่สำเร็จสามารถทำต่อได้'); });
      $id('automaticQueueStatus').addEventListener('change', () => { currentPage = 1; render(); });
      document.querySelectorAll('[data-queue-status]').forEach(el => {
        const select = () => { $id('automaticQueueStatus').value = el.dataset.queueStatus; currentPage = 1; render(); };
        el.addEventListener('click',select); el.addEventListener('keydown',event => { if (['Enter',' '].includes(event.key)) { event.preventDefault(); select(); } });
      });
      $id('automaticQueuePrevious').addEventListener('click', () => { currentPage--; render(); });
      $id('automaticQueueNext').addEventListener('click', () => { currentPage++; render(); });
      $id('refreshAutomaticQueueBtn').addEventListener('click', () => { render(); log('รีเฟรชสถานะจากข้อมูลในแท็บนี้'); });
      $id('automaticQueueBody').addEventListener('click', event => {
        const button = event.target.closest('[data-queue-detail]'); if (!button) return;
        const q = state.queues.find(q => q.queue_id === Number(button.dataset.queueDetail));
        text('automaticQueueDetailMeta',`DEMO-Q${String(q.queue_id).padStart(2,'0')} · ${q.department_sub_name} · ${labels[q.status]}`);
        text('automaticQueueDetailSource',JSON.stringify(q,null,2)); modal('automaticQueueDetailModal');
      });
      render();
    }
    if (page === 'email-report') {
      const defaults = {reportEnabled:false,reportFrequency:'daily',reportWeekday:'1',reportTime:'08:30',lookbackDays:'30',maxItems:'100',reportSubject:'สรุปประกาศ E-GP วันที่ {date}',reportRecipients:'reader@example.test',reportCcRecipients:''};
      const settings = {...defaults,...state.report};
      for (const [id,value] of Object.entries(settings)) { if (id === 'reportEnabled') $id(id).checked = value; else $id(id).value = value; }
      const latest = state.announcements.map(a => date(a.pubDate)).sort().at(-1) || date(manifest.snapshotDate);
      text('summaryMonth',state.announcements.filter(a => date(a.pubDate).startsWith(latest.slice(0,7))).length);
      text('summaryYear',state.announcements.filter(a => date(a.pubDate).startsWith(latest.slice(0,4))).length);
      text('summaryTotal',state.announcements.length); text('smtpStatus','จำลองเท่านั้น'); text('lastSentText',`อ้างอิงวันล่าสุดในชุดตัวอย่าง: ${latest} · ไม่มีการส่งจริง`);
      function schedule() { $id('weekdayGroup').hidden = $id('reportFrequency').value !== 'weekly'; }
      $id('reportFrequency').addEventListener('change',schedule); schedule();
      const collect = () => Object.fromEntries(Object.keys(defaults).map(id => [id,id === 'reportEnabled' ? $id(id).checked : $id(id).value]));
      const recipientsValid = value => !value.trim() || value.split(/[\s,;]+/).filter(Boolean).every(email => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email));
      function validate() {
        if (!$id('emailReportForm').reportValidity()) return false;
        if (!recipientsValid($id('reportRecipients').value) || !recipientsValid($id('reportCcRecipients').value) || ($id('reportEnabled').checked && !$id('reportRecipients').value.trim())) { message('emailReportStatus','กรุณาตรวจสอบรูปแบบอีเมลและระบุผู้รับเมื่อเปิดการจำลองอัตโนมัติ','warning'); return false; }
        return true;
      }
      function logs() {
        const entries = state.logs || []; text('summaryEmailSuccess',entries.length); text('summaryEmailFailed','');
        document.querySelector('#emailLogTable tbody').innerHTML = entries.map(l => `<tr><td>${escape(l.time)}</td><td>${escape(l.kind)}</td><td><span class="badge badge-info">จำลอง</span></td><td>${escape(l.subject)}</td><td>${escape(l.recipients)}</td><td>${l.count}</td><td>ผู้ชมเดโม</td><td>แสดงตัวอย่างเท่านั้น</td></tr>`).join('') || '<tr><td colspan="8" class="text-center py-4">ยังไม่มีการสร้างตัวอย่างรายงาน</td></tr>';
      }
      $id('emailReportForm').addEventListener('submit', event => { event.preventDefault(); if (!validate()) return; state.report = collect(); save(); message('emailReportStatus','บันทึกการตั้งค่าในแท็บนี้แล้ว ตารางเวลาเป็นเพียงตัวอย่าง ไม่มีการส่งอีเมลอัตโนมัติ','success'); });
      function preview(test) {
        if (!validate()) return;
        if (test && (!$id('testEmail').value || !$id('testEmail').reportValidity())) { message('emailReportStatus','กรุณาระบุอีเมลสำหรับการจำลองทดสอบ','warning'); return; }
        const config = collect();
        const start = new Date(`${latest}T00:00:00Z`); start.setUTCDate(start.getUTCDate()-Number(config.lookbackDays));
        const startDate = start.toISOString().slice(0,10);
        const items = state.announcements.filter(a => date(a.pubDate) >= startDate && date(a.pubDate) <= latest).sort((a,b) => String(b.pubDate).localeCompare(String(a.pubDate))).slice(0,Math.min(100,Number(config.maxItems)));
        const subject = config.reportSubject.replaceAll('{date}',latest).replaceAll('{start_date}',startDate).replaceAll('{end_date}',latest);
        const recipients = test ? $id('testEmail').value : config.reportRecipients;
        $id('reportPreviewBody').innerHTML = `<div class="alert alert-info">ตัวอย่างเท่านั้น ไม่มีการส่งอีเมล</div><h6>${escape(subject)}</h6><p class="small text-muted">ถึง: ${escape(recipients || 'ยังไม่ระบุ')}<br>สำเนา: ${escape(config.reportCcRecipients || '—')}<br>ช่วงข้อมูล: ${startDate} ถึง ${latest} · ${items.length} รายการ</p><ol class="report-list">${items.map(a => `<li><strong>${escape(a.title)}</strong><br><small>${escape(date(a.pubDate))} · ${escape(a.department_sub_name)} · ${escape(a.projectId)}</small></li>`).join('')}</ol>`;
        state.logs = [{time:new Date().toLocaleString('th-TH'),kind:test?'ทดสอบ':'รายงาน',subject,recipients,count:items.length},...(state.logs || [])].slice(0,10); save(); logs(); modal('reportPreview');
      }
      $id('testEmailButton').addEventListener('click', () => preview(true)); $id('sendNowButton').addEventListener('click', () => preview(false));
      $id('refreshLogsButton').addEventListener('click', () => { logs(); message('emailReportStatus','รีเฟรชประวัติการจำลองในแท็บนี้แล้ว'); }); logs();
    }
    document.body.dataset.ready = 'true';
  } catch (error) {
    message('loadError','โหลดข้อมูลเดโมไม่สำเร็จ กรุณาเปิดผ่านเว็บเซิร์ฟเวอร์หรือ GitHub Pages แล้วลองรีเฟรชอีกครั้ง','danger');
    console.error('Unable to initialize portfolio demo',error);
  }
})();
