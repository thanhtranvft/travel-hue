import test from 'node:test';import assert from 'node:assert/strict';
import {railSegments,hitsRail} from '../src/modules/areas/south-bank/view/BoardwalkRails.js';
test('both sides block the bicycle while center and open ends remain usable',()=>{const segments=railSegments({points:[{x:0,z:0},{x:0,z:10}]},4,()=>.12);assert.equal(segments.length,2);assert.ok(hitsRail({x:1.8,z:5},segments));assert.ok(hitsRail({x:-1.8,z:5},segments));assert.equal(hitsRail({x:0,z:5},segments),false);assert.equal(hitsRail({x:0,z:-1},segments),false);});
