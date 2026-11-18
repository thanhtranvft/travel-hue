import test from 'node:test';import assert from 'node:assert/strict';
import {roadWidth} from '../src/world/roadProfile.js';
test('playable roads allow two lanes while mapped footpaths stay narrow',()=>{assert.equal(roadWidth({tags:{name:'Lê Lợi',highway:'secondary'}}),14);assert.equal(roadWidth({tags:{highway:'footway'}}),4);assert.equal(roadWidth({tags:{highway:'primary',width:'20'}}),20);assert.equal(roadWidth({tags:{highway:'residential'}}),8);});
