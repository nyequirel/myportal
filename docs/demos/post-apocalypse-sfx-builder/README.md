# Post-Apocalypse SFX Builder v1.5

เครื่องมือสร้างเสียงประกอบเกมแบบ procedural ใน browser โดยอ้างอิงโครงสร้าง UX จาก Post-Apocalypse VFX Builder

## ความสามารถ
- Preset Library 11 หมวด / 90+ presets
- Weapons, Fire, Electricity, Radiation, Biohazard, Psychic, Impact, Explosion, Machinery, Ambience, UI
- Prompt to Preset heuristic ภาษาไทย/อังกฤษแบบไม่ต้องใช้ API
- Deterministic seed
- ปรับ Duration, Intensity, Pitch, Noise, Transient, Body, Texture, Attack/Release
- DSP: Low-pass, High-pass, Distortion, Bit Crush, Echo/Space, Stereo Width
- Waveform preview + timeline
- Loop preview
- Export WAV 16-bit mono/stereo 22.05/44.1/48 kHz
- Save / Load Project JSON
- ทำงาน local ใน browser ไม่ต้องมี server backend

## วิธีใช้
เปิด `index.html` ด้วย browser รุ่นใหม่ เช่น Chrome / Edge / Firefox

> หมายเหตุ: Browser อาจอนุญาตเสียงหลังจากผู้ใช้กด Play ครั้งแรกเท่านั้น (Web Audio autoplay policy)


## v1.1 changes
- Auto-stop playback immediately when Category, Preset, or Style changes.
- Rebuilt ballistic weapon presets with layered muzzle transient, pressure/body, supersonic crack, mechanical action, casing, and blast tail.
- Rifle Burst and SMG now synthesize real repeated shots with deterministic cadence instead of a single synthesized hit.
- Reduced excessive weapon distortion and narrowed stereo width for a more plausible source sound.


## v1.2 changes
- Removed the global broadband white-noise injection that was added to every synthesis layer and caused constant radio-like hiss.
- The Noise control now scales only dedicated noise layers such as fire, hiss, crackle, wind, ambience air, blast noise, and debris.
- Style Packs no longer add hidden Bit Crush. Bit Crush is now applied only when the preset/control explicitly requests it.
- Clean tonal, mechanical, weapon, impact, and UI layers no longer receive background hiss simply because the Noise value is above zero.


## v1.3 changes — Modern Acoustic Engine
- Reworked core synthesis to reduce the retro/arcade character from obvious single sine/square oscillators.
- Added deterministic colored noise and inharmonic modal resonances for weapons, explosions, metal, wood, glass, flesh, machinery, wind and room tone.
- Ballistic weapons now use broadband shock transients, dark pressure bodies, non-tonal supersonic cracks and inharmonic mechanical/casing resonance.
- Explosions and impacts use broadband/low-frequency energy instead of a clearly audible pitched oscillator.
- Replaced sparse echo taps with denser early reflections; Weapons/Impact/Explosion use shorter reflections to preserve a believable direct source.
- Normal UI sounds no longer receive hidden bit-crush; only deliberately lo-fi/radio presets retain it.
- Reduced artificial periodic texture modulation.
- Default export/preview sample rate changed to 48 kHz.
- Added short anti-click fades and a more transparent peak safety stage.

## v1.4 fixes — Clean Explosion + Playback Lifecycle
- Removed the long broadband blast-noise layer from all Explosion presets.
- Added a bandwidth-limited pressure-burst generator so Grenade Blast / Pipe Bomb / Heavy Blast keep punch without a radio-static tail.
- Explosion debris is now sparse resonant impacts rather than continuous white-noise fragments.
- Reduced explosion distortion, stereo spread, space, and high-frequency bandwidth.
- Fixed playback cleanup: when a non-looping AudioBuffer ends, source, meter, timeline, and animation frame are all stopped/reset.
- Added a defensive duration check in the timeline loop so the playhead cannot continue indefinitely after silent playback.

## v1.5 fixes — Clean Noise Architecture + Distinct Explosion Archetypes

- ตัด broadband/static-like noise ออกจาก one-shot ที่ไม่ควรมี เช่น Psychic, Impact, Explosion และส่วน body/tail ของ Weapons
- Telekinesis Hit เปลี่ยนเป็น psionic impact + wave + sub โดยไม่มี whoosh/static layer
- Void Swell ใช้ smooth air-pressure movement แทน broadband whoosh
- Impact presets ไม่เติม generic noise-hit ซ้ำทุกเสียงอีกต่อไป
- ปรับ gun body / blast tail / pellet blast / boom / flesh / engine / creak / rumble / liquid impacts ให้ใช้ modal หรือ low-band motion แทน broadband hiss เมื่อไม่จำเป็น
- Explosion 9 preset แยก acoustic structure จริง: grenade, fuel, dust, pipe bomb, electro, reactor, small pop, heavy blast และ shockwave ไม่ใช้สูตร boom เดียวกันอีกต่อไป
- Noise Layer control มีผลเฉพาะ layer ที่ตั้งใจให้เป็น noise ต่อเนื่อง เช่น fire, wind, hiss, whisper หรือ combustion tail
- Playback lifecycle fix จาก v1.4 ยังคงอยู่: เสียงจบแล้ว timeline และสถานะหยุดตามจริง

## ข้อจำกัด

Engine v1.5 ทำให้ procedural SFX ฟังร่วมสมัยและเป็นธรรมชาติกว่าเดิมมาก แต่เสียงที่ต้องการ realism สูงสุด เช่น ปืนจริง ระเบิดจริง เครื่องยนต์จริง และ Foley มนุษย์ ยังควรใช้ recorded sample เป็น transient/body layer แล้วใช้ procedural engine สำหรับ variation, tail, environment และ processing.
