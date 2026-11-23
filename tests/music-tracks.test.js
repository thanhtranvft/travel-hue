import test from 'node:test';import assert from 'node:assert/strict';
import config from '../src/data/app-config.json' with {type:'json'};
const music={tracks:config.music.tracks};
import {CityAudio} from '../src/core/audio/CityAudio.js';
test('four original instrumental tracks have unique IDs and valid melodies',()=>{const originals=music.tracks;assert.equal(originals.length,4);assert.equal(new Set(originals.map(t=>t.id)).size,4);assert.equal(new Set(originals.map(t=>JSON.stringify(t.melody))).size,4);for(const t of originals){assert.ok(t.stepSeconds>.2&&t.stepSeconds<2);assert.ok(t.melody.every(n=>n===null||Number.isInteger(n)&&n>=24&&n<=96));}});
test('track changes reset phrase without enabling audio or changing effects volume',()=>{const audio=Object.create(CityAudio.prototype);Object.assign(audio,{tracks:music.tracks,track:music.tracks[0],step:14,enabled:false,volume:.35,ctx:null});assert.equal(audio.setTrack(music.tracks[2].id),true);assert.equal(audio.track.id,'citadel-morning');assert.equal(audio.step,0);assert.equal(audio.enabled,false);assert.equal(audio.volume,.35);assert.equal(audio.setTrack('missing'),false);});
