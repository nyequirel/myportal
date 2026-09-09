# MyPublic — Personal portfolio

เว็บโปรไฟล์และรวมผลงาน ภาษาไทย รองรับมือถือ แยกจาก Laravel template เดิม

เว็บไซต์: https://nyequirel.github.io/myportal/ · Repository: https://github.com/nyequirel/myportal

Repository นี้ตั้ง Pages เป็น **Deploy from a branch → main → /docs** เมื่อ push ข้อมูลหน้าเว็บจะเผยแพร่อัตโนมัติ Custom workflow `Deploy portfolio to GitHub Pages` ถูกปิดไว้เพื่อใช้การเผยแพร่จาก branch เพียงช่องทางเดียว

เว็บไซต์บน GitHub Pages ใช้หน้าเว็บ static ส่วน Login และการส่ง OTP จริงต้องเชื่อม backend ตามขั้นตอนด้านล่าง

เริ่มใช้งานแบบสั้น ๆ ที่ [QUICKSTART.md](QUICKSTART.md) หรือดับเบิลคลิก `start-local.cmd` เพื่อเปิดเซิร์ฟเวอร์ในเครื่อง ใช้ `scripts/package.ps1` เพื่อสร้างชุด ZIP สำหรับอัปโหลดภายหลัง

- `docs/` — HTML/CSS/JavaScript พร้อมเผยแพร่บน **GitHub Pages** ไม่มีขั้นตอน build
- `server/` — backend ขนาดเล็ก ใช้ Node.js + SQLite สำหรับเจ้าของพอร์ต: รหัสผ่าน → OTP ทางอีเมล → จัดการโปรไฟล์/ผลงาน
- `sample_template/` — Laravel ต้นฉบับ เก็บไว้ในเครื่องโดยไม่แก้ไขและไม่รวมใน Git repository ใหม่นี้

แต่ละผลงานมีหน้ารายละเอียดและลิงก์ของตัวเองที่ `project.html?id=PROJECT_ID` คลิกการ์ดเพื่อเปิด หรือกดคัดลอกลิงก์จากหน้าผลงานเพื่อแชร์ รองรับภาพรวม บทบาท ช่วงเวลา โจทย์ วิธีดำเนินงาน และผลลัพธ์ ซึ่งแก้ไขได้ในหลังบ้าน ส่วนที่เว้นว่างจะไม่แสดง และลิงก์จะคงเดิมเมื่อเปลี่ยนชื่อผลงาน ดูวิธีเพิ่มโปรเจกต์ใน [QUICKSTART.md](QUICKSTART.md)

GitHub เก็บ source code Laravel ได้ แต่ **GitHub Pages รัน PHP, Laravel, Node.js หรือส่งอีเมลฝั่งเซิร์ฟเวอร์ไม่ได้** ([เอกสาร GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)) จึงต้องใช้ hosting แยกสำหรับ backend หากต้องการ login จริง

## เริ่มจากพอร์ตบน GitHub Pages

1. แก้ `docs/data/portfolio.json` เป็นข้อมูลจริงของคุณ: ชื่อ คำแนะนำตัว ทักษะ อีเมลติดต่อ และ `githubUrl`
2. แทนผลงานตัวอย่างด้วยผลงานจริง ตั้ง `sample: false` และใส่ URL ของ repository / demo เป็น `https://...`
3. อัปโหลดโปรเจกต์นี้ไปยัง repository ของคุณ สาขา `main` โดยเก็บโครงสร้าง `docs/` ไว้
4. ใน GitHub ไปที่ **Settings → Pages → Build and deployment → Source → Deploy from a branch** เลือก `main` และ `/docs`
5. กด **Save** หรือ push การเปลี่ยนแปลงใน `docs/` ระบบจะเผยแพร่ให้

Repository ชื่อ `USERNAME.github.io` จะได้ `https://USERNAME.github.io/` ส่วน repository อื่น เช่น `mypublic` จะได้ `https://USERNAME.github.io/mypublic/` ไฟล์หน้าเว็บใช้ relative paths จึงรองรับทั้งสองแบบ

อีกทางเลือกคือ Source = **GitHub Actions** แล้วเปิดใช้งาน workflow `Deploy portfolio to GitHub Pages` และกด **Run workflow** วิธีนี้ต้องให้บัญชีใช้งาน Actions ได้ตามปกติ

