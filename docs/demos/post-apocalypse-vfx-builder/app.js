const $ = (id)=>document.getElementById(id);
const stage = $('stage');
const ctx = stage.getContext('2d');

const CATEGORIES = {
  Fire: ['small_fire','oil_fire','burning_barrel'],
  Water: ['dirty_water','pipe_leak'],
  Electricity: ['electric_arc','emp_burst'],
  Frost: ['frost_burst'],
  Radiation: ['radiation_mist','reactor_leak'],
  Poison: ['poison_cloud'],
  Acid: ['acid_splash'],
  Slime: ['slime_drip','mutant_goo'],
  Psychic: ['psychic_pulse'],
  Impact: ['bullet_flesh','bullet_metal','bullet_concrete'],
  Blood: ['blood_spray','bleeding_trail'],
  Explosion: ['dust_explosion'],
  Smoke: ['smoke_plume']
};

const PRESETS = {
  small_fire: {
    name:'Small Fire', category:'Fire', description:'เปลวไฟพื้นฐาน มีแกนร้อนและควันบาง', tags:['fire','ambient','camp','barrel'],
    palette:['#ffb13b','#ff5a17','#5a2106'], style:'dirty',
    config:{count:110,life:1.6,speed:80,spread:42,gravity:-55,depth:120,perspective:760,size:28,glow:24,turbulence:10,trail:5,blend:'lighter',intensity:1,duration:1.8},
    layers:[
      {type:'fire',countMul:1,sizeMul:1.0,speedMul:1.0,lifeMul:1.0,upBias:1,emission:'cone'},
      {type:'smoke',countMul:.4,sizeMul:1.6,speedMul:.55,lifeMul:1.8,upBias:1,emission:'cone'}
    ],
    rings:[]
  },
  oil_fire: {
    name:'Oil Fire', category:'Fire', description:'ไฟน้ำมันสีส้มเข้ม ควันดำเยอะ ใช้กับพื้นหรือคราบเชื้อเพลิง', tags:['fire','oil','burn','hazard'],
    palette:['#ff9b1a','#ff5f16','#201810'], style:'dirty',
    config:{count:160,life:2.2,speed:72,spread:62,gravity:-38,depth:180,perspective:800,size:34,glow:26,turbulence:16,trail:7,blend:'screen',intensity:1.1,duration:2.2},
    layers:[
      {type:'fire',countMul:.95,sizeMul:1.2,speedMul:1,lifeMul:1.0,upBias:1,emission:'pool'},
      {type:'smoke',countMul:.9,sizeMul:1.9,speedMul:.45,lifeMul:2.1,upBias:1,emission:'pool'},
      {type:'ember',countMul:.15,sizeMul:.45,speedMul:1.2,lifeMul:.7,upBias:1,emission:'pool'}
    ],
    rings:[]
  },
  burning_barrel: {
    name:'Burning Barrel', category:'Fire', description:'เปลวไฟและควันแบบถังเผา ใช้กับฉากหลังหรือจุดพักพิง', tags:['barrel','ambient','fire'],
    palette:['#ffbd4b','#ff6e1c','#2c1208'], style:'survival',
    config:{count:130,life:1.9,speed:78,spread:38,gravity:-50,depth:90,perspective:740,size:26,glow:20,turbulence:10,trail:6,blend:'lighter',intensity:1,duration:1.9},
    layers:[
      {type:'fire',countMul:.9,sizeMul:1.0,speedMul:1.0,lifeMul:1.0,upBias:1,emission:'cone'},
      {type:'smoke',countMul:.55,sizeMul:1.8,speedMul:.5,lifeMul:2.0,upBias:1,emission:'cone'}
    ], rings:[]
  },
  dirty_water: {
    name:'Dirty Water Splash', category:'Water', description:'น้ำสกปรกกระเซ็นสั้น ๆ มีหยดน้ำและละออง', tags:['water','splash','dirty'],
    palette:['#69b7d3','#356777','#bee8ef'], style:'dirty',
    config:{count:120,life:1.0,speed:180,spread:88,gravity:220,depth:180,perspective:760,size:18,glow:0,turbulence:5,trail:4,blend:'source-over',intensity:1,duration:1.1},
    layers:[
      {type:'droplet',countMul:.8,sizeMul:.55,speedMul:1.25,lifeMul:1.0,upBias:.4,emission:'burst'},
      {type:'mist',countMul:.6,sizeMul:1.2,speedMul:.6,lifeMul:.8,upBias:.3,emission:'burst'}
    ],
    puddle:{color:'#355b68',alpha:.25,rx:65,ry:20}
  },
  pipe_leak: {
    name:'Pipe Leak', category:'Water', description:'น้ำจากท่อรั่ว พุ่งต่อเนื่องและแตกเป็นละออง', tags:['water','pipe','leak'],
    palette:['#88d0ea','#3d6f84','#d7f4ff'], style:'industrial',
    config:{count:90,life:1.4,speed:140,spread:28,gravity:180,depth:140,perspective:760,size:14,glow:0,turbulence:6,trail:4,blend:'source-over',intensity:1,duration:1.6},
    layers:[
      {type:'stream',countMul:.5,sizeMul:.6,speedMul:1.0,lifeMul:1.2,upBias:.2,emission:'directional'},
      {type:'mist',countMul:.5,sizeMul:1.1,speedMul:.5,lifeMul:.8,upBias:.2,emission:'directional'}
    ]
  },
  electric_arc: {
    name:'Electric Arc', category:'Electricity', description:'อาร์กไฟฟ้าแตกแขนง มีประกายไฟกระโดด', tags:['electric','arc','machine'],
    palette:['#99e8ff','#4e86ff','#ffffff'], style:'ruin',
    config:{count:78,life:.85,speed:220,spread:60,gravity:50,depth:180,perspective:730,size:13,glow:22,turbulence:15,trail:3,blend:'lighter',intensity:1,duration:0.9},
    layers:[
      {type:'spark',countMul:.8,sizeMul:.6,speedMul:1.3,lifeMul:.6,upBias:.2,emission:'burst'},
      {type:'electric',countMul:.4,sizeMul:1.0,speedMul:.6,lifeMul:.9,upBias:.1,emission:'burst'}
    ],
    beam:{kind:'electric',segments:10,amplitude:24,from:[-110,-30],to:[120,25]}
  },
  emp_burst: {
    name:'EMP Burst', category:'Electricity', description:'คลื่น EMP แบบวงแหวนพลังงานและสะเก็ดไฟ', tags:['emp','pulse','energy'],
    palette:['#9ff3ff','#55abff','#dfffff'], style:'ruin',
    config:{count:95,life:1.0,speed:190,spread:360,gravity:0,depth:220,perspective:780,size:18,glow:26,turbulence:10,trail:4,blend:'screen',intensity:1,duration:1.0},
    layers:[
      {type:'spark',countMul:.45,sizeMul:.55,speedMul:1.15,lifeMul:.55,upBias:0,emission:'burst'},
      {type:'electric',countMul:.55,sizeMul:1.0,speedMul:.8,lifeMul:.9,upBias:0,emission:'burst'}
    ],
    rings:[{life:.8,maxR:190,color:'#9ff3ff',width:16},{life:1.0,maxR:260,color:'#55abff',width:7}]
  },
  frost_burst: {
    name:'Frost Burst', category:'Frost', description:'ไอเย็น เศษน้ำแข็ง และคลื่นเยือกแข็ง', tags:['ice','frost','cold'],
    palette:['#d8fbff','#89e1ff','#86b7ff'], style:'survival',
    config:{count:120,life:1.25,speed:145,spread:110,gravity:80,depth:200,perspective:770,size:18,glow:10,turbulence:8,trail:4,blend:'screen',intensity:1,duration:1.4},
    layers:[
      {type:'frost',countMul:.6,sizeMul:.8,speedMul:1.05,lifeMul:.8,upBias:.1,emission:'burst'},
      {type:'mist',countMul:.8,sizeMul:1.4,speedMul:.55,lifeMul:1.1,upBias:.1,emission:'burst'}
    ],
    rings:[{life:1.0,maxR:180,color:'#c7fbff',width:14}]
  },
  radiation_mist: {
    name:'Radiation Mist', category:'Radiation', description:'หมอกรังสีสีเขียว เรืองอันตราย และอนุภาค fallout', tags:['radiation','mist','hazard'],
    palette:['#90ff50','#4f7d22','#d9ff9d'], style:'mutant',
    config:{count:170,life:2.7,speed:38,spread:130,gravity:-10,depth:240,perspective:880,size:40,glow:10,turbulence:18,trail:6,blend:'screen',intensity:1,duration:2.8},
    layers:[
      {type:'mist',countMul:.9,sizeMul:1.7,speedMul:.45,lifeMul:1.35,upBias:1,emission:'pool'},
      {type:'rad',countMul:.5,sizeMul:.45,speedMul:.65,lifeMul:1.1,upBias:1,emission:'pool'}
    ],
    rings:[{life:2.2,maxR:120,color:'#93ff55',width:5}]
  },
  reactor_leak: {
    name:'Reactor Leak', category:'Radiation', description:'การรั่วไหลจากเครื่องปฏิกรณ์ มีหมอก เขม่าพลังงาน และ pulse แปลก ๆ', tags:['reactor','radiation','leak'],
    palette:['#9dff62','#4da827','#efffd1'], style:'ruin',
    config:{count:185,life:2.4,speed:50,spread:150,gravity:-5,depth:260,perspective:860,size:34,glow:16,turbulence:20,trail:7,blend:'screen',intensity:1.1,duration:2.5},
    layers:[
      {type:'mist',countMul:.8,sizeMul:1.6,speedMul:.5,lifeMul:1.3,upBias:1,emission:'pool'},
      {type:'electric',countMul:.15,sizeMul:.65,speedMul:.7,lifeMul:.7,upBias:.3,emission:'pool'},
      {type:'rad',countMul:.5,sizeMul:.4,speedMul:.75,lifeMul:1.0,upBias:1,emission:'pool'}
    ],
    rings:[{life:2.0,maxR:160,color:'#84ff48',width:8}]
  },
  poison_cloud: {
    name:'Poison Cloud', category:'Poison', description:'กลุ่มแก๊สพิษสีเขียวหม่น ลอยเอื่อยและกดดันพื้นที่', tags:['poison','cloud','aoe'],
    palette:['#8fcf45','#416b20','#d8f695'], style:'mutant',
    config:{count:160,life:2.6,speed:35,spread:120,gravity:-15,depth:180,perspective:900,size:44,glow:5,turbulence:14,trail:5,blend:'screen',intensity:1,duration:2.7},
    layers:[
      {type:'mist',countMul:.95,sizeMul:1.75,speedMul:.45,lifeMul:1.4,upBias:1,emission:'pool'},
      {type:'toxic',countMul:.45,sizeMul:.42,speedMul:.55,lifeMul:1.0,upBias:1,emission:'pool'}
    ],
    puddle:{color:'#547333',alpha:.18,rx:85,ry:26}
  },
  acid_splash: {
    name:'Acid Splash', category:'Acid', description:'น้ำกรดกระเด็นแรง มีหยดกัดกร่อนและควันพิษจาง', tags:['acid','splash','corrosive'],
    palette:['#cfff4e','#75a322','#f3ffb0'], style:'mutant',
    config:{count:130,life:1.1,speed:190,spread:90,gravity:200,depth:180,perspective:760,size:16,glow:7,turbulence:8,trail:4,blend:'screen',intensity:1,duration:1.2},
    layers:[
      {type:'acid',countMul:.75,sizeMul:.65,speedMul:1.25,lifeMul:.95,upBias:.3,emission:'burst'},
      {type:'mist',countMul:.4,sizeMul:1.2,speedMul:.45,lifeMul:.8,upBias:.4,emission:'burst'}
    ],
    puddle:{color:'#749922',alpha:.24,rx:72,ry:20}
  },
  slime_drip: {
    name:'Slime Drip', category:'Slime', description:'เมือกเหนียวไหลหยดลงมา เหมาะกับรังมิวแทนต์หรือผนังสกปรก', tags:['slime','drip','goo'],
    palette:['#72ff8f','#2d7937','#cffff0'], style:'mutant',
    config:{count:65,life:2.2,speed:65,spread:35,gravity:240,depth:120,perspective:840,size:20,glow:0,turbulence:4,trail:10,blend:'source-over',intensity:1,duration:2.3},
    layers:[
      {type:'goo',countMul:.8,sizeMul:1.1,speedMul:.7,lifeMul:1.25,upBias:-.1,emission:'drip'},
      {type:'droplet',countMul:.3,sizeMul:.45,speedMul:.9,lifeMul:.8,upBias:-.1,emission:'drip'}
    ],
    puddle:{color:'#3f8f4a',alpha:.28,rx:70,ry:18}
  },
  mutant_goo: {
    name:'Mutant Goo', category:'Slime', description:'เมือกชีวภาพกระเด็นแรง มีคราบและไอปนเปื้อน', tags:['goo','biohazard','mutant'],
    palette:['#8cff8b','#297340','#defedd'], style:'mutant',
    config:{count:100,life:1.45,speed:150,spread:95,gravity:160,depth:180,perspective:810,size:20,glow:0,turbulence:10,trail:10,blend:'source-over',intensity:1,duration:1.6},
    layers:[
      {type:'goo',countMul:.7,sizeMul:.85,speedMul:1.1,lifeMul:1.0,upBias:.2,emission:'burst'},
      {type:'mist',countMul:.35,sizeMul:1.2,speedMul:.45,lifeMul:.9,upBias:.4,emission:'burst'}
    ],
    puddle:{color:'#3b7c4b',alpha:.28,rx:78,ry:22}
  },
  psychic_pulse: {
    name:'Psychic Pulse', category:'Psychic', description:'คลื่นพลังจิต วงแหวน distortion และสะเก็ด psionic', tags:['psychic','psionic','pulse'],
    palette:['#ff8aff','#7a5dff','#ffd9ff'], style:'ruin',
    config:{count:110,life:1.2,speed:150,spread:360,gravity:-8,depth:250,perspective:760,size:22,glow:24,turbulence:14,trail:5,blend:'screen',intensity:1,duration:1.3},
    layers:[
      {type:'psychic',countMul:.7,sizeMul:1.0,speedMul:.8,lifeMul:1.0,upBias:0,emission:'burst'},
      {type:'spark',countMul:.2,sizeMul:.5,speedMul:1.15,lifeMul:.5,upBias:0,emission:'burst'}
    ],
    rings:[{life:.9,maxR:160,color:'#ff8aff',width:14},{life:1.1,maxR:250,color:'#7a5dff',width:8}],
    beam:{kind:'distortion',segments:0,amplitude:0}
  },
  bullet_flesh: {
    name:'Bullet Impact Flesh', category:'Impact', description:'กระสุนโดนเนื้อ มีเลือดกระเซ็นและหยดตก', tags:['impact','bullet','flesh','blood'],
    palette:['#ff5a66','#851f28','#ffb3bb'], style:'survival',
    config:{count:90,life:.85,speed:210,spread:70,gravity:210,depth:150,perspective:720,size:14,glow:0,turbulence:6,trail:8,blend:'source-over',intensity:1,duration:.9},
    layers:[
      {type:'blood',countMul:.8,sizeMul:.65,speedMul:1.15,lifeMul:.9,upBias:.2,emission:'forward'},
      {type:'mist',countMul:.15,sizeMul:.8,speedMul:.6,lifeMul:.45,upBias:.2,emission:'forward'}
    ],
    puddle:{color:'#6c0f19',alpha:.3,rx:55,ry:12}
  },
  bullet_metal: {
    name:'Bullet Impact Metal', category:'Impact', description:'กระสุนโดนเหล็ก มีสะเก็ดไฟและเศษฝุ่นเล็ก', tags:['impact','metal','spark'],
    palette:['#ffd79e','#ff8f33','#ffffff'], style:'industrial',
    config:{count:85,life:.75,speed:280,spread:68,gravity:140,depth:160,perspective:720,size:12,glow:12,turbulence:5,trail:4,blend:'lighter',intensity:1,duration:.8},
    layers:[
      {type:'spark',countMul:.8,sizeMul:.45,speedMul:1.35,lifeMul:.65,upBias:.1,emission:'forward'},
      {type:'dust',countMul:.5,sizeMul:.8,speedMul:.65,lifeMul:.7,upBias:.1,emission:'forward'}
    ]
  },
  bullet_concrete: {
    name:'Bullet Impact Concrete', category:'Impact', description:'กระสุนโดนปูน มีเศษฝุ่นและเศษปูนกระเด็น', tags:['impact','concrete','dust'],
    palette:['#d8d6d0','#8f8c84','#ffffff'], style:'survival',
    config:{count:95,life:.82,speed:225,spread:72,gravity:180,depth:160,perspective:720,size:12,glow:0,turbulence:5,trail:3,blend:'source-over',intensity:1,duration:.9},
    layers:[
      {type:'dust',countMul:.85,sizeMul:.95,speedMul:.95,lifeMul:.9,upBias:.1,emission:'forward'},
      {type:'spark',countMul:.12,sizeMul:.35,speedMul:1.25,lifeMul:.45,upBias:.1,emission:'forward'}
    ]
  },
  blood_spray: {
    name:'Blood Spray', category:'Blood', description:'เลือดกระเซ็นกระจาย ใช้กับ hit ใหญ่หรือ critical', tags:['blood','spray','combat'],
    palette:['#ff455d','#7a1220','#ffc3c8'], style:'survival',
    config:{count:125,life:1.05,speed:220,spread:100,gravity:240,depth:170,perspective:740,size:16,glow:0,turbulence:7,trail:10,blend:'source-over',intensity:1,duration:1.1},
    layers:[
      {type:'blood',countMul:.9,sizeMul:.65,speedMul:1.15,lifeMul:.95,upBias:.2,emission:'burst'},
      {type:'droplet',countMul:.25,sizeMul:.35,speedMul:1.2,lifeMul:.7,upBias:.1,emission:'burst'}
    ],
    puddle:{color:'#6c0d18',alpha:.34,rx:72,ry:14}
  },
  bleeding_trail: {
    name:'Bleeding Trail', category:'Blood', description:'เลือดหยดและมี trail ต่อเนื่อง ใช้กับสถานะ bleed', tags:['blood','trail','bleed'],
    palette:['#db3049','#73101d','#ffc1c9'], style:'survival',
    config:{count:60,life:1.8,speed:48,spread:20,gravity:260,depth:100,perspective:830,size:14,glow:0,turbulence:2,trail:14,blend:'source-over',intensity:1,duration:1.8},
    layers:[
      {type:'blood',countMul:.65,sizeMul:.55,speedMul:.55,lifeMul:1.2,upBias:-.2,emission:'drip'},
      {type:'droplet',countMul:.18,sizeMul:.3,speedMul:.6,lifeMul:.75,upBias:-.2,emission:'drip'}
    ],
    puddle:{color:'#6c0d18',alpha:.26,rx:56,ry:12}
  },
  dust_explosion: {
    name:'Explosion Dust', category:'Explosion', description:'การระเบิดแบบฝุ่นและสะเก็ด เหมาะกับโลกพังทลาย', tags:['explosion','dust','blast'],
    palette:['#f1d08a','#9d6e34','#2e1d10'], style:'dirty',
    config:{count:180,life:1.4,speed:220,spread:360,gravity:140,depth:240,perspective:760,size:24,glow:10,turbulence:18,trail:4,blend:'screen',intensity:1,duration:1.5},
    layers:[
      {type:'spark',countMul:.18,sizeMul:.45,speedMul:1.3,lifeMul:.45,upBias:0,emission:'burst'},
      {type:'dust',countMul:.92,sizeMul:1.2,speedMul:.75,lifeMul:1.1,upBias:0,emission:'burst'},
      {type:'smoke',countMul:.35,sizeMul:1.55,speedMul:.45,lifeMul:1.4,upBias:.4,emission:'burst'}
    ],
    rings:[{life:1.1,maxR:210,color:'#e4be72',width:16}]
  },
  smoke_plume: {
    name:'Smoke Plume', category:'Smoke', description:'ควันดำ/เทาแบบซากเมืองหรือโรงงาน', tags:['smoke','ambient','industrial'],
    palette:['#a4a8ae','#44474d','#e8edf2'], style:'industrial',
    config:{count:120,life:2.8,speed:42,spread:60,gravity:-38,depth:140,perspective:980,size:48,glow:0,turbulence:14,trail:3,blend:'source-over',intensity:1,duration:3.0},
    layers:[
      {type:'smoke',countMul:1.0,sizeMul:1.85,speedMul:.52,lifeMul:1.35,upBias:1,emission:'cone'},
      {type:'ember',countMul:.08,sizeMul:.4,speedMul:.8,lifeMul:.4,upBias:1,emission:'cone'}
    ]
  }
};


