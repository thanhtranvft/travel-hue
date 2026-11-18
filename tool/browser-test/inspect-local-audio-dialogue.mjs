import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'});
try{
 const page=await browser.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/youtube|ytimg|googlevideo/i.test(r.url()))external.push(r.url());});
 await page.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle',timeout:120000});
 await page.locator('#scene-loading').waitFor({state:'hidden',timeout:120000});
 await page.locator('#audio-toggle').click();
 const tracks=[];
 for(const id of ['hue-thuong-vocal','thuong-ve-mien-trung-vocal']){
  await page.locator('#music-track').selectOption(id);
  await page.waitForFunction(()=>{const a=document.querySelector('#recorded-music');return !a.paused&&a.readyState>=3&&a.currentTime>.8;},null,{timeout:20000});
  const state=await page.evaluate(()=>{const a=document.querySelector('#recorded-music');return {src:a.currentSrc,duration:a.duration,time:a.currentTime,error:a.error?.message||null};});
  assert.ok(state.duration>30&&state.time>0);assert.equal(state.error,null);assert.ok(state.src.startsWith('http://127.0.0.1:5174/'));tracks.push(state);
 }
 await page.locator('#audio-toggle').click();assert.equal(await page.locator('#recorded-music').evaluate(a=>a.paused),true);
 const dialogue=await page.evaluate(async()=>{
  const {game}=await import(document.querySelector('script[src*="/src/main.js"]').src);game.renderer.setAnimationLoop(null);
  await game.audio.setEnabled(true);await game.audio.collisionVoice.preload();const spoken=[],play=game.audio.collisionVoice.play.bind(game.audio.collisionVoice);game.audio.collisionVoice.play=type=>{spoken.push(type);return play(type);};
  game.audio.collision=()=>{};game.traffic.actors.forEach(a=>a.mesh.position.set(-1000,0,-1000));
  const person=game.world.pedestrianLife.people[0];game.bike.position.copy(person.mesh.position);const actor=game.traffic.contact({x:person.mesh.position.x-.2,z:person.mesh.position.z},game.bike);
  game.bike.motion.speed=3;game.crash(actor,game.bike.position.x,game.bike.position.z);const pedestrian=document.querySelector('#collision-message').textContent;
  game.crash({type:'scooter',heading:0,pause:0},game.bike.position.x,game.bike.position.z);
  return {stats:game.world.pedestrianLife.stats,contact:actor?.type,pedestrian,scooter:document.querySelector('#collision-message').textContent,spoken};
 });
 assert.ok(dialogue.stats.sidewalkLeft+dialogue.stats.sidewalkRight>=350);assert.equal(dialogue.contact,'pedestrian');
 assert.equal(dialogue.pedestrian,'Đi đứng kiểu chi rứa hả?');assert.equal(dialogue.scooter,'Bị đui hay răng mà không thấy?');
 assert.deepEqual(dialogue.spoken,['pedestrian','scooter']);assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 console.log('LOCAL_AUDIO_DIALOGUE_PASS',JSON.stringify({tracks,dialogue,externalRequests:external.length}));
}finally{await browser.close();}
