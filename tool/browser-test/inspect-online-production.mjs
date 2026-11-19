import { chromium } from 'playwright';
import { WebSocket } from 'ws';
import { once } from 'node:events';
import assert from 'node:assert/strict';
const base=process.argv[2]||'http://127.0.0.1:8080/';
const url=new URL('/online',base);url.protocol=url.protocol==='https:'?'wss:':'ws:';
const bots=[];
async function bot(name){
  const socket=new WebSocket(url);bots.push(socket);await once(socket,'open');
  const welcome=new Promise(resolve=>{socket.on('message',raw=>{const m=JSON.parse(raw);if(m.type==='welcome')resolve(m);});});
  socket.send(JSON.stringify({type:'join',version:1,name,region:'quoc-hoc'}));
  const {player}=await welcome;
  let seq=0;
  const timer=setInterval(()=>socket.readyState===1&&socket.send(JSON.stringify({type:'state',...player,seq:seq++})),50);
  socket.on('close',()=>clearInterval(timer));
}
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'});
try{
  for(let i=0;i<9;i++)await bot(`Cún ${i+1}`);
  const page=await browser.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true}),errors=[],messages=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('websocket',ws=>ws.on('framereceived',({payload})=>{try{messages.push(JSON.parse(payload));}catch{}}));
  await page.goto(base,{waitUntil:'networkidle'});
  await page.screenshot({path:new URL('./online-entry.png',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')});
  await page.locator('#player-name').fill('Cún thứ mười');await page.locator('.session-modes [value="online"]').click();
  await page.locator('#scene-loading').waitFor({state:'hidden',timeout:120000});
  await page.waitForFunction(()=>document.querySelector('#session-panel summary')?.textContent.includes('10/10'));
  assert.ok((await page.locator('script[type="module"][src]').getAttribute('src')).startsWith('/assets/'));
  assert.ok(messages.some(m=>m.type==='welcome'));
  await page.waitForTimeout(1000);
  assert.ok(messages.some(m=>m.type==='snapshot'&&m.players.length===10));
  await page.screenshot({path:new URL('./online-ten-mobile.png',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')});
  const rejected=await browser.newPage();
  await rejected.goto(base,{waitUntil:'networkidle'});await rejected.locator('#player-name').fill('Người 11');await rejected.locator('.session-modes [value="online"]').click();
  await rejected.waitForFunction(()=>document.querySelector('.connection-status')?.textContent.includes('đủ 10'));
  await rejected.locator('#session-panel button').click();await rejected.locator('.session-modes [value="explore"]').click();
  assert.ok((await rejected.locator('#session-panel summary').textContent()).includes('Khám phá'));
  bots[0].close(1000);await page.waitForFunction(()=>document.querySelector('#session-panel summary')?.textContent.includes('9/10'));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.deepEqual(errors,[]);
  console.log('PRODUCTION_ONLINE_PASS',JSON.stringify({tenPlayers:true,eleventhSeesFull:true,exploreFallback:true,slotReleased:true,mobileNoOverflow:true,errors}));
}finally{for(const ws of bots)ws.close(1000);await browser.close();}
