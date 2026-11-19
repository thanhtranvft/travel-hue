import test from 'node:test';import assert from 'node:assert/strict';
import {roadsidePoint,onOtherCarriageway} from '../src/core/world/streetPlacement.js';
test('posts are to the right in either direction',()=>{const a={x:0,z:0},b={x:0,z:100};assert.deepEqual(roadsidePoint(a,b,20,9,1),{x:-9,z:20});assert.deepEqual(roadsidePoint(a,b,20,9,-1),{x:9,z:20});});
test('crossing pavement is excluded from paint and roadside decorations',()=>{const road={id:1,tags:{highway:'secondary'},points:[{x:0,z:0},{x:0,z:100}]},cross={id:2,tags:{highway:'secondary'},points:[{x:-50,z:50},{x:50,z:50}]};assert.ok(onOtherCarriageway({x:0,z:50},road,[road,cross]));assert.equal(onOtherCarriageway({x:0,z:25},road,[road,cross]),false);});
