import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'});
const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
const errors=[],failedAssets=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(/\.(js|css|glb)(\?|$)/.test(r.url())&&!r.ok())failedAssets.push({url:r.url(),status:r.status()});});
await page.addInitScript(()=>{
  window.testAudioContexts=[];window.testAudioMeters=[];
  const Original=window.AudioContext||window.webkitAudioContext;
  window.AudioContext=class extends Original{constructor(...args){super(...args);window.testAudioContexts.push(this);}createAnalyser(){const meter=super.createAnalyser();window.testAudioMeters.push(meter);return meter;}};
});
const shot=name=>page.screenshot({path:new URL(name,import.meta.url).pathname.replace(/^\/(\w:)/,'$1')});
try{
  await page.goto(base,{waitUntil:'networkidle',timeout:60000});await page.locator('#scene-loading').waitFor({state:'hidden',timeout:60000});
  const entry=await page.locator('script[type="module"][src]').getAttribute('src');assert.ok(entry.startsWith('/assets/'),`Expected compiled entry, received ${entry}`);assert.ok(await page.locator('#asset-notice').isHidden());
  assert.equal(await page.locator('#toggle-districts').getAttribute('aria-expanded'),'false');assert.ok(await page.locator('#district-list').isHidden());assert.equal(await page.evaluate(()=>window.testAudioContexts.length),0);
  await shot('production-mobile-portrait.png');
  await page.locator('#toggle-districts').click();await page.locator('[data-district="north-bank"]').click();assert.ok(await page.locator('#district-list').isHidden());assert.equal(await page.locator('#destination').innerText(),'Trần Hưng Đạo');
  await page.evaluate(()=>{document.documentElement.requestFullscreen=async()=>{throw new Error('not supported in test');};Object.defineProperty(screen.orientation,'lock',{configurable:true,value:async()=>{throw new Error('not supported in test');}});});
  await page.locator('#landscape-toggle').click();assert.ok(await page.locator('#orientation-hint').isVisible());await page.locator('#dismiss-orientation').click();
  await page.locator('#audio-toggle').click();await page.waitForTimeout(1500);assert.equal(await page.locator('#audio-toggle').getAttribute('aria-pressed'),'true');
  const signal=await page.evaluate(()=>{const meter=window.testAudioMeters[0],values=new Float32Array(meter.fftSize);meter.getFloatTimeDomainData(values);return {contexts:window.testAudioContexts.length,state:window.testAudioContexts[0].state,rms:Math.sqrt(values.reduce((sum,value)=>sum+value*value,0)/values.length)};});assert.equal(signal.contexts,1);assert.equal(signal.state,'running');assert.ok(signal.rms>1e-6,JSON.stringify(signal));
  await page.locator('#toggle-districts').click();await page.locator('[data-district="imperial-city"]').click();await page.waitForTimeout(500);assert.match(await page.locator('#sound-location').innerText(),/Nhạc ven quán/);
  await page.locator('#toggle-districts').click();await page.locator('[data-district="truong-tien"]').click();await page.waitForTimeout(400);assert.equal(await page.locator('#sound-location').innerText(),'Giai điệu bên sông Hương');
  await page.setViewportSize({width:844,height:390});await page.waitForTimeout(200);assert.ok(await page.locator('#move-stick').isVisible());assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await shot('production-mobile-landscape.png');
  await page.locator('#audio-toggle').click();assert.equal(await page.evaluate(()=>window.testAudioContexts[0].state),'suspended');assert.equal(await page.locator('#audio-toggle').getAttribute('aria-pressed'),'false');
  await page.setViewportSize({width:1440,height:900});assert.ok(await page.locator('#district-list').isVisible());
  assert.deepEqual(errors,[]);assert.deepEqual(failedAssets,[]);console.log(JSON.stringify({base,compiledEntry:entry,mobileMenu:'pass',orientationFallback:'pass',audio:signal,restaurantMusic:'near/far pass',mute:'suspended',landscape:'pass',desktopMenu:'pass',pageErrors:errors,failedAssets}));
}finally{await browser.close();}
