import {chromium} from 'playwright';import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1100,height:720}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle',timeout:60000});await page.locator('#scene-loading').waitFor({state:'hidden',timeout:60000});
 const audit=await page.evaluate(async()=>{const {game}=await import(document.querySelector('script[src*="/src/main.js"]').src);game.renderer.setAnimationLoop(null);const roads=game.world.renderRoads;return {roads:roads.length,invalid:roads.flatMap(r=>r.points.map((p,i)=>({r,i,y:game.world.roadHeight(r,i)}))).filter(v=>!Number.isFinite(v.y)||(!['footway','path','pedestrian'].includes(v.r.tags.highway)&&v.y<.319)).map(v=>v.r.id)};});assert.deepEqual(audit.invalid,[]);
 for(const id of ['quoc-hoc','south-bank','truong-tien','north-bank','imperial-city'])for(const u of [.12,.5,.85]){
  await page.evaluate(async({id,u})=>{const {game}=await import(document.querySelector('script[src*="/src/main.js"]').src);game.travelTo(id);const p=game.curve.getPointAt(u),t=game.curve.getTangentAt(u);game.bike.reset(p.x,p.z,Math.atan2(t.x,t.z));game.bike.position.y=game.world.groundAt(p.x,p.z);game.camera.position.set(p.x-t.x*7,game.bike.position.y+3,p.z-t.z*7);game.camera.lookAt(p.x+t.x*10,game.bike.position.y+.7,p.z+t.z*10);game.world.update(0,game.bike.position);game.updateHud();game.renderer.render(game.scene,game.camera);}, {id,u});
  await page.screenshot({path:new URL(`road-${id}-${u}.png`,import.meta.url).pathname.replace(/^\/(\w:)/,'$1')});
 }
 assert.deepEqual(errors,[]);console.log('ALL_ROAD_AUDIT_PASS',JSON.stringify({...audit,captures:15}));
}finally{await browser.close();}
