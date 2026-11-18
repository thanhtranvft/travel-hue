import {collisionRecordingURLs} from './collisionRecordings.js';
export {collisionRecordingURLs} from './collisionRecordings.js';

export class CollisionVoice{
 constructor(ctx,output,onStatus=()=>{}){this.ctx=ctx;this.output=output;this.onStatus=onStatus;this.buffers=new Map();this.sequence=0;this.active=null;this.lastPlayed=null;}
 load(type){if(!collisionRecordingURLs[type])return Promise.reject(new Error('Không có bản thu cho va chạm này.'));if(!this.buffers.has(type)){const pending=fetch(collisionRecordingURLs[type]).then(response=>{if(!response.ok)throw new Error('Không tải được bản thu va chạm.');return response.arrayBuffer();}).then(bytes=>this.ctx.decodeAudioData(bytes)).catch(error=>{this.buffers.delete(type);throw error;});this.buffers.set(type,pending);}return this.buffers.get(type);}
 preload(){return Promise.allSettled(Object.keys(collisionRecordingURLs).map(type=>this.load(type)));}
 stop(){this.sequence++;if(this.active){try{this.active.stop();}catch{}this.active.disconnect();this.active=null;}}
 async play(type){if(!collisionRecordingURLs[type]||this.ctx.state!=='running')return false;this.stop();const sequence=this.sequence;try{const buffer=await this.load(type);if(sequence!==this.sequence||this.ctx.state!=='running')return false;const source=this.ctx.createBufferSource();source.buffer=buffer;source.connect(this.output);this.active=source;this.lastPlayed={type,duration:buffer.duration};source.onended=()=>{source.disconnect();if(this.active===source)this.active=null;};source.start();return true;}catch{if(sequence===this.sequence)this.onStatus('Chưa tải được âm thanh va chạm; lời thoại vẫn hiển thị trên màn hình.');return false;}}
}
