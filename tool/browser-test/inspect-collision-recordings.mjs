import {chromium} from 'playwright';import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle',timeout:120000});await page.locator('#scene-loading').waitFor({state:'hidden',timeout:120000});await page.locator('#audio-toggle').click();
 await page.evaluate(async()=>{const {game}=await import(document.querySelector('script[src*="/src/main.js"]').src);game.renderer.setAnimationLoop(null);await game.audio.collisionVoice.preload();for(const bus of ['background','venue','engineGain','wheelGain'])game.audio[bus].gain.value=0;game.audio.collision=()=>{};});
 const result=[];
 for(const type of ['pedestrian','scooter']){
  await page.evaluate(async type=>{const {game}=await import(document.querySelector('script[src*="/src/main.js"]').src);game.crash({type,heading:0,pause:0},game.bike.position.x,game.bike.position.z);},type);
  await page.waitForFunction(async type=>{const {game}=await import(document.querySelector('script[src*="/src/main.js"]').src);return game.audio.collisionVoice.lastPlayed?.type===type&&!!game.audio.collisionVoice.active;},type,{timeout:10000});
  let peak=0;for(let i=0;i<10;i++){await page.waitForTimeout(100);peak=Math.max(peak,await page.evaluate(async()=>{const {game}=await import(document.querySelector('script[src*="/src/main.js"]').src),a=new Float32Array(game.audio.meter.fftSize);game.audio.meter.getFloatTimeDomainData(a);return Math.sqrt(a.reduce((n,v)=>n+v*v,0)/a.length);}));}
  const state=await page.evaluate(async()=>{const {game}=await import(document.querySelector('script[src*="/src/main.js"]').src);return {...game.audio.collisionVoice.lastPlayed,subtitle:document.querySelector('#collision-message').textContent};});assert.ok(state.duration>1&&peak>.001);result.push({...state,peak});
 }
 await page.locator('#audio-toggle').click();const muted=await page.evaluate(async()=>{const {game}=await import(document.querySelector('script[src*="/src/main.js"]').src);return {active:game.audio.collisionVoice.active===null,play:game.audio.speakCollision('pedestrian')};});assert.ok(muted.active);assert.equal(muted.play,false);assert.deepEqual(errors,[]);console.log('COLLISION_RECORDINGS_PASS',JSON.stringify({result,muted}));
}finally{await browser.close();}
