'use strict';
const $ = id => document.getElementById(id);
const wave = $('waveform');
const wctx = wave.getContext('2d');

function preset(name, category, description, tags, config, layers){ return {name,category,description,tags,config,layers}; }
const CATEGORIES = {
  Weapons: ['pistol_rust','rifle_burst','shotgun_scrap','sniper_crack','smg_dirty','railgun_ruin','plasma_rifle','flamethrower_burst','dry_fire'],
  Fire: ['campfire_loop','oil_fire_loop','barrel_fire','torch_fire','fire_whoosh','molotov_ignite','ember_crackle','gas_burner','engine_fire'],
  Electricity: ['electric_arc','tesla_zap','emp_burst','reactor_spark','power_short','cable_snap','coil_charge','grid_hum','terminal_glitch'],
  Radiation: ['geiger_tick','geiger_alarm','reactor_pulse','radiation_hum','anomaly_ping','dosimeter_warning','rad_storm','core_resonance'],
  Biohazard: ['poison_hiss','acid_splash','slime_squish','mutant_growl','bio_burst','spore_puff','goo_drip','toxic_bubble','infection_pulse'],
  Psychic: ['psychic_pulse','mind_shock','psionic_charge','anomaly_whisper','telekinesis_hit','brain_ring','void_swell','hallucination_chime','psi_burst'],
  Impact: ['flesh_hit','metal_hit','concrete_hit','wood_hit','armor_hit','glass_hit','bullet_ricochet','shell_drop','debris_hit'],
  Explosion: ['grenade_blast','fuel_explosion','dust_blast','pipe_bomb','electro_blast','reactor_blast','small_pop','heavy_blast','shockwave'],
  Machinery: ['generator_loop','reactor_loop','servo_move','rusty_door','hydraulic_hiss','drone_motor','vent_fan','pump_loop','terminal_boot'],
  Ambience: ['ruined_city_wind','bunker_roomtone','radiation_zone','industrial_ruin','underground_tunnel','storm_distant','wasteland_night','toxic_swamp','abandoned_lab'],
  UI: ['ui_click','ui_error','ui_confirm','ui_warning','ui_inventory','ui_radio','ui_scan','ui_levelup','ui_hack']
};

const P = {};
function add(key,name,cat,desc,tags,c,l){ P[key]=preset(name,cat,desc,tags,c,l); }
const base = {duration:1,intensity:1,pitch:1,pitchVar:.12,noise:.25,transient:.65,body:.8,texture:.25,attack:.004,release:.25,lowpass:16000,highpass:20,distortion:.12,bitcrush:0,space:.16,stereo:.28};
const cfg = p => ({...base,...p});
const L = (type, gain=1, opts={}) => ({type,gain,...opts});

// Weapons — layered ballistic model: muzzle / pressure body / crack / action / casing / tail
add('pistol_rust','Rusty Pistol','Weapons','ปืนพกเก่าแบบ ballistic: muzzle snap + pressure body + slide/action + casing tail',['gun','pistol','rust'],cfg({duration:.72,noise:.13,transient:1.16,body:1.02,pitch:1.0,pitchVar:.035,lowpass:16500,highpass:34,distortion:.07,space:.08,stereo:.12,attack:0,release:.34}),[
  L('muzzle',1.0,{freq:155,duration:.16}),L('gunbody',.82,{freq:118,duration:.34}),L('guncrack',.50,{freq:3200,duration:.075}),
  L('mechanical',.22,{freq:1450,delay:.052,duration:.12}),L('shell',.11,{freq:2850,delay:.19,duration:.30}),L('blasttail',.24,{freq:82,delay:.018,duration:.46})
]);
add('rifle_burst','Assault Rifle Burst','Weapons','ไรเฟิล 3 นัดจริง มี muzzle crack, bolt/action และปลอกกระสุนแยกแต่ละนัด',['gun','rifle','burst'],cfg({duration:.82,noise:.11,transient:1.2,body:1.05,pitch:.96,pitchVar:.028,lowpass:17800,highpass:38,distortion:.055,space:.07,stereo:.14,attack:0,release:.30}),[
  L('muzzle',.92,{freq:132,duration:.14,repeat:3,interval:.104}),L('gunbody',.78,{freq:102,duration:.27,repeat:3,interval:.104}),
  L('guncrack',.64,{freq:3900,duration:.06,repeat:3,interval:.104}),L('mechanical',.18,{freq:1850,delay:.032,duration:.085,repeat:3,interval:.104}),
  L('shell',.085,{freq:3350,delay:.125,duration:.24,repeat:3,interval:.104}),L('blasttail',.19,{freq:76,delay:.014,duration:.33,repeat:3,interval:.104})
]);
add('shotgun_scrap','Scrap Shotgun','Weapons','ลูกซองประกอบ: pressure blast ต่ำ, muzzle noise กว้าง, ชิ้นส่วนโลหะ และ pump/action ตามหลัง',['shotgun','scrap','gun'],cfg({duration:1.08,noise:.16,transient:1.28,body:1.28,pitch:.82,pitchVar:.025,lowpass:14800,highpass:30,distortion:.085,space:.10,stereo:.18,attack:0,release:.48}),[
  L('muzzle',1.18,{freq:92,duration:.22}),L('gunbody',1.02,{freq:68,duration:.48}),L('pelletblast',.58,{freq:180,duration:.30}),
  L('guncrack',.34,{freq:2500,duration:.07}),L('blasttail',.40,{freq:58,delay:.025,duration:.72}),L('mechanical',.25,{freq:820,delay:.48,duration:.20}),L('shell',.10,{freq:2100,delay:.68,duration:.30})
]);
add('sniper_crack','Sniper Crack','Weapons','ไรเฟิลระยะไกล: supersonic crack เด่น ตามด้วย muzzle/body และ action ที่หน่วงเวลา',['sniper','crack','rifle'],cfg({duration:1.38,noise:.085,transient:1.35,body:.98,pitch:1.02,pitchVar:.018,lowpass:19000,highpass:42,distortion:.045,space:.14,stereo:.12,attack:0,release:.70}),[
  L('guncrack',.92,{freq:4700,duration:.055}),L('muzzle',.88,{freq:112,duration:.17}),L('gunbody',.80,{freq:78,duration:.52}),
  L('blasttail',.32,{freq:60,delay:.018,duration:.92}),L('mechanical',.18,{freq:1180,delay:.34,duration:.18}),L('shell',.075,{freq:2700,delay:.53,duration:.34})
]);
add('smg_dirty','Dirty SMG','Weapons','SMG 5 นัดสั้น มี cadence จริง พร้อม action และ casing ต่อเนื่อง',['smg','gun','burst'],cfg({duration:.72,noise:.12,transient:1.16,body:.78,pitch:1.08,pitchVar:.04,lowpass:17000,highpass:45,distortion:.065,space:.045,stereo:.14,attack:0,release:.24}),[
  L('muzzle',.76,{freq:165,duration:.11,repeat:5,interval:.074}),L('gunbody',.58,{freq:128,duration:.20,repeat:5,interval:.074}),
  L('guncrack',.42,{freq:3500,duration:.045,repeat:5,interval:.074}),L('mechanical',.18,{freq:2100,delay:.024,duration:.065,repeat:5,interval:.074}),
  L('shell',.065,{freq:3600,delay:.105,duration:.18,repeat:5,interval:.074})
]);
add('railgun_ruin','Ruin Railgun','Weapons','ชาร์จแม่เหล็กแล้วปล่อยแรงกระแทกพลังงาน',['railgun','scifi'],cfg({duration:1.55,noise:.18,transient:1.15,body:1.1,pitch:.85,distortion:.14,space:.30}),[L('charge',.72,{freq:170}),L('zap',1.0,{freq:760}),L('boom',.75,{freq:62})]);
add('plasma_rifle','Plasma Rifle','Weapons','ปืนพลาสมาแบบซากเทคโนโลยี มี sweep และไฟฟ้า',['plasma','energy'],cfg({duration:.9,noise:.14,transient:.95,body:.75,pitch:1.15,distortion:.12,space:.24}),[L('laser',1,{freq:620}),L('zap',.55,{freq:1200}),L('hum',.2,{freq:100})]);
add('flamethrower_burst','Flamethrower Burst','Weapons','ลมเชื้อเพลิง + เปลวไฟพุ่ง',['flame','weapon'],cfg({duration:1.8,noise:1.0,transient:.45,body:.72,pitch:.72,lowpass:7200,distortion:.12,space:.06}),[L('fire',1.1),L('hiss',.55),L('rumble',.3,{freq:55})]);
add('dry_fire','Dry Fire','Weapons','ไกปืนลั่นแต่ไม่มีกระสุน: trigger + hammer/striker + slide resonance สั้น',['click','weapon'],cfg({duration:.22,noise:.035,transient:1.25,body:.28,pitch:1.1,lowpass:15000,highpass:60,distortion:.025,space:.015,stereo:.06}),[L('mechanical',.88,{freq:1250,duration:.09}),L('click',.44,{freq:2600,delay:.012}),L('metal',.16,{freq:920,delay:.02})]);