หากมี repository อยู่แล้ว ให้ clone repository นั้นก่อน แล้วคัดลอกไฟล์โปรเจกต์นี้เข้าไป ตรวจความเปลี่ยนแปลงก่อน commit เพื่อไม่ทับไฟล์เดิม ห้าม force push โดยไม่ตรวจสอบ

```powershell
# สำหรับ repository ว่าง และโฟลเดอร์นี้ยังไม่มี Git
git init -b main
git add .
git commit -m "Create portfolio with email two-step login"
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

ใช้การเข้าสู่ระบบของ Git/GitHub ตามปกติ ไม่ใส่ token ไว้ใน source code หรือ URL และไม่ต้องส่งรหัสผ่านให้ผู้ช่วย

ในโหมด static ระบบแสดงข้อมูลจาก JSON เท่านั้น หน้า login จะแจ้งว่ายังไม่ได้เชื่อม backend และปิดการส่งแบบฟอร์ม ไม่มีบัญชีหรือ OTP ปลอมให้เข้าสู่ระบบได้

## เปิดระบบเต็มในเครื่อง

ต้องใช้ **Node.js 22.13 ขึ้นไป** (แนะนำ 22 LTS หรือ 24 LTS) มี dependency ฝั่งใช้งานสองตัว: Express และ Nodemailer; SQLite ใช้โมดูลที่มากับ Node ([เอกสาร Node SQLite](https://nodejs.org/api/sqlite.html))

```powershell
cd C:\Users\phattarayus.t\Desktop\mypublic
npm install
Copy-Item server/.env.example server/.env
```

แก้ไฟล์ **`server/.env` ในเครื่อง**:

```dotenv
OWNER_EMAIL=your-real-email@example.com
OWNER_PASSWORD=your-unique-password-at-least-12-characters
```

```powershell
npm run owner:create
# ลบค่า OWNER_PASSWORD ออกจาก server/.env หลังสร้างบัญชี
npm start
```

เปิด **http://localhost:3000** (ใช้ hostname ให้ตรง `APP_URL`) จากนั้นเข้าสู่ระบบที่ `/login.html` ระบบไม่เปิดรับสมัครสมาชิกสาธารณะ ผู้ชมดูพอร์ตได้ทันที

หาก PowerShell บล็อก `npm.ps1` ให้ใช้ `npm.cmd` แทน หากเครื่องเลือกไฟล์ `C:\Windows\System32\node` แทน Node จริง ให้ตั้ง PATH เฉพาะหน้าต่างนี้ก่อน:

```powershell
$env:PATH = 'C:\Program Files\nodejs;' + $env:PATH
npm.cmd start
```

**โหมดพัฒนาเริ่มต้นยังไม่ส่งอีเมลจริง:** `MAIL_MODE=outbox` เขียนอีเมลทดสอบลง `server/data/outbox/latest-email.txt` อ่าน OTP จากไฟล์นี้เพื่อทดลอง flow ข้อมูลดังกล่าวไม่ถูกเสิร์ฟผ่านเว็บและถูกกันออกจาก Git

เมื่อใช้งาน backend ครั้งแรก ระบบนำเข้าข้อมูล `docs/data/portfolio.json` ไปยัง SQLite ครั้งเดียว หลังจากนั้นแก้ข้อมูลผ่านหลังบ้าน ฐานข้อมูลอยู่ที่ `server/data/portfolio.sqlite` และยังอยู่เมื่อปิด/เปิดเซิร์ฟเวอร์ใหม่

## ตั้งค่าอีเมลจริง

แก้ `server/.env` ด้วยค่าจากผู้ให้บริการ SMTP ของคุณ:

```dotenv
MAIL_MODE=smtp
SMTP_HOST=smtp.your-provider.example
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password-or-app-password
MAIL_FROM="MyPublic <no-reply@your-domain.example>"
```

พอร์ต 587 ใช้ STARTTLS และบังคับ TLS; พอร์ต 465 ให้ตั้ง `SMTP_SECURE=true` ข้อมูล sender ต้องได้รับอนุญาตจากผู้ให้บริการ ([เอกสาร Nodemailer SMTP](https://nodemailer.com/smtp)) แล้ว restart เซิร์ฟเวอร์

## เชื่อม GitHub Pages กับ backend

1. รัน backend บนเครื่อง/hosting ที่รองรับ Node.js และมีพื้นที่เก็บไฟล์ถาวรสำหรับ `server/data/` ใช้ backend หนึ่ง instance และสำรอง SQLite ด้วยเครื่องมือ backup ที่รองรับ SQLite
2. ตั้ง HTTPS reverse proxy ไปยัง Node; `APP_URL=https://api.your-domain.example` ต้องตรง URL ที่ผู้ใช้เปิด
3. ตั้ง `NODE_ENV=production`, `MAIL_MODE=smtp` และ `APP_SECRET` แบบสุ่มอย่างน้อย 64 ตัวอักษร เช่นสร้างด้วย:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. ตั้ง `HOST=0.0.0.0` เฉพาะกรณี hosting/container ต้องรับ connection ภายนอก และใช้ `PORT` ตามที่ hosting กำหนด
5. สร้างบัญชีเจ้าของบน backend ด้วยขั้นตอน `owner:create` โดยไม่ใส่บัญชีเริ่มต้นลง Git
6. ใน `docs/config.js` ตั้ง `apiBaseUrl: "https://api.your-domain.example"` แล้ว push

