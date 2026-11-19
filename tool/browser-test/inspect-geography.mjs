import {chromium} from 'playwright';import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
const shot=name=>page.screenshot({path:new URL(name,import.meta.url).pathname.replace(/^\/(\w:)/,'$1')});
try{
 await page.goto('http://127.0.0.1:5174/',{waitUntil:'networkidle',timeout:60000});await page.locator('#scene-loading').waitFor({state:'hidden',timeout:60000});assert.ok(await page.locator('#asset-notice').isHidden());await shot('hue-osm-station.png');
 const report=await page.evaluate(async()=>{
  const {game}=await import(document.querySelector('script[src*="/src/main.js"]').src),{sites,geoDistricts,roads}=await import('/src/core/shared/geography/map.js'),{nearestPoint}=await import('/src/core/shared/geography/geometry.js');game.renderer.setAnimationLoop(null);game.traffic.enabled=false;
  const quoc=sites.find(s=>s.id==='quoc-hoc-school'),road=roads.find(r=>r.id===626373586),p=nearestPoint(quoc.sign,road.points);game.bike.reset(p.x,p.z,p.heading+Math.PI);game.bike.position.y=game.world.groundAt(p.x,p.z);game.cameraYaw=game.bike.motion.heading;game.input.drag.yaw=-.6;game.camera.position.set(p.x-5,3,p.z+5);game.world.update(0,game.bike.position);game.updateCamera(1);game.updateHud();game.drawMap();game.renderer.render(game.scene,game.camera);
  const routes=[];for(const district of geoDistricts){game.travelTo(district.id);game.toggleAutopilot();const length=game.routeLength;const budget=Math.ceil((length/2+80)*120);for(let i=0;i<budget&&game.auto;i++)game.step(1/120);routes.push({id:district.id,length,complete:game.completed,u:game.routeU,x:game.bike.position.x,z:game.bike.position.z});}
  const venue=game.world.venues[0];game.bike.position.set(venue.x,.23,venue.z);game.audio.update(game.bike,[],0);const venueNear=game.audio.venueLevel;game.bike.position.set(-1000,.23,1000);game.audio.update(game.bike,[],0);const venueFar=game.audio.venueLevel;
  game.travelTo('quoc-hoc');game.bike.reset(p.x,p.z,p.heading+Math.PI);game.bike.position.y=game.world.groundAt(p.x,p.z);game.cameraYaw=game.bike.motion.heading;game.input.drag.yaw=-.6;game.camera.position.set(p.x-5,3,p.z+5);game.world.update(0,game.bike.position);game.updateCamera(1);game.updateHud();game.drawMap();game.renderer.render(game.scene,game.camera);
  return {buildings:game.world.buildingCount,landmarks:game.world.landmarks.size,roadSegments:game.world.roadSegments.length,venues:game.world.venues.length,venueNear,venueFar,routes};
 });
 await shot('hue-osm-quoc-hoc.png');console.log(JSON.stringify(report));assert.ok(report.buildings>20);assert.equal(report.landmarks,11);assert.equal(report.venueNear,1);assert.equal(report.venueFar,0);assert.ok(report.routes.every(r=>r.complete),JSON.stringify(report.routes));assert.deepEqual(errors,[]);console.log('GEO_BROWSER_PASS');
}finally{await browser.close();}
