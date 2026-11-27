import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const output=fileURLToPath(new URL('./traditional-jump-check/',import.meta.url));await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'});
try{
  for(const avatar of ['scholar','ao-dai-woman']){
    const page=await browser.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true});
    const errors=[],jumps=[];page.on('pageerror',e=>errors.push(e.message));
    page.on('websocket',ws=>ws.on('framereceived',({payload})=>{try{const m=JSON.parse(payload);if(m.type==='snapshot')for(const p of m.players)if(p.avatar===avatar)jumps.push(p.jumpHeight||0);}catch{}}));
    await page.goto('http://localhost:5182/',{waitUntil:'networkidle'});
    await page.locator('#player-name').fill(avatar==='scholar'?'Thầy đồ':'Áo dài Huế');
    await page.locator(`[data-avatar="${avatar}"]`).click();
    await page.locator('.lobby-cta').click();
    await page.locator('#scene-loading').waitFor({state:'hidden',timeout:60000});
    await page.locator('#touch-jump').waitFor({state:'visible'});
    await page.keyboard.down('w');await page.keyboard.press('Space');await page.waitForTimeout(220);
    await page.screenshot({path:`${output}/${avatar}-jump.png`});
    await page.waitForTimeout(1200);await page.keyboard.up('w');
    await page.mouse.move(440,180);await page.mouse.down();await page.mouse.move(810,180,{steps:16});await page.mouse.up();
    await page.screenshot({path:`${output}/${avatar}-front.png`});
    await page.locator('#touch-jump').click();await page.waitForTimeout(400);
    const jump=await page.locator('#touch-jump').boundingBox();
    const result={avatar,errors,networkPeak:Math.max(...jumps),jumpButton:jump};
    await writeFile(`${output}/${avatar}.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result));
    await page.close();
  }
}finally{await browser.close();}