// Fire
add('campfire_loop','Campfire Loop','Fire','กองไฟเบา มี crackle ต่อเนื่อง',['fire','loop'],cfg({duration:4,noise:.7,transient:.15,body:.5,pitch:.75,lowpass:8500,space:.12,stereo:.55}),[L('fire',1),L('crackle',.7)]);
add('oil_fire_loop','Oil Fire Loop','Fire','ไฟน้ำมันหนาและต่ำ',['fire','oil','loop'],cfg({duration:4,noise:.85,transient:.12,body:.72,pitch:.58,lowpass:6200,distortion:.1,stereo:.5}),[L('fire',1.15),L('rumble',.25,{freq:48}),L('crackle',.45)]);
add('barrel_fire','Burning Barrel','Fire','เปลวไฟในถังเหล็ก มี resonance โลหะ',['fire','barrel'],cfg({duration:3.5,noise:.62,body:.55,pitch:.8,lowpass:7800,space:.16}),[L('fire',1),L('metalhum',.18,{freq:180}),L('crackle',.5)]);
add('torch_fire','Torch Flame','Fire','ไฟคบเพลิงแคบและสว่าง',['fire','torch'],cfg({duration:3,noise:.58,body:.32,pitch:1.05,lowpass:9800,stereo:.2}),[L('fire',.9),L('hiss',.22),L('crackle',.28)]);
add('fire_whoosh','Fire Whoosh','Fire','ไฟวูบผ่านเร็ว ใช้กับ attack/transition',['fire','whoosh'],cfg({duration:.85,noise:.92,transient:.7,body:.5,pitch:.9,lowpass:9800,space:.18}),[L('whoosh',1),L('fire',.48)]);
add('molotov_ignite','Molotov Ignite','Fire','จุดระเบิดขวดเชื้อเพลิง มี glass + fire burst',['molotov','fire'],cfg({duration:1.3,noise:.7,transient:1.05,body:.72,pitch:.85,space:.2}),[L('glass',.72),L('fire',1),L('boom',.38,{freq:75})]);
add('ember_crackle','Ember Crackle','Fire','ถ่านแตกเบา ๆ แบบ isolated sparks',['ember','crackle'],cfg({duration:2.8,noise:.38,transient:.55,body:.18,pitch:1.1,lowpass:12000,stereo:.65}),[L('crackle',1)]);
add('gas_burner','Gas Burner','Fire','เปลวแก๊สต่อเนื่องเนียนกว่ากองไฟ',['gas','burner'],cfg({duration:3,noise:.72,transient:.05,body:.25,pitch:1.22,lowpass:12500,stereo:.25}),[L('hiss',1),L('fire',.28)]);
add('engine_fire','Engine Fire','Fire','เครื่องยนต์ไหม้ มี flame + mechanical rumble',['fire','engine'],cfg({duration:4,noise:.75,body:.85,pitch:.62,lowpass:6800,distortion:.2,stereo:.45}),[L('fire',.85),L('rumble',.55,{freq:42}),L('metalhum',.25,{freq:105})]);

// Electricity
add('electric_arc','Electric Arc','Electricity','สายไฟอาร์กแตกพร่าและ snap',['electric','arc'],cfg({duration:.65,noise:.35,transient:1.15,body:.4,pitch:1.2,lowpass:17000,distortion:.25,space:.12}),[L('zap',1.1,{freq:1500}),L('crackle',.6)]);
add('tesla_zap','Tesla Zap','Electricity','Tesla coil ยิงพลังงานแหลม',['tesla','zap'],cfg({duration:.8,noise:.22,transient:1.0,body:.5,pitch:1.35,distortion:.32,space:.25}),[L('zap',1.1,{freq:2200}),L('laser',.45,{freq:820})]);
add('emp_burst','EMP Burst','Electricity','ชาร์จสั้น + pulse ต่ำ + digital fizz',['emp','pulse'],cfg({duration:1.35,noise:.35,transient:.9,body:1.05,pitch:.8,distortion:.28,bitcrush:.14,space:.3}),[L('charge',.5,{freq:130}),L('boom',.7,{freq:52}),L('zap',.65,{freq:900})]);
add('reactor_spark','Reactor Sparks','Electricity','ประกายไฟเครื่องปฏิกรณ์แบบสุ่ม',['reactor','spark'],cfg({duration:2.5,noise:.28,transient:.65,body:.18,pitch:1.05,stereo:.7}),[L('crackle',1),L('zap',.25,{freq:1200})]);
add('power_short','Power Short','Electricity','ไฟช็อตแรงแล้วดับ',['short','power'],cfg({duration:.9,noise:.55,transient:1.2,body:.48,pitch:.95,distortion:.42,lowpass:13500}),[L('zap',.95,{freq:1300}),L('crackle',.8),L('boom',.22,{freq:70})]);
add('cable_snap','Cable Snap','Electricity','สายไฟขาด มี whip + arc',['cable','snap'],cfg({duration:.65,noise:.42,transient:1.35,body:.35,pitch:1.15}),[L('crack',.8,{freq:1600}),L('zap',.75,{freq:1100})]);
add('coil_charge','Coil Charge','Electricity','เสียงชาร์จแรงดันไต่ขึ้น',['charge','coil'],cfg({duration:1.8,noise:.18,transient:.12,body:.55,pitch:.85,space:.2}),[L('charge',1,{freq:95}),L('hum',.35,{freq:55})]);
add('grid_hum','Broken Grid Hum','Electricity','ฮัมไฟ 50Hz สกปรกและไม่นิ่ง',['hum','loop'],cfg({duration:4,noise:.12,transient:.02,body:.85,pitch:1,lowpass:5000,distortion:.18,stereo:.2}),[L('hum',1,{freq:50}),L('metalhum',.22,{freq:100})]);
add('terminal_glitch','Terminal Glitch','Electricity','ไฟฟ้าดิจิทัลกระตุกและ bitcrush',['glitch','terminal'],cfg({duration:.75,noise:.24,transient:.65,body:.25,pitch:1.3,bitcrush:.55,distortion:.3}),[L('digital',1,{freq:620}),L('click',.35,{freq:2100})]);

// Radiation
add('geiger_tick','Geiger Tick','Radiation','click เดี่ยวของเครื่องวัดรังสี',['geiger','tick'],cfg({duration:.12,noise:.18,transient:1.3,body:.15,pitch:1.25,lowpass:14000}),[L('click',1,{freq:2800}),L('noisehit',.3)]);
add('geiger_alarm','Geiger Alarm','Radiation','geiger ถี่ + alarm warning',['geiger','alarm'],cfg({duration:2.2,noise:.3,transient:.7,body:.35,pitch:1,space:.08}),[L('ticks',.9,{rate:16}),L('beep',.75,{freq:1400})]);
add('reactor_pulse','Reactor Pulse','Radiation','pulse ต่ำจาก core รังสี',['reactor','pulse'],cfg({duration:1.5,noise:.18,transient:.7,body:1.2,pitch:.62,lowpass:7000,space:.42}),[L('boom',.72,{freq:44}),L('hum',.5,{freq:72}),L('ring',.35,{freq:420})]);
add('radiation_hum','Radiation Hum','Radiation','ฮัมเหนือธรรมชาติค้างยาว',['radiation','hum'],cfg({duration:4,noise:.2,transient:.02,body:.72,pitch:.8,space:.55,stereo:.65}),[L('hum',.8,{freq:86}),L('ring',.5,{freq:480}),L('air',.28)]);
add('anomaly_ping','Anomaly Ping','Radiation','ping แหลมตรวจพบความผิดปกติ',['anomaly','ping'],cfg({duration:1.1,noise:.05,transient:.95,body:.25,pitch:1.22,space:.65}),[L('ring',1,{freq:920}),L('sub',.2,{freq:52})]);
add('dosimeter_warning','Dosimeter Warning','Radiation','เตือนระดับรังสีแบบอุปกรณ์เก่า',['warning','dosimeter'],cfg({duration:1.6,noise:.08,transient:.55,body:.25,pitch:1,bitcrush:.18}),[L('beep',1,{freq:1250}),L('click',.18,{freq:2600})]);
add('rad_storm','Radiation Storm','Radiation','ลมรังสีและ static กระเพื่อม',['radiation','storm','loop'],cfg({duration:5,noise:.72,transient:.08,body:.58,pitch:.65,lowpass:9000,space:.48,stereo:.8}),[L('wind',1),L('ticks',.4,{rate:8}),L('hum',.28,{freq:64})]);
add('core_resonance','Core Resonance','Radiation','เสียงแกน reactor ก้อง harmonic หลายชั้น',['core','resonance'],cfg({duration:3.5,noise:.12,transient:.08,body:1,pitch:.72,space:.6,distortion:.16}),[L('hum',.9,{freq:52}),L('ring',.5,{freq:208}),L('ring',.32,{freq:416})]);

// Biohazard
add('poison_hiss','Poison Hiss','Biohazard','แก๊สพิษพ่นจากท่อ',['poison','hiss'],cfg({duration:1.8,noise:1.0,transient:.35,body:.28,pitch:.82,lowpass:8500}),[L('hiss',1),L('bubble',.2,{freq:90})]);
add('acid_splash','Acid Splash','Biohazard','ของเหลวกัดกร่อนกระเซ็นและ fizz',['acid','splash'],cfg({duration:1.1,noise:.72,transient:.8,body:.45,pitch:1.05,lowpass:11000}),[L('splash',1),L('fizz',.65),L('bubble',.28,{freq:120})]);
add('slime_squish','Slime Squish','Biohazard','เมือกเหนียวบีบและดูด',['slime','squish'],cfg({duration:.75,noise:.32,transient:.45,body:.8,pitch:.68,lowpass:4200}),[L('squish',1,{freq:95}),L('bubble',.42,{freq:68})]);
add('mutant_growl','Mutant Growl','Biohazard','เสียงคำรามสังเคราะห์ของสิ่งกลายพันธุ์',['mutant','growl'],cfg({duration:1.8,noise:.42,transient:.18,body:1.1,pitch:.48,lowpass:5200,distortion:.34,space:.25}),[L('growl',1,{freq:72}),L('rumble',.45,{freq:38})]);
add('bio_burst','Bio Burst','Biohazard','ถุงชีวภาพแตก มี wet impact + hiss',['bio','burst'],cfg({duration:.9,noise:.65,transient:1.0,body:.7,pitch:.8}),[L('squish',.9,{freq:100}),L('splash',.72),L('hiss',.3)]);
add('spore_puff','Spore Puff','Biohazard','ฝุ่นสปอร์พุ่งฟุ้งเบา',['spore','puff'],cfg({duration:1.2,noise:.82,transient:.48,body:.2,pitch:.75,lowpass:6000,space:.22}),[L('whoosh',.7),L('hiss',.5)]);
add('goo_drip','Goo Drip','Biohazard','หยดเมือกตกลงพื้น',['goo','drip'],cfg({duration:.8,noise:.25,transient:.55,body:.5,pitch:.78,lowpass:5500}),[L('droplet',.8,{freq:420}),L('squish',.55,{freq:120})]);
add('toxic_bubble','Toxic Bubble','Biohazard','ฟองพิษปุดแล้วแตก',['bubble','toxic'],cfg({duration:.65,noise:.28,transient:.65,body:.58,pitch:.85,lowpass:6800}),[L('bubble',1,{freq:105}),L('pop',.7,{freq:500})]);
add('infection_pulse','Infection Pulse','Biohazard','ชีพจรชีวภาพหนักและไม่สบายใจ',['infection','pulse'],cfg({duration:1.4,noise:.18,transient:.55,body:1.05,pitch:.6,distortion:.2,space:.3}),[L('heartbeat',1,{freq:62}),L('growl',.3,{freq:54})]);