หน้าพอร์ตบน Pages อ่านเฉพาะข้อมูลสาธารณะจาก API; หน้า login เปิดระบบบนโดเมน backend โดยตรงเพื่อใช้ HttpOnly cookie แบบ same-origin ไม่พึ่ง third-party cookies ไม่เก็บ token ใน localStorage

หาก backend ใช้ไม่ได้ หน้าพอร์ตจะแสดง JSON ฉบับสำรองพร้อมข้อความแจ้ง การแก้ไขผ่านหลังบ้านบันทึกใน SQLite และมีผลต่อหน้าที่เชื่อม API ทันที **ไม่ได้ push GitHub อัตโนมัติ** ปุ่ม “ส่งออกไฟล์สำหรับ GitHub” จะดาวน์โหลดเฉพาะผลงานที่เผยแพร่แล้ว ให้นำไปแทน `docs/data/portfolio.json` และ commit/push เพื่ออัปเดตฉบับ static

## การยืนยันตัวตน

- รหัสผ่านอย่างน้อย 12 ตัวอักษร จัดเก็บด้วย salted scrypt
- สร้าง session หลังผ่านทั้งรหัสผ่านและ OTP เท่านั้น อายุ session 8 ชั่วโมง
- OTP 6 หลัก ใช้ครั้งเดียว หมดอายุ 10 นาที ผูกกับ pending cookie และเก็บ HMAC ในฐานข้อมูล
- ลอง OTP ได้ 5 ครั้งต่อ challenge, ขอส่งใหม่ได้ทุก 60 วินาที โดยไม่รีเซ็ตอายุหรือจำนวนครั้งที่ลองผิด
- จำกัดการลองรหัสผ่าน/OTP และการส่งอีเมลด้วยข้อมูลใน SQLite จึงไม่หายเมื่อ restart
- ป้องกันคำขอแก้ไขจาก origin อื่น ใช้ JSON, HttpOnly/SameSite cookies และ Secure cookies ใน production
- หากส่งอีเมลไม่สำเร็จ challenge ถูกยกเลิก และไม่มีการให้ session
- ไม่มีการรีเซ็ตรหัสผ่านผ่านหน้าเว็บในรุ่นแรก หากลืม ให้ตั้ง OWNER_EMAIL/OWNER_PASSWORD ในเครื่อง backend แล้วรัน `npm run owner:create -- --reset` เพื่อเปลี่ยนบัญชีและเพิกถอน session เดิมทั้งหมด

## ตรวจสอบ

```powershell
npm run check
npm test
npm audit
```

ทดสอบผ่านเบราว์เซอร์ด้วย `npm run test:browser` (Windows ใช้ Chrome ที่ติดตั้งไว้; Linux ให้รัน `npx playwright install chromium` ก่อน) ทดสอบฐานข้อมูลในหน่วยความจำแยกจากข้อมูลจริง และบันทึกภาพหน้าจอใน `.artifacts/`

