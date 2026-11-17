import {chromium} from 'playwright';import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
const screenshot=name=>page.screenshot({path:new URL(name,import.meta.url).pathname.replace(/^\/(\w:)/,'$1')});
try{
  await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});await page.locator('#scene-loading').waitFor({state:'hidden'});
  await page.evaluate(async()=>{const {game}=await import(document.querySelector('script[src*="/src/main.js"]').src);game.travelTo('quoc-hoc');game.input.drag.yaw=-.45;});await page.waitForTimeout(900);await screenshot('hue-street-life.png');
  await page.locator('[data-district="truong-tien"]').click();await page.waitForTimeout(400);await screenshot('hue-wide-bridge.png');
  const result=await page.evaluate(async()=>{
    const {game}=await import(document.querySelector('script[src*="/src/main.js"]').src);game.renderer.setAnimationLoop(null);
    const count=Object.fromEntries(['car','scooter','pedestrian'].map(type=>[type,game.traffic.actors.filter(a=>a.type===type).length]));
    const car=game.traffic.actors.find(a=>a.type==='car');const oldX=car.mesh.position.x;for(let i=0;i<120;i++)game.step(1/120);const moving=Math.abs(oldX-car.mesh.position.x)>.1;
    const tours=[];game.traffic.enabled=false;
    for(const id of ['quoc-hoc','south-bank','truong-tien','north-bank','imperial-city']){game.travelTo(id);game.toggleAutopilot();for(let i=0;i<9000&&game.auto;i++)game.step(1/120);tours.push({id,complete:game.completed,u:game.routeU,x:game.bike.position.x,z:game.bike.position.z});}
    game.travelTo('quoc-hoc');game.traffic.enabled=true;for(const actor of game.traffic.actors)if(actor!==car)actor.mesh.visible=false;game.traffic.actors=[car];
    game.bike.reset(-40,35.5,Math.PI/2);game.bike.motion.speed=6;car.mesh.position.set(-33,.23,35.5);car.heading=-Math.PI/2;car.mesh.rotation.y=car.heading;car.axis='x';car.direction=-1;car.baseSpeed=5.5;car.pause=0;game.collisionCooldown=0;
    const before=game.crashCount;for(let i=0;i<240&&game.crashCount===before;i++)game.step(1/120);
    game.updateHud();game.updateCamera(1);game.renderer.render(game.scene,game.camera);
    return {count,moving,tours,collision:game.crashCount>before,speed:game.bike.motion.speed,auto:game.auto,toast:!document.querySelector('#collision-toast').hidden,message:document.querySelector('#collision-message').textContent,noticeTime:game.noticeTime};
  });
  console.log('SCENARIO',JSON.stringify(result));console.log('TOAST_STYLE',await page.locator('#collision-toast').evaluate(e=>({hidden:e.hidden,rect:e.getBoundingClientRect().toJSON(),display:getComputedStyle(e).display,zIndex:getComputedStyle(e).zIndex})));await page.locator('#collision-toast').waitFor({state:'visible'});await screenshot('hue-traffic-collision.png');
  assert.ok(result.count.car>0&&result.count.scooter>0&&result.count.pedestrian>0);assert.ok(result.moving);assert.ok(result.tours.every(t=>t.complete),JSON.stringify(result.tours));assert.ok(result.collision);assert.equal(result.speed,0);assert.equal(result.auto,false);assert.ok(result.toast&&result.message.includes('đối đầu'));
  const recovery=await page.evaluate(async()=>{const {game}=await import(document.querySelector('script[src*="/src/main.js"]').src);const count=game.crashCount;for(let i=0;i<120;i++)game.step(1/120);const repeated=game.crashCount!==count;for(let i=0;i<480;i++)game.step(1/120);const hidden=document.querySelector('#collision-toast').hidden;game.input.keys.add('w');for(let i=0;i<100;i++)game.step(1/120);return {repeated,hidden,canContinue:game.bike.motion.speed>0};});
  assert.equal(recovery.repeated,false);assert.ok(recovery.hidden&&recovery.canContinue);assert.deepEqual(errors,[]);console.log(JSON.stringify({...result,recovery,pageErrors:errors}));
}finally{await browser.close();}