// Psychic
add('psychic_pulse','Psychic Pulse','Psychic','คลื่นพลังจิต sweep ออกแล้วก้อง',['psychic','pulse'],cfg({duration:1.45,noise:.12,transient:.7,body:.75,pitch:1.05,space:.65,stereo:.7}),[L('psi',1,{freq:380}),L('ring',.55,{freq:780}),L('sub',.35,{freq:48})]);
add('mind_shock','Mind Shock','Psychic','การกระแทกทางจิตฉับพลัน แหลมและบิด',['psychic','shock'],cfg({duration:.85,noise:.22,transient:1.15,body:.55,pitch:1.2,distortion:.3,space:.5}),[L('crack',.55,{freq:1900}),L('psi',.9,{freq:520}),L('sub',.28,{freq:55})]);
add('psionic_charge','Psionic Charge','Psychic','พลังจิตไต่ระดับก่อนปล่อย',['charge','psionic'],cfg({duration:2,noise:.1,transient:.12,body:.62,pitch:.9,space:.52}),[L('charge',.75,{freq:145}),L('psi',.75,{freq:270})]);
add('anomaly_whisper','Anomaly Whisper','Psychic','เสียงลม/กระซิบสังเคราะห์รอบตัว',['whisper','anomaly'],cfg({duration:4,noise:.52,transient:.04,body:.25,pitch:.82,space:.82,stereo:1}),[L('whisper',1),L('ring',.22,{freq:620})]);
add('telekinesis_hit','Telekinesis Hit','Psychic','แรงกระแทกพลังจิตแบบสะอาด: psionic impact + wave + sub ไม่มี broadband hiss',['telekinesis','impact'],cfg({duration:1.05,noise:0,transient:1.04,body:1.02,pitch:.82,space:.42,lowpass:12000,distortion:.06}),[L('psiimpact',.92,{freq:175,duration:.52}),L('psiwave',.62,{freq:330,delay:.012,duration:.68}),L('sub',.34,{freq:46,duration:.62})]);
add('brain_ring','Brain Ring','Psychic','เสียง ringing หลังโดนพลังจิต',['ring','psychic'],cfg({duration:2.7,noise:.05,transient:.35,body:.25,pitch:1.1,space:.86}),[L('ring',1,{freq:1350}),L('ring',.35,{freq:690})]);
add('void_swell','Void Swell','Psychic','เสียงพองตัวจาก void ต่ำและกว้างแบบ smooth pressure ไม่มี radio hiss',['void','swell'],cfg({duration:2.6,noise:0,transient:.08,body:1.15,pitch:.55,lowpass:6500,space:.72,stereo:.9}),[L('airpush',.5,{freq:82}),L('sub',.9,{freq:38}),L('psi',.4,{freq:180})]);
add('hallucination_chime','Hallucination Chime','Psychic','ระฆังเพี้ยนสำหรับ hallucination',['chime','hallucination'],cfg({duration:2.1,noise:.04,transient:.65,body:.2,pitch:1.2,space:.9}),[L('ring',.85,{freq:1100}),L('ring',.5,{freq:1470}),L('reverse',.22,{freq:650})]);
add('psi_burst','Psi Burst','Psychic','ระเบิดพลังจิตหลาย harmonic',['psi','burst'],cfg({duration:1.2,noise:.18,transient:1.0,body:.88,pitch:.92,distortion:.18,space:.62}),[L('psi',1,{freq:420}),L('boom',.45,{freq:60}),L('ring',.42,{freq:920})]);

// Impact
const impactDefs = [
 ['flesh_hit','Flesh Hit','flesh',110,.85,4200],['metal_hit','Metal Hit','metal',480,1.1,15000],['concrete_hit','Concrete Hit','debris',170,.95,7000],['wood_hit','Wood Hit','wood',190,.9,8000],['armor_hit','Armor Hit','metal',260,1.05,11000],['glass_hit','Glass Hit','glass',950,1.18,17000],['bullet_ricochet','Bullet Ricochet','ricochet',1800,1.32,18000],['shell_drop','Shell Drop','metal',1150,.9,15000],['debris_hit','Debris Hit','debris',130,.82,6500]
];
for(const [k,n,t,f,pit,lp] of impactDefs) add(k,n,'Impact',`${n} สำหรับ combat / environment`,[t,'impact'],cfg({duration:t==='glass'?1.15:.65,noise:.06,transient:1,body:.72,pitch:pit,lowpass:lp,space:.12}),[L(t,1,{freq:f})]);

// Explosion — v1.5: distinct archetypes + clean transient/pressure design.
// Each preset has a different acoustic structure instead of sharing one generic boom recipe.
add('grenade_blast','Grenade Blast','Explosion','ระเบิดมือ: detonation crack สั้น + pressure punch + metal fragments',['explosion','grenade','fragmentation'],cfg({duration:1.28,noise:.04,transient:1.28,body:.72,pitch:.98,lowpass:9800,highpass:28,distortion:.07,space:.16,stereo:.16,release:.20}),[L('grenadedet',1.0,{freq:78,duration:.42}),L('pressurefront',.58,{freq:62,duration:.5}),L('fragburst',.38,{delay:.018,duration:.72})]);
add('fuel_explosion','Fuel Explosion','Explosion','เชื้อเพลิงลุกระเบิด: low whoomph + rolling combustion body ไม่มี fragmentation เด่น',['explosion','fuel','combustion'],cfg({duration:2.05,noise:.10,transient:.72,body:1.05,pitch:.74,lowpass:6200,highpass:18,distortion:.08,space:.26,stereo:.24,release:.42}),[L('fuelblast',1.0,{freq:48,duration:1.45}),L('pressurefront',.34,{freq:44,duration:.72}),L('combustiontail',.34,{delay:.08,duration:1.55})]);
add('dust_blast','Dust Blast','Explosion','ฝุ่น/เศษวัสดุพุ่ง: thump อับ + particulate impacts กระจาย',['explosion','dust','debris'],cfg({duration:1.72,noise:.10,transient:.76,body:.9,pitch:.84,lowpass:4700,highpass:16,distortion:.04,space:.24,stereo:.28,release:.36}),[L('dustthump',1.0,{freq:56,duration:1.0}),L('debris',.52,{delay:.04,duration:1.18})]);
add('pipe_bomb','Pipe Bomb','Explosion','ระเบิดท่อ: crack แข็ง + metallic rupture + fragments คม',['explosion','pipe','metal'],cfg({duration:1.3,noise:.035,transient:1.35,body:.62,pitch:1.03,lowpass:12500,highpass:32,distortion:.08,space:.13,stereo:.14,release:.20}),[L('pipedet',1.0,{freq:92,duration:.46}),L('metalrupture',.54,{freq:620,delay:.012,duration:.55}),L('fragburst',.46,{delay:.02,duration:.68})]);
add('electro_blast','Electro Blast','Explosion','ระเบิดพลังงานไฟฟ้า: pulse + arc snap + resonant discharge',['explosion','electric','energy'],cfg({duration:1.22,noise:.03,transient:1.18,body:.7,pitch:1.06,lowpass:11800,highpass:34,distortion:.10,space:.28,stereo:.34,release:.24}),[L('electrodet',1.0,{freq:360,duration:.62}),L('pressurefront',.30,{freq:58,duration:.42}),L('ring',.22,{freq:980,delay:.035,duration:.72})]);
add('reactor_blast','Reactor Blast','Explosion','reactor collapse: deep core implosion + huge sub pressure + energy resonance',['explosion','reactor','core'],cfg({duration:3.1,noise:.025,transient:.76,body:1.28,pitch:.62,lowpass:7200,highpass:14,distortion:.07,space:.5,stereo:.42,release:.62}),[L('reactordet',1.0,{freq:34,duration:2.3}),L('pressurefront',.46,{freq:34,duration:1.25}),L('ring',.34,{freq:360,delay:.08,duration:2.0})]);
add('small_pop','Small Explosion','Explosion','ระเบิดขนาดเล็ก: compact pop สั้น แห้ง และแทบไม่มี tail',['explosion','small','pop'],cfg({duration:.62,noise:0,transient:1.42,body:.38,pitch:1.2,lowpass:14000,highpass:42,distortion:.04,space:.07,stereo:.09,release:.12}),[L('smalldet',1.0,{freq:118,duration:.28}),L('pressurefront',.24,{freq:92,duration:.22})]);
add('heavy_blast','Heavy Blast','Explosion','ระเบิดหนัก: deep shock + chest pressure + long low-frequency decay',['explosion','heavy','shock'],cfg({duration:2.7,noise:.035,transient:.92,body:1.35,pitch:.56,lowpass:5200,highpass:12,distortion:.06,space:.4,stereo:.28,release:.56}),[L('heavydet',1.0,{freq:30,duration:2.05}),L('pressurefront',.62,{freq:32,duration:1.32}),L('sub',.34,{freq:27,delay:.02,duration:1.8})]);
add('shockwave','Shockwave','Explosion','คลื่นกระแทก: pressure front กว้าง ไม่มีเศษโลหะและไม่มี combustion tail',['explosion','shockwave','pressure'],cfg({duration:1.8,noise:0,transient:.98,body:1.15,pitch:.7,lowpass:4300,highpass:10,distortion:.02,space:.22,stereo:.22,release:.40}),[L('shockfront',1.0,{freq:40,duration:1.32}),L('sub',.4,{freq:31,duration:1.2})]);