ครอบคลุมการข้าม OTP, รหัสผิด/หมดอายุ/ใช้ซ้ำ, ส่งใหม่, SMTP ล้มเหลว, brute force, CSRF, ปิด session, เก็บฉบับร่าง, ตรวจ URL และการคงอยู่ของข้อมูล มี GitHub Actions สำหรับรัน syntax checks และ integration tests

เว็บไซต์เผยแพร่ที่ https://nyequirel.github.io/myportal/ แล้ว ส่วนระบบเข้าสู่ระบบจริงยังต้องตั้งบัญชีเจ้าของ, SMTP และ hosting backend การทดสอบอัตโนมัติใช้อีเมลจำลอง ไม่ได้ยืนยันการส่งถึง inbox ของผู้ให้บริการจริง

## ระบบเชื่อมโยงข้อมูลจัดซื้อจัดจ้างภาครัฐ

- หน้าผลงาน: https://nyequirel.github.io/myportal/project.html?id=egp-integration
- เดโม: https://nyequirel.github.io/myportal/demos/egp/
- ไฟล์แยกโปรเจกต์อยู่ใน `docs/demos/egp/` มีหน้าภาพรวม ประกาศ คิวซิงก์ และรายงานอีเมล

ปรับโครงหน้าประกาศ คิว และรายงานจากโปรเจกต์ PHP/MariaDB ที่เจ้าของให้มา โดยใช้ชื่อกลาง ระบบเชื่อมโยงข้อมูลจัดซื้อจัดจ้างภาครัฐ และนำโลโก้กับชื่อหน่วยงานเดิมออก คงไฟล์ลิขสิทธิ์ของ AdminLTE, Bootstrap, jQuery และ Font Awesome ไว้ใน `vendor/` ข้อมูลเริ่มต้นคัดมา **100 ประกาศและ 10 queue รวมทุกสถานะ** ชื่อประกาศ คำอธิบาย รหัสโครงการ วันที่ วิธีจัดหา และประเภทประกาศตรงกับรายการต้นทาง โดยเปลี่ยนเฉพาะชื่อหน่วยงานและ branding ปุ่มเปิดเอกสาร 98 รายการและสาระสำคัญของสัญญา 20 รายการใช้ลิงก์สาธารณะเดียวกับต้นทางและเปิดเว็บไซต์ E-GP ภายนอกเมื่อผู้ชมคลิก รายการที่ต้นทางไม่มีลิงก์จะแสดงขีด ไม่มีการสร้างลิงก์หรือรายละเอียดทดแทน

เดโมอ่าน JSON ภายในโปรเจกต์เท่านั้น การแก้ไขใช้ `sessionStorage` ของแท็บที่เปิดอยู่ เพิ่มประกาศได้เมื่อมีพื้นที่ว่างจากการลบและไม่เกิน 100 รายการ การสร้างคิวย้อนหลังแทนที่ชุดเดิมด้วย 10 queue การซิงก์และรายงานอีเมลเป็นการจำลอง ไม่มีการเชื่อมต่อระบบต้นทางหรือส่งอีเมล กด **คืนค่าตัวอย่าง** เพื่อเริ่มใหม่ ไม่รวม PHP backend, ไฟล์เชื่อมต่อฐานข้อมูล, บัญชี Directory, workers, logs หรือไฟล์ความลับ

ประกาศ 100 รายการคัดจากข้อมูลที่หน้าประกาศต้นทางแสดง โดยเลือกวนทีละประเภทจากรายการล่าสุดของแต่ละประเภท เพื่อครอบคลุมครบทั้ง 7 ประเภทที่มีข้อมูลจริง: ราคากลาง 15, ร่างเอกสารประกวดราคา 11, เชิญชวน 14, ยกเลิกเชิญชวน 1, แผนจัดซื้อจัดจ้าง 20, ผู้ชนะ/ผู้ได้รับคัดเลือก 20 และยกเลิกผู้ชนะ/ผู้ได้รับคัดเลือก 19 รายการ ประเภทเปลี่ยนแปลงประกาศเชิญชวน (D2) และเปลี่ยนแปลงรายชื่อผู้ชนะ (W2) ไม่มีรายการในชุดต้นทาง จึงไม่ได้สร้างข้อมูลขึ้นมาแทน ดูจำนวนต้นทางและจำนวนที่เลือกได้ใน `data/manifest.json` ภายในเดโม เมื่อเปลี่ยนรุ่นชุดข้อมูล ระบบจะโหลดชุดใหม่แทนข้อมูลเดโมรุ่นเก่าที่ค้างในแท็บ

