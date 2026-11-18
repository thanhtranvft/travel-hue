import {restaurantZones} from '../world/streetVenues.js';
import {nearestAudibleSource,proximityGain,sourcePan} from './spatial.js';
import {backgroundMelody,restaurantMelody,pluck,flute} from './music.js';

export class CityAudio {
  constructor(){this.enabled=false;this.volume=.45;this.ctx=null;this.step=0;this.nearbyVenue=null;this.lastPedal=0;this.collisionsPlayed=0;this.onStatus=()=>{};
    document.addEventListener('visibilitychange',()=>{if(!this.ctx)return;if(document.hidden)this.ctx.suspend().catch(()=>{});else if(this.enabled)this.ctx.resume().catch(()=>this.onStatus('Chạm nút âm thanh để phát tiếp.'));});
    addEventListener('pagehide',()=>this.ctx?.suspend().catch(()=>{}));
  }
  initialize(){
    if(this.ctx)return;const Context=window.AudioContext||window.webkitAudioContext;if(!Context)throw new Error('Web Audio không được hỗ trợ');this.ctx=new Context();const ctx=this.ctx;
    this.master=ctx.createGain();this.master.gain.value=this.volume;const compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-15;compressor.ratio.value=5;this.meter=ctx.createAnalyser();this.meter.fftSize=256;this.master.connect(compressor).connect(this.meter).connect(ctx.destination);
    const bus=()=>{const gain=ctx.createGain();gain.connect(this.master);return gain;};this.background=bus();this.background.gain.value=.65;
    this.venue=ctx.createGain();this.venue.gain.value=0;this.venuePan=ctx.createStereoPanner();this.venue.connect(this.venuePan).connect(this.master);
    this.engineGain=ctx.createGain();this.engineGain.gain.value=0;this.enginePan=ctx.createStereoPanner();const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=210;this.engine=ctx.createOscillator();this.engine.type='sawtooth';this.engine.frequency.value=55;this.engine.connect(filter).connect(this.engineGain).connect(this.enginePan).connect(this.master);this.engine.start();
    this.noiseBuffer=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const data=this.noiseBuffer.getChannelData(0);let seed=42;for(let i=0;i<data.length;i++){seed=(seed*1664525+1013904223)>>>0;data[i]=seed/4294967296*2-1;}
    const rolling=ctx.createBufferSource();rolling.buffer=this.noiseBuffer;rolling.loop=true;const wheelFilter=ctx.createBiquadFilter();wheelFilter.type='bandpass';wheelFilter.frequency.value=650;wheelFilter.Q.value=.6;this.wheelGain=ctx.createGain();this.wheelGain.gain.value=0;rolling.connect(wheelFilter).connect(this.wheelGain).connect(this.master);rolling.start();
    this.timer=setInterval(()=>this.schedule(),100);this.nextNote=ctx.currentTime+.08;
  }
  async setEnabled(enabled){
    if(enabled){this.initialize();await this.ctx.resume();if(this.ctx.state!=='running')throw new Error('Audio đang bị tạm dừng');this.enabled=true;this.nextNote=this.ctx.currentTime+.08;}
    else {this.enabled=false;if(this.ctx)await this.ctx.suspend();}
    return this.enabled;
  }
  setVolume(value){this.volume=Math.max(0,Math.min(1,value));if(this.ctx)this.master.gain.setTargetAtTime(this.volume,this.ctx.currentTime,.05);}
  schedule(){
    if(!this.enabled||this.ctx.state!=='running'||document.hidden)return;const ctx=this.ctx,now=ctx.currentTime;if(this.nextNote<now-.25)this.nextNote=now+.05;
    for(let count=0;this.nextNote<now+.25&&count<4;count++){
      const index=this.step%backgroundMelody.length,note=backgroundMelody[index],time=this.nextNote;
      if(note!==null){pluck(ctx,this.background,note,time,.12,2.2);if(index%4===0)flute(ctx,this.background,note+12,time+.08,.045,1.8);}
      if(index%8===0)pluck(ctx,this.background,index<16?50:57,time,.08,3.3);
      const localNote=restaurantMelody[this.step%restaurantMelody.length];if(localNote!==null&&this.nearbyVenue){pluck(ctx,this.venue,localNote,time,.22,1.1);if(index%4===0)flute(ctx,this.venue,localNote,time+.06,.06,1.3);}
      this.step++;this.nextNote+=.66;
    }
  }
  update(bike,actors,cameraHeading){
    const nearby=nearestAudibleSource(bike.position,this.venues||restaurantZones,25);this.nearbyVenue=nearby?.source||null;this.venueLevel=nearby?.gain||0;
    if(!this.enabled||!this.ctx||this.ctx.state!=='running')return;const ctx=this.ctx,t=ctx.currentTime,speed=Math.abs(bike.motion.speed);
    this.background.gain.setTargetAtTime(.65-this.venueLevel*.4,t,.7);this.venue.gain.setTargetAtTime(this.venueLevel*.9,t,.45);
    this.venuePan.pan.setTargetAtTime(nearby?sourcePan(nearby.source.x-bike.position.x,nearby.source.z-bike.position.z,cameraHeading):0,t,.2);
    this.wheelGain.gain.setTargetAtTime(Math.min(.045,speed*.005),t,.12);
    if(speed>.25&&t-this.lastPedal>Math.max(.09,.4/(1+speed*.3))){this.noiseBurst(t,.035,.018,1800);this.lastPedal=t;}
    let nearest=null,distance=32;for(const actor of actors){if(actor.type==='pedestrian')continue;const d=Math.hypot(actor.mesh.position.x-bike.position.x,actor.mesh.position.z-bike.position.z);if(d<distance){distance=d;nearest=actor;}}
    this.engineGain.gain.setTargetAtTime(nearest?proximityGain(distance,32)*(nearest.type==='scooter'?.025:.045):0,t,.18);
    if(nearest){this.engine.frequency.setTargetAtTime((nearest.type==='scooter'?95:43)+nearest.speed*5,t,.15);this.enginePan.pan.setTargetAtTime(sourcePan(nearest.mesh.position.x-bike.position.x,nearest.mesh.position.z-bike.position.z,cameraHeading),t,.15);}
  }
  noiseBurst(time,duration,volume,cutoff){const ctx=this.ctx,source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=this.noiseBuffer;filter.type='lowpass';filter.frequency.value=cutoff;gain.gain.setValueAtTime(volume,time);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);source.connect(filter).connect(gain).connect(this.master);source.start(time);source.stop(time+duration+.01);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};}
  collision(){if(!this.enabled||this.ctx?.state!=='running')return;const t=this.ctx.currentTime;this.collisionsPlayed++;this.noiseBurst(t,.35,.35,1800);pluck(this.ctx,this.master,43,t,.2,.35);pluck(this.ctx,this.master,91,t+.025,.09,.45);}
  dispose(){clearInterval(this.timer);return this.ctx?.close();}
}