// Machinery
add('generator_loop','Generator Loop','Machinery','เครื่องปั่นไฟเก่า loop ไม่เรียบ',['generator','loop'],cfg({duration:4,noise:.25,transient:.05,body:.85,pitch:.72,lowpass:6500,distortion:.2,stereo:.3}),[L('engine',1,{freq:42}),L('metalhum',.28,{freq:126})]);
add('reactor_loop','Reactor Loop','Machinery','แกน reactor ทำงานพร้อม harmonic',['reactor','loop'],cfg({duration:4,noise:.12,transient:.02,body:1,pitch:.68,space:.28}),[L('hum',.9,{freq:55}),L('metalhum',.42,{freq:220}),L('pulse',.25,{freq:2})]);
add('servo_move','Servo Move','Machinery','มอเตอร์ servo ขยับกลไก',['servo','robot'],cfg({duration:.8,noise:.2,transient:.25,body:.45,pitch:1.2,lowpass:10000}),[L('servo',1,{freq:240}),L('click',.25,{freq:1200})]);
add('rusty_door','Rusty Door','Machinery','ประตูเหล็กขึ้นสนิมลากแล้วปิด',['door','rust'],cfg({duration:1.8,noise:.55,transient:.35,body:.65,pitch:.6,lowpass:6200}),[L('creak',1,{freq:120}),L('metal',.45,{freq:420})]);
add('hydraulic_hiss','Hydraulic Hiss','Machinery','แรงดันไฮดรอลิกปล่อยลม',['hydraulic','hiss'],cfg({duration:1.2,noise:.95,transient:.45,body:.25,pitch:.82,lowpass:9000}),[L('hiss',1),L('servo',.28,{freq:130})]);
add('drone_motor','Drone Motor','Machinery','มอเตอร์โดรนผุพังและ wobble',['drone','motor','loop'],cfg({duration:3,noise:.18,transient:.03,body:.58,pitch:1.18,lowpass:9000,distortion:.16,stereo:.42}),[L('engine',.75,{freq:105}),L('buzz',.55,{freq:210})]);
add('vent_fan','Vent Fan','Machinery','พัดลมระบายอากาศเก่า',['fan','loop'],cfg({duration:4,noise:.32,transient:.02,body:.6,pitch:.72,lowpass:5200,stereo:.35}),[L('engine',.55,{freq:34}),L('wind',.45)]);
add('pump_loop','Water Pump','Machinery','ปั๊มน้ำเก่ากระตุกเป็นจังหวะ',['pump','loop'],cfg({duration:4,noise:.24,transient:.12,body:.72,pitch:.7,lowpass:6000}),[L('engine',.7,{freq:46}),L('pulse',.5,{freq:3.2}),L('click',.12,{freq:700})]);
add('terminal_boot','Terminal Boot','Machinery','เครื่อง terminal เก่าบูตและ relay click',['terminal','boot'],cfg({duration:1.8,noise:.12,transient:.55,body:.3,pitch:1.1,bitcrush:.24}),[L('click',.4,{freq:1800}),L('digital',.75,{freq:380}),L('beep',.45,{freq:900})]);

// Ambience
add('ruined_city_wind','Ruined City Wind','Ambience','ลมผ่านซากตึก มี resonance ไกล ๆ',['wind','city','loop'],cfg({duration:6,noise:.85,transient:.01,body:.4,pitch:.68,lowpass:7200,space:.55,stereo:1}),[L('wind',1),L('metalhum',.16,{freq:95}),L('debris',.1)]);
add('bunker_roomtone','Bunker Roomtone','Ambience','ห้อง bunker ปิด มีไฟฮัมและ ventilation',['bunker','roomtone'],cfg({duration:6,noise:.26,transient:.01,body:.55,pitch:.78,lowpass:5400,space:.28,stereo:.55}),[L('air',.65),L('hum',.42,{freq:50}),L('metalhum',.18,{freq:150})]);
add('radiation_zone','Radiation Zone','Ambience','พื้นที่รังสี มี wind + geiger เบา',['radiation','ambience'],cfg({duration:6,noise:.62,transient:.05,body:.4,pitch:.7,space:.5,stereo:.85}),[L('wind',.8),L('ticks',.32,{rate:4}),L('hum',.2,{freq:70})]);
add('industrial_ruin','Industrial Ruin','Ambience','โรงงานร้าง มี metal drone และลม',['industrial','ruin'],cfg({duration:6,noise:.45,transient:.02,body:.7,pitch:.62,lowpass:6500,space:.62,stereo:.8}),[L('air',.5),L('metalhum',.55,{freq:78}),L('debris',.1)]);
add('underground_tunnel','Underground Tunnel','Ambience','อุโมงค์ใต้ดินก้องและมี drip',['tunnel','ambience'],cfg({duration:6,noise:.32,transient:.03,body:.45,pitch:.68,space:.8,stereo:.9}),[L('air',.55),L('droplets',.45,{rate:1.8}),L('hum',.2,{freq:60})]);
add('storm_distant','Distant Storm','Ambience','พายุห่างไกล มี low thunder',['storm','ambience'],cfg({duration:6,noise:.7,transient:.08,body:.72,pitch:.58,lowpass:6500,space:.7,stereo:1}),[L('wind',.82),L('rumble',.55,{freq:34})]);
add('wasteland_night','Wasteland Night','Ambience','กลางคืนใน wasteland เงียบ ลม และ insect synth',['night','wasteland'],cfg({duration:6,noise:.5,transient:.02,body:.22,pitch:.9,lowpass:9000,space:.62,stereo:1}),[L('wind',.55),L('chirps',.35,{rate:2.4})]);
add('toxic_swamp','Toxic Swamp','Ambience','หนองพิษ มี bubble + insects + air',['swamp','toxic'],cfg({duration:6,noise:.42,transient:.05,body:.4,pitch:.7,lowpass:7000,space:.55,stereo:.9}),[L('air',.45),L('bubbles',.55,{rate:1.6}),L('chirps',.22,{rate:1.5})]);
add('abandoned_lab','Abandoned Lab','Ambience','ห้องทดลองร้าง ไฟฮัม terminal glitch เป็นครั้งคราว',['lab','ambience'],cfg({duration:6,noise:.24,transient:.05,body:.55,pitch:.82,space:.48,stereo:.75}),[L('hum',.45,{freq:50}),L('air',.35),L('glitches',.25,{rate:.7})]);

// UI
const uiDefs=[
 ['ui_click','UI Click','click',1500,.16],['ui_error','UI Error','beep',360,.45],['ui_confirm','UI Confirm','beep',900,.35],['ui_warning','UI Warning','beep',1250,.65],['ui_inventory','Inventory Move','digital',520,.3],['ui_radio','Radio Toggle','radio',950,.42],['ui_scan','Scanner Ping','ring',1150,.8],['ui_levelup','Level Up','chime',720,1.2],['ui_hack','Hack Input','digital',680,.55]
];
for(const [k,n,t,f,d] of uiDefs) add(k,n,'UI',`${n} โทน interface แบบอุปกรณ์เอาตัวรอด`,['ui',t],cfg({duration:d,noise:.04,transient:.72,body:.28,pitch:1,lowpass:18000,bitcrush:k.includes('radio')?.14:0,space:.09}),[L(t,1,{freq:f}),...(k==='ui_levelup'?[L('ring',.35,{freq:f*1.5})]:[])]);

const STYLE = {
 dirty:{name:'Dirty / Rusty',noise:1.18,distortion:1.35,lowpass:.78,space:.9,bitcrush:0},
 industrial:{name:'Industrial',noise:1.05,distortion:1.15,lowpass:.92,space:.75,bitcrush:0},
 mutant:{name:'Mutant / Biohazard',noise:1.08,distortion:1.2,lowpass:.7,space:1.1,bitcrush:0},
 survival:{name:'Military / Survival',noise:.9,distortion:.95,lowpass:1.0,space:.72,bitcrush:0},
 ruin:{name:'Sci-fi Ruin',noise:.8,distortion:1.05,lowpass:1.08,space:1.35,bitcrush:0}
};

function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function lerp(a,b,t){ return a+(b-a)*t; }
function expEnv(t, attack, release, dur){ const a=attack<=0?1:Math.min(1,t/attack); const tail=Math.max(0,(dur-t)/Math.max(.0001,release)); return a*Math.min(1,tail); }
function noiseSample(rnd){ return rnd()*2-1; }
function smoothstep(a,b,x){ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); }
function hashRand(seed,n){ let x=(seed+n*374761393)|0; x=(x^(x>>>13))*1274126177; return ((x^(x>>>16))>>>0)/4294967296; }

// Modern acoustic helpers: deterministic colored noise + inharmonic modal banks.
// These avoid the obvious single-oscillator / white-noise character of older game SFX.
function whiteAt(seed,i){ return hashRand(seed,i)*2-1; }
function coloredNoise(seed,i,color='pink'){
  const w=whiteAt(seed,i);
  if(color==='white') return w;
  if(color==='dark'){
    return w*.32 + whiteAt(seed+11,Math.floor(i/4))*.28 + whiteAt(seed+23,Math.floor(i/16))*.24 + whiteAt(seed+47,Math.floor(i/64))*.16;
  }
  return w*.52 + whiteAt(seed+11,Math.floor(i/2))*.24 + whiteAt(seed+23,Math.floor(i/4))*.14 + whiteAt(seed+47,Math.floor(i/8))*.10;
}
// Smooth, bandwidth-limited random signal for pressure/air movement. Unlike white/pink
// noise this does not leave a radio-like high-frequency hiss in explosions.
function lowRateNoise(seed,i,step=32){
  const cell=Math.floor(i/step), u=(i-cell*step)/step;
  const a=whiteAt(seed,cell), b=whiteAt(seed,cell+1);
  const q=u*u*(3-2*u);
  return a+(b-a)*q;
}
function modalBank(t,base,seed,decay=7,brightness=1){
  const ratios=[1,1.31,1.87,2.53,3.41,4.76];
  const amps=[1,.62,.43,.28,.18,.11];
  let v=0;
  for(let m=0;m<ratios.length;m++){
    const det=1+(hashRand(seed,300+m)-.5)*.028;
    const ph=hashRand(seed,330+m)*Math.PI*2;
    const d=decay*(.82+m*.27/Math.max(.35,brightness));
    v+=Math.sin(2*Math.PI*base*ratios[m]*det*t+ph)*amps[m]*Math.exp(-t*d);
  }
  return v*.42;
}
function shapedBurst(seed,i,t,fast=55,slow=12,dark=.4){
  const hi=coloredNoise(seed,i,'pink')*Math.exp(-t*fast);
  const body=coloredNoise(seed+71,i,'dark')*Math.exp(-t*slow);
  return hi*(1-dark)+body*dark;
}

// Only genuinely noise-based layers are controlled by the Noise slider.
// v1.1 added broadband white noise to every layer, which created a permanent radio-like hiss.
const NOISE_DRIVEN_LAYER_TYPES = new Set(['fire','hiss','fizz','crackle','ticks','whoosh','wind','air','whisper','combustiontail']);
function noiseLayerScale(type,c,style){
  if(!NOISE_DRIVEN_LAYER_TYPES.has(type)) return 1;
  // Most presets were authored around ~0.75 as a normal noise-layer level.
  // 0 is true silence for dedicated noise layers; values above 0.75 can deliberately exaggerate them.
  return clamp((c.noise/.75)*style.noise,0,1.6);
}