ทดสอบด้วย `npm run test:egp` ครอบคลุมทั้งเซิร์ฟเวอร์ที่มี CSP และเส้นทางแบบ GitHub Pages: ค้นหา/กรอง/แบ่งหน้า แก้ไข/ลบ/เพิ่มตามขีดจำกัด การแสดงข้อความอย่างปลอดภัย เริ่ม/หยุด/ประมวลผลคิว ตัวอย่างอีเมล การคงข้อมูลในแท็บ และหน้าจอมือถือ/แท็บเล็ต ภาพทดสอบอยู่ใน `.artifacts/`

## ระบบครุภัณฑ์คอมพิวเตอร์

- หน้าผลงาน: https://nyequirel.github.io/myportal/project.html?id=computer-assets
- เดโม: https://nyequirel.github.io/myportal/demos/computer-assets/
- แยกไฟล์อยู่ใน `docs/demos/computer-assets/` ใช้ Bootstrap 5.0.2 และ Bootstrap Icons 1.11.3 จากต้นทาง พร้อม JavaScript modules โดยไม่ต้อง build หรือรัน PHP บน GitHub Pages

ปรับจาก template ระบบ Laravel 11 ของเจ้าของงาน โดยนำโครงเมนู Bootstrap และ CSS เดิมมาใช้ คอลัมน์ทะเบียนกับช่องรายละเอียดถูกดึงจาก Blade views ของทั้ง 8 หมวด: คอมพิวเตอร์ โน้ตบุ๊ก แท็บเล็ต เครื่องพิมพ์ สแกนเนอร์ UPS ซอฟต์แวร์ และอุปกรณ์เครือข่าย นำโลโก้และ branding หน่วยงานออก พร้อมเก็บประกาศลิขสิทธิ์ใน `vendor/`

ข้อมูลเริ่มต้นเป็น **ข้อมูลสมมติ 80 รายการ หมวดละ 10 รายการ** ไม่ใช่ทะเบียนหรือบุคลากรจริง ดูประเภทข้อมูลและปีอ้างอิงใน `data/manifest.json` รายละเอียดและคอลัมน์อยู่ใน `data/schema.json` การเพิ่ม/แก้ไขและประวัติบันทึกใน sessionStorage ของแท็บนั้น กดคืนค่าตัวอย่างเพื่อเริ่มใหม่ ค้นหาทุกช่องข้อมูล กรองประเภท/หน่วยงาน/สถานะ/อายุ จัดเรียง แบ่งหน้า เปิดรายละเอียดและแก้ไขได้ CSV ส่งออกเฉพาะรายการตามตัวกรองและป้องกันข้อมูลถูกตีความเป็นสูตร

Dashboard และรายงานคำนวณจากทะเบียนชุดเดียวกัน รายงานเสนอทดแทนใช้ **เกณฑ์สาธิต**: อายุอย่างน้อย 8 ปี หรือสถานะทดแทน และไม่นับรายการจำหน่าย ไม่ได้ย้ายโมเดลคะแนนที่ตั้งค่าในฐานข้อมูลต้นทางมา ระบบสิทธิ์ผู้ใช้ การเชื่อม Directory และการบันทึกฐานข้อมูลจริงยังต้องใช้ backend แยก สามารถคง Laravel ต้นฉบับไว้สำหรับงานจริงได้ เดโมไม่มี `.env`, credentials, PHP backend, logs, ฐานข้อมูล หรือข้อมูลเชื่อมต่อภายใน

ทดสอบด้วย `npm run test:assets` ตรวจช่องรายละเอียดครบทั้ง 8 หมวด ค้นหา/กรอง/แบ่งหน้า แก้ไขและคงข้อมูล ป้องกันเลขครุภัณฑ์ซ้ำ CSV ตามตัวกรอง รายงาน ประวัติ คืนค่า หน้าจอมือถือ/แท็บเล็ต และทั้ง CSP ของ backend กับเส้นทาง GitHub Pages
