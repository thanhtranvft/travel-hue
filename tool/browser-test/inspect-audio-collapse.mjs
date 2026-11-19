import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({headless:true,executablePath:'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'});
try {
  const page = await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await page.goto('http://127.0.0.1:5174/', {waitUntil:'networkidle',timeout:120000});
  await page.locator('#scene-loading').waitFor({state:'hidden',timeout:120000});
  await page.locator('#audio-toggle').click();
  await page.locator('#sound-settings').waitFor({state:'visible'});
  await page.getByRole('button',{name:'Thu gọn bảng nhạc'}).click();
  assert.equal(await page.locator('#sound-settings').isVisible(),false);
  assert.equal(await page.locator('#audio-toggle').getAttribute('aria-pressed'),'true');
  await page.getByRole('button',{name:'Mở bảng nhạc'}).click();
  assert.equal(await page.locator('#sound-settings').isVisible(),true);
  await page.locator('#audio-toggle').click();
  assert.equal(await page.locator('#sound-settings').isVisible(),false);
  assert.equal(await page.locator('#audio-settings-toggle').isVisible(),false);
  console.log('AUDIO_COLLAPSE_PASS: collapse preserves audio, reopen and mute work on mobile');
} finally { await browser.close(); }