function getControls(){
  return {
    seed:parseInt($('seed').value)||1,duration:+$('duration').value,intensity:+$('intensity').value,pitch:+$('pitch').value,pitchVar:+$('pitchVar').value,
    noise:+$('noise').value,transient:+$('transient').value,body:+$('body').value,texture:+$('texture').value,attack:+$('attack').value,release:+$('release').value,
    lowpass:+$('lowpass').value,highpass:+$('highpass').value,distortion:+$('distortion').value,bitcrush:+$('bitcrush').value,space:+$('space').value,stereo:+$('stereo').value,
    sampleRate:+$('sampleRate').value,channels:+$('channels').value,preset:$('preset').value,stylePack:$('stylePack').value
  };
}

function osc(type, phase){
  const s=Math.sin(phase);
  if(type==='sine') return s;
  if(type==='tri') return 2/Math.PI*Math.asin(s);
  if(type==='square') return s>=0?1:-1;
  return s;
}
function layerSample(layer,t,dur,rndState,c,seed,index){
  // Per-layer timing lets ballistic presets contain delayed action/casing and real multi-shot bursts.
  const delay=layer.delay||0, repeat=Math.max(1,layer.repeat||1), interval=Math.max(.001,layer.interval||.1);
  let localT=t-delay, shotIndex=0;
  if(localT<0) return 0;
  if(repeat>1){ shotIndex=Math.floor(localT/interval); if(shotIndex>=repeat) return 0; localT-=shotIndex*interval; }
  const localDur=layer.duration||Math.max(.05,dur-delay-(repeat-1)*interval);
  if(localT>localDur) return 0;
  t=localT; seed=(seed+shotIndex*104729)>>>0; index=index+shotIndex*8191;
  const f0=(layer.freq||120)*c.pitch;
  const localVar=1+(hashRand(seed,17)-.5)*2*c.pitchVar*.18;
  const f=f0*localVar;
  const progress=clamp(t/localDur,0,1);
  const n=hashRand(seed,index);
  const white=n*2-1;
  const pulse=(rate=8,width=.15)=> ((t*rate)%1)<width?1:0;
  let x=0;
  switch(layer.type){
    case 'muzzle': {
      const shock=shapedBurst(seed,index,t,92,15,.58);
      const pressure=modalBank(t,Math.max(46,f*.46),seed+3,11,.55)*Math.exp(-t*4.5);
      const cone=Math.sin(2*Math.PI*Math.max(34,f*.27)*(1-.28*progress)*t+hashRand(seed,7)*6.28)*Math.exp(-t*18);
      x=shock*1.28 + pressure*.74 + cone*.24;
      break;
    }
    case 'gunbody': {
      const thud=lowRateNoise(seed+31,index,Math.max(20,Math.floor(c.sampleRate/1100)))*.08*Math.exp(-t*20);
      x=modalBank(t,Math.max(48,f*.72),seed+19,6.8,.72)*1.25 + thud;
      break;
    }
    case 'guncrack': {
      const e=Math.exp(-t*105);
      x=(coloredNoise(seed,index,'white')*.95 + coloredNoise(seed+17,index,'pink')*.48)*e;
      break;
    }
    case 'mechanical': {
      x=modalBank(t,Math.max(260,f*.72),seed+41,24,1.5)*1.05 + coloredNoise(seed+5,index,'pink')*.18*Math.exp(-t*38);
      break;
    }
    case 'shell': {
      const impact=coloredNoise(seed+83,index,'pink')*.22*Math.exp(-t*55);
      x=modalBank(t,Math.max(700,f*.72),seed+67,9.5,1.8)*.95 + impact;
      break;
    }
    case 'blasttail': {
      const air=lowRateNoise(seed,index,Math.max(28,Math.floor(c.sampleRate/700)))*Math.exp(-t*5.4);
      x=(air*.38 + modalBank(t,Math.max(36,f*.52),seed+5,5.4,.45)*.62)*Math.exp(-t*2.5);
      break;
    }
    case 'pelletblast': {
      const snap=lowRateNoise(seed,index,Math.max(8,Math.floor(c.sampleRate/2600)))*Math.exp(-t*34);
      const body=lowRateNoise(seed+9,index,Math.max(28,Math.floor(c.sampleRate/850)))*Math.exp(-t*10.5);
      x=snap*.58+body*.54;
      break;
    }
    case 'gun': { const e=Math.exp(-t*13); x=Math.sin(2*Math.PI*(f*(1-.35*progress))*t)*.75*e + white*Math.exp(-t*25)*.65; break; }
    case 'boom': { const e=Math.exp(-t*3.3); const p=lowRateNoise(seed+29,index,Math.max(24,Math.floor(c.sampleRate/900)))*Math.exp(-t*9.5); x=modalBank(t,Math.max(28,f*.72),seed+13,4.6,.45)*1.18 + p*.28; x*=e*.9+0.18; break; }
    case 'sub': x=Math.sin(2*Math.PI*f*t)*Math.exp(-t*2.4); break;
    case 'crack': x=coloredNoise(seed,index,'white')*Math.exp(-t*68)+modalBank(t,Math.max(350,f*.45),seed+2,28,1.7)*.38; break;
    case 'click': x=(coloredNoise(seed,index,'pink')*.52+modalBank(t,Math.max(600,f*.68),seed+2,42,1.8)*.72)*Math.exp(-t*18); break;
    case 'metal': x=modalBank(t,Math.max(120,f),seed+17,5.3,1.65)*1.32 + coloredNoise(seed+5,index,'pink')*.15*Math.exp(-t*22); break;
    case 'metalhum': x=.7*Math.sin(2*Math.PI*f*t)+.23*Math.sin(2*Math.PI*f*2.04*t)+.12*Math.sin(2*Math.PI*f*3.9*t); break;
    case 'hum': x=.78*Math.sin(2*Math.PI*f*t)+.2*Math.sin(2*Math.PI*f*2*t)+.08*Math.sin(2*Math.PI*f*3*t); break;
    case 'ring': x=modalBank(t,Math.max(180,f),seed+27,2.4,1.8)*1.15; break;
    case 'laser': { const ff=f*(1.8-1.45*progress); x=Math.sin(2*Math.PI*ff*t)*Math.exp(-t*4.8); break; }
    case 'charge': { const ff=f*(.55+2.2*progress*progress); x=Math.sin(2*Math.PI*ff*t)*(smoothstep(0,.18,progress))*(1-.25*progress); break; }
    case 'zap': x=(Math.sin(2*Math.PI*f*t)*.55+white*.65)*Math.exp(-t*8)*(0.5+0.5*Math.sin(2*Math.PI*53*t)); break;
    case 'fire': x=coloredNoise(seed,index,'pink')*(.52+.34*Math.sin(2*Math.PI*(6.2+2.1*Math.sin(t*1.7))*t)+.14*Math.sin(2*Math.PI*.83*t)); break;
    case 'hiss': x=coloredNoise(seed,index,'pink')*(.78+.22*Math.sin(2*Math.PI*4.3*t)); break;
    case 'fizz': x=white*(pulse(34,.18)*.6+.25); break;
    case 'crackle': { const gate=hashRand(seed,Math.floor(t*24))>.78 ? Math.exp(-((t*24)%1)*18) : 0; x=white*gate; break; }
    case 'ticks': { const r=layer.rate||10; const cell=Math.floor(t*r); const gate=hashRand(seed,cell)>.3?Math.exp(-((t*r)%1)*45):0; x=(white+.35*Math.sin(2*Math.PI*2200*t))*gate; break; }
    case 'whoosh': x=coloredNoise(seed,index,'pink')*Math.sin(Math.PI*progress)*(.48+.52*progress); break;
    case 'wind': x=coloredNoise(seed,index,'dark')*(.58+.24*Math.sin(2*Math.PI*.18*t)+.18*Math.sin(2*Math.PI*.47*t+1.2)); break;
    case 'air': x=coloredNoise(seed,index,'dark')*.46 + modalBank(t,Math.max(35,f*.35),seed+9,.65,.3)*.035; break;
    case 'splash': x=lowRateNoise(seed,index,Math.max(16,Math.floor(c.sampleRate/1500)))*Math.exp(-t*5.2)*.72+.28*Math.sin(2*Math.PI*(180+120*Math.sin(t*8))*t)*Math.exp(-t*5); break;
    case 'bubble': x=Math.sin(2*Math.PI*(f*(1+1.6*Math.exp(-t*8)))*t)*Math.exp(-t*6); break;
    case 'bubbles': { const r=layer.rate||2; const cell=Math.floor(t*r); const u=(t*r)%1; x=hashRand(seed,cell)>.35?Math.sin(2*Math.PI*(70+hashRand(seed+8,cell)*110)*t)*Math.exp(-u*9):0; break; }
    case 'pop': x=(Math.sin(2*Math.PI*f*t)+lowRateNoise(seed,index,Math.max(10,Math.floor(c.sampleRate/2000)))*.18)*Math.exp(-t*22); break;
    case 'squish': x=(Math.sin(2*Math.PI*(f*(1-.55*progress))*t)*.68+lowRateNoise(seed,index,Math.max(30,Math.floor(c.sampleRate/800)))*.28)*Math.sin(Math.PI*clamp(progress*1.7,0,1))*Math.exp(-t*2.8); break;
    case 'droplet': x=Math.sin(2*Math.PI*(f*(1+1.2*Math.exp(-t*18)))*t)*Math.exp(-t*9); break;
    case 'droplets': { const r=layer.rate||2; const cell=Math.floor(t*r); const u=(t*r)%1; x=hashRand(seed,cell)>.42?Math.sin(2*Math.PI*(400+hashRand(seed+5,cell)*700)*t)*Math.exp(-u*28):0; break; }
    case 'growl': x=(Math.sin(2*Math.PI*f*t)+.45*Math.sin(2*Math.PI*f*.5*t)+lowRateNoise(seed,index,Math.max(36,Math.floor(c.sampleRate/650)))*.12)*(0.6+0.4*Math.sin(2*Math.PI*9*t)); break;
    case 'heartbeat': x=(Math.sin(2*Math.PI*f*t)*Math.exp(-((t*1.45)%1)*12)) + .55*Math.sin(2*Math.PI*f*.82*t)*Math.exp(-(((t*1.45+.22)%1))*14); break;
    case 'psi': x=(Math.sin(2*Math.PI*(f*(1+.28*Math.sin(t*5)))*t)+.32*Math.sin(2*Math.PI*f*1.61*t))*Math.exp(-t*1.8); break;
    case 'reverse': x=Math.sin(2*Math.PI*f*t)*progress*progress; break;
    case 'debris': {
      const r=8, cell=Math.floor(t*r), u=(t*r)%1;
      if(hashRand(seed,cell)>.76){
        const ff=180+hashRand(seed+13,cell)*1450;
        x=(modalBank(u,ff,seed+cell*31,32,1.3)*.72 + lowRateNoise(seed+73,index,12)*.12)*Math.exp(-u*28);
      } else x=0;
      break;
    }
    case 'wood': x=(coloredNoise(seed,index,'dark')*.52*Math.exp(-t*15)+modalBank(t,Math.max(75,f*.75),seed+7,8.7,.62)*.78); break;
    case 'glass': { x=modalBank(t,Math.max(950,f),seed+37,4.1,2.4)*1.34 + coloredNoise(seed+19,index,'white')*.18*Math.exp(-t*38); break; }
    case 'ricochet': { const ff=f*(1-0.5*progress); x=(Math.sin(2*Math.PI*ff*t)+.32*Math.sin(2*Math.PI*ff*1.8*t))*Math.exp(-t*4); break; }
    case 'flesh': x=(lowRateNoise(seed,index,Math.max(24,Math.floor(c.sampleRate/900)))*.5 + modalBank(t,Math.max(45,f*.55),seed+17,13,.38)*.55)*Math.exp(-t*9.8); break;
    case 'noisehit': x=lowRateNoise(seed,index,Math.max(10,Math.floor(c.sampleRate/2200)))*Math.exp(-t*30); break;
    case 'blastnoise': x=(coloredNoise(seed,index,'dark')*.62+coloredNoise(seed+2,index,'pink')*.18)*Math.exp(-t*7.5); break;
    case 'pressureblast': {
      // Low-rate turbulent pressure with a short modal component: punch without continuous hiss.
      const step=Math.max(18,Math.floor(c.sampleRate/1500));
      const air=lowRateNoise(seed,index,step)*Math.exp(-t*6.4);
      const chest=modalBank(t,Math.max(30,f*.58),seed+91,5.8,.34)*Math.exp(-t*2.7);
      const snap=lowRateNoise(seed+37,index,Math.max(8,Math.floor(step*.45)))*Math.exp(-t*28);
      x=air*.72+chest*.58+snap*.18;
      break;
    }
    case 'airpush': {
      const step=Math.max(48,Math.floor(c.sampleRate/420));
      const flow=lowRateNoise(seed,index,step);
      x=flow*Math.sin(Math.PI*progress)*.46 + modalBank(t,Math.max(42,f*.5),seed+15,3.2,.35)*.16;
      break;
    }
    case 'psiimpact': {
      const sweep=Math.max(70,f)*(1.35-.52*progress);
      const core=Math.sin(2*Math.PI*sweep*t+hashRand(seed,4)*6.28)*Math.exp(-t*7.2);
      x=core*.55 + modalBank(t,Math.max(95,f),seed+61,7.8,1.15)*.9 + Math.sin(2*Math.PI*Math.max(38,f*.28)*t)*Math.exp(-t*9)*.28;
      break;
    }
    case 'psiwave': {
      const ff=Math.max(120,f)*(1+.22*Math.sin(2*Math.PI*.9*t));
      x=(Math.sin(2*Math.PI*ff*t)+.28*Math.sin(2*Math.PI*ff*1.57*t+1.2))*Math.sin(Math.PI*progress)*Math.exp(-t*1.55);
      break;
    }
    case 'pressurefront': {
      const step=Math.max(36,Math.floor(c.sampleRate/520));
      const p=lowRateNoise(seed,index,step)*Math.exp(-t*9.5);
      const chest=modalBank(t,Math.max(26,f*.58),seed+101,6.6,.28)*Math.exp(-t*2.8);
      x=p*.34+chest*.82;
      break;
    }
    case 'grenadedet': {
      const snap=lowRateNoise(seed,index,Math.max(7,Math.floor(c.sampleRate/3200)))*Math.exp(-t*58);
      const body=modalBank(t,Math.max(62,f),seed+121,8.5,.7)*Math.exp(-t*2.2);
      x=snap*.62+body*.92;
      break;
    }
    case 'fragburst': {
      const rate=19, cell=Math.floor(t*rate), u=(t*rate)%1;
      if(hashRand(seed,cell)>.56){
        const ff=620+hashRand(seed+7,cell)*2600;
        x=modalBank(u,ff,seed+cell*37,34,1.9)*Math.exp(-u*34)*.68;
      } else x=0;
      break;
    }
    case 'fuelblast': {
      const swell=smoothstep(0,.035,progress)*(1-smoothstep(.72,1,progress));
      const core=modalBank(t,Math.max(30,f),seed+141,2.7,.28)*.92;
      const pulse=lowRateNoise(seed+17,index,Math.max(76,Math.floor(c.sampleRate/260)))*.28;
      x=(core+pulse)*swell;
      break;
    }
    case 'combustiontail': {
      const step=Math.max(52,Math.floor(c.sampleRate/360));
      const flow=lowRateNoise(seed,index,step);
      const flutter=.72+.28*Math.sin(2*Math.PI*(3.2+.4*Math.sin(t*.8))*t);
      x=flow*flutter*Math.exp(-t*2.3)*.52;
      break;
    }
    case 'dustthump': {
      const p=lowRateNoise(seed,index,Math.max(82,Math.floor(c.sampleRate/240)))*Math.exp(-t*5.2);
      x=p*.48 + modalBank(t,Math.max(30,f),seed+161,4.7,.22)*.92;
      break;
    }
    case 'pipedet': {
      const snap=lowRateNoise(seed,index,Math.max(6,Math.floor(c.sampleRate/3600)))*Math.exp(-t*70);
      x=snap*.48 + modalBank(t,Math.max(86,f),seed+181,10.8,1.05)*1.0;
      break;
    }
    case 'metalrupture': {
      x=modalBank(t,Math.max(260,f),seed+191,6.4,1.8)*1.05;
      break;
    }
    case 'electrodet': {
      const ff=Math.max(180,f)*(1.8-1.05*progress);
      const tonal=Math.sin(2*Math.PI*ff*t)+.32*Math.sin(2*Math.PI*ff*2.17*t+.8);
      const snap=lowRateNoise(seed,index,Math.max(8,Math.floor(c.sampleRate/2800)))*Math.exp(-t*48);
      x=tonal*Math.exp(-t*6.8)*.72 + snap*.28;
      break;
    }
    case 'reactordet': {
      const ff=Math.max(24,f)*(1.18-.32*progress);
      const core=Math.sin(2*Math.PI*ff*t)*Math.exp(-t*.9);
      x=core*.52 + modalBank(t,Math.max(30,f),seed+211,1.7,.25)*1.08 + Math.sin(2*Math.PI*ff*.5*t+1.1)*Math.exp(-t*1.4)*.28;
      break;
    }
    case 'smalldet': {
      const snap=lowRateNoise(seed,index,Math.max(5,Math.floor(c.sampleRate/4200)))*Math.exp(-t*86);
      x=snap*.48 + modalBank(t,Math.max(95,f),seed+231,18,1.05)*.78;
      break;
    }
    case 'heavydet': {
      const low=modalBank(t,Math.max(24,f),seed+251,2.6,.2)*1.18;
      const chest=Math.sin(2*Math.PI*Math.max(22,f*.72)*t+1.3)*Math.exp(-t*2.2)*.34;
      x=low+chest;
      break;
    }
    case 'shockfront': {
      const env=Math.sin(Math.PI*clamp(progress*1.08,0,1));
      const wave=lowRateNoise(seed,index,Math.max(110,Math.floor(c.sampleRate/190)))*.28;
      const low=Math.sin(2*Math.PI*Math.max(24,f*.75)*(1-.18*progress)*t)*.72;
      x=(low+wave)*env*Math.exp(-t*1.45);
      break;
    }
    case 'engine': { const wob=.992+.012*Math.sin(2*Math.PI*.63*t)+.006*Math.sin(2*Math.PI*2.1*t); const rough=.055*Math.sin(2*Math.PI*f*5.13*wob*t+1.7)+.035*Math.sin(2*Math.PI*f*7.07*wob*t+.4); x=.48*Math.sin(2*Math.PI*f*wob*t)+.24*Math.sin(2*Math.PI*f*2.01*wob*t)+.13*Math.sin(2*Math.PI*f*3.07*wob*t)+rough; break; }
    case 'servo': { const ff=f*(1+.4*Math.sin(progress*Math.PI)); x=Math.sin(2*Math.PI*ff*t)*.75 + .25*Math.sin(2*Math.PI*ff*2.8*t); break; }
    case 'creak': { const ff=f*(.65+.5*Math.sin(progress*Math.PI)); x=modalBank(t,Math.max(60,ff),seed+7,2.8,.7)*(.52+.48*Math.sin(2*Math.PI*6.3*t)) + lowRateNoise(seed,index,Math.max(48,Math.floor(c.sampleRate/420)))*.08; break; }
    case 'buzz': x=osc('square',2*Math.PI*f*t)*.45 + Math.sin(2*Math.PI*f*.5*t)*.35; break;
    case 'pulse': x=pulse(layer.freq||2,.35)*.8-.15; break;
    case 'digital': x=(osc('square',2*Math.PI*f*t)*.55+osc('tri',2*Math.PI*f*1.5*t)*.4)*(pulse(14,.52)); break;
    case 'beep': x=Math.sin(2*Math.PI*f*t)*(pulse(4,.6)); break;
    case 'radio': x=(Math.sin(2*Math.PI*f*t)*.55+white*.35)*pulse(18,.47); break;
    case 'chime': x=(Math.sin(2*Math.PI*f*t)+.55*Math.sin(2*Math.PI*f*1.5*t)+.24*Math.sin(2*Math.PI*f*2.01*t))*Math.exp(-t*2.2); break;
    case 'whisper': x=white*(.35+.65*Math.abs(Math.sin(2*Math.PI*(.35+.1*Math.sin(t))*t))); break;
    case 'chirps': { const r=layer.rate||2; const cell=Math.floor(t*r); const u=(t*r)%1; const ff=1400+hashRand(seed,cell)*1800; x=hashRand(seed+1,cell)>.45?Math.sin(2*Math.PI*ff*t)*Math.exp(-u*18):0; break; }
    case 'glitches': { const r=layer.rate||1; const cell=Math.floor(t*r); const u=(t*r)%1; const ff=250+hashRand(seed,cell)*1200; x=hashRand(seed+4,cell)>.62?osc('square',2*Math.PI*ff*t)*Math.exp(-u*9):0; break; }
    case 'rumble': x=(modalBank(t,Math.max(24,f),seed+21,.65,.32)*.78+lowRateNoise(seed+8,index,Math.max(64,Math.floor(c.sampleRate/320)))*.12)*(.72+.28*Math.sin(2*Math.PI*.4*t)); break;
    case 'echo': x=Math.sin(2*Math.PI*350*t)*Math.exp(-t*1.5)*.4; break;
    default: x=Math.sin(2*Math.PI*f*t)*Math.exp(-t*3); break;
  }
  return x*layer.gain;
}

