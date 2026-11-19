import {chromium} from 'playwright';import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.argv[2]||'http://127.0.0.1:5181/',{waitUntil:'networkidle'});
 await page.locator('#player-name').fill('Cún test');await page.locator('[value="explore"]').click();
 await page.locator('#scene-loading').waitFor({state:'hidden',timeout:120000});
 await page.evaluate(async()=>{window.game=(await import(document.querySelector('script[src*="/src/main.js"]').src)).game;game.renderer.setAnimationLoop(null);});
 assert.equal(await page.locator('#audio-toggle').getAttribute('aria-pressed'),'true');
 assert.equal(await page.evaluate(()=>game.audio.ctx.state),'running');
 assert.ok(await page.locator('#sound-settings').isHidden());
 await page.locator('#audio-toggle').click();
 assert.equal(await page.evaluate(()=>game.audio.enabled&&!game.audio.musicEnabled&&game.audio.ctx.state==='running'),true);
 const voices=await page.evaluate(async()=>{
  const types=['pedestrian','scooter','player','car'],played=[];
  for(const type of types){await game.audio.speakCollision(type);played.push({...game.audio.collisionVoice.lastPlayed});}
  return played;
 });
 assert.deepEqual(voices.map(v=>v.type),['pedestrian','scooter','player','car']);assert.ok(voices.every(v=>v.duration>0));
 const patrol=await page.evaluate(()=>{
  const officers=game.traffic.actors.filter(a=>a.isPolice);window.patrol=officers[0];
  game.audio.collisionVoice.stop();game.audio.lastCollisionVoiceAt=-Infinity;
  game.bike.position.copy(patrol.mesh.position);game.bike.position.x+=4;game.bike.motion.speed=2;game.collisionCooldown=99;
  game.traffic.time+=100;game.frame();
  return {count:officers.length,people:patrol.mesh.children.filter(o=>o.name.startsWith('police-')).map(o=>o.name),notice:document.querySelector('#patrol-toast').hidden};
 });
 await page.waitForFunction(()=>game.audio.collisionVoice.lastPlayed?.type==='police');
 assert.ok(patrol.count>0);assert.deepEqual(patrol.people,['police-driver','police-passenger']);assert.equal(patrol.notice,false);
 const warning=await page.evaluate(()=>({...game.audio.collisionVoice.lastPlayed}));
 const policeShot=await page.evaluate(()=>{
  const p=patrol.mesh.position,h=patrol.heading;
  game.camera.position.set(p.x+Math.cos(h)*3+Math.sin(h)*2, p.y+2.5,p.z-Math.sin(h)*3+Math.cos(h)*2);
  game.camera.lookAt(p.x,p.y+1.1,p.z);game.renderer.render(game.scene,game.camera);
  return game.audio.ctx.state;
 });
 await page.screenshot({path:new URL('./police-patrol.png',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')});
 await page.locator('#master-audio-toggle').click();
 await page.waitForFunction(()=>!game.audio.enabled&&game.audio.ctx.state==='suspended');
 assert.equal(await page.evaluate(()=>game.audio.ctx.state),'suspended');
 assert.equal(await page.evaluate(()=>game.audio.collisionVoice.active),null);
 assert.equal(await page.evaluate(()=>game.audio.speakCollision('player')),false);
 await page.locator('#master-audio-toggle').click();
 await page.waitForFunction(()=>game.audio.enabled&&game.audio.ctx.state==='running');
 assert.equal(await page.evaluate(()=>game.audio.ctx.state),'running');assert.equal(await page.evaluate(()=>game.audio.musicEnabled),false);
 await page.locator('#audio-toggle').click();await page.locator('#audio-settings-toggle').click();
 await page.locator('#music-track').selectOption('hue-thuong-vocal');
 await page.waitForFunction(()=>{const a=document.querySelector('#recorded-music');return !a.paused&&a.currentTime>.3;},null,{timeout:20000});
 await page.locator('#audio-toggle').click();
 assert.equal(await page.locator('#recorded-music').evaluate(a=>a.paused),true);
 assert.equal(await page.evaluate(()=>game.audio.ctx.state),'running');
 assert.equal(await page.evaluate(async()=>{await game.audio.speakCollision('player');return game.audio.collisionVoice.lastPlayed.type;}),'player');
 assert.deepEqual(errors,[]);
 console.log('PATROL_AUDIO_PASS',JSON.stringify({defaultMusicOn:true,musicOffEffectsWork:true,masterMuteWorks:true,voices,warning,patrol,errors}));
}finally{await browser.close();}
