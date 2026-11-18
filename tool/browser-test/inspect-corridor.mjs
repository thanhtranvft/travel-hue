import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle'});await page.locator('#scene-loading').waitFor({state:'hidden',timeout:60000});
 const report=await page.evaluate(async()=>{
  const {game}=await import(document.querySelector('script[src*="/src/main.js"]').src),{sites,roads}=await import('/src/geography/map.js'),{nearestPoint}=await import('/src/geography/geometry.js');
  game.renderer.setAnimationLoop(null);const site=sites.find(s=>s.id==='hue-cit'),hit=roads.filter(r=>r.tags.name==='Lê Lợi').map(r=>nearestPoint(site.center,r.points)).sort((a,b)=>a.distance-b.distance)[0];
  game.bike.reset(hit.x,hit.z,hit.heading);game.bike.position.y=.23;game.camera.position.set(hit.x-20,13,hit.z-20);game.camera.lookAt(site.center.x,6,site.center.z);game.world.update(0,game.bike.position);game.renderer.render(game.scene,game.camera);
  const counts=game.traffic.actors.reduce((a,v)=>(a[v.type]=(a[v.type]||0)+1,a),{});for(let i=0;i<120;i++)game.traffic.step(1/120,game.bike);
  return {landmarks:game.world.landmarks.size,buildings:game.world.buildingCount,rideable:game.world.canRide(hit.x,hit.z),details:game.world.streetDetailCounts,trees:game.world.treePositions.length,actors:counts,finite:game.traffic.actors.every(a=>Number.isFinite(a.mesh.position.x)&&Number.isFinite(a.mesh.position.z))};
 });
 await page.screenshot({path:new URL('hue-corridor.png',import.meta.url).pathname.replace(/^\/(\w:)/,'$1')});assert.equal(report.landmarks,14);assert.ok(report.rideable&&report.finite);assert.ok(report.details.laneMarkers>100&&report.details.buildingLabels>100);assert.ok(report.actors.truck>=5&&report.actors.pedestrian>=50&&report.actors.car>0&&report.actors.scooter>0);assert.deepEqual(errors,[]);console.log('CORRIDOR_BROWSER_PASS',JSON.stringify(report));
}finally{await browser.close();}