function onePoleLP(input, cutoff, sr){ const out=new Float32Array(input.length); const a=Math.exp(-2*Math.PI*clamp(cutoff,20,sr*.45)/sr); let y=0; for(let i=0;i<input.length;i++){y=(1-a)*input[i]+a*y; out[i]=y;} return out; }
function onePoleHP(input, cutoff, sr){ if(cutoff<=5) return input; const out=new Float32Array(input.length); const rc=1/(2*Math.PI*cutoff), dt=1/sr, a=rc/(rc+dt); let y=0,prev=0; for(let i=0;i<input.length;i++){ y=a*(y+input[i]-prev); prev=input[i]; out[i]=y;} return out; }
function softClip(x,amt){ if(amt<=0) return x; const k=1+amt*18; return Math.tanh(x*k)/Math.tanh(k); }
function applyBitcrush(buf,amt){ if(amt<=.001) return; const hold=1+Math.floor(amt*28); const levels=Math.max(8,Math.floor(32768*(1-amt*.96))); let v=0; for(let i=0;i<buf.length;i++){ if(i%hold===0) v=Math.round(buf[i]*levels)/levels; buf[i]=v; } }
function addSpace(Lb,Rb,amount,sr,seed,category=''){
  if(amount<=.001)return;
  const directHeavy=(category==='Weapons'||category==='Impact'||category==='Explosion');
  const taps=directHeavy?[.006,.011,.019,.033,.061,.103,.167]:[.013,.027,.049,.083,.127,.191,.277];
  const base=directHeavy?[.18,.15,.12,.09,.065,.045,.028]:[.20,.17,.14,.11,.085,.06,.04];
  const srcL=Lb.slice(), srcR=Rb.slice();
  for(let t=0;t<taps.length;t++){
    const jitter=(hashRand(seed,700+t)-.5)*.003;
    const d=Math.max(1,Math.floor((taps[t]+jitter)*sr));
    const gl=base[t]*amount;
    const pan=(hashRand(seed,760+t)-.5)*.72;
    for(let i=d;i<Lb.length;i++){
      Lb[i]+=srcL[i-d]*gl*(1-pan*.65)+srcR[i-d]*gl*.10;
      Rb[i]+=srcR[i-d]*gl*(1+pan*.65)+srcL[i-d]*gl*.10;
    }
  }
}