function deepMerge(target, patch) {
  if (patch === null) return null;
  if (Array.isArray(patch)) return JSON.parse(JSON.stringify(patch));
  if (typeof patch !== 'object' || patch === undefined) return patch;
  const out = Array.isArray(target) ? [] : {...(target || {})};
  for (const [k,v] of Object.entries(patch)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) out[k] = JSON.parse(JSON.stringify(v));
    else if (v === null) delete out[k];
    else if (typeof v === 'object') out[k] = deepMerge(out[k] || {}, v);
    else out[k] = v;
  }
  return out;
}
function upsertPreset(key, baseKey, patch) {
  const base = PRESETS[baseKey] ? JSON.parse(JSON.stringify(PRESETS[baseKey])) : {};
  PRESETS[key] = deepMerge(base, patch || {});
}
(function expandPresetLibrary() {
  const LIB = {
  "Fire": [
    {
      "key": "campfire_loop",
      "base": "small_fire",
      "patch": {
        "name": "Campfire Loop",
        "description": "กองไฟลูปนิ่ง ๆ ใช้กับแคมป์หรือจุดเซฟ",
        "tags": [
          "fire",
          "camp",
          "loop"
        ],
        "style": "survival",
        "config": {
          "count": 120,
          "life": 1.9,
          "speed": 72,
          "spread": 38,
          "gravity": -55,
          "depth": 90,
          "perspective": 760,
          "size": 26,
          "glow": 20,
          "turbulence": 10,
          "trail": 5,
          "blend": "lighter",
          "intensity": 1,
          "duration": 2.0
        }
      }
    },
    {
      "key": "small_fire",
      "base": "small_fire",
      "patch": {
        "name": "Small Flame Loop"
      }
    },
    {
      "key": "burning_barrel",
      "base": "burning_barrel",
      "patch": {}
    },
    {
      "key": "oil_fire",
      "base": "oil_fire",
      "patch": {}
    },
    {
      "key": "flamethrower_stream",
      "base": "small_fire",
      "patch": {
        "name": "Flamethrower Stream",
        "description": "ลำไฟแบบปืนไฟ ยิงต่อเนื่องไปด้านหน้า",
        "tags": [
          "flamethrower",
          "stream",
          "weapon"
        ],
        "style": "survival",
        "config": {
          "count": 180,
          "life": 1.0,
          "speed": 220,
          "spread": 26,
          "gravity": 35,
          "depth": 180,
          "perspective": 720,
          "size": 18,
          "glow": 18,
          "turbulence": 8,
          "trail": 5,
          "blend": "lighter",
          "intensity": 1.15,
          "duration": 1.0
        },
        "layers": [
          {
            "type": "fire",
            "countMul": 0.9,
            "sizeMul": 0.75,
            "speedMul": 1.3,
            "lifeMul": 0.8,
            "upBias": 0.2,
            "emission": "directional"
          },
          {
            "type": "ember",
            "countMul": 0.28,
            "sizeMul": 0.3,
            "speedMul": 1.5,
            "lifeMul": 0.45,
            "upBias": 0.1,
            "emission": "directional"
          },
          {
            "type": "smoke",
            "countMul": 0.18,
            "sizeMul": 1.0,
            "speedMul": 0.4,
            "lifeMul": 0.9,
            "upBias": 0.3,
            "emission": "directional"
          }
        ]
      }
    },
    {
      "key": "molotov_ignite",
      "base": "oil_fire",
      "patch": {
        "name": "Molotov Ignite",
        "description": "ไฟลุกแบบโมโลตอฟ แตกแล้วลามเป็นวง",
        "tags": [
          "molotov",
          "ignite",
          "fire"
        ],
        "config": {
          "count": 155,
          "life": 1.35,
          "speed": 170,
          "spread": 120,
          "gravity": 90,
          "depth": 200,
          "perspective": 760,
          "size": 24,
          "glow": 24,
          "turbulence": 12,
          "trail": 4,
          "blend": "lighter",
          "intensity": 1.05,
          "duration": 1.4
        },
        "rings": [
          {
            "life": 1.0,
            "maxR": 170,
            "color": "#ffbe57",
            "width": 14
          }
        ]
      }
    },
    {
      "key": "torch_flame",
      "base": "small_fire",
      "patch": {
        "name": "Torch Flame",
        "description": "เปลวไฟคบเพลิงหรือหลอดเผา",
        "tags": [
          "torch",
          "flame",
          "loop"
        ],
        "config": {
          "count": 105,
          "life": 1.7,
          "speed": 68,
          "spread": 26,
          "gravity": -58,
          "depth": 95,
          "perspective": 780,
          "size": 23,
          "glow": 18,
          "turbulence": 10,
          "trail": 5,
          "blend": "lighter",
          "intensity": 1,
          "duration": 1.8
        }
      }
    },
    {
      "key": "engine_fire",
      "base": "oil_fire",
      "patch": {
        "name": "Engine Fire",
        "description": "ไฟไหม้เครื่องยนต์ มีประกายและควัน",
        "tags": [
          "engine",
          "fire",
          "vehicle"
        ],
        "style": "industrial",
        "config": {
          "count": 145,
          "life": 1.8,
          "speed": 92,
          "spread": 54,
          "gravity": -32,
          "depth": 150,
          "perspective": 760,
          "size": 24,
          "glow": 21,
          "turbulence": 14,
          "trail": 5,
          "blend": "screen",
          "intensity": 1.05,
          "duration": 1.9
        },
        "layers": [
          {
            "type": "fire",
            "countMul": 0.72,
            "sizeMul": 0.95,
            "speedMul": 1.0,
            "lifeMul": 1.0,
            "upBias": 0.9,
            "emission": "pool"
          },
          {
            "type": "smoke",
            "countMul": 0.5,
            "sizeMul": 1.7,
            "speedMul": 0.55,
            "lifeMul": 1.9,
            "upBias": 1,
            "emission": "pool"
          },
          {
            "type": "spark",
            "countMul": 0.12,
            "sizeMul": 0.32,
            "speedMul": 1.2,
            "lifeMul": 0.45,
            "upBias": 0.3,
            "emission": "pool"
          }
        ]
      }
    },
    {
      "key": "fire_burst",
      "base": "small_fire",
      "patch": {
        "name": "Fire Burst",
        "description": "ระเบิดไฟสั้น ๆ สำหรับ hit หรือ skill",
        "tags": [
          "fire",
          "burst",
          "impact"
        ],
        "config": {
          "count": 135,
          "life": 1.0,
          "speed": 210,
          "spread": 110,
          "gravity": 110,
          "depth": 220,
          "perspective": 730,
          "size": 22,
          "glow": 28,
          "turbulence": 10,
          "trail": 4,
          "blend": "lighter",
          "intensity": 1.1,
          "duration": 1.0
        },
        "layers": [
          {
            "type": "fire",
            "countMul": 0.8,
            "sizeMul": 0.9,
            "speedMul": 1.15,
            "lifeMul": 0.8,
            "upBias": 0.3,
            "emission": "burst"
          },
          {
            "type": "ember",
            "countMul": 0.16,
            "sizeMul": 0.3,
            "speedMul": 1.5,
            "lifeMul": 0.45,
            "upBias": 0.2,
            "emission": "burst"
          },
          {
            "type": "smoke",
            "countMul": 0.18,
            "sizeMul": 1.2,
            "speedMul": 0.5,
            "lifeMul": 0.8,
            "upBias": 0.4,
            "emission": "burst"
          }
        ],
        "rings": [
          {
            "life": 0.75,
            "maxR": 140,
            "color": "#ffb658",
            "width": 12
          }
        ]
      }
    }
  ],
  "Water": [
    {
      "key": "dirty_water",
      "base": "dirty_water",
      "patch": {}
    },
    {
      "key": "pipe_leak",
      "base": "pipe_leak",
      "patch": {}
    },
    {
      "key": "sewer_burst",
      "base": "dirty_water",
      "patch": {
        "name": "Sewer Burst",
        "description": "น้ำเสียระเบิดจากฝาท่อ",
        "tags": [
          "water",
          "sewer",
          "burst"
        ],
        "config": {
          "count": 130,
          "life": 1.2,
          "speed": 165,
          "spread": 110,
          "gravity": 210,
          "depth": 180,
          "perspective": 760,
          "size": 18,
          "glow": 0,
          "turbulence": 6,
          "trail": 4,
          "blend": "source-over",
          "intensity": 1.05,
          "duration": 1.2
        },
        "puddle": {
          "color": "#3a5d53",
          "alpha": 0.22,
          "rx": 70,
          "ry": 18
        }
      }
    },
    {
      "key": "toxic_water_splash",
      "base": "dirty_water",
      "patch": {
        "name": "Toxic Water Splash",
        "description": "น้ำปนเปื้อนสีเขียว",
        "tags": [
          "water",
          "toxic",
          "splash"
        ],
        "style": "mutant",
        "palette": [
          "#8bd8af",
          "#2c7551",
          "#d7ffe6"
        ],
        "layers": [
          {
            "type": "droplet",
            "countMul": 0.72,
            "sizeMul": 0.55,
            "speedMul": 1.2,
            "lifeMul": 0.95,
            "upBias": 0.3,
            "emission": "burst"
          },
          {
            "type": "mist",
            "countMul": 0.45,
            "sizeMul": 1.2,
            "speedMul": 0.5,
            "lifeMul": 0.85,
            "upBias": 0.3,
            "emission": "burst"
          },
          {
            "type": "toxic",
            "countMul": 0.18,
            "sizeMul": 0.35,
            "speedMul": 0.5,
            "lifeMul": 0.85,
            "upBias": 0.3,
            "emission": "burst"
          }
        ],
        "puddle": {
          "color": "#3f845d",
          "alpha": 0.2,
          "rx": 68,
          "ry": 18
        }
      }
    },
    {
      "key": "pressurized_jet",
      "base": "pipe_leak",
      "patch": {
        "name": "Pressurized Jet",
        "description": "ลำน้ำแรงดันสูงแบบเครื่องจักร",
        "tags": [
          "water",
          "jet",
          "industrial"
        ],
        "config": {
          "count": 95,
          "life": 1.05,
          "speed": 250,
          "spread": 18,
          "gravity": 120,
          "depth": 150,
          "perspective": 720,
          "size": 14,
          "glow": 0,
          "turbulence": 5,
          "trail": 4,
          "blend": "source-over",
          "intensity": 1,
          "duration": 1.1
        }
      }
    },
    {
      "key": "puddle_splash",
      "base": "dirty_water",
      "patch": {
        "name": "Puddle Splash",
        "description": "เหยียบแอ่งน้ำแล้วกระเซ็น",
        "tags": [
          "water",
          "puddle",
          "splash"
        ],
        "config": {
          "count": 100,
          "life": 0.95,
          "speed": 145,
          "spread": 120,
          "gravity": 230,
          "depth": 170,
          "perspective": 760,
          "size": 16,
          "glow": 0,
          "turbulence": 4,
          "trail": 4,
          "blend": "source-over",
          "intensity": 1,
          "duration": 1.0
        },
        "puddle": {
          "color": "#486b77",
          "alpha": 0.2,
          "rx": 74,
          "ry": 16
        }
      }
    },
    {
      "key": "contaminated_wave",
      "base": "dirty_water",
      "patch": {
        "name": "Contaminated Wave",
        "description": "คลื่นน้ำปนเปื้อนต่ำ ๆ",
        "tags": [
          "water",
          "wave",
          "contaminated"
        ],
        "style": "mutant",
        "palette": [
          "#8ed8c8",
          "#2e7f73",
          "#e3fff8"
        ],
        "layers": [
          {
            "type": "stream",
            "countMul": 0.4,
            "sizeMul": 0.65,
            "speedMul": 1.0,
            "lifeMul": 1.1,
            "upBias": 0.1,
            "emission": "forward"
          },
          {
            "type": "mist",
            "countMul": 0.55,
            "sizeMul": 1.15,
            "speedMul": 0.45,
            "lifeMul": 0.95,
            "upBias": 0.2,
            "emission": "forward"
          },
          {
            "type": "toxic",
            "countMul": 0.15,
            "sizeMul": 0.4,
            "speedMul": 0.45,
            "lifeMul": 0.9,
            "upBias": 0.2,
            "emission": "forward"
          }
        ],
        "puddle": {
          "color": "#3e7a6d",
          "alpha": 0.18,
          "rx": 80,
          "ry": 16
        }
      }
    },
    {
      "key": "steam_leak",
      "base": "pipe_leak",
      "patch": {
        "name": "Steam Leak",
        "description": "ไอน้ำร้อนพ่นจากท่อ",
        "tags": [
          "steam",
          "leak",
          "pipe"
        ],
        "style": "industrial",
        "palette": [
          "#f7ffff",
          "#c0d6df",
          "#ffffff"
        ],
        "config": {
          "count": 95,
          "life": 1.6,
          "speed": 95,
          "spread": 36,
          "gravity": -32,
          "depth": 120,
          "perspective": 860,
          "size": 26,
          "glow": 4,
          "turbulence": 8,
          "trail": 3,
          "blend": "screen",
          "intensity": 1,
          "duration": 1.8
        },
        "layers": [
          {
            "type": "mist",
            "countMul": 0.95,
            "sizeMul": 1.6,
            "speedMul": 0.55,
            "lifeMul": 1.2,
            "upBias": 1,
            "emission": "directional"
          },
          {
            "type": "smoke",
            "countMul": 0.15,
            "sizeMul": 1.1,
            "speedMul": 0.45,
            "lifeMul": 0.9,
            "upBias": 0.8,
            "emission": "directional"
          }
        ]
      }
    }
  ],
  "Electricity": [
    {
      "key": "electric_arc",
      "base": "electric_arc",
      "patch": {}
    },
    {
      "key": "emp_burst",
      "base": "emp_burst",
      "patch": {}
    },
    {
      "key": "reactor_arc",
      "base": "electric_arc",
      "patch": {
        "name": "Reactor Arc",
        "description": "อาร์กแรงจากเครื่องปฏิกรณ์เสีย",
        "tags": [
          "reactor",
          "electric",
          "arc"
        ],
        "config": {
          "count": 90,
          "life": 0.95,
          "speed": 240,
          "spread": 70,
          "gravity": 40,
          "depth": 220,
          "perspective": 740,
          "size": 14,
          "glow": 24,
          "turbulence": 14,
          "trail": 3,
          "blend": "lighter",
          "intensity": 1,
          "duration": 0.95
        },
        "beam": {
          "kind": "electric",
          "segments": 12,
          "amplitude": 30,
          "from": [
            -130,
            -20
          ],
          "to": [
            130,
            20
          ]
        }
      }
    },
    {
      "key": "generator_spark",
      "base": "electric_arc",
      "patch": {
        "name": "Generator Sparks",
        "description": "สะเก็ดจากเครื่องปั่นไฟ",
        "tags": [
          "generator",
          "spark",
          "machine"
        ],
        "style": "industrial",
        "palette": [
          "#ffe9ad",
          "#ff9f43",
          "#ffffff"
        ],
        "config": {
          "count": 70,
          "life": 0.65,
          "speed": 250,
          "spread": 75,
          "gravity": 120,
          "depth": 140,
          "perspective": 720,
          "size": 10,
          "glow": 12,
          "turbulence": 6,
          "trail": 2,
          "blend": "lighter",
          "intensity": 1,
          "duration": 0.7
        },
        "layers": [
          {
            "type": "spark",
            "countMul": 0.85,
            "sizeMul": 0.35,
            "speedMul": 1.45,
            "lifeMul": 0.55,
            "upBias": 0.15,
            "emission": "forward"
          },
          {
            "type": "dust",
            "countMul": 0.25,
            "sizeMul": 0.7,
            "speedMul": 0.6,
            "lifeMul": 0.65,
            "upBias": 0.1,
            "emission": "forward"
          }
        ]
      }
    },
    {
      "key": "tesla_zap",
      "base": "electric_arc",
      "patch": {
        "name": "Tesla Zap",
        "description": "ซาปสั้น ๆ แบบเทสลา",
        "tags": [
          "tesla",
          "zap",
          "electric"
        ],
        "config": {
          "count": 88,
          "life": 0.72,
          "speed": 210,
          "spread": 48,
          "gravity": 20,
          "depth": 160,
          "perspective": 720,
          "size": 12,
          "glow": 20,
          "turbulence": 12,
          "trail": 3,
          "blend": "lighter",
          "intensity": 1,
          "duration": 0.8
        },
        "beam": {
          "kind": "electric",
          "segments": 9,
          "amplitude": 22,
          "from": [
            -90,
            -70
          ],
          "to": [
            110,
            50
          ]
        }
      }
    },
    {
      "key": "cable_short",
      "base": "electric_arc",
      "patch": {
        "name": "Cable Short",
        "description": "สายไฟช็อตเป็นจังหวะ",
        "tags": [
          "cable",
          "short",
          "spark"
        ],
        "style": "industrial",
        "palette": [
          "#fff0bf",
          "#ffb347",
          "#ffffff"
        ],
        "config": {
          "count": 65,
          "life": 0.6,
          "speed": 180,
          "spread": 36,
          "gravity": 80,
          "depth": 120,
          "perspective": 720,
          "size": 10,
          "glow": 14,
          "turbulence": 8,
          "trail": 2,
          "blend": "lighter",
          "intensity": 1,
          "duration": 0.7
        },
        "beam": {
          "kind": "electric",
          "segments": 7,
          "amplitude": 16,
          "from": [
            -160,
            -70
          ],
          "to": [
            -30,
            -5
          ]
        }
      }
    },
    {
      "key": "electric_field",
      "base": "emp_burst",
      "patch": {
        "name": "Electric Field",
        "description": "สนามไฟฟ้ารอบวัตถุ",
        "tags": [
          "field",
          "electric",
          "aura"
        ],
        "config": {
          "count": 100,
          "life": 1.3,
          "speed": 90,
          "spread": 360,
          "gravity": -5,
          "depth": 250,
          "perspective": 820,
          "size": 16,
          "glow": 20,
          "turbulence": 18,
          "trail": 4,
          "blend": "screen",
          "intensity": 1,
          "duration": 1.4
        },
        "rings": [
          {
            "life": 1.2,
            "maxR": 130,
            "color": "#8edbff",
            "width": 10
          },
          {
            "life": 1.1,
            "maxR": 220,
            "color": "#5d87ff",
            "width": 6
          }
        ]
      }
    },
    {
      "key": "stun_hit",
      "base": "electric_arc",
      "patch": {
        "name": "Stun Hit",
        "description": "ไฟฟ้าช็อตตอนโดนโจมตี",
        "tags": [
          "stun",
          "hit",
          "electric"
        ],
        "style": "survival",
        "config": {
          "count": 75,
          "life": 0.75,
          "speed": 180,
          "spread": 90,
          "gravity": 60,
          "depth": 160,
          "perspective": 720,
          "size": 12,
          "glow": 16,
          "turbulence": 10,
          "trail": 3,
          "blend": "lighter",
          "intensity": 1,
          "duration": 0.8
        },
        "rings": [
          {
            "life": 0.6,
            "maxR": 90,
            "color": "#9ceaff",
            "width": 8
          }
        ]
      }
    }
  ],
  "Frost": [
    {
      "key": "frost_burst",
      "base": "frost_burst",
      "patch": {}
    },
    {
      "key": "ice_shatter",
      "base": "frost_burst",
      "patch": {
        "name": "Ice Shatter",
        "description": "เศษน้ำแข็งแตกกระจาย",
        "tags": [
          "ice",
          "shatter",
          "impact"
        ],
        "config": {
          "count": 95,
          "life": 0.85,
          "speed": 210,
          "spread": 95,
          "gravity": 170,
          "depth": 170,
          "perspective": 740,
          "size": 14,
          "glow": 6,
          "turbulence": 4,
          "trail": 2,
          "blend": "screen",
          "intensity": 1,
          "duration": 0.9
        },
        "layers": [
          {
            "type": "frost",
            "countMul": 0.82,
            "sizeMul": 0.65,
            "speedMul": 1.25,
            "lifeMul": 0.65,
            "upBias": 0.15,
            "emission": "burst"
          },
          {
            "type": "mist",
            "countMul": 0.18,
            "sizeMul": 1.0,
            "speedMul": 0.45,
            "lifeMul": 0.5,
            "upBias": 0.1,
            "emission": "burst"
          }
        ],
        "rings": []
      }
    },
    {
      "key": "cold_breath",
      "base": "frost_burst",
      "patch": {
        "name": "Cold Breath",
        "description": "ลมหายใจเย็น ๆ",
        "tags": [
          "cold",
          "breath",
          "mist"
        ],
        "palette": [
          "#effcff",
          "#b6e7ff",
          "#ffffff"
        ],
        "config": {
          "count": 88,
          "life": 1.1,
          "speed": 70,
          "spread": 28,
          "gravity": -18,
          "depth": 130,
          "perspective": 900,
          "size": 24,
          "glow": 4,
          "turbulence": 6,
          "trail": 3,
          "blend": "screen",
          "intensity": 1,
          "duration": 1.2
        },
        "layers": [
          {
            "type": "mist",
            "countMul": 0.95,
            "sizeMul": 1.5,
            "speedMul": 0.5,
            "lifeMul": 1.15,
            "upBias": 1,
            "emission": "directional"
          }
        ],
        "rings": []
      }
    },
    {
      "key": "freeze_aura",
      "base": "frost_burst",
      "patch": {
        "name": "Freeze Aura",
        "description": "ออร่าเยือกแข็งรอบตัว",
        "tags": [
          "freeze",
          "aura",
          "ring"
        ],
        "style": "ruin",
        "config": {
          "count": 110,
          "life": 1.4,
          "speed": 95,
          "spread": 360,
          "gravity": -5,
          "depth": 220,
          "perspective": 860,
          "size": 18,
          "glow": 8,
          "turbulence": 10,
          "trail": 4,
          "blend": "screen",
          "intensity": 1,
          "duration": 1.5
        },
        "layers": [
          {
            "type": "mist",
            "countMul": 0.55,
            "sizeMul": 1.2,
            "speedMul": 0.45,
            "lifeMul": 1.1,
            "upBias": 0,
            "emission": "burst"
          },
          {
            "type": "frost",
            "countMul": 0.35,
            "sizeMul": 0.7,
            "speedMul": 0.55,
            "lifeMul": 0.85,
            "upBias": 0,
            "emission": "burst"
          }
        ],
        "rings": [
          {
            "life": 1.1,
            "maxR": 160,
            "color": "#d5fbff",
            "width": 12
          },
          {
            "life": 1.3,
            "maxR": 230,
            "color": "#99dfff",
            "width": 6
          }
        ]
      }
    },
    {
      "key": "snow_puff",
      "base": "frost_burst",
      "patch": {
        "name": "Snow Puff",
        "description": "ฟูหิมะเล็ก ๆ ตอนโดนพื้น",
        "tags": [
          "snow",
          "puff",
          "impact"
        ],
        "palette": [
          "#fbfeff",
          "#dcefff",
          "#ffffff"
        ],
        "config": {
          "count": 95,
          "life": 0.95,
          "speed": 110,
          "spread": 120,
          "gravity": 140,
          "depth": 150,
          "perspective": 760,
          "size": 16,
          "glow": 0,
          "turbulence": 5,
          "trail": 2,
          "blend": "screen",
          "intensity": 1,
          "duration": 1.0
        },
        "layers": [
          {
            "type": "mist",
            "countMul": 0.8,
            "sizeMul": 1.2,
            "speedMul": 0.55,
            "lifeMul": 0.7,
            "upBias": 0.2,
            "emission": "burst"
          },
          {
            "type": "frost",
            "countMul": 0.22,
            "sizeMul": 0.45,
            "speedMul": 1.0,
            "lifeMul": 0.5,
            "upBias": 0.2,
            "emission": "burst"
          }
        ],
        "rings": []
      }
    },
    {
      "key": "cryo_spray",
      "base": "frost_burst",
      "patch": {
        "name": "Cryo Spray",
        "description": "สเปรย์เย็นยิงไปข้างหน้า",
        "tags": [
          "cryo",
          "spray",
          "directional"
        ],
        "palette": [
          "#effdff",
          "#bbe5ff",
          "#ffffff"
        ],
        "config": {
          "count": 120,
          "life": 1.0,
          "speed": 180,
          "spread": 24,
          "gravity": 70,
          "depth": 150,
          "perspective": 750,
          "size": 16,
          "glow": 8,
          "turbulence": 6,
          "trail": 3,
          "blend": "screen",
          "intensity": 1,
          "duration": 1.0
        },
        "layers": [
          {
            "type": "mist",
            "countMul": 0.82,
            "sizeMul": 1.2,
            "speedMul": 0.75,
            "lifeMul": 0.95,
            "upBias": 0.2,
            "emission": "directional"
          },
          {
            "type": "frost",
            "countMul": 0.25,
            "sizeMul": 0.45,
            "speedMul": 1.15,
            "lifeMul": 0.55,
            "upBias": 0.2,
            "emission": "directional"
          }
        ],
        "rings": []
      }
    },
    {
      "key": "ice_spike_hit",
      "base": "frost_burst",
      "patch": {
        "name": "Ice Spike Hit",
        "description": "โดนน้ำแข็งแทงกระแทก",
        "tags": [
          "ice",
          "spike",
          "hit"
        ],
        "config": {
          "count": 105,
          "life": 0.8,
          "speed": 200,
          "spread": 90,
          "gravity": 150,
          "depth": 170,
          "perspective": 740,
          "size": 14,
          "glow": 6,
          "turbulence": 4,
          "trail": 2,
          "blend": "screen",
          "intensity": 1,
          "duration": 0.85
        },
        "layers": [
          {
            "type": "frost",
            "countMul": 0.75,
            "sizeMul": 0.55,
            "speedMul": 1.25,
            "lifeMul": 0.6,
            "upBias": 0.15,
            "emission": "burst"
          },
          {
            "type": "mist",
            "countMul": 0.22,
            "sizeMul": 0.95,
            "speedMul": 0.45,
            "lifeMul": 0.5,
            "upBias": 0.1,
            "emission": "burst"
          }
        ],
        "rings": []
      }
    },
    {
      "key": "frost_ring",
      "base": "frost_burst",
      "patch": {
        "name": "Frost Ring",
        "description": "วงแหวนเยือกแข็ง",
        "tags": [
          "frost",
          "ring",
          "aura"
        ],
        "style": "ruin",
        "config": {
          "count": 90,
          "life": 1.05,
          "speed": 120,
          "spread": 360,
          "gravity": 10,
          "depth": 180,
          "perspective": 820,
          "size": 15,
          "glow": 10,
          "turbulence": 8,
          "trail": 3,
          "blend": "screen",
          "intensity": 1,
          "duration": 1.1
        },
        "layers": [
          {
            "type": "mist",
            "countMul": 0.45,
            "sizeMul": 1.2,
            "speedMul": 0.45,
            "lifeMul": 0.85,
            "upBias": 0,
            "emission": "burst"
          },
          {
            "type": "frost",
            "countMul": 0.32,
            "sizeMul": 0.5,
            "speedMul": 0.75,
            "lifeMul": 0.6,
            "upBias": 0,
            "emission": "burst"
          }
        ],
        "rings": [
          {
            "life": 1.0,
            "maxR": 210,
            "color": "#d7ffff",
            "width": 14
          }
        ]
      }
    }
  ],
  "Radiation": [
    {
      "key": "radiation_mist",
      "base": "radiation_mist",
      "patch": {}
    },
    {
      "key": "reactor_leak",
      "base": "reactor_leak",
      "patch": {}
    },
    {
      "key": "fallout_drift",
      "base": "radiation_mist",
      "patch": {
        "name": "Fallout Drift",
        "description": "ฝุ่น fallout ปนเรืองแสง",
        "tags": [
          "fallout",
          "dust",
          "rad"
        ],
        "palette": [
          "#d4ff92",
          "#708a39",
          "#f2ffd8"
        ],
        "style": "dirty",
        "config": {
          "count": 115,
          "life": 2.4,
          "speed": 26,
          "spread": 90,
          "gravity": -8,
          "depth": 220,
          "perspective": 960,
          "size": 24,
          "glow": 4,
          "turbulence": 12,
          "trail": 3,
          "blend": "screen",
          "intensity": 1,
          "duration": 2.6
        },
        "layers": [
          {
            "type": "rad",
            "countMul": 0.55,
            "sizeMul": 0.35,
            "speedMul": 0.55,
            "lifeMul": 1.1,
            "upBias": 1,
            "emission": "pool"
          },
          {
            "type": "dust",
            "countMul": 0.45,
            "sizeMul": 0.9,
            "speedMul": 0.4,
            "lifeMul": 1.2,
            "upBias": 1,
            "emission": "pool"
          },
          {
            "type": "mist",
            "countMul": 0.35,
            "sizeMul": 1.2,
            "speedMul": 0.35,
            "lifeMul": 1.3,
            "upBias": 1,
            "emission": "pool"
          }
        ],
        "rings": []
      }
    },
    {
      "key": "rad_pulse",
      "base": "radiation_mist",
      "patch": {
        "name": "Rad Pulse",
        "description": "พัลส์รังสีเป็นคลื่น",
        "tags": [
          "radiation",
          "pulse",
          "ring"
        ],
        "style": "ruin",
        "config": {
          "count": 110,
          "life": 1.5,
          "speed": 90,
          "spread": 360,
          "gravity": -5,
          "depth": 220,
          "perspective": 840,
          "size": 20,
          "glow": 14,
          "turbulence": 12,
          "trail": 4,
          "blend": "screen",
          "intensity": 1,
          "duration": 1.6
        },
        "layers": [
          {
            "type": "rad",
            "countMul": 0.45,
            "sizeMul": 0.35,
            "speedMul": 0.65,
            "lifeMul": 0.95,
            "upBias": 0,
            "emission": "burst"
          },
          {
            "type": "mist",
            "countMul": 0.45,
            "sizeMul": 1.2,
            "speedMul": 0.35,
            "lifeMul": 1.0,
            "upBias": 0,
            "emission": "burst"
          }
        ],
        "rings": [
          {
            "life": 1.2,
            "maxR": 170,
            "color": "#b0ff69",
            "width": 12
          },
          {
            "life": 1.4,
            "maxR": 250,
            "color": "#6ab42e",
            "width": 7
          }
        ]
      }
    },
    {
      "key": "anomaly_glow",
      "base": "reactor_leak",
      "patch": {
        "name": "Anomaly Glow",
        "description": "พลังงานผิดปกติแบบ anomaly",
        "tags": [
          "anomaly",
          "glow",
          "radiation"
        ],
        "config": {
          "count": 100,
          "life": 1.8,
          "speed": 70,
          "spread": 360,
          "gravity": -10,
          "depth": 260,
          "perspective": 900,
          "size": 18,
          "glow": 20,
          "turbulence": 20,
          "trail": 4,
          "blend": "screen",
          "intensity": 1,
          "duration": 2.0
        },
        "layers": [
          {
            "type": "rad",
            "countMul": 0.5,
            "sizeMul": 0.35,
            "speedMul": 0.6,
            "lifeMul": 1.0,
            "upBias": 0,
            "emission": "burst"
          },
          {
            "type": "electric",
            "countMul": 0.12,
            "sizeMul": 0.55,
            "speedMul": 0.55,
            "lifeMul": 0.6,
            "upBias": 0,
            "emission": "burst"
          },
          {
            "type": "mist",
            "countMul": 0.42,
            "sizeMul": 1.4,
            "speedMul": 0.4,
            "lifeMul": 1.1,
            "upBias": 0,
            "emission": "burst"
          }
        ],
        "rings": [
          {
            "life": 1.5,
            "maxR": 150,
            "color": "#b7ff72",
            "width": 10
          }
        ]
      }
    },
    {
      "key": "toxic_waste_glow",
      "base": "radiation_mist",
      "patch": {
        "name": "Toxic Waste Glow",
        "description": "บ่อกากพิษเรืองแสง",
        "tags": [
          "waste",
          "toxic",
          "glow"
        ],
        "style": "mutant",
        "palette": [
          "#d5ff75",
          "#6f9c27",
          "#f6ffd4"
        ],
        "config": {
          "count": 110,
          "life": 2.1,
          "speed": 30,
          "spread": 100,
          "gravity": -5,
          "depth": 180,
          "perspective": 900,
          "size": 30,
          "glow": 8,
          "turbulence": 14,
          "trail": 4,
          "blend": "screen",
          "intensity": 1,
          "duration": 2.2
        },
        "layers": [
          {
            "type": "mist",
            "countMul": 0.75,
            "sizeMul": 1.6,
            "speedMul": 0.35,
            "lifeMul": 1.25,
            "upBias": 1,
            "emission": "pool"
          },
          {
            "type": "toxic",
            "countMul": 0.35,
            "sizeMul": 0.38,
            "speedMul": 0.4,
            "lifeMul": 1.0,
            "upBias": 1,
            "emission": "pool"
          }
        ],
        "puddle": {
          "color": "#689225",
          "alpha": 0.22,
          "rx": 90,
          "ry": 26
        },
        "rings": []
      }
    },
    {
      "key": "geiger_spark",
      "base": "radiation_mist",
      "patch": {
        "name": "Geiger Sparks",
        "description": "สะเก็ดรังสีจากอุปกรณ์เสีย",
        "tags": [
          "geiger",
          "spark",
          "radiation"
        ],
        "style": "industrial",
        "palette": [
          "#d6ff82",
          "#85be37",
          "#ffffff"
        ],
        "config": {
          "count": 75,
          "life": 0.9,
          "speed": 160,
          "spread": 95,
          "gravity": 80,
          "depth": 170,
          "perspective": 730,
          "size": 12,
          "glow": 10,
          "turbulence": 8,
          "trail": 2,
          "blend": "screen",
          "intensity": 1,
          "duration": 1.0
        },
        "layers": [
          {
            "type": "spark",
            "countMul": 0.25,
            "sizeMul": 0.35,
            "speedMul": 1.2,
            "lifeMul": 0.45,
            "upBias": 0.1,
            "emission": "burst"
          },
          {
            "type": "rad",
            "countMul": 0.55,
            "sizeMul": 0.32,
            "speedMul": 0.7,
            "lifeMul": 0.9,
            "upBias": 0.1,
            "emission": "burst"
          },
          {
            "type": "mist",
            "countMul": 0.2,
            "sizeMul": 1.0,
            "speedMul": 0.35,
            "lifeMul": 0.9,
            "upBias": 0.2,
            "emission": "burst"
          }
        ],
        "rings": []
      }
    },
    {
      "key": "contaminated_zone",
      "base": "radiation_mist",
      "patch": {
        "name": "Contaminated Zone",
        "description": "โซนปนเปื้อนลูปนิ่ง ๆ",
        "tags": [
          "zone",
          "contaminated",
          "ambient"
        ],
        "style": "mutant",
        "palette": [
          "#c9ff74",
          "#6d9930",
          "#ecffd0"
        ],
        "config": {
          "count": 150,
          "life": 2.8,
          "speed": 18,
          "spread": 360,
          "gravity": -8,
          "depth": 240,
          "perspective": 980,
          "size": 34,
          "glow": 6,
          "turbulence": 16,
          "trail": 4,
          "blend": "screen",
          "intensity": 1,
          "duration": 3.0
        },
        "layers": [
          {
            "type": "mist",
            "countMul": 0.85,
            "sizeMul": 1.8,
            "speedMul": 0.28,
            "lifeMul": 1.4,
            "upBias": 1,
            "emission": "pool"
          },
          {
            "type": "rad",
            "countMul": 0.3,
            "sizeMul": 0.34,
            "speedMul": 0.4,
            "lifeMul": 1.1,
            "upBias": 1,
            "emission": "pool"
          }
        ],
        "puddle": {
          "color": "#5f8628",
          "alpha": 0.14,
          "rx": 100,
          "ry": 28
        },
        "rings": [
          {
            "life": 2.2,
            "maxR": 110,
            "color": "#b9ff64",
            "width": 5
          }
        ]
      }
    }
  ],
  "Poison": [
    {
      "key": "poison_cloud",
      "base": "poison_cloud",
      "patch": {}
    },
    {
      "key": "toxic_breath",
      "base": "poison_cloud",
      "patch": {
        "name": "Toxic Breath",
        "description": "ลมหายใจพิษยิงไปด้านหน้า",
        "tags": [
          "poison",
          "breath",
          "directional"
        ],
        "config": {
          "count": 95,
          "life": 1.05,
          "speed": 110,
          "spread": 28,
          "gravity": -10,
          "depth": 150,
          "perspective": 830,
          "size": 22,
          "glow": 4,
          "turbulence": 8,
          "trail": 4,
          "blend": "screen",
          "intensity": 1,
          "duration": 1.1
        },
        "layers": [
          {
            "type": "mist",
            "countMul": 0.75,
            "sizeMul": 1.25,
            "speedMul": 0.65,
            "lifeMul": 0.95,
            "upBias": 0.3,
            "emission": "directional"
          },
          {
            "type": "toxic",
            "countMul": 0.35,
            "sizeMul": 0.35,
            "speedMul": 0.7,
            "lifeMul": 0.85,
            "upBias": 0.3,
            "emission": "directional"
          }
        ],
        "puddle": null
      }
    },
    {
      "key": "venom_spit",
      "base": "acid_splash",
      "patch": {
        "name": "Venom Spit",
        "category": "Poison",
        "description": "พิษพุ่งกระแทกแล้วฟุ้ง",
        "tags": [
          "venom",
          "spit",
          "impact"
        ],
        "style": "mutant",
        "palette": [
          "#9de44c",
          "#4e7f1f",
          "#f0ffbf"
        ],
        "config": {
          "count": 115,
          "life": 1.0,
          "speed": 190,
          "spread": 72,
          "gravity": 180,
          "depth": 170,
          "perspective": 750,
          "size": 15,
          "glow": 5,
          "turbulence": 7,
          "trail": 4,
          "blend": "screen",
          "intensity": 1,
          "duration": 1.05
        },
        "layers": [
          {
            "type": "acid",
            "countMul": 0.48,
            "sizeMul": 0.52,
            "speedMul": 1.15,
            "lifeMul": 0.8,
            "upBias": 0.2,
            "emission": "directional"
          },
          {
            "type": "mist",
            "countMul": 0.32,
            "sizeMul": 1.15,
            "speedMul": 0.45,
            "lifeMul": 0.8,
            "upBias": 0.3,
            "emission": "burst"
          },
          {
            "type": "toxic",
            "countMul": 0.25,
            "sizeMul": 0.32,
            "speedMul": 0.55,
            "lifeMul": 0.85,
            "upBias": 0.3,
            "emission": "burst"
          }
        ],
        "puddle": {
          "color": "#5f8526",
          "alpha": 0.18,
          "rx": 60,
          "ry": 16
        }
      }
    },
    {
      "key": "gas_leak",
      "base": "poison_cloud",
      "patch": {
        "name": "Gas Leak",
        "description": "แก๊สรั่วจากถังหรือท่อ",
        "tags": [
          "gas",
          "leak",
          "ambient"
        ],
        "style": "industrial",
        "palette": [
          "#b8f06e",
          "#5a7f28",
          "#f2ffd5"
        ],
        "config": {
          "count": 120,
          "life": 2.0,
          "speed": 28,
          "spread": 56,
          "gravity": -18,
          "depth": 160,
          "perspective": 940,
          "size": 28,
          "glow": 3,
          "turbulence": 10,
          "trail": 3,
          "blend": "screen",
          "intensity": 1,
          "duration": 2.2
        },
        "layers": [
          {
            "type": "mist",
            "countMul": 0.85,
            "sizeMul": 1.55,
            "speedMul": 0.42,
            "lifeMul": 1.25,
            "upBias": 1,
            "emission": "directional"
          },
          {
            "type": "toxic",
            "countMul": 0.22,
            "sizeMul": 0.3,
            "speedMul": 0.42,
            "lifeMul": 0.95,
            "upBias": 1,
            "emission": "directional"
          }
        ],
        "puddle": null
      }
    },
    {
      "key": "plague_aura",
      "base": "poison_cloud",
      "patch": {
        "name": "Plague Aura",
        "description": "ออร่าพิษ/โรค ลูปนิ่ง",
        "tags": [
          "plague",
          "aura",
          "loop"
        ],
        "config": {
          "count": 125,
          "life": 1.9,
          "speed": 42,
          "spread": 360,
          "gravity": -10,
          "depth": 220,
          "perspective": 900,
          "size": 26,
          "glow": 5,
          "turbulence": 12,
          "trail": 4,
          "blend": "screen",
          "intensity": 1,
          "duration": 2.0
        },
        "layers": [
          {
            "type": "mist",
            "countMul": 0.65,
            "sizeMul": 1.4,
            "speedMul": 0.4,
            "lifeMul": 1.1,
            "upBias": 0,
            "emission": "burst"
          },
          {
            "type": "toxic",
            "countMul": 0.28,
            "sizeMul": 0.32,
            "speedMul": 0.45,
            "lifeMul": 0.9,
            "upBias": 0,
            "emission": "burst"
          }
        ],
        "rings": [
          {
            "life": 1.7,
            "maxR": 145,
            "color": "#b6ed67",
            "width": 8
          }
        ],
        "puddle": null
      }
    },
    {
      "key": "poison_burst",
      "base": "poison_cloud",
      "patch": {
        "name": "Poison Burst",
        "description": "ระเบิดควันพิษทันที",
        "tags": [
          "poison",
          "burst",
          "cloud"
        ],
        "config": {
          "count": 130,
          "life": 1.0,
          "speed": 150,
          "spread": 120,
          "gravity": 100,
          "depth": 190,
          "perspective": 760,
          "size": 21,
          "glow": 5,
          "turbulence": 8,
          "trail": 4,
          "blend": "screen",
          "intensity": 1,
          "duration": 1.05
        },
        "layers": [
          {
            "type": "mist",
            "countMul": 0.72,
            "sizeMul": 1.2,
            "speedMul": 0.65,
            "lifeMul": 0.8,
            "upBias": 0.2,
            "emission": "burst"
          },
          {
            "type": "toxic",
            "countMul": 0.4,
            "sizeMul": 0.36,
            "speedMul": 0.65,
            "lifeMul": 0.85,
            "upBias": 0.2,
            "emission": "burst"
          }
        ],
        "rings": [
          {
            "life": 0.8,
            "maxR": 120,
            "color": "#b6eb61",
            "width": 8
          }
        ],
        "puddle": null
      }
    },
    {
      "key": "spore_cloud",
      "base": "poison_cloud",
      "patch": {
        "name": "Spore Cloud",
        "description": "กลุ่มสปอร์ลอยช้า",
        "tags": [
          "spore",
          "cloud",
          "biohazard"
        ],
        "palette": [
          "#c3e78f",
          "#678642",
          "#f5ffe8"
        ],
        "config": {
          "count": 150,
          "life": 2.3,
          "speed": 22,
          "spread": 100,
          "gravity": -12,
          "depth": 220,
          "perspective": 980,
          "size": 26,
          "glow": 3,
          "turbulence": 9,
          "trail": 4,
          "blend": "screen",
          "intensity": 1,
          "duration": 2.4
        },
        "layers": [
          {
            "type": "mist",
            "countMul": 0.52,
            "sizeMul": 1.25,
            "speedMul": 0.35,
            "lifeMul": 1.1,
            "upBias": 1,
            "emission": "pool"
          },
          {
            "type": "toxic",
            "countMul": 0.55,
            "sizeMul": 0.3,
            "speedMul": 0.35,
            "lifeMul": 1.15,
            "upBias": 1,
            "emission": "pool"
          },
          {
            "type": "rad",
            "countMul": 0.12,
            "sizeMul": 0.24,
            "speedMul": 0.3,
            "lifeMul": 1.0,
            "upBias": 1,
            "emission": "pool"
          }
        ],
        "puddle": null
      }
    },
    {
      "key": "poison_pool",
      "base": "poison_cloud",
      "patch": {
        "name": "Poison Pool",
        "description": "บ่อพิษนิ่ง ๆ มีไอควัน",
        "tags": [
          "pool",
          "poison",
          "hazard"
        ],
        "config": {
          "count": 110,
          "life": 2.4,
          "speed": 18,
          "spread": 100,
          "gravity": -15,
          "depth": 140,
          "perspective": 980,
          "size": 30,
          "glow": 3,
          "turbulence": 8,
          "trail": 4,
          "blend": "screen",
          "intensity": 1,
          "duration": 2.5
        },
        "layers": [
          {
            "type": "mist",
            "countMul": 0.75,
            "sizeMul": 1.65,
            "speedMul": 0.3,
            "lifeMul": 1.2,
            "upBias": 1,
            "emission": "pool"
          },
          {
            "type": "toxic",
            "countMul": 0.25,
            "sizeMul": 0.32,
            "speedMul": 0.3,
            "lifeMul": 1.0,
            "upBias": 1,
            "emission": "pool"
          }
        ],
        "puddle": {
          "color": "#648421",
          "alpha": 0.24,
          "rx": 90,
          "ry": 24
        }
      }
    }
  ],
  "Acid": [
    {
      "key": "acid_splash",
      "base": "acid_splash",
      "patch": {}
    },
    {
      "key": "acid_pool",
      "base": "acid_splash",
      "patch": {
        "name": "Acid Pool",
        "description": "บ่อกรดเรื่อย ๆ มีไอ",
        "tags": [
          "acid",
          "pool",
          "hazard"
        ],
        "config": {
          "count": 100,
          "life": 2.2,
          "speed": 20,
          "spread": 90,
          "gravity": -8,
          "depth": 130,
          "perspective": 980,
          "size": 28,
          "glow": 4,
          "turbulence": 9,
          "trail": 4,
          "blend": "screen",
          "intensity": 1,
          "duration": 2.3
        },
        "layers": [
          {
            "type": "mist",
            "countMul": 0.7,
            "sizeMul": 1.55,
            "speedMul": 0.32,
            "lifeMul": 1.2,
            "upBias": 1,
            "emission": "pool"
          },
          {
            "type": "acid",
            "countMul": 0.2,
            "sizeMul": 0.28,
            "speedMul": 0.3,
            "lifeMul": 0.95,
            "upBias": 1,
            "emission": "pool"
          }
        ],
        "puddle": {
          "color": "#7aa11c",
          "alpha": 0.28,
          "rx": 94,
          "ry": 25
        }
      }
    },
    {
      "key": "acid_spit",
      "base": "acid_splash",
      "patch": {
        "name": "Acid Spit",
        "description": "ศัตรูพ่นกรดเป็นเส้น",
        "tags": [
          "acid",
          "spit",
          "directional"
        ],
        "config": {
          "count": 105,
          "life": 1.0,
          "speed": 210,
          "spread": 24,
          "gravity": 170,
          "depth": 170,
          "perspective": 750,
          "size": 14,
          "glow": 7,
          "turbulence": 7,
          "trail": 3,
          "blend": "screen",
          "intensity": 1,
          "duration": 1.0
        },
        "layers": [
          {
            "type": "acid",
            "countMul": 0.6,
            "sizeMul": 0.48,
            "speedMul": 1.25,
            "lifeMul": 0.9,
            "upBias": 0.25,
            "emission": "directional"
          },
          {
            "type": "mist",
            "countMul": 0.25,
            "sizeMul": 1.0,
            "speedMul": 0.42,
            "lifeMul": 0.7,
            "upBias": 0.3,
            "emission": "directional"
          }
        ],
        "puddle": null
      }
    },
    {
      "key": "corrosive_spray",
      "base": "acid_splash",
      "patch": {
        "name": "Corrosive Spray",
        "description": "สเปรย์กรดกระจายเป็นพัด",
        "tags": [
          "acid",
          "spray",
          "cone"
        ],
        "config": {
          "count": 140,
          "life": 1.05,
          "speed": 175,
          "spread": 50,
          "gravity": 170,
          "depth": 160,
          "perspective": 760,
          "size": 15,
          "glow": 6,
          "turbulence": 8,
          "trail": 3,
          "blend": "screen",
          "intensity": 1,
          "duration": 1.1
        },
        "layers": [
          {
            "type": "acid",
            "countMul": 0.68,
            "sizeMul": 0.45,
            "speedMul": 1.2,
            "lifeMul": 0.85,
            "upBias": 0.25,
            "emission": "directional"
          },
          {
            "type": "mist",
            "countMul": 0.32,
            "sizeMul": 1.05,
            "speedMul": 0.45,
            "lifeMul": 0.75,
            "upBias": 0.3,
            "emission": "directional"
          }
        ],
        "puddle": null
      }
    },
    {
      "key": "melt_smoke",
      "base": "acid_splash",
      "patch": {
        "name": "Melt Smoke",
        "description": "ไอกัดกร่อนจากพื้นผิวละลาย",
        "tags": [
          "melt",
          "smoke",
          "acid"
        ],
        "style": "dirty",
        "palette": [
          "#defa82",
          "#89a529",
          "#ffffff"
        ],
        "config": {
          "count": 95,
          "life": 1.7,
          "speed": 40,
          "spread": 80,
          "gravity": -18,
          "depth": 140,
          "perspective": 920,
          "size": 26,
          "glow": 4,
          "turbulence": 10,
          "trail": 3,
          "blend": "screen",
          "intensity": 1,
          "duration": 1.8
        },
        "layers": [
          {
            "type": "mist",
            "countMul": 0.72,
            "sizeMul": 1.45,
            "speedMul": 0.42,
            "lifeMul": 1.15,
            "upBias": 1,
            "emission": "pool"
          },
          {
            "type": "acid",
            "countMul": 0.12,
            "sizeMul": 0.24,
            "speedMul": 0.32,
            "lifeMul": 0.9,
            "upBias": 1,
            "emission": "pool"
          },
          {
            "type": "smoke",
            "countMul": 0.18,
            "sizeMul": 1.15,
            "speedMul": 0.35,
            "lifeMul": 1.15,
            "upBias": 1,
            "emission": "pool"
          }
        ],
        "puddle": {
          "color": "#73961e",
          "alpha": 0.18,
          "rx": 80,
          "ry": 20
        }
      }
    },
    {
      "key": "acid_burst",
      "base": "acid_splash",
      "patch": {
        "name": "Acid Burst",
        "description": "กรดระเบิดออกเป็นวง",
        "tags": [
          "acid",
          "burst",
          "impact"
        ],
        "config": {
          "count": 125,
          "life": 1.0,
          "speed": 170,
          "spread": 115,
          "gravity": 180,
          "depth": 190,
          "perspective": 750,
          "size": 16,
          "glow": 8,
          "turbulence": 8,
          "trail": 4,
          "blend": "screen",
          "intensity": 1,
          "duration": 1.0
        },
        "rings": [
          {
            "life": 0.75,
            "maxR": 118,
            "color": "#d6ff6a",
            "width": 8
          }
        ],
        "puddle": null
      }
    },
    {
      "key": "toxic_acid_leak",
      "base": "acid_splash",
      "patch": {
        "name": "Toxic Acid Leak",
        "description": "กรดปนพิษรั่วช้า ๆ",
        "tags": [
          "acid",
          "toxic",
          "leak"
        ],
        "config": {
          "count": 105,
          "life": 1.9,
          "speed": 28,
          "spread": 46,
          "gravity": 120,
          "depth": 140,
          "perspective": 920,
          "size": 24,
          "glow": 4,
          "turbulence": 8,
          "trail": 4,
          "blend": "screen",
          "intensity": 1,
          "duration": 2.0
        },
        "layers": [
          {
            "type": "acid",
            "countMul": 0.28,
            "sizeMul": 0.36,
            "speedMul": 0.55,
            "lifeMul": 1.0,
            "upBias": 0.1,
            "emission": "drip"
          },
          {
            "type": "mist",
            "countMul": 0.4,
            "sizeMul": 1.2,
            "speedMul": 0.3,
            "lifeMul": 1.1,
            "upBias": 1,
            "emission": "pool"
          },
          {
            "type": "toxic",
            "countMul": 0.25,
            "sizeMul": 0.24,
            "speedMul": 0.3,
            "lifeMul": 1.0,
            "upBias": 1,
            "emission": "pool"
          }
        ],
        "puddle": {
          "color": "#729720",
          "alpha": 0.25,
          "rx": 78,
          "ry": 20
        }
      }
    },
    {
      "key": "acid_impact",
      "base": "acid_splash",
      "patch": {
        "name": "Acid Impact",
        "description": "โดนกรดกระแทก มีหยดและไอ",
        "tags": [
          "acid",
          "impact",
          "hit"
        ],
        "config": {
          "count": 110,
          "life": 0.92,
          "speed": 165,
          "spread": 72,
          "gravity": 175,
          "depth": 170,
          "perspective": 740,
          "size": 14,
          "glow": 7,
          "turbulence": 7,
          "trail": 3,
          "blend": "screen",
          "intensity": 1,
          "duration": 0.95
        },
        "layers": [
          {
            "type": "acid",
            "countMul": 0.65,
            "sizeMul": 0.45,
            "speedMul": 1.05,
            "lifeMul": 0.8,
            "upBias": 0.2,
            "emission": "forward"
          },
          {
            "type": "mist",
            "countMul": 0.28,
            "sizeMul": 1.0,
            "speedMul": 0.42,
            "lifeMul": 0.7,
            "upBias": 0.25,
            "emission": "forward"
          },
          {
            "type": "droplet",
            "countMul": 0.18,
            "sizeMul": 0.22,
            "speedMul": 1.1,
            "lifeMul": 0.6,
            "upBias": 0.1,
            "emission": "forward"
          }
        ],
        "puddle": {
          "color": "#7e9d23",
          "alpha": 0.18,
          "rx": 55,
          "ry": 12
        }
      }
    }
  ],
  "Slime": [
    {
      "key": "slime_drip",
      "base": "slime_drip",
      "patch": {}
    },
    {
      "key": "mutant_goo",
      "base": "mutant_goo",
      "patch": {}
    },
    {
      "key": "goo_splash",
      "base": "mutant_goo",
      "patch": {
        "name": "Goo Splash",
        "description": "เมือกกระเซ็นแบบแอ่ง",
        "tags": [
          "goo",
          "splash",
          "slime"
        ],
        "palette": [
          "#98ff93",
          "#3b7c42",
          "#e8ffe5"
        ],
        "config": {
          "count": 110,
          "life": 1.1,
          "speed": 145,
          "spread": 100,
          "gravity": 190,
          "depth": 170,
          "perspective": 760,
          "size": 17,
          "glow": 0,
          "turbulence": 7,
          "trail": 8,
          "blend": "source-over",
          "intensity": 1,
          "duration": 1.15
        },
        "layers": [
          {
            "type": "goo",
            "countMul": 0.75,
            "sizeMul": 0.62,
            "speedMul": 1.1,
            "lifeMul": 0.85,
            "upBias": 0.2,
            "emission": "burst"
          },
          {
            "type": "droplet",
            "countMul": 0.22,
            "sizeMul": 0.25,
            "speedMul": 1.15,
            "lifeMul": 0.65,
            "upBias": 0.1,
            "emission": "burst"
          }
        ],
        "puddle": {
          "color": "#4a8650",
          "alpha": 0.26,
          "rx": 70,
          "ry": 18
        }
      }
    },
    {
      "key": "sticky_blob",
      "base": "slime_drip",
      "patch": {
        "name": "Sticky Blob",
        "description": "ก้อนเมือกหนืดพุ่งออกไป",
        "tags": [
          "slime",
          "blob",
          "sticky"
        ],
        "config": {
          "count": 90,
          "life": 1.15,
          "speed": 120,
          "spread": 42,
          "gravity": 150,
          "depth": 150,
          "perspective": 760,
          "size": 20,
          "glow": 0,
          "turbulence": 5,
          "trail": 10,
          "blend": "source-over",
          "intensity": 1,
          "duration": 1.2
        },
        "layers": [
          {
            "type": "goo",
            "countMul": 0.55,
            "sizeMul": 0.9,
            "speedMul": 0.85,
            "lifeMul": 1.0,
            "upBias": 0.1,
            "emission": "directional"
          },
          {
            "type": "droplet",
            "countMul": 0.18,
            "sizeMul": 0.2,
            "speedMul": 1.0,
            "lifeMul": 0.7,
            "upBias": 0.1,
            "emission": "directional"
          }
        ],
        "puddle": {
          "color": "#4b8a56",
          "alpha": 0.24,
          "rx": 60,
          "ry": 16
        }
      }
    },
    {
      "key": "bio_trail",
      "base": "slime_drip",
      "patch": {
        "name": "Bio Trail",
        "description": "รอยเมือกตามทาง",
        "tags": [
          "slime",
          "trail",
          "bio"
        ],
        "config": {
          "count": 58,
          "life": 1.8,
          "speed": 42,
          "spread": 20,
          "gravity": 240,
          "depth": 90,
          "perspective": 860,
          "size": 14,
          "glow": 0,
          "turbulence": 2,
          "trail": 16,
          "blend": "source-over",
          "intensity": 1,
          "duration": 1.9
        },
        "layers": [
          {
            "type": "goo",
            "countMul": 0.55,
            "sizeMul": 0.55,
            "speedMul": 0.5,
            "lifeMul": 1.15,
            "upBias": -0.2,
            "emission": "drip"
          },
          {
            "type": "droplet",
            "countMul": 0.12,
            "sizeMul": 0.18,
            "speedMul": 0.45,
            "lifeMul": 0.65,
            "upBias": -0.2,
            "emission": "drip"
          }
        ],
        "puddle": {
          "color": "#467b51",
          "alpha": 0.26,
          "rx": 65,
          "ry": 14
        }
      }
    },
    {
      "key": "nest_ooze",
      "base": "slime_drip",
      "patch": {
        "name": "Nest Ooze",
        "description": "เมือกจากรังหรือผนังเน่า",
        "tags": [
          "nest",
          "ooze",
          "slime"
        ],
        "palette": [
          "#98ff89",
          "#376b30",
          "#f1ffe7"
        ],
        "config": {
          "count": 80,
          "life": 2.1,
          "speed": 38,
          "spread": 32,
          "gravity": 230,
          "depth": 120,
          "perspective": 860,
          "size": 18,
          "glow": 0,
          "turbulence": 4,
          "trail": 11,
          "blend": "source-over",
          "intensity": 1,
          "duration": 2.2
        },
        "layers": [
          {
            "type": "goo",
            "countMul": 0.68,
            "sizeMul": 0.85,
            "speedMul": 0.55,
            "lifeMul": 1.2,
            "upBias": -0.2,
            "emission": "drip"
          },
          {
            "type": "mist",
            "countMul": 0.12,
            "sizeMul": 0.95,
            "speedMul": 0.3,
            "lifeMul": 1.1,
            "upBias": 1,
            "emission": "pool"
          }
        ],
        "puddle": {
          "color": "#4b7b3d",
          "alpha": 0.26,
          "rx": 75,
          "ry": 16
        }
      }
    },
    {
      "key": "slime_burst",
      "base": "mutant_goo",
      "patch": {
        "name": "Slime Burst",
        "description": "เมือกระเบิดแตกเป็นชิ้น",
        "tags": [
          "slime",
          "burst",
          "impact"
        ],
        "config": {
          "count": 120,
          "life": 1.0,
          "speed": 155,
          "spread": 110,
          "gravity": 170,
          "depth": 180,
          "perspective": 760,
          "size": 17,
          "glow": 0,
          "turbulence": 8,
          "trail": 10,
          "blend": "source-over",
          "intensity": 1,
          "duration": 1.0
        },
        "layers": [
          {
            "type": "goo",
            "countMul": 0.7,
            "sizeMul": 0.65,
            "speedMul": 1.1,
            "lifeMul": 0.85,
            "upBias": 0.2,
            "emission": "burst"
          },
          {
            "type": "droplet",
            "countMul": 0.26,
            "sizeMul": 0.2,
            "speedMul": 1.1,
            "lifeMul": 0.55,
            "upBias": 0.2,
            "emission": "burst"
          },
          {
            "type": "mist",
            "countMul": 0.15,
            "sizeMul": 0.95,
            "speedMul": 0.45,
            "lifeMul": 0.7,
            "upBias": 0.3,
            "emission": "burst"
          }
        ],
        "puddle": {
          "color": "#4b8049",
          "alpha": 0.22,
          "rx": 60,
          "ry": 16
        }
      }
    },
    {
      "key": "infected_drip",
      "base": "slime_drip",
      "patch": {
        "name": "Infected Drip",
        "description": "เมือกติดเชื้อหยดลงช้า ๆ",
        "tags": [
          "infected",
          "drip",
          "slime"
        ],
        "palette": [
          "#95ff7d",
          "#4f7d22",
          "#efffd1"
        ],
        "config": {
          "count": 72,
          "life": 2.3,
          "speed": 58,
          "spread": 28,
          "gravity": 250,
          "depth": 110,
          "perspective": 880,
          "size": 18,
          "glow": 0,
          "turbulence": 3,
          "trail": 12,
          "blend": "source-over",
          "intensity": 1,
          "duration": 2.4
        },
        "layers": [
          {
            "type": "goo",
            "countMul": 0.68,
            "sizeMul": 0.9,
            "speedMul": 0.55,
            "lifeMul": 1.25,
            "upBias": -0.2,
            "emission": "drip"
          },
          {
            "type": "toxic",
            "countMul": 0.08,
            "sizeMul": 0.18,
            "speedMul": 0.3,
            "lifeMul": 1.0,
            "upBias": 1,
            "emission": "pool"
          }
        ],
        "puddle": {
          "color": "#588329",
          "alpha": 0.24,
          "rx": 68,
          "ry": 16
        }
      }
    }
  ],
  "Psychic": [
    {
      "key": "psychic_pulse",
      "base": "psychic_pulse",
      "patch": {}
    },
    {
      "key": "psionic_burst",
      "base": "psychic_pulse",
      "patch": {
        "name": "Psionic Burst",
        "description": "ระเบิดพลังจิตสั้น ๆ",
        "tags": [
          "psionic",
          "burst",
          "skill"
        ],
        "config": {
          "count": 105,
          "life": 1.0,
          "speed": 185,
          "spread": 120,
          "gravity": 60,
          "depth": 220,
          "perspective": 740,
          "size": 18,
          "glow": 22,
          "turbulence": 12,
          "trail": 4,
          "blend": "screen",
          "intensity": 1,
          "duration": 1.0
        },
        "layers": [
          {
            "type": "psychic",
            "countMul": 0.75,
            "sizeMul": 0.85,
            "speedMul": 1.0,
            "lifeMul": 0.85,
            "upBias": 0.1,
            "emission": "burst"
          },
          {
            "type": "spark",
            "countMul": 0.18,
            "sizeMul": 0.4,
            "speedMul": 1.2,
            "lifeMul": 0.45,
            "upBias": 0.1,
            "emission": "burst"
          }
        ],
        "rings": [
          {
            "life": 0.8,
            "maxR": 135,
            "color": "#ff9cff",
            "width": 10
          }
        ]
      }
    },
    {
      "key": "mind_wave",
      "base": "psychic_pulse",
      "patch": {
        "name": "Mind Wave",
        "description": "คลื่นจิตกว้าง ๆ",
        "tags": [
          "mind",
          "wave",
          "ring"
        ],
        "config": {
          "count": 95,
          "life": 1.35,
          "speed": 100,
          "spread": 360,
          "gravity": -5,
          "depth": 220,
          "perspective": 820,
          "size": 18,
          "glow": 22,
          "turbulence": 10,
          "trail": 5,
          "blend": "screen",
          "intensity": 1,
          "duration": 1.4
        },
        "layers": [
          {
            "type": "psychic",
            "countMul": 0.45,
            "sizeMul": 0.9,
            "speedMul": 0.55,
            "lifeMul": 1.0,
            "upBias": 0,
            "emission": "burst"
          },
          {
            "type": "mist",
            "countMul": 0.15,
            "sizeMul": 1.1,
            "speedMul": 0.35,
            "lifeMul": 0.9,
            "upBias": 0,
            "emission": "burst"
          }
        ],
        "rings": [
          {
            "life": 1.0,
            "maxR": 170,
            "color": "#ff9bff",
            "width": 12
          },
          {
            "life": 1.2,
            "maxR": 260,
            "color": "#8666ff",
            "width": 7
          }
        ]
      }
    },
    {
      "key": "telekinetic_orb",
      "base": "psychic_pulse",
      "patch": {
        "name": "Telekinetic Orb",
        "description": "ลูกพลังจิตลอยเรืองแสง",
        "tags": [
          "telekinesis",
          "orb",
          "projectile"
        ],
        "config": {
          "count": 85,
          "life": 1.35,
          "speed": 80,
          "spread": 40,
          "gravity": -12,
          "depth": 260,
          "perspective": 840,
          "size": 20,
          "glow": 26,
          "turbulence": 14,
          "trail": 7,
          "blend": "screen",
          "intensity": 1,
          "duration": 1.5
        },
        "layers": [
          {
            "type": "psychic",
            "countMul": 0.65,
            "sizeMul": 0.95,
            "speedMul": 0.55,
            "lifeMul": 1.0,
            "upBias": 0,
            "emission": "burst"
          },
          {
            "type": "spark",
            "countMul": 0.08,
            "sizeMul": 0.28,
            "speedMul": 0.7,
            "lifeMul": 0.45,
            "upBias": 0,
            "emission": "burst"
          }
        ],
        "rings": [
          {
            "life": 1.25,
            "maxR": 120,
            "color": "#ffb5ff",
            "width": 8
          }
        ]
      }
    },
    {
      "key": "void_ripple",
      "base": "psychic_pulse",
      "patch": {
        "name": "Void Ripple",
        "description": "คลื่นผิดปกติจากมิติ",
        "tags": [
          "void",
          "ripple",
          "anomaly"
        ],
        "config": {
          "count": 90,
          "life": 1.45,
          "speed": 95,
          "spread": 360,
          "gravity": -10,
          "depth": 280,
          "perspective": 860,
          "size": 20,
          "glow": 24,
          "turbulence": 16,
          "trail": 5,
          "blend": "screen",
          "intensity": 1,
          "duration": 1.6
        },
        "layers": [
          {
            "type": "psychic",
            "countMul": 0.42,
            "sizeMul": 0.95,
            "speedMul": 0.5,
            "lifeMul": 1.05,
            "upBias": 0,
            "emission": "burst"
          },
          {
            "type": "mist",
            "countMul": 0.18,
            "sizeMul": 1.15,
            "speedMul": 0.32,
            "lifeMul": 1.0,
            "upBias": 0,
            "emission": "burst"
          }
        ],
        "rings": [
          {
            "life": 1.2,
            "maxR": 180,
            "color": "#ef88ff",
            "width": 10
          },
          {
            "life": 1.4,
            "maxR": 280,
            "color": "#6552e6",
            "width": 6
          }
        ]
      }
    },
    {
      "key": "psi_beam",
      "base": "psychic_pulse",
      "patch": {
        "name": "Psi Beam",
        "description": "เส้นพลังจิตแบบลำแสง",
        "tags": [
          "psi",
          "beam",
          "directional"
        ],
        "config": {
          "count": 95,
          "life": 1.0,
          "speed": 140,
          "spread": 22,
          "gravity": -5,
          "depth": 220,
          "perspective": 740,
          "size": 16,
          "glow": 26,
          "turbulence": 12,
          "trail": 7,
          "blend": "screen",
          "intensity": 1,
          "duration": 1.0
        },
        "layers": [
          {
            "type": "psychic",
            "countMul": 0.35,
            "sizeMul": 0.75,
            "speedMul": 0.55,
            "lifeMul": 0.9,
            "upBias": 0,
            "emission": "directional"
          },
          {
            "type": "spark",
            "countMul": 0.08,
            "sizeMul": 0.22,
            "speedMul": 0.8,
            "lifeMul": 0.45,
            "upBias": 0,
            "emission": "directional"
          }
        ],
        "rings": [
          {
            "life": 0.8,
            "maxR": 90,
            "color": "#ffb2ff",
            "width": 8
          }
        ],
        "beam": {
          "kind": "electric",
          "segments": 7,
          "amplitude": 8,
          "from": [
            -150,
            0
          ],
          "to": [
            150,
            0
          ]
        }
      }
    },
    {
      "key": "distortion_aura",
      "base": "psychic_pulse",
      "patch": {
        "name": "Distortion Aura",
        "description": "ออร่าบิดเบือนลูปนิ่ง",
        "tags": [
          "distortion",
          "aura",
          "loop"
        ],
        "config": {
          "count": 100,
          "life": 1.7,
          "speed": 70,
          "spread": 360,
          "gravity": -8,
          "depth": 260,
          "perspective": 880,
          "size": 18,
          "glow": 20,
          "turbulence": 14,
          "trail": 5,
          "blend": "screen",
          "intensity": 1,
          "duration": 1.8
        },
        "layers": [
          {
            "type": "psychic",
            "countMul": 0.38,
            "sizeMul": 0.85,
            "speedMul": 0.4,
            "lifeMul": 1.0,
            "upBias": 0,
            "emission": "burst"
          },
          {
            "type": "mist",
            "countMul": 0.14,
            "sizeMul": 1.1,
            "speedMul": 0.28,
            "lifeMul": 1.0,
            "upBias": 0,
            "emission": "burst"
          }
        ],
        "rings": [
          {
            "life": 1.4,
            "maxR": 145,
            "color": "#ff9fff",
            "width": 10
          },
          {
            "life": 1.6,
            "maxR": 220,
            "color": "#846bff",
            "width": 6
          }
        ]
      }
    },
    {
      "key": "anomaly_push",
      "base": "psychic_pulse",
      "patch": {
        "name": "Anomaly Push",
        "description": "แรงผลักจาก anomaly",
        "tags": [
          "anomaly",
          "push",
          "pulse"
        ],
        "config": {
          "count": 110,
          "life": 1.1,
          "speed": 160,
          "spread": 130,
          "gravity": 35,
          "depth": 240,
          "perspective": 760,
          "size": 18,
          "glow": 24,
          "turbulence": 12,
          "trail": 4,
          "blend": "screen",
          "intensity": 1,
          "duration": 1.2
        },
        "layers": [
          {
            "type": "psychic",
            "countMul": 0.6,
            "sizeMul": 0.85,
            "speedMul": 0.9,
            "lifeMul": 0.85,
            "upBias": 0.1,
            "emission": "burst"
          },
          {
            "type": "spark",
            "countMul": 0.12,
            "sizeMul": 0.3,
            "speedMul": 1.0,
            "lifeMul": 0.4,
            "upBias": 0.1,
            "emission": "burst"
          }
        ],
        "rings": [
          {
            "life": 0.85,
            "maxR": 150,
            "color": "#ff9dff",
            "width": 10
          },
          {
            "life": 1.0,
            "maxR": 220,
            "color": "#8165ff",
            "width": 6
          }
        ]
      }
    }
  ],
  "Impact": [
    {
      "key": "bullet_flesh",
      "base": "bullet_flesh",
      "patch": {}
    },
    {
      "key": "bullet_metal",
      "base": "bullet_metal",
      "patch": {}
    },
    {
      "key": "bullet_concrete",
      "base": "bullet_concrete",
      "patch": {}
    },
    {
      "key": "bullet_wood",
      "base": "bullet_concrete",
      "patch": {
        "name": "Bullet Impact Wood",
        "description": "กระสุนโดนไม้",
        "tags": [
          "impact",
          "wood",
          "splinter"
        ],
        "palette": [
          "#d6af72",
          "#8c6239",
          "#fff2de"
        ],
        "config": {
          "count": 90,
          "life": 0.8,
          "speed": 215,
          "spread": 70,
          "gravity": 175,
          "depth": 150,
          "perspective": 720,
          "size": 12,
          "glow": 0,
          "turbulence": 5,
          "trail": 3,
          "blend": "source-over",
          "intensity": 1,
          "duration": 0.85
        },
        "layers": [
          {
            "type": "dust",
            "countMul": 0.65,
            "sizeMul": 0.82,
            "speedMul": 0.9,
            "lifeMul": 0.85,
            "upBias": 0.1,
            "emission": "forward"
          },
          {
            "type": "droplet",
            "countMul": 0.22,
            "sizeMul": 0.25,
            "speedMul": 1.0,
            "lifeMul": 0.55,
            "upBias": 0.1,
            "emission": "forward"
          }
        ]
      }
    },
    {
      "key": "bullet_armor",
      "base": "bullet_metal",
      "patch": {
        "name": "Bullet Impact Armor",
        "description": "กระสุนโดนเกราะ",
        "tags": [
          "impact",
          "armor",
          "spark"
        ],
        "style": "industrial",
        "palette": [
          "#fff0bf",
          "#ffb347",
          "#ffffff"
        ],
        "config": {
          "count": 82,
          "life": 0.7,
          "speed": 290,
          "spread": 62,
          "gravity": 130,
          "depth": 150,
          "perspective": 720,
          "size": 11,
          "glow": 14,
          "turbulence": 5,
          "trail": 4,
          "blend": "lighter",
          "intensity": 1,
          "duration": 0.75
        },
        "layers": [
          {
            "type": "spark",
            "countMul": 0.9,
            "sizeMul": 0.4,
            "speedMul": 1.45,
            "lifeMul": 0.55,
            "upBias": 0.1,
            "emission": "forward"
          },
          {
            "type": "dust",
            "countMul": 0.28,
            "sizeMul": 0.75,
            "speedMul": 0.55,
            "lifeMul": 0.6,
            "upBias": 0.1,
            "emission": "forward"
          }
        ]
      }
    },
    {
      "key": "ricochet_spark",
      "base": "bullet_metal",
      "patch": {
        "name": "Ricochet Spark",
        "description": "สะเก็ด ricochet เด้งเฉี่ยว",
        "tags": [
          "ricochet",
          "spark",
          "impact"
        ],
        "config": {
          "count": 65,
          "life": 0.58,
          "speed": 310,
          "spread": 45,
          "gravity": 120,
          "depth": 130,
          "perspective": 720,
          "size": 10,
          "glow": 12,
          "turbulence": 4,
          "trail": 3,
          "blend": "lighter",
          "intensity": 1,
          "duration": 0.65
        },
        "layers": [
          {
            "type": "spark",
            "countMul": 0.95,
            "sizeMul": 0.35,
            "speedMul": 1.55,
            "lifeMul": 0.5,
            "upBias": 0.1,
            "emission": "directional"
          }
        ]
      }
    },
    {
      "key": "shotgun_hit",
      "base": "bullet_flesh",
      "patch": {
        "name": "Shotgun Hit",
        "description": "โดนลูกซองกระจายกว้าง",
        "tags": [
          "shotgun",
          "impact",
          "blood"
        ],
        "config": {
          "count": 120,
          "life": 0.9,
          "speed": 190,
          "spread": 120,
          "gravity": 220,
          "depth": 160,
          "perspective": 720,
          "size": 14,
          "glow": 0,
          "turbulence": 7,
          "trail": 8,
          "blend": "source-over",
          "intensity": 1,
          "duration": 1.0
        },
        "layers": [
          {
            "type": "blood",
            "countMul": 0.72,
            "sizeMul": 0.62,
            "speedMul": 1.0,
            "lifeMul": 0.85,
            "upBias": 0.2,
            "emission": "forward"
          },
          {
            "type": "mist",
            "countMul": 0.2,
            "sizeMul": 0.8,
            "speedMul": 0.55,
            "lifeMul": 0.4,
            "upBias": 0.2,
            "emission": "forward"
          },
          {
            "type": "dust",
            "countMul": 0.12,
            "sizeMul": 0.85,
            "speedMul": 0.5,
            "lifeMul": 0.5,
            "upBias": 0.1,
            "emission": "forward"
          }
        ],
        "puddle": {
          "color": "#6c0f19",
          "alpha": 0.28,
          "rx": 62,
          "ry": 12
        }
      }
    },
    {
      "key": "laser_hit",
      "base": "bullet_metal",
      "patch": {
        "name": "Laser Hit",
        "description": "พลังงานหรือเลเซอร์กระแทก",
        "tags": [
          "laser",
          "hit",
          "energy"
        ],
        "style": "ruin",
        "palette": [
          "#9feeff",
          "#57adff",
          "#ffffff"
        ],
        "config": {
          "count": 80,
          "life": 0.7,
          "speed": 230,
          "spread": 60,
          "gravity": 90,
          "depth": 160,
          "perspective": 720,
          "size": 12,
          "glow": 16,
          "turbulence": 6,
          "trail": 3,
          "blend": "screen",
          "intensity": 1,
          "duration": 0.75
        },
        "layers": [
          {
            "type": "electric",
            "countMul": 0.32,
            "sizeMul": 0.8,
            "speedMul": 0.7,
            "lifeMul": 0.75,
            "upBias": 0.1,
            "emission": "forward"
          },
          {
            "type": "spark",
            "countMul": 0.45,
            "sizeMul": 0.35,
            "speedMul": 1.25,
            "lifeMul": 0.45,
            "upBias": 0.1,
            "emission": "forward"
          }
        ],
        "rings": [
          {
            "life": 0.55,
            "maxR": 90,
            "color": "#95e8ff",
            "width": 8
          }
        ]
      }
    },
    {
      "key": "critical_hit",
      "base": "bullet_metal",
      "patch": {
        "name": "Critical Hit",
        "description": "ฮิตแรง มีวง flash",
        "tags": [
          "critical",
          "hit",
          "burst"
        ],
        "style": "survival",
        "config": {
          "count": 95,
          "life": 0.8,
          "speed": 230,
          "spread": 95,
          "gravity": 140,
          "depth": 170,
          "perspective": 720,
          "size": 13,
          "glow": 12,
          "turbulence": 5,
          "trail": 4,
          "blend": "lighter",
          "intensity": 1,
          "duration": 0.85
        },
        "layers": [
          {
            "type": "spark",
            "countMul": 0.52,
            "sizeMul": 0.4,
            "speedMul": 1.3,
            "lifeMul": 0.5,
            "upBias": 0.1,
            "emission": "forward"
          },
          {
            "type": "blood",
            "countMul": 0.28,
            "sizeMul": 0.42,
            "speedMul": 0.95,
            "lifeMul": 0.75,
            "upBias": 0.15,
            "emission": "forward"
          },
          {
            "type": "dust",
            "countMul": 0.2,
            "sizeMul": 0.75,
            "speedMul": 0.45,
            "lifeMul": 0.55,
            "upBias": 0.1,
            "emission": "forward"
          }
        ],
        "rings": [
          {
            "life": 0.55,
            "maxR": 110,
            "color": "#fff2c6",
            "width": 10
          }
        ]
      }
    }
  ],
  "Blood": [
    {
      "key": "blood_spray",
      "base": "blood_spray",
      "patch": {}
    },
    {
      "key": "bleeding_trail",
      "base": "bleeding_trail",
      "patch": {}
    },
    {
      "key": "blood_drip",
      "base": "bleeding_trail",
      "patch": {
        "name": "Blood Drip",
        "description": "เลือดหยดช้า ๆ",
        "tags": [
          "blood",
          "drip",
          "loop"
        ],
        "config": {
          "count": 45,
          "life": 1.9,
          "speed": 42,
          "spread": 15,
          "gravity": 270,
          "depth": 90,
          "perspective": 860,
          "size": 13,
          "glow": 0,
          "turbulence": 1,
          "trail": 14,
          "blend": "source-over",
          "intensity": 1,
          "duration": 2.0
        },
        "layers": [
          {
            "type": "blood",
            "countMul": 0.55,
            "sizeMul": 0.5,
            "speedMul": 0.5,
            "lifeMul": 1.2,
            "upBias": -0.2,
            "emission": "drip"
          },
          {
            "type": "droplet",
            "countMul": 0.15,
            "sizeMul": 0.22,
            "speedMul": 0.55,
            "lifeMul": 0.7,
            "upBias": -0.2,
            "emission": "drip"
          }
        ],
        "puddle": {
          "color": "#6b0e17",
          "alpha": 0.22,
          "rx": 50,
          "ry": 10
        }
      }
    },
    {
      "key": "heavy_splatter",
      "base": "blood_spray",
      "patch": {
        "name": "Heavy Splatter",
        "description": "เลือดกระจายหนัก",
        "tags": [
          "blood",
          "splatter",
          "heavy"
        ],
        "config": {
          "count": 140,
          "life": 1.0,
          "speed": 240,
          "spread": 120,
          "gravity": 250,
          "depth": 180,
          "perspective": 740,
          "size": 16,
          "glow": 0,
          "turbulence": 8,
          "trail": 10,
          "blend": "source-over",
          "intensity": 1,
          "duration": 1.0
        },
        "layers": [
          {
            "type": "blood",
            "countMul": 0.95,
            "sizeMul": 0.62,
            "speedMul": 1.2,
            "lifeMul": 0.9,
            "upBias": 0.2,
            "emission": "burst"
          },
          {
            "type": "droplet",
            "countMul": 0.32,
            "sizeMul": 0.3,
            "speedMul": 1.25,
            "lifeMul": 0.6,
            "upBias": 0.1,
            "emission": "burst"
          }
        ],
        "puddle": {
          "color": "#6d0d18",
          "alpha": 0.36,
          "rx": 76,
          "ry": 15
        }
      }
    },
    {
      "key": "wound_drip",
      "base": "bleeding_trail",
      "patch": {
        "name": "Wound Drip",
        "description": "เลือดไหลจากบาดแผล",
        "tags": [
          "wound",
          "drip",
          "blood"
        ],
        "config": {
          "count": 55,
          "life": 1.9,
          "speed": 40,
          "spread": 16,
          "gravity": 255,
          "depth": 90,
          "perspective": 860,
          "size": 13,
          "glow": 0,
          "turbulence": 1,
          "trail": 15,
          "blend": "source-over",
          "intensity": 1,
          "duration": 2.0
        },
        "layers": [
          {
            "type": "blood",
            "countMul": 0.5,
            "sizeMul": 0.52,
            "speedMul": 0.5,
            "lifeMul": 1.15,
            "upBias": -0.2,
            "emission": "drip"
          },
          {
            "type": "droplet",
            "countMul": 0.12,
            "sizeMul": 0.22,
            "speedMul": 0.55,
            "lifeMul": 0.65,
            "upBias": -0.2,
            "emission": "drip"
          }
        ],
        "puddle": {
          "color": "#690d18",
          "alpha": 0.2,
          "rx": 48,
          "ry": 10
        }
      }
    },
    {
      "key": "pool_spatter",
      "base": "blood_spray",
      "patch": {
        "name": "Pool Spatter",
        "description": "แอ่งเลือดกระเด็น",
        "tags": [
          "blood",
          "pool",
          "spatter"
        ],
        "config": {
          "count": 95,
          "life": 0.95,
          "speed": 170,
          "spread": 95,
          "gravity": 220,
          "depth": 160,
          "perspective": 740,
          "size": 14,
          "glow": 0,
          "turbulence": 5,
          "trail": 8,
          "blend": "source-over",
          "intensity": 1,
          "duration": 1.0
        },
        "layers": [
          {
            "type": "blood",
            "countMul": 0.78,
            "sizeMul": 0.58,
            "speedMul": 1.0,
            "lifeMul": 0.85,
            "upBias": 0.2,
            "emission": "burst"
          },
          {
            "type": "droplet",
            "countMul": 0.25,
            "sizeMul": 0.22,
            "speedMul": 1.05,
            "lifeMul": 0.6,
            "upBias": 0.1,
            "emission": "burst"
          }
        ],
        "puddle": {
          "color": "#6b0d18",
          "alpha": 0.34,
          "rx": 82,
          "ry": 16
        }
      }
    },
    {
      "key": "slash_blood",
      "base": "blood_spray",
      "patch": {
        "name": "Slash Blood",
        "description": "เลือดจากการฟันเป็นเส้น",
        "tags": [
          "blood",
          "slash",
          "melee"
        ],
        "config": {
          "count": 100,
          "life": 0.85,
          "speed": 205,
          "spread": 48,
          "gravity": 230,
          "depth": 160,
          "perspective": 740,
          "size": 14,
          "glow": 0,
          "turbulence": 4,
          "trail": 10,
          "blend": "source-over",
          "intensity": 1,
          "duration": 0.9
        },
        "layers": [
          {
            "type": "blood",
            "countMul": 0.7,
            "sizeMul": 0.5,
            "speedMul": 1.1,
            "lifeMul": 0.8,
            "upBias": 0.1,
            "emission": "directional"
          },
          {
            "type": "droplet",
            "countMul": 0.18,
            "sizeMul": 0.22,
            "speedMul": 1.2,
            "lifeMul": 0.55,
            "upBias": 0.1,
            "emission": "directional"
          }
        ],
        "puddle": {
          "color": "#6c0f19",
          "alpha": 0.28,
          "rx": 62,
          "ry": 12
        }
      }
    },
    {
      "key": "arterial_burst",
      "base": "blood_spray",
      "patch": {
        "name": "Arterial Burst",
        "description": "เลือดพุ่งแรงเป็น burst",
        "tags": [
          "blood",
          "burst",
          "critical"
        ],
        "config": {
          "count": 120,
          "life": 0.95,
          "speed": 250,
          "spread": 70,
          "gravity": 240,
          "depth": 170,
          "perspective": 730,
          "size": 15,
          "glow": 0,
          "turbulence": 5,
          "trail": 12,
          "blend": "source-over",
          "intensity": 1,
          "duration": 1.0
        },
        "layers": [
          {
            "type": "blood",
            "countMul": 0.82,
            "sizeMul": 0.58,
            "speedMul": 1.25,
            "lifeMul": 0.8,
            "upBias": 0.1,
            "emission": "directional"
          },
          {
            "type": "droplet",
            "countMul": 0.25,
            "sizeMul": 0.22,
            "speedMul": 1.35,
            "lifeMul": 0.55,
            "upBias": 0.1,
            "emission": "directional"
          }
        ],
        "puddle": {
          "color": "#6a0e17",
          "alpha": 0.32,
          "rx": 70,
          "ry": 14
        }
      }
    }
  ],
  "Explosion": [
    {
      "key": "dust_explosion",
      "base": "dust_explosion",
      "patch": {}
    },
    {
      "key": "fuel_explosion",
      "base": "dust_explosion",
      "patch": {
        "name": "Fuel Explosion",
        "description": "ไฟลุกแรงพร้อมควันดำ",
        "tags": [
          "fuel",
          "explosion",
          "fire"
        ],
        "palette": [
          "#ffd36a",
          "#ff6720",
          "#2b170d"
        ],
        "config": {
          "count": 190,
          "life": 1.35,
          "speed": 240,
          "spread": 360,
          "gravity": 130,
          "depth": 260,
          "perspective": 760,
          "size": 24,
          "glow": 24,
          "turbulence": 16,
          "trail": 4,
          "blend": "lighter",
          "intensity": 1.05,
          "duration": 1.4
        },
        "layers": [
          {
            "type": "fire",
            "countMul": 0.65,
            "sizeMul": 0.95,
            "speedMul": 1.05,
            "lifeMul": 0.9,
            "upBias": 0.1,
            "emission": "burst"
          },
          {
            "type": "smoke",
            "countMul": 0.4,
            "sizeMul": 1.55,
            "speedMul": 0.45,
            "lifeMul": 1.2,
            "upBias": 0.4,
            "emission": "burst"
          },
          {
            "type": "ember",
            "countMul": 0.16,
            "sizeMul": 0.32,
            "speedMul": 1.4,
            "lifeMul": 0.45,
            "upBias": 0.1,
            "emission": "burst"
          }
        ],
        "rings": [
          {
            "life": 1.0,
            "maxR": 220,
            "color": "#ffb45b",
            "width": 16
          }
        ]
      }
    },
    {
      "key": "fireball_blast",
      "base": "dust_explosion",
      "patch": {
        "name": "Fireball Blast",
        "description": "ไฟบอลระเบิดกลางอากาศ",
        "tags": [
          "fireball",
          "blast",
          "magic"
        ],
        "palette": [
          "#ffd979",
          "#ff6e24",
          "#ffffff"
        ],
        "config": {
          "count": 165,
          "life": 1.1,
          "speed": 220,
          "spread": 360,
          "gravity": 90,
          "depth": 280,
          "perspective": 760,
          "size": 22,
          "glow": 28,
          "turbulence": 12,
          "trail": 4,
          "blend": "lighter",
          "intensity": 1.05,
          "duration": 1.15
        },
        "layers": [
          {
            "type": "fire",
            "countMul": 0.72,
            "sizeMul": 0.95,
            "speedMul": 1.1,
            "lifeMul": 0.85,
            "upBias": 0.1,
            "emission": "burst"
          },
          {
            "type": "ember",
            "countMul": 0.16,
            "sizeMul": 0.28,
            "speedMul": 1.35,
            "lifeMul": 0.45,
            "upBias": 0.1,
            "emission": "burst"
          }
        ],
        "rings": [
          {
            "life": 0.85,
            "maxR": 180,
            "color": "#ffd376",
            "width": 14
          }
        ]
      }
    },
    {
      "key": "grenade_burst",
      "base": "dust_explosion",
      "patch": {
        "name": "Grenade Burst",
        "description": "ระเบิดลูกเกรเนด มีฝุ่นและสะเก็ด",
        "tags": [
          "grenade",
          "burst",
          "debris"
        ],
        "style": "survival",
        "palette": [
          "#e8c689",
          "#82623b",
          "#e9ddc6"
        ],
        "config": {
          "count": 155,
          "life": 1.0,
          "speed": 230,
          "spread": 360,
          "gravity": 165,
          "depth": 220,
          "perspective": 760,
          "size": 20,
          "glow": 6,
          "turbulence": 12,
          "trail": 3,
          "blend": "screen",
          "intensity": 1,
          "duration": 1.1
        },
        "layers": [
          {
            "type": "dust",
            "countMul": 0.82,
            "sizeMul": 1.0,
            "speedMul": 0.85,
            "lifeMul": 0.95,
            "upBias": 0,
            "emission": "burst"
          },
          {
            "type": "spark",
            "countMul": 0.15,
            "sizeMul": 0.35,
            "speedMul": 1.15,
            "lifeMul": 0.45,
            "upBias": 0,
            "emission": "burst"
          },
          {
            "type": "smoke",
            "countMul": 0.2,
            "sizeMul": 1.25,
            "speedMul": 0.4,
            "lifeMul": 1.05,
            "upBias": 0.3,
            "emission": "burst"
          }
        ],
        "rings": [
          {
            "life": 0.85,
            "maxR": 160,
            "color": "#e4c381",
            "width": 12
          }
        ]
      }
    },
    {
      "key": "debris_blast",
      "base": "dust_explosion",
      "patch": {
        "name": "Debris Blast",
        "description": "ระเบิดเศษซากกระเด็น",
        "tags": [
          "debris",
          "blast",
          "ruin"
        ],
        "palette": [
          "#d8c5ab",
          "#74624c",
          "#f1e8db"
        ],
        "config": {
          "count": 150,
          "life": 1.0,
          "speed": 220,
          "spread": 360,
          "gravity": 180,
          "depth": 220,
          "perspective": 760,
          "size": 18,
          "glow": 0,
          "turbulence": 10,
          "trail": 3,
          "blend": "source-over",
          "intensity": 1,
          "duration": 1.1
        },
        "layers": [
          {
            "type": "dust",
            "countMul": 0.88,
            "sizeMul": 0.95,
            "speedMul": 0.85,
            "lifeMul": 0.95,
            "upBias": 0,
            "emission": "burst"
          },
          {
            "type": "droplet",
            "countMul": 0.18,
            "sizeMul": 0.18,
            "speedMul": 1.1,
            "lifeMul": 0.55,
            "upBias": 0,
            "emission": "burst"
          }
        ],
        "rings": [
          {
            "life": 0.8,
            "maxR": 145,
            "color": "#e3d0b4",
            "width": 10
          }
        ]
      }
    },
    {
      "key": "shockwave_blast",
      "base": "dust_explosion",
      "patch": {
        "name": "Shockwave Blast",
        "description": "คลื่นกระแทกเน้น ring",
        "tags": [
          "shockwave",
          "blast",
          "ring"
        ],
        "style": "survival",
        "palette": [
          "#ffe8b0",
          "#ffbc58",
          "#ffffff"
        ],
        "config": {
          "count": 95,
          "life": 0.9,
          "speed": 170,
          "spread": 360,
          "gravity": 30,
          "depth": 180,
          "perspective": 780,
          "size": 16,
          "glow": 12,
          "turbulence": 6,
          "trail": 2,
          "blend": "screen",
          "intensity": 1,
          "duration": 1.0
        },
        "layers": [
          {
            "type": "dust",
            "countMul": 0.32,
            "sizeMul": 0.75,
            "speedMul": 0.6,
            "lifeMul": 0.7,
            "upBias": 0,
            "emission": "burst"
          },
          {
            "type": "spark",
            "countMul": 0.12,
            "sizeMul": 0.28,
            "speedMul": 1.0,
            "lifeMul": 0.4,
            "upBias": 0,
            "emission": "burst"
          }
        ],
        "rings": [
          {
            "life": 0.9,
            "maxR": 250,
            "color": "#ffe6b3",
            "width": 18
          },
          {
            "life": 0.8,
            "maxR": 180,
            "color": "#ffbc5e",
            "width": 8
          }
        ]
      }
    },
    {
      "key": "mine_pop",
      "base": "dust_explosion",
      "patch": {
        "name": "Mine Pop",
        "description": "ระเบิดกับระเบิดขนาดเล็ก",
        "tags": [
          "mine",
          "pop",
          "explosion"
        ],
        "style": "survival",
        "palette": [
          "#f0c98a",
          "#8f6232",
          "#f3e5cc"
        ],
        "config": {
          "count": 120,
          "life": 0.85,
          "speed": 200,
          "spread": 360,
          "gravity": 170,
          "depth": 180,
          "perspective": 760,
          "size": 17,
          "glow": 5,
          "turbulence": 8,
          "trail": 2,
          "blend": "screen",
          "intensity": 1,
          "duration": 0.9
        },
        "layers": [
          {
            "type": "dust",
            "countMul": 0.78,
            "sizeMul": 0.95,
            "speedMul": 0.8,
            "lifeMul": 0.8,
            "upBias": 0,
            "emission": "burst"
          },
          {
            "type": "spark",
            "countMul": 0.16,
            "sizeMul": 0.32,
            "speedMul": 1.1,
            "lifeMul": 0.4,
            "upBias": 0,
            "emission": "burst"
          }
        ],
        "rings": [
          {
            "life": 0.7,
            "maxR": 130,
            "color": "#e7c68c",
            "width": 10
          }
        ]
      }
    },
    {
      "key": "barrel_blast",
      "base": "dust_explosion",
      "patch": {
        "name": "Barrel Blast",
        "description": "ถังระเบิด",
        "tags": [
          "barrel",
          "blast",
          "fire"
        ],
        "palette": [
          "#ffd06f",
          "#ff6e23",
          "#2e1b10"
        ],
        "config": {
          "count": 180,
          "life": 1.2,
          "speed": 235,
          "spread": 360,
          "gravity": 140,
          "depth": 240,
          "perspective": 760,
          "size": 22,
          "glow": 22,
          "turbulence": 14,
          "trail": 4,
          "blend": "lighter",
          "intensity": 1.1,
          "duration": 1.25
        },
        "layers": [
          {
            "type": "fire",
            "countMul": 0.55,
            "sizeMul": 0.9,
            "speedMul": 1.0,
            "lifeMul": 0.8,
            "upBias": 0.1,
            "emission": "burst"
          },
          {
            "type": "smoke",
            "countMul": 0.35,
            "sizeMul": 1.45,
            "speedMul": 0.45,
            "lifeMul": 1.15,
            "upBias": 0.4,
            "emission": "burst"
          },
          {
            "type": "ember",
            "countMul": 0.14,
            "sizeMul": 0.28,
            "speedMul": 1.3,
            "lifeMul": 0.45,
            "upBias": 0.1,
            "emission": "burst"
          },
          {
            "type": "dust",
            "countMul": 0.42,
            "sizeMul": 1.0,
            "speedMul": 0.7,
            "lifeMul": 0.85,
            "upBias": 0,
            "emission": "burst"
          }
        ],
        "rings": [
          {
            "life": 0.95,
            "maxR": 210,
            "color": "#ffb45b",
            "width": 16
          }
        ]
      }
    }
  ],
  "Smoke": [
    {
      "key": "smoke_plume",
      "base": "smoke_plume",
      "patch": {}
    },
    {
      "key": "black_smoke",
      "base": "smoke_plume",
      "patch": {
        "name": "Black Smoke",
        "description": "ควันดำเข้มจากไฟไหม้",
        "tags": [
          "black",
          "smoke",
          "fire"
        ],
        "style": "dirty",
        "palette": [
          "#8b9098",
          "#2a2e33",
          "#d2d7de"
        ],
        "config": {
          "count": 130,
          "life": 2.6,
          "speed": 38,
          "spread": 54,
          "gravity": -35,
          "depth": 140,
          "perspective": 980,
          "size": 46,
          "glow": 0,
          "turbulence": 16,
          "trail": 3,
          "blend": "source-over",
          "intensity": 1,
          "duration": 2.8
        },
        "layers": [
          {
            "type": "smoke",
            "countMul": 1.0,
            "sizeMul": 1.9,
            "speedMul": 0.48,
            "lifeMul": 1.35,
            "upBias": 1,
            "emission": "cone"
          }
        ]
      }
    },
    {
      "key": "ash_drift",
      "base": "smoke_plume",
      "patch": {
        "name": "Ash Drift",
        "description": "เถ้าถ่านลอยช้า ๆ",
        "tags": [
          "ash",
          "drift",
          "ambient"
        ],
        "style": "dirty",
        "palette": [
          "#d0d2d5",
          "#6c6e73",
          "#ffffff"
        ],
        "config": {
          "count": 110,
          "life": 2.4,
          "speed": 22,
          "spread": 80,
          "gravity": -12,
          "depth": 160,
          "perspective": 1000,
          "size": 24,
          "glow": 0,
          "turbulence": 8,
          "trail": 2,
          "blend": "source-over",
          "intensity": 1,
          "duration": 2.5
        },
        "layers": [
          {
            "type": "dust",
            "countMul": 0.42,
            "sizeMul": 0.55,
            "speedMul": 0.4,
            "lifeMul": 1.2,
            "upBias": 1,
            "emission": "pool"
          },
          {
            "type": "smoke",
            "countMul": 0.25,
            "sizeMul": 1.2,
            "speedMul": 0.28,
            "lifeMul": 1.2,
            "upBias": 1,
            "emission": "pool"
          }
        ]
      }
    },
    {
      "key": "steam_vent",
      "base": "smoke_plume",
      "patch": {
        "name": "Steam Vent",
        "description": "ไอน้ำจากท่อหรือรอยรั่ว",
        "tags": [
          "steam",
          "vent",
          "pipe"
        ],
        "style": "industrial",
        "palette": [
          "#f8ffff",
          "#bacad4",
          "#ffffff"
        ],
        "config": {
          "count": 110,
          "life": 1.9,
          "speed": 55,
          "spread": 30,
          "gravity": -28,
          "depth": 130,
          "perspective": 960,
          "size": 30,
          "glow": 2,
          "turbulence": 10,
          "trail": 2,
          "blend": "screen",
          "intensity": 1,
          "duration": 2.0
        },
        "layers": [
          {
            "type": "mist",
            "countMul": 0.95,
            "sizeMul": 1.55,
            "speedMul": 0.5,
            "lifeMul": 1.2,
            "upBias": 1,
            "emission": "cone"
          }
        ]
      }
    },
    {
      "key": "dust_puff",
      "base": "smoke_plume",
      "patch": {
        "name": "Dust Puff",
        "description": "ฝุ่นลอยตอนกระแทกพื้น",
        "tags": [
          "dust",
          "puff",
          "impact"
        ],
        "style": "dirty",
        "palette": [
          "#d8ceb9",
          "#8b7d68",
          "#f2ebdf"
        ],
        "config": {
          "count": 95,
          "life": 1.0,
          "speed": 120,
          "spread": 120,
          "gravity": 120,
          "depth": 150,
          "perspective": 760,
          "size": 18,
          "glow": 0,
          "turbulence": 8,
          "trail": 2,
          "blend": "source-over",
          "intensity": 1,
          "duration": 1.05
        },
        "layers": [
          {
            "type": "dust",
            "countMul": 0.9,
            "sizeMul": 1.15,
            "speedMul": 0.65,
            "lifeMul": 0.9,
            "upBias": 0.1,
            "emission": "burst"
          }
        ]
      }
    },
    {
      "key": "ruin_debris",
      "base": "smoke_plume",
      "patch": {
        "name": "Ruin Debris Smoke",
        "description": "ฝุ่นจากอาคารถล่ม",
        "tags": [
          "ruin",
          "debris",
          "smoke"
        ],
        "style": "dirty",
        "palette": [
          "#d4cdc3",
          "#72675c",
          "#eee6dc"
        ],
        "config": {
          "count": 125,
          "life": 1.7,
          "speed": 110,
          "spread": 140,
          "gravity": 110,
          "depth": 170,
          "perspective": 760,
          "size": 24,
          "glow": 0,
          "turbulence": 10,
          "trail": 3,
          "blend": "source-over",
          "intensity": 1,
          "duration": 1.8
        },
        "layers": [
          {
            "type": "dust",
            "countMul": 0.8,
            "sizeMul": 1.1,
            "speedMul": 0.75,
            "lifeMul": 1.0,
            "upBias": 0.1,
            "emission": "burst"
          },
          {
            "type": "smoke",
            "countMul": 0.3,
            "sizeMul": 1.35,
            "speedMul": 0.35,
            "lifeMul": 1.1,
            "upBias": 0.3,
            "emission": "burst"
          }
        ]
      }
    },
    {
      "key": "embers_smoke",
      "base": "smoke_plume",
      "patch": {
        "name": "Embers Smoke",
        "description": "ควันพร้อมสะเก็ดไฟ",
        "tags": [
          "embers",
          "smoke",
          "fire"
        ],
        "style": "dirty",
        "palette": [
          "#c9cdd2",
          "#565a60",
          "#ffbc5f"
        ],
        "config": {
          "count": 115,
          "life": 2.2,
          "speed": 45,
          "spread": 55,
          "gravity": -32,
          "depth": 150,
          "perspective": 980,
          "size": 40,
          "glow": 6,
          "turbulence": 12,
          "trail": 3,
          "blend": "source-over",
          "intensity": 1,
          "duration": 2.3
        },
        "layers": [
          {
            "type": "smoke",
            "countMul": 0.85,
            "sizeMul": 1.7,
            "speedMul": 0.48,
            "lifeMul": 1.25,
            "upBias": 1,
            "emission": "cone"
          },
          {
            "type": "ember",
            "countMul": 0.14,
            "sizeMul": 0.32,
            "speedMul": 0.85,
            "lifeMul": 0.35,
            "upBias": 1,
            "emission": "cone"
          }
        ]
      }
    },
    {
      "key": "toxic_haze",
      "base": "smoke_plume",
      "patch": {
        "name": "Toxic Haze",
        "description": "หมอกควันพิษบาง ๆ",
        "tags": [
          "toxic",
          "haze",
          "ambient"
        ],
        "style": "mutant",
        "palette": [
          "#b8d57e",
          "#5c7035",
          "#f5ffe3"
        ],
        "config": {
          "count": 125,
          "life": 2.3,
          "speed": 25,
          "spread": 100,
          "gravity": -14,
          "depth": 180,
          "perspective": 1000,
          "size": 28,
          "glow": 2,
          "turbulence": 10,
          "trail": 3,
          "blend": "screen",
          "intensity": 1,
          "duration": 2.4
        },
        "layers": [
          {
            "type": "mist",
            "countMul": 0.75,
            "sizeMul": 1.4,
            "speedMul": 0.35,
            "lifeMul": 1.2,
            "upBias": 1,
            "emission": "pool"
          },
          {
            "type": "toxic",
            "countMul": 0.18,
            "sizeMul": 0.28,
            "speedMul": 0.35,
            "lifeMul": 1.0,
            "upBias": 1,
            "emission": "pool"
          }
        ],
        "puddle": {
          "color": "#647c37",
          "alpha": 0.12,
          "rx": 92,
          "ry": 24
        }
      }
    }
  ]
};
  for (const [category, entries] of Object.entries(LIB)) {
    CATEGORIES[category] = [];
    for (const entry of entries) {
      upsertPreset(entry.key, entry.base, Object.assign({category}, entry.patch || {}));
      PRESETS[entry.key].category = category;
      CATEGORIES[category].push(entry.key);
    }
  }
})();

