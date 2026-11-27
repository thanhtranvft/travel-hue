import {chromium,firefox} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const useFirefox=process.argv.includes('--firefox');
const output=fileURLToPath(new URL(`./capture-audio-check/${useFirefox?'firefox':'chromium'}/`,import.meta.url));await mkdir(output,{recursive:true});
const browser=useFirefox?await (await import('playwright-firefox-compat')).firefox.launch({headless:true,executablePath:'C:/Users/Admin/AppData/Local/ms-playwright/firefox-1497/firefox/firefox.exe'}):await chromium.launch({headless:true,executablePath:'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe'});
try{
  const page=await browser.newPage();
  await page.goto('http://localhost:5182/',{waitUntil:'networkidle'});
  const results=await page.evaluate(async()=>{
    const {CityAudio}=await import('/src/core/audio/CityAudio.js');
    const {startClipRecording}=await import('/src/core/capture/GameplayCapture.js');
    const {CA_HUE_SONGS}=await import('/src/core/world/CaHueBoats.js');
    const audio=new CityAudio();await audio.setEnabled(true);
    const canvas=document.createElement('canvas');canvas.width=640;canvas.height=360;
    const ctx=canvas.getContext('2d');let frame=0;
    const timer=setInterval(()=>{ctx.fillStyle=frame++%2?'#315b50':'#28544a';ctx.fillRect(0,0,640,360);},33);
    const results=[];
    try{
      for(const mode of ['background','cruise','repeat']){
        if(mode==='cruise'){audio.setMusicEnabled(false);audio.setDragonCruiseMode(true,{song:CA_HUE_SONGS[0]});}
        await new Promise(resolve=>setTimeout(resolve,900));
        const result=await new Promise(async(resolve,reject)=>{
          try{await startClipRecording({getCanvas:()=>canvas,audio,watermark:false,quality:'standard',maxDurationSec:3,onFinish:resolve,onError:reject});}catch(e){reject(e);}
        });
        const bytes=await result.blob.arrayBuffer();
        let decoded;
        try{
          const pcm=await audio.ctx.decodeAudioData(bytes.slice(0));
          const samples=pcm.getChannelData(0);let sum=0,peak=0;
          for(const v of samples){sum+=v*v;peak=Math.max(peak,Math.abs(v));}
          decoded={duration:pcm.duration,channels:pcm.numberOfChannels,rms:Math.sqrt(sum/samples.length),peak};
        }catch(error){decoded={error:error.message};}
        let binary='';for(const value of new Uint8Array(bytes))binary+=String.fromCharCode(value);
        results.push({mode,mime:result.mimeType,hasAudio:result.hasAudio,bytes:bytes.byteLength,decoded,base64:btoa(binary),context:audio.ctx.state});
      }
    }finally{clearInterval(timer);await audio.dispose();}
    return results;
  });
  for(const result of results){
    const {base64,...metadata}=result;
    const extension=result.mime.includes('mp4')?'mp4':'webm';
    await writeFile(`${output}/${result.mode}.${extension}`,Buffer.from(base64,'base64'));
    console.log(JSON.stringify(metadata));
  }
  await writeFile(`${output}/results.json`,JSON.stringify(results.map(({base64,...metadata})=>metadata),null,2));
}finally{await browser.close();}