function synthesize(){
  const c=getControls(), pr=P[c.preset], style=STYLE[c.stylePack];
  const sr=c.sampleRate, N=Math.max(16,Math.floor(c.duration*sr));
  let Lb=new Float32Array(N), Rb=new Float32Array(N);
  const rnd=mulberry32(c.seed>>>0);
  for(let li=0;li<pr.layers.length;li++){
    const layer=pr.layers[li], panBase=(hashRand(c.seed,li)-.5)*c.stereo;
    for(let i=0;i<N;i++){
      const t=i/sr;
      let v=layerSample(layer,t,c.duration,rnd,c,c.seed+li*911,i);
      const env=expEnv(t,c.attack,c.release,c.duration);
      const trans=1+c.transient*Math.exp(-t*22)*.45;
      const body=1+(c.body-.75)*.35*(1-progressSafe(t,c.duration));
      v*=env*trans*body*c.intensity;
      // Do NOT inject broadband white noise into every layer. Dedicated noise layers
      // (fire/wind/hiss/crackle/etc.) carry their own noise and are scaled explicitly.
      v *= noiseLayerScale(layer.type,c,style);
      v *= (1 + c.texture*.035*Math.sin(2*Math.PI*(13.7+li*5.9)*t + hashRand(c.seed,900+li)*6.28));
      const pan=clamp(panBase + .18*c.stereo*Math.sin(2*Math.PI*(.13+li*.07)*t),-1,1);
      Lb[i]+=v*(pan<=0?1:1-pan);
      Rb[i]+=v*(pan>=0?1:1+pan);
    }
  }
  Lb=onePoleHP(onePoleLP(Lb,c.lowpass*style.lowpass,sr),c.highpass,sr);
  Rb=onePoleHP(onePoleLP(Rb,c.lowpass*style.lowpass,sr),c.highpass,sr);
  const dist=clamp(c.distortion*style.distortion,0,1);
  for(let i=0;i<N;i++){ Lb[i]=softClip(Lb[i],dist); Rb[i]=softClip(Rb[i],dist); }
  // Bit-crush is now opt-in only. Style packs no longer force digital grain onto clean sounds.
  applyBitcrush(Lb,clamp(c.bitcrush,0,.95)); applyBitcrush(Rb,clamp(c.bitcrush,0,.95));
  addSpace(Lb,Rb,clamp(c.space*style.space,0,1),sr,c.seed,pr.category);
  // Transparent safety stage: only catches inter-layer spikes; does not deliberately squash transients.
  let peak=0; for(let i=0;i<N;i++) peak=Math.max(peak,Math.abs(Lb[i]),Math.abs(Rb[i]));
  if(peak>1.05){ const g=.99/peak; for(let i=0;i<N;i++){Lb[i]*=g;Rb[i]*=g;} peak=.99; }
  // Tiny fade prevents digital edge clicks when exporting one-shots/loops.
  const fade=Math.min(Math.floor(sr*.003),Math.floor(N*.08));
  for(let i=0;i<fade;i++){ const a=i/Math.max(1,fade); Lb[i]*=a; Rb[i]*=a; }
  if(!['Ambience','Fire','Machinery'].includes(pr.category)){
    for(let i=0;i<fade;i++){ const j=N-1-i, a=i/Math.max(1,fade); Lb[j]*=a; Rb[j]*=a; }
  }
  peak=0; for(let i=0;i<N;i++) peak=Math.max(peak,Math.abs(Lb[i]),Math.abs(Rb[i]));
  return {left:Lb,right:Rb,sampleRate:sr,duration:c.duration,peak,controls:c,preset:pr};
}
function progressSafe(t,d){return d<=0?0:clamp(t/d,0,1)}

let rendered=null, audioCtx=null, source=null, sourceGain=null, playStarted=0, raf=0;
function ensureRendered(){ rendered=synthesize(); drawWaveform(rendered); $('timeline').max=rendered.duration; $('peakInfo').textContent=`Peak ${rendered.peak.toFixed(2)}`; return rendered; }
function drawWaveform(r){
  const W=wave.width,H=wave.height; wctx.clearRect(0,0,W,H);
  const g=wctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#101a26'); g.addColorStop(1,'#080d13'); wctx.fillStyle=g; wctx.fillRect(0,0,W,H);
  wctx.strokeStyle='rgba(130,160,190,.16)'; wctx.lineWidth=1;
  for(let i=1;i<8;i++){ const y=i*H/8; wctx.beginPath();wctx.moveTo(0,y);wctx.lineTo(W,y);wctx.stroke(); }
  for(let i=1;i<12;i++){ const x=i*W/12; wctx.beginPath();wctx.moveTo(x,0);wctx.lineTo(x,H);wctx.stroke(); }
  drawChannel(r.left,H*.28,'#63e6be'); drawChannel(r.right,H*.72,'#74c0fc');
  wctx.fillStyle='#93a4b8'; wctx.font='13px system-ui'; wctx.fillText('L',12,H*.28-8); wctx.fillText('R',12,H*.72-8);
  function drawChannel(buf,mid,color){ wctx.strokeStyle=color; wctx.lineWidth=1.5; wctx.beginPath(); const step=Math.max(1,Math.floor(buf.length/W)); for(let x=0;x<W;x++){ let min=1,max=-1; const s=x*step,e=Math.min(buf.length,s+step); for(let i=s;i<e;i++){const v=buf[i];if(v<min)min=v;if(v>max)max=v;} const y1=mid-min*H*.18,y2=mid-max*H*.18; wctx.moveTo(x,y1);wctx.lineTo(x,y2);} wctx.stroke(); }
}
function drawPlayhead(t){ if(!rendered)return; drawWaveform(rendered); const x=clamp(t/rendered.duration,0,1)*wave.width; wctx.strokeStyle='#ffd43b';wctx.lineWidth=2;wctx.beginPath();wctx.moveTo(x,0);wctx.lineTo(x,wave.height);wctx.stroke(); }