const STYLE_PRESETS = {
  dirty:{name:'Dirty', tint:null, contrast:1.0, roughness:1.1, glowMul:1.0, alphaMul:1.0},
  industrial:{name:'Industrial', tint:'#d0e0ff', contrast:1.02, roughness:0.95, glowMul:1.05, alphaMul:0.95},
  mutant:{name:'Mutant / Biohazard', tint:'#b7ff8a', contrast:1.06, roughness:1.15, glowMul:1.1, alphaMul:1.0},
  survival:{name:'Military / Survival', tint:'#ffe1c6', contrast:1.0, roughness:1.05, glowMul:0.92, alphaMul:0.98},
  ruin:{name:'Sci-fi Ruin', tint:'#c8d7ff', contrast:1.07, roughness:0.9, glowMul:1.18, alphaMul:1.0}
};

let cfg = {};
let particles = [];
let rings = [];
let beams = [];
let puddles = [];
let playing = true;
let simTime = 0;
let last = performance.now();

function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function hexToRgb(hex){let h=hex.replace('#',''); if(h.length===3) h=h.split('').map(c=>c+c).join(''); const n=parseInt(h,16); return {r:(n>>16)&255,g:(n>>8)&255,b:n&255}}
function rgbToStr(rgb,a=1){return `rgba(${rgb.r|0},${rgb.g|0},${rgb.b|0},${a})`}
function lerp(a,b,t){return a+(b-a)*t}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function mixColor(c1,c2,t){return {r:lerp(c1.r,c2.r,t),g:lerp(c1.g,c2.g,t),b:lerp(c1.b,c2.b,t)}}
function applyTint(rgb, tint, amount=.14){ if(!tint) return rgb; return mixColor(rgb,hexToRgb(tint),amount); }
function colorPalette(){ return [hexToRgb($('color1').value), hexToRgb($('color2').value), hexToRgb($('color3').value)] }

