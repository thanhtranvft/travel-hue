import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'});
const errors=[];
async function join(name){
  const page=await browser.newPage({viewport:{width:1100,height:720}});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.argv[2] || 'http://127.0.0.1:5180/',{waitUntil:'networkidle'});
  await page.locator('#player-name').fill(name);await page.locator('[value="online"]').click();
  await page.locator('#scene-loading').waitFor({state:'hidden',timeout:120000});
  await page.evaluate(async()=>{window.game=(await import(document.querySelector('script[src*="/src/main.js"]').src)).game;game.traffic.enabled=false;});
  await page.waitForFunction(()=>game.online?.canMove);
  return page;
}
async function background(page,hidden){
  await page.evaluate(hidden=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>hidden});document.dispatchEvent(new Event('visibilitychange'));},hidden);
}
async function remote(page){return page.evaluate(()=>{const e=[...game.online.avatars.entries.values()][0];return e&&{name:e.target.name,ready:e.target.ready,paused:e.target.paused,visible:e.bike.visible,root:game.online.avatars.root.visible};});}
try{
  const first=await join('Người trước'),second=await join('Người sau');
  for(const page of [first,second])await page.waitForFunction(()=>[...game.online.avatars.entries.values()].some(e=>e.bike.visible));
  await background(first,true);await second.waitForTimeout(500);
  console.log('EARLIER_IN_BACKGROUND',await remote(second));
  assert.equal((await remote(second)).visible,true,'The later player must keep seeing the earlier player in background');
  await background(first,false);await background(second,true);await first.waitForTimeout(500);
  console.log('LATER_IN_BACKGROUND',await remote(first));
  assert.equal((await remote(first)).visible,true,'The earlier player must keep seeing the later player in background');
  await first.waitForTimeout(2200);
  await first.keyboard.down('w');
  await first.waitForFunction(()=>game.crashCount>0,null,{timeout:12000});await first.keyboard.up('w');
  await first.waitForTimeout(3500);
  assert.equal((await remote(first)).visible,true,'An inactive rider must not disappear after collision cooldown');
  await background(second,false);await first.waitForTimeout(300);
  assert.equal((await remote(first)).visible,true);
  await second.locator('[data-district="south-bank"]').click();
  await second.waitForFunction(()=>game.world.region.id==='south-bank'&&game.online.canMove,null,{timeout:120000});
  await first.waitForFunction(()=>[...game.online.avatars.entries.values()].every(e=>!e.bike.visible));
  assert.deepEqual(errors,[]);
  console.log('PRESENCE_PASS',{bothJoinOrders:true,backgroundRiderVisible:true,afterCollisionVisible:true,otherRegionHidden:true,errors});
}finally{await browser.close();}
