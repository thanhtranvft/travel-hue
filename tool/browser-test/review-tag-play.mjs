import {chromium} from 'playwright';
import {createInterface} from 'node:readline';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const directory=fileURLToPath(new URL('./review-tag-play/',import.meta.url));await mkdir(directory,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'});
const pages=[],logs=[[],[]],latest=[{},{}];
for(let i=0;i<2;i++){
 const context=await browser.newContext({viewport:{width:i===0?844:1280,height:i===0?390:800},isMobile:i===0,hasTouch:i===0});
 const page=await context.newPage();pages.push(page);
 page.on('pageerror',e=>logs[i].push({error:e.message}));
 page.on('websocket',ws=>{if(!ws.url().includes('/online'))return;ws.on('framereceived',({payload})=>{try{const m=JSON.parse(payload);if(m.type==='snapshot')latest[i].snapshot=m;else if(m.type==='mode_event'&&m.event==='tag_state')latest[i].tag=m;else if(m.type==='welcome')latest[i].welcome={id:m.id,player:m.player};else logs[i].push(m);}catch{}});});
}
console.log(JSON.stringify({ready:true,directory}));
async function snapshot(i,label='view'){
 const page=pages[i],path=`${directory}/${i}-${label}.png`;await page.screenshot({path});
 const dom=await page.evaluate(()=>({title:document.title,text:document.body.innerText.slice(0,6500),screen:{w:innerWidth,h:innerHeight},overflow:document.documentElement.scrollWidth>innerWidth}));
 const recent=logs[i].splice(0);
 await writeFile(`${directory}/${i}-${label}.json`,JSON.stringify({dom,network:latest[i],events:recent},null,2));
 const t=latest[i].tag,s=latest[i].snapshot;
 console.log(JSON.stringify({page:i,path,text:dom.text.slice(-2200),tag:t&&{phase:t.phase,remainingMs:t.remainingMs,hotspot:t.hotspot,boxes:t.partyBoxes,coop:t.coop&&{...t.coop,items:undefined},leaderboard:t.leaderboard},players:s?.players.map(p=>({name:p.name,x:p.x,z:p.z,heading:p.heading,speed:p.speed,role:p.modeData?.role})),events:recent.filter(m=>m.type==='mode_event'&&m.event!=='tag_state').slice(-8)}));
}
const reader=createInterface({input:process.stdin});
for await(const line of reader){
 try{
  const c=JSON.parse(line),i=c.page||0,page=pages[i];
  if(c.action==='goto'){await page.goto('http://127.0.0.1:5182/',{waitUntil:'networkidle',timeout:120000});}
  if(c.action==='join'){
   await page.locator('#player-name').fill(c.name);
   await page.locator(`[data-region="${c.region||'quoc-hoc'}"]`).click();
   await page.locator(`[data-game-mode="tag-chase"]`).click();
   await page.locator(`[data-avatar="${c.avatar||'dog'}"]`).click();
   await page.locator(`[data-transport="${c.transport||'foot'}"]`).click();
   await page.locator('.lobby-cta').click();
   await page.locator('#scene-loading').waitFor({state:'hidden',timeout:120000});
   await page.locator('#tc-timer').waitFor({state:'visible',timeout:30000});
  }
  if(c.action==='move'){
   const v=page.viewportSize();await page.mouse.click(v.width*.5,v.height*.55);
   for(const key of c.keys)await page.keyboard.down(key);
   await page.waitForTimeout(Math.min(6000,c.ms||1000));
   for(const key of c.keys)await page.keyboard.up(key);
  }
  if(c.action==='click')await page.locator(c.selector).click({timeout:5000});
  if(c.action==='key')await page.keyboard.press(c.key);
  if(c.action==='touch'){
   const rect=await page.locator('#move-stick').boundingBox(),x=rect.x+rect.width/2,y=rect.y+rect.height/2;
   const cdp=await page.context().newCDPSession(page);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x,y}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:x+(c.dx||0),y:y+(c.dy||-45)}]});
   await page.waitForTimeout(Math.min(6000,c.ms||1000));
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
  }
  if(c.action==='resize')await page.setViewportSize({width:c.width,height:c.height});
  if(c.action==='look'){await page.mouse.move(640,400);await page.mouse.down();await page.mouse.move(640+(c.dx||0),400+(c.dy||0),{steps:10});await page.mouse.up();}
  if(c.action==='wait')await page.waitForTimeout(Math.min(10000,c.ms||1000));
  if(c.action==='close'){await browser.close();console.log('CLOSED');break;}
  await snapshot(i,c.label||c.action);
 }catch(error){console.log(JSON.stringify({error:error.message}));}
}
await browser.close();