// Cached glow sprites: build a tiny halo once, then reuse drawImage for every
// particle. This avoids Canvas2D shadowBlur and avoids creating an extra
// gradient for every glowing particle on every frame.
const glowSpriteCache = new Map();
function getGlowSprite(rgb, glow){
  const bucket = Math.max(1, Math.min(12, Math.round(glow / 5)));
  const key = `${rgb.r|0},${rgb.g|0},${rgb.b|0}:${bucket}`;
  if(glowSpriteCache.has(key)) return glowSpriteCache.get(key);
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const gctx = c.getContext('2d');
  const radius = 30;
  const g = gctx.createRadialGradient(32,32,0,32,32,radius);
  const strength = .26 + bucket * .025;
  g.addColorStop(0, `rgba(${rgb.r|0},${rgb.g|0},${rgb.b|0},${Math.min(.58,strength)})`);
  g.addColorStop(.32, `rgba(${rgb.r|0},${rgb.g|0},${rgb.b|0},${Math.min(.28,strength*.48)})`);
  g.addColorStop(1, `rgba(${rgb.r|0},${rgb.g|0},${rgb.b|0},0)`);
  gctx.fillStyle = g;
  gctx.fillRect(0,0,64,64);
  glowSpriteCache.set(key,c);
  return c;
}

