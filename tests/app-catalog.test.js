import test from 'node:test';import assert from 'node:assert/strict';
import {isEnabled,enabledRecords,enabledAreas,musicTracks} from '../src/app/catalog.js';
test('enabled false or disabled true removes records and missing flag defaults on',()=>{const items=[{id:'a'},{id:'b',enabled:false},{id:'c',disabled:true},{id:'d',enabled:true,disabled:true},{id:'e',enabled:true}];assert.deepEqual(enabledRecords(items).map(i=>i.id),['a','e']);assert.equal(isEnabled({enabled:false,disabled:false}),false);});
test('catalog has unique area and music identities',()=>{assert.equal(new Set(enabledAreas.map(a=>a.id)).size,enabledAreas.length);assert.equal(new Set(musicTracks.map(t=>t.id)).size,musicTracks.length);});
