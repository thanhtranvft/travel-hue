import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe',args:['--enable-webgl','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
const shot=name=>page.screenshot({path:new URL(name,import.meta.url).pathname.replace(/^\/(\w:)/,'$1')});
try{
  await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle',timeout:60000});await page.waitForTimeout(1200);
  await page.locator('#scene-loading').waitFor({state:'hidden',timeout:60000});assert.ok(await page.locator('#asset-notice').isHidden(),'GLB assets should load');
  assert.equal(await page.locator('[data-district]').count(),5);
  await shot('hue-city-initial.png');
  await page.keyboard.down('w');await page.waitForTimeout(1800);await page.keyboard.down('a');await page.waitForTimeout(500);await page.keyboard.up('a');await page.keyboard.up('w');
  const speed=Number(await page.locator('#speed').innerText());assert.ok(speed>0,'manual movement should increase speed');
  await page.keyboard.down(' ');await page.waitForTimeout(2200);await page.keyboard.up(' ');assert.equal(await page.locator('#speed').innerText(),'0');
  for(const id of ['south-bank','truong-tien','north-bank','imperial-city']){
    await page.locator(`[data-district="${id}"]`).click();assert.equal(await page.locator(`[data-district="${id}"]`).getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#speed').innerText(),'0');
  }
  await page.locator('[data-district="truong-tien"]').click();await page.locator('#autopilot').click();await page.waitForTimeout(2500);assert.equal(await page.locator('#mode-label').innerText(),'Tự lái tham quan');assert.ok(Number(await page.locator('#speed').innerText())>0);
  await shot('hue-city-bridge.png');
  await page.keyboard.down('w');await page.waitForTimeout(150);await page.keyboard.up('w');assert.equal(await page.locator('#mode-label').innerText(),'Đạp tự do');
  await page.locator('#expand-map').click();assert.ok(await page.locator('#map-panel').evaluate(e=>e.classList.contains('expanded')));
  await page.locator('#expand-map').click();await page.setViewportSize({width:390,height:844});await page.locator('#toggle-districts').click();await page.locator('[data-district="quoc-hoc"]').click();await page.waitForTimeout(400);await shot('hue-city-mobile.png');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false);
  const tours=await page.evaluate(async()=>{const {game}=await import(document.querySelector('script[src*="/src/main.js"]').src);game.renderer.setAnimationLoop(null);const results=[];for(const id of ['quoc-hoc','south-bank','truong-tien','north-bank','imperial-city']){game.travelTo(id);game.toggleAutopilot();for(let i=0;i<6000&&game.auto;i++)game.step(1/120);results.push({id,complete:game.completed,u:game.routeU,speed:game.bike.motion.speed});}return results;});
  assert.ok(tours.every(t=>t.complete),JSON.stringify(tours));
  assert.deepEqual(errors,[]);console.log(JSON.stringify({manualSpeedKmh:speed,districts:5,braking:'pass',autopilot:'pass',manualTakeover:'pass',mobileOverflow:overflow,pageErrors:errors,tours}));
}finally{await browser.close();}