function syncLabels(){
  [['intensity','intensityVal','×'],['count','countVal',''],['life','lifeVal',' s'],['speed','speedVal',' px/s'],['spread','spreadVal','°'],
   ['gravity','gravityVal',''],['depth','depthVal',''],['perspective','perspectiveVal',''],['size','sizeVal',' px'],
   ['glow','glowVal',''],['turbulence','turbulenceVal',''],['trail','trailVal','']].forEach(([a,b,s])=>$(b).textContent=$(a).value+s);
  $('timeline').max=$('duration').value;
}

function populateCategorySelect(){
  $('category').innerHTML = Object.keys(CATEGORIES).map(k=>`<option>${k}</option>`).join('');
}
function populatePresetSelect(category){
  const list = CATEGORIES[category] || [];
  $('preset').innerHTML = list.map(k=>`<option value="${k}">${PRESETS[k].name}</option>`).join('');
}
function setPresetInfo(key){
  const p = PRESETS[key];
  $('presetInfo').innerHTML = `
    <div><b>${p.name}</b></div>
    <div style="margin-top:6px">${p.description}</div>
    <div style="margin-top:8px"><b>Category:</b> <code class="badge">${p.category}</code></div>
    <div style="margin-top:6px"><b>Tags:</b> ${p.tags.map(t=>`<code class="badge">${t}</code>`).join(' ')}</div>
    <div style="margin-top:8px"><b>Layers:</b> ${p.layers.map(l=>l.type).join(', ')}${p.beam ? ', beam' : ''}${p.rings?.length ? ', rings' : ''}${p.puddle ? ', puddle' : ''}</div>
  `;
}
function loadPresetIntoControls(key){
  const p = PRESETS[key];
  const c = p.config;
  $('stylePack').value = p.style || 'dirty';
  $('count').value = c.count;
  $('life').value = c.life;
  $('speed').value = c.speed;
  $('spread').value = c.spread;
  $('gravity').value = c.gravity;
  $('depth').value = c.depth;
  $('perspective').value = c.perspective;
  $('size').value = c.size;
  $('glow').value = c.glow;
  $('turbulence').value = c.turbulence;
  $('trail').value = c.trail;
  $('blend').value = c.blend;
  $('intensity').value = c.intensity;
  $('duration').value = c.duration;
  $('color1').value = p.palette[0];
  $('color2').value = p.palette[1];
  $('color3').value = p.palette[2];
  syncLabels();
  setPresetInfo(key);
  $('badge').textContent = `${p.name} / ${STYLE_PRESETS[$('stylePack').value].name}`;
}
function readCfg(){
  cfg = {
    preset:$('preset').value,
    stylePack:$('stylePack').value,
    seed:+$('seed').value || 1,
    count:+$('count').value,
    life:+$('life').value,
    speed:+$('speed').value,
    spread:+$('spread').value,
    gravity:+$('gravity').value,
    depth:+$('depth').value,
    perspective:+$('perspective').value,
    size:+$('size').value,
    glow:+$('glow').value,
    turbulence:+$('turbulence').value,
    trail:+$('trail').value,
    blend:$('blend').value,
    intensity:+$('intensity').value,
    duration:+$('duration').value,
    showGround:$('showGround').checked,
    showDecal:$('showDecal').checked
  };
}
function styleModValue(baseName, fallback){
  const p = PRESETS[cfg.preset].config;
  return (p[baseName] ?? fallback);
}
function emissionAngle(rnd, layer){
  const spreadRad = cfg.spread * Math.PI/180;
  switch(layer.emission){
    case 'cone': return -Math.PI/2 + (rnd()-.5)*spreadRad;
    case 'pool': return -Math.PI/2 + (rnd()-.5)*(spreadRad*.55);
    case 'drip': return Math.PI/2 + (rnd()-.5)*(spreadRad*.25);
    case 'forward': return (rnd()-.5)*(spreadRad*.65);
    case 'directional': return -0.2 + (rnd()-.5)*(spreadRad*.18);
    default: return (rnd()-.5)*spreadRad;
  }
}
function spawnParticle(layer, rnd, palette, style){
  const a = emissionAngle(rnd, layer);
  const sp = cfg.speed * layer.speedMul * cfg.intensity * (.55 + rnd()*.85);
  const z = (rnd()-.5) * cfg.depth;
  const vz = (rnd()-.5) * cfg.speed * .35;
  const life = cfg.life * layer.lifeMul * (.7 + rnd()*.7);
  const base = cfg.size * layer.sizeMul * (.55 + rnd()*.9);
  let x=0, y=0;
  if(layer.emission==='pool'){ x=(rnd()-.5)*60; y=(rnd()-.5)*16; }
  if(layer.emission==='drip'){ x=(rnd()-.5)*30; y=-120 + rnd()*35; }
  if(layer.emission==='directional'){ x=-160 + rnd()*10; y=-50 + rnd()*24; }
  const p = {
    type:layer.type, x,y,z,
    vx:Math.cos(a)*sp, vy:Math.sin(a)*sp - (cfg.speed * .35 * layer.upBias),
    vz, life, age:0, base, rot:rnd()*Math.PI*2, spin:(rnd()-.5)*8, seed:rnd(),
    c1:palette[0], c2:palette[1], c3:palette[2],
    history:[], roughness:style.roughness, alphaMul:style.alphaMul
  };
  if(layer.type==='stream'){ p.vx += 120; p.vy -= 15; }
  if(layer.type==='electric'){ p.life *= .85; p.vx *= .7; p.vy *= .7; }
  if(layer.type==='mist' || layer.type==='smoke'){ p.vx *= .5; p.vy *= .5; }
  return p;
}
function spawnAll(){
  readCfg();
  particles = []; rings = []; beams = []; puddles = [];
  const preset = PRESETS[cfg.preset];
  const style = STYLE_PRESETS[cfg.stylePack];
  const rnd = mulberry32(cfg.seed);
  const palette = colorPalette();

  for(const layer of preset.layers){
    const total = Math.max(1, Math.round(cfg.count * layer.countMul * cfg.intensity));
    for(let i=0;i<total;i++) particles.push(spawnParticle(layer, rnd, palette, style));
  }
  if(preset.rings){
    preset.rings.forEach(r=>rings.push({
      age:0, life:r.life * cfg.intensity, maxR:r.maxR * (.8 + cfg.intensity*.2), color:r.color, width:r.width
    }));
  }
  if(preset.beam){
    beams.push({...preset.beam, age:0, life:Math.max(.25, cfg.life*.8)});
  }
  if(preset.puddle){
    puddles.push({...preset.puddle});
  }
}
function restart(){ simTime = 0; spawnAll(); $('timeline').value = 0; setPresetInfo(cfg.preset || $('preset').value); }
function step(dt){
  simTime += dt;
  for(const p of particles){
    p.age += dt;
    const t = p.age / p.life;
    const swirl = Math.sin((p.seed*10 + p.age*4))*cfg.turbulence*0.5;
    if(['mist','smoke','rad','toxic'].includes(p.type)){ p.vx += swirl * dt * .35; p.vz += Math.cos(p.age*4+p.seed*7)*cfg.turbulence*dt*.12; }
    if(['psychic','electric'].includes(p.type)){ p.vx += Math.sin(p.age*16+p.seed*12)*cfg.turbulence*dt*.22; p.vy += Math.cos(p.age*18+p.seed*9)*cfg.turbulence*dt*.18; }
    p.vy += cfg.gravity * dt;
    p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.rot += p.spin * dt;
    if(['smoke','mist','toxic'].includes(p.type)){ p.vx *= Math.pow(.992, dt*60); p.vy *= Math.pow(.995, dt*60); }
    if(['goo','blood','acid','droplet'].includes(p.type) && p.y > 175){ p.vx *= .92; p.vy *= -.22; }
    if(cfg.trail > 0 && ['blood','goo','acid','spark','psychic','stream'].includes(p.type)){
      p.history.push({x:p.x,y:p.y,z:p.z,age:p.age});
      if(p.history.length > cfg.trail) p.history.shift();
    }
  }
  for(const r of rings) r.age += dt;
  for(const b of beams) b.age += dt;
}
function project(p,w,h){
  const denom = Math.max(80, cfg.perspective + p.z);
  const s = cfg.perspective / denom;
  return {x:w/2 + p.x*s, y:h/2 + p.y*s, s};
}
function colorForParticle(p,t){
  let col;
  switch(p.type){
    case 'fire': col = mixColor(p.c1, p.c2, t*.85); break;
    case 'ember': col = mixColor(p.c1, p.c2, .55+t*.25); break;
    case 'smoke': col = mixColor(p.c2, p.c3, .2+t*.4); break;
    case 'mist': col = mixColor(p.c1, p.c3, .35+t*.2); break;
    case 'droplet': col = mixColor(p.c1, p.c3, .25); break;
    case 'stream': col = mixColor(p.c1, p.c3, .35); break;
    case 'spark': col = mixColor(p.c1, p.c3, .3); break;
    case 'dust': col = mixColor(p.c1, p.c2, .55); break;
    case 'frost': col = mixColor(p.c1, p.c3, .4); break;
    case 'rad': col = mixColor(p.c1, p.c2, .35); break;
    case 'toxic': col = mixColor(p.c1, p.c3, .2); break;
    case 'acid': col = mixColor(p.c1, p.c2, .25); break;
    case 'goo': col = mixColor(p.c1, p.c2, .3); break;
    case 'psychic': col = mixColor(p.c1, p.c2, .45); break;
    case 'blood': col = mixColor(p.c1, p.c2, .35); break;
    case 'electric': col = mixColor(p.c1, p.c3, .5); break;
    default: col = p.c1;
  }
  return applyTint(col, STYLE_PRESETS[cfg.stylePack].tint, .11);
}
function drawParticle(target, p, w, h){
  const t = clamp(p.age/p.life,0,1);
  if(t >= 1) return;
  const pr = project(p,w,h);
  let s = Math.max(.5, p.base * pr.s * (1 - t*.35));
  const col = colorForParticle(p,t);
  const alphaBase = (1 - t) * p.alphaMul;
  target.save();
  target.translate(pr.x, pr.y);
  target.rotate(p.rot);

  // trails
  if(p.history && p.history.length > 1){
    target.strokeStyle = rgbToStr(col, alphaBase * .38);
    target.lineCap = 'round';
    target.lineJoin = 'round';
    target.lineWidth = Math.max(1, s * .35);
    target.beginPath();
    p.history.forEach((hpt, idx)=>{
      const hp = project(hpt,w,h);
      if(idx===0) target.moveTo(hp.x - pr.x, hp.y - pr.y);
      else target.lineTo(hp.x - pr.x, hp.y - pr.y);
    });
    target.stroke();
  }

  // PERFORMANCE: reuse cached glow sprite; no per-particle shadowBlur.
  const glowAmount = cfg.glow * STYLE_PRESETS[cfg.stylePack].glowMul;
  const emissive = ['fire','ember','spark','electric','frost','rad','toxic','acid','psychic'].includes(p.type);
  if(glowAmount > 0 && emissive){
    const haloR = s * (1.15 + Math.min(glowAmount, 60) / 24);
    const glowSprite = getGlowSprite(col, glowAmount);
    target.save();
    target.globalAlpha = Math.min(.72, .18 + glowAmount / 120);
    target.drawImage(glowSprite, -haloR, -haloR, haloR*2, haloR*2);
    target.restore();
  }

  switch(p.type){
    case 'fire':
    case 'ember':
    case 'spark':
    case 'electric':
      target.fillStyle = radial(target,0,0,s,
        [[0, 'rgba(255,255,255,.95)'],
         [.22, rgbToStr(col, alphaBase)],
         [1, rgbToStr(col, 0)]]);
      circle(target,0,0,s); break;

    case 'smoke':
    case 'mist':
    case 'toxic':
    case 'rad':
    case 'dust':
      if(p.type==='smoke') s *= 1.7;
      if(p.type==='mist' || p.type==='toxic') s *= 1.45;
      target.fillStyle = radial(target,0,0,s,
        [[0, rgbToStr(col, alphaBase*.55)],
         [1, rgbToStr(col, 0)]]);
      blob(target,0,0,s,4 + Math.floor(p.seed*4), p.seed*6.28, p.roughness);
      target.fill();
      break;

    case 'droplet':
    case 'blood':
    case 'acid':
    case 'goo':
      s *= p.type==='goo' ? 1.18 : .78;
      target.fillStyle = rgbToStr(col, alphaBase*.95);
      teardrop(target,0,0,s,1.35);
      target.fill();
      break;

    case 'stream':
      target.strokeStyle = rgbToStr(col, alphaBase*.7);
      target.lineWidth = Math.max(1.2, s*.35);
      target.beginPath();
      target.moveTo(-s*2.2, 0);
      target.lineTo(s*2.2, 0);
      target.stroke();
      break;

    case 'frost':
      target.strokeStyle = rgbToStr(col, alphaBase*.95);
      target.lineWidth = Math.max(1, s*.14);
      snowShard(target,s);
      break;

    case 'psychic':
      target.strokeStyle = rgbToStr(col, alphaBase*.85);
      target.lineWidth = Math.max(1, s*.14);
      target.beginPath();
      target.arc(0,0,s,0,Math.PI*2);
      target.stroke();
      target.fillStyle = radial(target,0,0,s,[[0, rgbToStr(col,alphaBase*.45)],[1, rgbToStr(col,0)]]);
      circle(target,0,0,s*.65);
      break;

    default:
      target.fillStyle = radial(target,0,0,s,[[0, rgbToStr(col,alphaBase)],[1, rgbToStr(col,0)]]);
      circle(target,0,0,s);
  }
  target.restore();
}
function radial(target,x,y,r,stops){
  const g = target.createRadialGradient(x,y,0,x,y,Math.max(1,r));
  stops.forEach(s=>g.addColorStop(s[0],s[1]));
  return g;
}
function circle(target,x,y,r){ target.beginPath(); target.arc(x,y,r,0,Math.PI*2); target.fill(); }
function teardrop(target,x,y,r,stretch=1.2){
  target.beginPath();
  target.moveTo(0,-r*stretch);
  target.quadraticCurveTo(r*1.15,-r*.25,0,r*1.2);
  target.quadraticCurveTo(-r*1.15,-r*.25,0,-r*stretch);
}
function blob(target,x,y,r,points=6,seed=0,rough=1){
  target.beginPath();
  for(let i=0;i<=points;i++){
    const a = (i/points)*Math.PI*2;
    const rr = r*(.72 + Math.sin(a*3 + seed)*.11*rough + Math.cos(a*5+seed*2)*.08*rough);
    const px = Math.cos(a)*rr, py = Math.sin(a)*rr;
    if(i===0) target.moveTo(px,py); else target.lineTo(px,py);
  }
  target.closePath();
}
function snowShard(target,s){
  target.beginPath();
  for(let i=0;i<6;i++){
    const a = i*Math.PI/3;
    target.moveTo(0,0);
    target.lineTo(Math.cos(a)*s, Math.sin(a)*s);
  }
  target.stroke();
}
function drawBeam(target,w,h){
  if(!beams.length) return;
  const preset = PRESETS[cfg.preset];
  const palette = colorPalette();
  beams.forEach((b,idx)=>{
    const t = clamp(b.age / b.life, 0, 1);
    const alpha = 1-t;
    if(alpha<=0) return;
    target.save();
    if(b.kind==='electric'){
      // Electric beams require explicit start/end points. Keep safe defaults so
      // malformed/custom presets cannot crash the whole renderer.
      const from = Array.isArray(b.from) ? b.from : [-100, 0];
      const to = Array.isArray(b.to) ? b.to : [100, 0];
      const p1 = {x:from[0],y:from[1],z:0}, p2={x:to[0],y:to[1],z:0};
      const a1 = project(p1,w,h), a2 = project(p2,w,h);
      target.shadowBlur = Math.min(cfg.glow*1.2, 16);
      target.shadowColor = rgbToStr(palette[0], alpha);
      target.strokeStyle = rgbToStr(palette[0], alpha*.95);
      target.lineWidth = 3.5;
      target.beginPath();
      const seg = Math.max(3, b.segments|0);
      for(let i=0;i<=seg;i++){
        const t = i/seg;
        const x = lerp(a1.x,a2.x,t);
        const y = lerp(a1.y,a2.y,t) + (i>0 && i<seg ? (Math.sin((i+simTime*22))*b.amplitude) : 0);
        if(i===0) target.moveTo(x,y); else target.lineTo(x,y);
      }
      target.stroke();
      target.strokeStyle = 'rgba(255,255,255,.9)';
      target.lineWidth = 1.2;
      target.stroke();
    } else {
      const r = 80 + Math.sin(simTime*14)*12;
      target.strokeStyle = rgbToStr(palette[0], alpha*.4);
      target.lineWidth = 18;
      target.beginPath();
      target.arc(w/2,h/2,r,0,Math.PI*2);
      target.stroke();
    }
    target.restore();
  });
}
function drawRings(target,w,h){
  rings.forEach(r=>{
    const t = clamp(r.age/r.life,0,1);
    if(t>=1) return;
    const radius = r.maxR*t;
    target.save();
    target.shadowBlur = Math.min(cfg.glow, 14);
    target.shadowColor = r.color;
    target.strokeStyle = r.color.replace(')', '');
    target.strokeStyle = hexToRgba(r.color, (1-t)*.85);
    target.lineWidth = Math.max(1, r.width*(1-t));
    target.beginPath();
    target.ellipse(w/2,h/2,radius,radius*.48,0,0,Math.PI*2);
    target.stroke();
    target.restore();
  });
}
function drawPuddles(target,w,h){
  puddles.forEach(p=>{
    target.save();
    target.fillStyle = hexToRgba(p.color,p.alpha);
    target.beginPath();
    target.ellipse(w/2, h/2+160, p.rx, p.ry, 0, 0, Math.PI*2);
    target.fill();
    target.restore();
  });
}
function hexToRgba(hex,a){ const c=hexToRgb(hex); return `rgba(${c.r},${c.g},${c.b},${a})`; }
function drawGround(target,w,h){
  target.save();
  const gx = w/2, gy = h/2 + 165;
  const g = target.createRadialGradient(gx, gy, 6, gx, gy, 130);
  g.addColorStop(0,'rgba(0,0,0,.18)');
  g.addColorStop(.55,'rgba(0,0,0,.10)');
  g.addColorStop(1,'rgba(0,0,0,0)');
  target.fillStyle = g;
  target.beginPath();
  target.ellipse(gx, gy, 125, 34, 0, 0, Math.PI*2);
  target.fill();
  target.restore();
}
function draw(w=stage.width,h=stage.height,target=ctx){
  target.clearRect(0,0,w,h);
  if(cfg.showGround) drawGround(target,w,h);
  if(cfg.showDecal) drawPuddles(target,w,h);
  target.save();
  target.globalCompositeOperation = cfg.blend;
  const alive = particles.filter(p=>p.age<p.life).sort((a,b)=>b.z-a.z);
  alive.forEach(p=>drawParticle(target,p,w,h));
  drawRings(target,w,h);
  drawBeam(target,w,h);
  target.restore();
}
function simulateTo(t){
  restart(); const dt = 1/120; let now = 0;
  while(now + dt < t){ step(dt); now += dt; }
  if(t-now > 0) step(t-now);
}
function animate(now){
  const dt = Math.min(.033, (now-last)/1000);
  last = now;
  if(playing){
    step(dt);
    $('timeline').value = Math.min(simTime, +$('duration').value);
  }
  draw();
  $('time').textContent = simTime.toFixed(2) + 's';
  if(simTime > +$('duration').value && playing) restart();
  requestAnimationFrame(animate);
}
function applyPromptHeuristic(){
  const t = $('prompt').value.toLowerCase();
  let preset = 'poison_cloud';
  let style = 'dirty';
  if(/กองไฟ|campfire/.test(t)) { preset='campfire_loop'; style='survival'; }
  else if(/ปืนไฟ|flamethrower/.test(t)) { preset='flamethrower_stream'; style='survival'; }
  else if(/โมโลตอฟ|molotov/.test(t)) { preset='molotov_ignite'; style='dirty'; }
  else if(/ไฟฟ้า|electric|emp|arc|ช็อต/.test(t)) { preset='electric_arc'; style='ruin'; }
  else if(/น้ำ|water|กระเซ็น|ท่อ/.test(t)) { preset='dirty_water'; style='industrial'; }
  else if(/เย็น|ice|frost|freeze|น้ำแข็ง/.test(t)) { preset='frost_burst'; style='survival'; }
  else if(/รังสี|radiation|fallout|reactor/.test(t)) { preset='radiation_mist'; style='mutant'; }
  else if(/พิษ|poison|toxic|gas/.test(t)) { preset='poison_cloud'; style='mutant'; }
  else if(/กรด|acid|corrosive/.test(t)) { preset='acid_splash'; style='mutant'; }
  else if(/เมือก|slime|goo|bio/.test(t)) { preset='mutant_goo'; style='mutant'; }
  else if(/จิต|psychic|psionic|telekinesis|mind/.test(t)) { preset='psychic_pulse'; style='ruin'; }
  else if(/เลือด|blood|bleed/.test(t)) { preset='blood_spray'; style='survival'; }
  else if(/ยิง|bullet|impact|โดนยิง|กระสุน|metal|concrete|flesh/.test(t)) {
    if(/metal|เหล็ก/.test(t)) preset='bullet_metal';
    else if(/concrete|ปูน|กำแพง/.test(t)) preset='bullet_concrete';
    else preset='bullet_flesh';
    style='survival';
  }
  else if(/ระเบิด|explosion|blast|dust/.test(t)) { preset='dust_explosion'; style='dirty'; }
  else if(/ควัน|smoke|ash/.test(t)) { preset='smoke_plume'; style='industrial'; }
  else if(/ไฟ|fire|flame|oil|burn/.test(t)) { preset='oil_fire'; style='dirty'; }

  const category = PRESETS[preset].category;
  $('category').value = category;
  populatePresetSelect(category);
  $('preset').value = preset;
  loadPresetIntoControls(preset);
  $('stylePack').value = style;
  $('badge').textContent = `${PRESETS[preset].name} / ${STYLE_PRESETS[style].name}`;
  restart();
}
async function exportPNG(){
  const size = +$('frameSize').value;
  const c = document.createElement('canvas'); c.width = c.height = size;
  const cctx = c.getContext('2d');
  draw(size,size,cctx);
  downloadBlob(await canvasBlob(c), `${cfg.preset}.png`);
}
async function exportSheet(){
  const size = +$('frameSize').value, fps = +$('fps').value, duration = +$('duration').value;
  const frames = Math.max(1, Math.ceil(duration*fps));
  const cols = Math.ceil(Math.sqrt(frames)), rows = Math.ceil(frames/cols);
  const sheet = document.createElement('canvas'); sheet.width = cols*size; sheet.height = rows*size;
  const sctx = sheet.getContext('2d');
  const frame = document.createElement('canvas'); frame.width = frame.height = size;
  const fctx = frame.getContext('2d');
  const oldPlaying = playing; playing = false;

  for(let i=0;i<frames;i++){
    simulateTo(i/fps);
    draw(size,size,fctx);
    sctx.drawImage(frame, (i%cols)*size, Math.floor(i/cols)*size);
    fctx.clearRect(0,0,size,size);
  }
  playing = oldPlaying; restart();
  downloadBlob(await canvasBlob(sheet), `${cfg.preset}_${frames}f_${size}.png`);
  const meta = {
    tool:'Post-Apocalypse VFX Builder',
    preset:cfg.preset,
    stylePack:cfg.stylePack,
    frameWidth:size, frameHeight:size,
    fps, duration, frames, columns:cols, rows,
    seed:cfg.seed,
    ground:{shadow:cfg.showGround,decal:cfg.showDecal},
    palette:[$('color1').value,$('color2').value,$('color3').value]
  };
  downloadBlob(new Blob([JSON.stringify(meta,null,2)], {type:'application/json'}), `${cfg.preset}.json`);
}
function canvasBlob(canvas){ return new Promise(resolve => canvas.toBlob(resolve, 'image/png')); }
function downloadBlob(blob, name){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href), 1500);
}
function saveProject(){
  readCfg();
  const data = {
    category:$('category').value,
    preset:$('preset').value,
    stylePack:$('stylePack').value,
    seed:$('seed').value,
    prompt:$('prompt').value,
    controls:{
      intensity:$('intensity').value, count:$('count').value, life:$('life').value, speed:$('speed').value, spread:$('spread').value,
      gravity:$('gravity').value, depth:$('depth').value, perspective:$('perspective').value, size:$('size').value, glow:$('glow').value,
      turbulence:$('turbulence').value, trail:$('trail').value, blend:$('blend').value, duration:$('duration').value
    },
    palette:[$('color1').value,$('color2').value,$('color3').value],
    ground:{shadow:$('showGround').checked,decal:$('showDecal').checked},
    export:{frameSize:$('frameSize').value, fps:$('fps').value}
  };
  downloadBlob(new Blob([JSON.stringify(data,null,2)], {type:'application/json'}), `project_${$('preset').value}.json`);
}
function loadProjectObject(data){
  $('category').value = data.category || PRESETS[data.preset].category;
  populatePresetSelect($('category').value);
  $('preset').value = data.preset;
  loadPresetIntoControls(data.preset);
  $('stylePack').value = data.stylePack || 'dirty';
  $('seed').value = data.seed || 1337;
  $('prompt').value = data.prompt || $('prompt').value;
  if(data.controls){
    Object.entries(data.controls).forEach(([k,v])=>{ if($(k)) $(k).value = v; });
  }
  if(data.palette?.length >= 3){
    $('color1').value = data.palette[0];
    $('color2').value = data.palette[1];
    $('color3').value = data.palette[2];
  }
  $('showGround').checked = data.ground?.shadow === true;
  $('showDecal').checked = data.ground?.decal === true;
  if(data.export){
    $('frameSize').value = data.export.frameSize || $('frameSize').value;
    $('fps').value = data.export.fps || $('fps').value;
  }
  syncLabels();
  restart();
}
function bindEvents(){
  $('category').onchange = e => {
    populatePresetSelect(e.target.value);
    loadPresetIntoControls($('preset').value);
    restart();
  };
  $('preset').onchange = e => { loadPresetIntoControls(e.target.value); restart(); };
  $('stylePack').onchange = ()=>{ $('badge').textContent = `${PRESETS[$('preset').value].name} / ${STYLE_PRESETS[$('stylePack').value].name}`; restart(); };
  $('applyIntentBtn').onclick = applyPromptHeuristic;
  $('playBtn').onclick = ()=>{ playing = !playing; $('playBtn').textContent = playing ? 'Pause' : 'Play'; $('status').textContent = playing ? 'Playing' : 'Paused'; };
  $('restartBtn').onclick = restart;
  $('exportPngBtn').onclick = exportPNG;
  $('exportSheetBtn').onclick = exportSheet;
  $('saveProjectBtn').onclick = saveProject;
  $('loadProjectBtn').onclick = ()=>$('projectFile').click();
  $('projectFile').addEventListener('change', ev=>{
    const f = ev.target.files[0]; if(!f) return;
    const fr = new FileReader();
    fr.onload = e => { try{ loadProjectObject(JSON.parse(e.target.result)); } catch(err){ alert('โหลด Project JSON ไม่สำเร็จ'); } };
    fr.readAsText(f);
    ev.target.value = '';
  });
  ['seed','intensity','count','life','speed','spread','gravity','depth','perspective','size','glow','turbulence','trail','blend','duration','color1','color2','color3'].forEach(id=>{
    $(id).oninput = ()=>{ syncLabels(); restart(); };
    $(id).onchange = ()=>{ syncLabels(); restart(); };
  });
  ['showGround','showDecal'].forEach(id=>{
    $(id).onchange = ()=>{ readCfg(); draw(); };
  });
  $('timeline').oninput = e => {
    playing = false;
    $('playBtn').textContent = 'Play';
    $('status').textContent = 'Scrubbing';
    simulateTo(+e.target.value);
    draw();
  };
}
function init(){
  $('showGround').checked = false;
  $('showDecal').checked = false;
  populateCategorySelect();
  $('category').value = 'Fire';
  populatePresetSelect('Fire');
  $('preset').value = 'campfire_loop';
  loadPresetIntoControls('campfire_loop');
  syncLabels();
  bindEvents();
  spawnAll();
  requestAnimationFrame(animate);
}
init();
