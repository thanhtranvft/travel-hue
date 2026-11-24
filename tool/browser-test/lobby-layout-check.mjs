import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
const directory=new URL('./lobby-layout/',import.meta.url);
await mkdir(directory,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'});
try{
  for(const [width,height] of [[1608,895],[1366,768],[1280,720],[390,844]]){
    const page=await browser.newPage({viewport:{width,height}});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto('http://localhost:5182/',{waitUntil:'networkidle'});
    await page.locator('[data-game-mode="tag-chase"]').click();
    await page.locator('.lobby-rules-list').waitFor();
    await page.screenshot({path:new URL(`${width}x${height}.png`,directory).pathname.replace(/^\/([A-Z]:)/,'$1'),fullPage:true});
    const layout=await page.evaluate(()=>{
      const overlay=document.querySelector('#session-entry'),footer=document.querySelector('#game-mode-rules');
      return {scroll:overlay.scrollHeight-overlay.clientHeight,horizontal:document.documentElement.scrollWidth-innerWidth,footerBottom:Math.round(footer.getBoundingClientRect().bottom),rules:footer.querySelectorAll('li').length,buttonBottom:Math.round(document.querySelector('.lobby-cta').getBoundingClientRect().bottom)};
    });
    console.log(JSON.stringify({width,height,...layout,errors}));
    await page.close();
  }
}finally{await browser.close();}
