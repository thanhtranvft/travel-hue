import test from 'node:test';import assert from 'node:assert/strict';
import {PatrolWarnings} from '../src/core/traffic/PatrolWarnings.js';
import config from '../src/data/world/police-patrols.json' with {type:'json'};
import {CityAudio} from '../src/core/audio/CityAudio.js';
test('patrol speaks once on approach, rearms only after leaving, respects cooldown and bridge height',()=>{
 const warnings=new PatrolWarnings(config),bike={position:{x:0,y:0,z:0},motion:{speed:2}},police={isPolice:true,speed:3,mesh:{position:{x:5,y:0,z:0}}};
 assert.equal(warnings.update(0,bike,[police]),police);
 assert.equal(warnings.update(40,bike,[police]),null);
 police.mesh.position.x=30;warnings.update(41,bike,[police]);police.mesh.position.x=5;
 assert.equal(warnings.update(42,bike,[police]),police);
 police.mesh.position.x=30;warnings.update(43,bike,[police]);police.mesh.position.x=5;
 assert.equal(warnings.update(44,bike,[police]),null);
 police.mesh.position.x=30;warnings.update(70,bike,[police]);police.mesh.position.x=5;police.mesh.position.y=5;
 assert.equal(warnings.update(71,bike,[police]),null);
});
test('music off never disables collision voices; master mute does',async()=>{
 const calls=[],audio=Object.create(CityAudio.prototype);
 Object.assign(audio,{enabled:true,musicEnabled:true,ctx:null,collisionVoice:{play:type=>{calls.push(type);return true;}}});
 audio.setMusicEnabled(false);audio.ctx={state:'running',currentTime:1};
 assert.equal(audio.speakCollision('player'),true);assert.equal(audio.speakCollision('police'),true);
 audio.ctx.suspend=async()=>{audio.ctx.state='suspended';};audio.collisionVoice.stop=()=>calls.push('stop');
 await audio.setEnabled(false);assert.equal(audio.speakCollision('player'),false);
 assert.deepEqual(calls,['player','police','stop']);assert.equal(audio.musicEnabled,false);
});