function finishPlayback(reset=true){
  cancelAnimationFrame(raf); raf=0;
  if(source){ try{source.onended=null; source.disconnect();}catch{} source=null; }
  if(sourceGain){ try{sourceGain.disconnect();}catch{} sourceGain=null; }
  $('meterFill').style.width='0%';
  $('status').textContent='Ready';
  if(reset){ $('timeline').value=0; $('time').textContent='0.00s'; if(rendered) drawPlayhead(0); }
}
async function play(from=0){
  stop(false);
  const r=ensureRendered();
  audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
  if(audioCtx.state==='suspended') await audioCtx.resume();
  const b=audioCtx.createBuffer(2,r.left.length,r.sampleRate); b.copyToChannel(r.left,0); b.copyToChannel(r.right,1);
  const s=audioCtx.createBufferSource();
  source=s; s.buffer=b; s.loop=$('loopPreview').checked;
  sourceGain=audioCtx.createGain(); sourceGain.gain.value=.9; s.connect(sourceGain).connect(audioCtx.destination);
  const offset=clamp(from,0,Math.max(0,r.duration-.001));
  playStarted=audioCtx.currentTime-offset;
  s.onended=()=>{ if(source===s && !s.loop) finishPlayback(true); };
  s.start(0,offset);
  $('status').textContent=s.loop?'Looping':'Playing';
  cancelAnimationFrame(raf); tick();
}
function tick(){
  if(!source||!audioCtx||!rendered) return;
  let t=audioCtx.currentTime-playStarted;
  if(source.loop) t=t%rendered.duration;
  else if(t>=rendered.duration){ finishPlayback(true); return; }
  $('time').textContent=`${t.toFixed(2)}s`; $('timeline').value=t; drawPlayhead(t);
  const idx=Math.min(rendered.left.length-1,Math.max(0,Math.floor(t*rendered.sampleRate)));
  const m=Math.max(Math.abs(rendered.left[idx]||0),Math.abs(rendered.right[idx]||0));
  $('meterFill').style.width=`${Math.min(100,m*125)}%`;
  raf=requestAnimationFrame(tick);
}
function stop(reset=true){
  cancelAnimationFrame(raf); raf=0;
  if(source){ const s=source; source=null; try{s.onended=null;s.stop();s.disconnect();}catch{} }
  if(sourceGain){ try{sourceGain.disconnect();}catch{} sourceGain=null; }
  $('meterFill').style.width='0%';
  if(reset){ $('status').textContent='Ready';$('timeline').value=0;$('time').textContent='0.00s';if(rendered)drawPlayhead(0); }
}

function encodeWav(r,channels=2){
  const mono=channels===1, frames=r.left.length, block=channels*2, ab=new ArrayBuffer(44+frames*block), v=new DataView(ab);
  const ws=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))}; ws(0,'RIFF'); v.setUint32(4,36+frames*block,true); ws(8,'WAVE'); ws(12,'fmt '); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,channels,true); v.setUint32(24,r.sampleRate,true); v.setUint32(28,r.sampleRate*block,true); v.setUint16(32,block,true); v.setUint16(34,16,true); ws(36,'data'); v.setUint32(40,frames*block,true);
  let o=44; const put=x=>{x=clamp(x,-1,1);v.setInt16(o,x<0?x*32768:x*32767,true);o+=2};
  for(let i=0;i<frames;i++){ if(mono) put((r.left[i]+r.right[i])*.5); else {put(r.left[i]);put(r.right[i]);} }
  return new Blob([ab],{type:'audio/wav'});
}
function downloadBlob(blob,name){ const a=document.createElement('a'); const u=URL.createObjectURL(blob); a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000); }
function exportWav(){ const r=ensureRendered(); const ch=+$('channels').value; downloadBlob(encodeWav(r,ch),`${$('preset').value}_${r.controls.seed}_${r.sampleRate}hz.wav`); $('status').textContent='WAV exported'; }

function syncLabels(){
 const defs=[['duration','s',2],['intensity','×',2],['pitch','×',2],['pitchVar','',2],['noise','',2],['transient','',2],['body','',2],['texture','',2],['attack','s',3],['release','s',2],['lowpass',' Hz',0],['highpass',' Hz',0],['distortion','',2],['bitcrush','',2],['space','',2],['stereo','',2]];
 for(const [id,sfx,d] of defs){ $(`${id}Val`).textContent=(+$(`${id}`).value).toFixed(d)+sfx; }
}
function populateCategories(){ $('category').innerHTML=Object.keys(CATEGORIES).map(x=>`<option>${x}</option>`).join(''); }
function populatePresets(cat){ $('preset').innerHTML=(CATEGORIES[cat]||[]).map(k=>`<option value="${k}">${P[k].name}</option>`).join(''); }
function setInfo(k){ const p=P[k]; $('presetInfo').innerHTML=`<b>${p.name}</b><br>${p.description}<br><br><b>Tags:</b> ${p.tags.join(', ')}`; $('layerInfo').innerHTML=p.layers.map((x,i)=>`${i+1}. <code class="badge">${x.type}</code> gain ${x.gain.toFixed(2)}${x.freq?` / ${x.freq}Hz`:''}`).join('<br>'); $('badge').textContent=`${p.name} / ${STYLE[$('stylePack').value].name}`; }
function loadPreset(k){ stop(); const p=P[k]; const c=p.config; $('category').value=p.category; if(!$('preset').querySelector(`option[value="${k}"]`)){populatePresets(p.category)} $('preset').value=k; for(const id of ['duration','intensity','pitch','pitchVar','noise','transient','body','texture','attack','release','lowpass','highpass','distortion','bitcrush','space','stereo']) if(c[id]!=null) $(id).value=c[id]; syncLabels(); setInfo(k); rendered=null; ensureRendered(); }
function randomize(){ const r=mulberry32((Date.now()^Math.floor(Math.random()*1e9))>>>0); $('seed').value=Math.floor(r()*9999999); const tweak=(id,amt,min,max)=>{$(id).value=clamp(+$(`${id}`).value*(1+(r()-.5)*amt),min,max)}; tweak('pitch',.36,.35,2.5); tweak('noise',.5,0,1.5); tweak('texture',.6,0,1.5); tweak('distortion',.7,0,1); tweak('space',.6,0,1); syncLabels(); rendered=null;ensureRendered(); }
function applyPrompt(){
 const q=$('prompt').value.toLowerCase(); const score={}; for(const [k,p] of Object.entries(P)){let s=0; for(const tag of p.tags){if(q.includes(tag.toLowerCase()))s+=4} if(q.includes(p.category.toLowerCase()))s+=3; if(q.includes(p.name.toLowerCase()))s+=8; score[k]=s;}
 const words=[['ปืน','pistol_rust'],['ไรเฟิล','rifle_burst'],['ลูกซอง','shotgun_scrap'],['ไฟ','campfire_loop'],['ไฟฟ้า','electric_arc'],['รังสี','radiation_hum'],['ไกเกอร์','geiger_alarm'],['พิษ','poison_hiss'],['กรด','acid_splash'],['เมือก','slime_squish'],['พลังจิต','psychic_pulse'],['ระเบิด','grenade_blast'],['โลหะ','metal_hit'],['เนื้อ','flesh_hit'],['ลม','ruined_city_wind'],['เครื่อง','generator_loop'],['ui','ui_click'],['ปุ่ม','ui_click']];
 for(const [w,k] of words) if(q.includes(w)) score[k]=(score[k]||0)+10;
 let best=Object.entries(score).sort((a,b)=>b[1]-a[1])[0]?.[0]||'pistol_rust'; if((score[best]||0)===0) best='pistol_rust';
 populatePresets(P[best].category); loadPreset(best);
 if(/เก่า|สกปรก|สนิม/.test(q)) $('stylePack').value='dirty'; if(/ทหาร|military|survival/.test(q)) $('stylePack').value='survival'; if(/กลายพันธุ์|ชีว|bio|mutant/.test(q)) $('stylePack').value='mutant'; if(/ไซไฟ|scifi|sci-fi|พลังงาน/.test(q)) $('stylePack').value='ruin';
 if(/ก้อง|echo|reverb/.test(q)) $('space').value=Math.max(.55,+$('space').value); if(/หนัก|ทุ้ม|ต่ำ/.test(q)) $('pitch').value=Math.max(.45,+$('pitch').value*.75); if(/แหลม|สูง/.test(q)) $('pitch').value=Math.min(2.2,+$('pitch').value*1.28); if(/แตก|พร่า|distort/.test(q)) $('distortion').value=Math.max(.35,+$('distortion').value); if(/ไกล/.test(q)){$('lowpass').value=5000;$('space').value=.65}
 syncLabels();setInfo(best);rendered=null;ensureRendered(); $('status').textContent=`Prompt → ${P[best].name}`;
}
function saveProject(){ const c=getControls(); const data={app:'Post-Apocalypse SFX Builder',version:1.5,category:$('category').value,preset:$('preset').value,stylePack:$('stylePack').value,controls:c,loopPreview:$('loopPreview').checked,prompt:$('prompt').value}; downloadBlob(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),`sfx_project_${c.preset}.json`); }
function loadProjectObject(d){ const k=P[d.preset]?d.preset:'pistol_rust'; populatePresets(P[k].category); loadPreset(k); if(d.stylePack&&STYLE[d.stylePack])$('stylePack').value=d.stylePack; if(d.controls){ for(const id of ['seed','duration','intensity','pitch','pitchVar','noise','transient','body','texture','attack','release','lowpass','highpass','distortion','bitcrush','space','stereo','sampleRate','channels']) if(d.controls[id]!=null&&$(id))$(id).value=d.controls[id]; } $('loopPreview').checked=!!d.loopPreview; if(d.prompt)$('prompt').value=d.prompt; syncLabels();setInfo(k);rendered=null;ensureRendered(); }
function bind(){
 $('category').onchange=()=>{stop();populatePresets($('category').value);loadPreset($('preset').value)}; $('preset').onchange=()=>loadPreset($('preset').value); $('stylePack').onchange=()=>{stop();setInfo($('preset').value);rendered=null;ensureRendered()};
 const live=['duration','intensity','pitch','pitchVar','noise','transient','body','texture','attack','release','lowpass','highpass','distortion','bitcrush','space','stereo','seed','sampleRate']; for(const id of live) $(id).addEventListener('input',()=>{syncLabels();rendered=null;clearTimeout(window.__renderTimer);window.__renderTimer=setTimeout(ensureRendered,60)});
 $('playBtn').onclick=()=>play(+$('timeline').value||0); $('stopBtn').onclick=()=>stop(); $('randomizeBtn').onclick=randomize; $('exportWavBtn').onclick=exportWav; $('applyIntentBtn').onclick=applyPrompt; $('saveProjectBtn').onclick=saveProject; $('loadProjectBtn').onclick=()=>$('projectFile').click();
 $('projectFile').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const fr=new FileReader();fr.onload=ev=>{try{loadProjectObject(JSON.parse(ev.target.result))}catch(err){alert('โหลด Project JSON ไม่สำเร็จ')}};fr.readAsText(f);e.target.value='';});
 $('timeline').addEventListener('input',()=>{const t=+$('timeline').value;drawPlayhead(t);$('time').textContent=`${t.toFixed(2)}s`;});
}
function init(){ populateCategories(); $('category').value='Weapons'; populatePresets('Weapons'); bind(); loadPreset('pistol_rust'); }
init();
