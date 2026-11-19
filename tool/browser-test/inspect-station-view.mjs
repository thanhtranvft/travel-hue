import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.argv[2]||'http://127.0.0.1:5181/',{waitUntil:'networkidle'});
 await page.locator('#player-name').fill('Thanh');await page.locator('[value="explore"]').click();
 await page.locator('#scene-loading').waitFor({state:'hidden',timeout:120000});
 const report=await page.evaluate(async()=>{
  const {game}=await import(document.querySelector('script[src*="/src/main.js"]').src);
  const THREE=await import('/node_modules/three/build/three.module.js');
  window.game=game;game.traffic.enabled=false;game.renderer.setAnimationLoop(null);
  game.scene.updateMatrixWorld(true);
  const patch=game.bike.identity.children.find(o=>o.isMesh&&o.geometry.type==='PlaneGeometry');
  const tail=game.bike.rider.children.find(o=>o.geometry?.type==='TorusGeometry');
  const nameBounds=new THREE.Box3().setFromObject(patch),tailBounds=new THREE.Box3().setFromObject(tail);
  const blocked=[];
  for(let i=0;i<=100;i++){const p=game.curve.getPointAt(Math.min(1,i*2/game.routeLength));if(!game.world.canRide(p.x,p.z))blocked.push({x:p.x,z:p.z});}
  const station=game.world.station;
  const initial={spawn:game.bike.position.toArray(),distanceToGate:Math.hypot(game.bike.position.x-station.entrance.x,game.bike.position.z-station.entrance.z),stats:station.stats,nameAboveTail:nameBounds.min.y>tailBounds.max.y,blocked};
  game.toggleAutopilot();for(let i=0;i<20000&&game.routeU*game.routeLength<220;i++)game.step(1/120);
  initial.autoDistance=game.routeU*game.routeLength;
  game.reset();game.frame();return initial;
 });
 console.log('STATION_REPORT',JSON.stringify(report));
 assert.ok(report.distanceToGate<12);assert.equal(report.stats.trains,2);assert.ok(report.stats.bridge);assert.ok(report.nameAboveTail);assert.deepEqual(report.blocked,[]);assert.ok(report.autoDistance>=220);
 await page.screenshot({path:new URL('./station-start.png',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')});
 await page.evaluate(()=>{game.camera.position.set(55,20,-45);game.camera.lookAt(12,2,7);game.renderer.render(game.scene,game.camera);});
 await page.screenshot({path:new URL('./station-overview.png',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')});
 await page.evaluate(()=>{game.camera.position.set(50,15,50);game.camera.lookAt(18,2,12);game.renderer.render(game.scene,game.camera);});
 await page.screenshot({path:new URL('./station-trains.png',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')});
 await page.evaluate(()=>{game.camera.position.set(66,20,-40);game.camera.lookAt(88,0,-82);game.renderer.render(game.scene,game.camera);});
 await page.screenshot({path:new URL('./station-bridge.png',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')});
 assert.deepEqual(errors,[]);console.log('STATION_VIEW_PASS');
}finally{await browser.close();}
