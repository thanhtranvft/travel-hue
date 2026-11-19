import test from 'node:test';import assert from 'node:assert/strict';
import {proximityGain,sourcePan,nearestAudibleSource} from '../src/core/audio/spatial.js';
import {restaurantZones} from '../src/core/world/streetVenues.js';
test('nhạc quán giảm theo khoảng cách và im ngoài vùng nghe',()=>{assert.equal(proximityGain(0),1);assert.ok(proximityGain(5)>proximityGain(15));assert.equal(proximityGain(24),0);assert.equal(proximityGain(100),0);});
test('pan trái/phải thay đổi đúng theo hướng camera',()=>{assert.equal(sourcePan(5,0,0),-1);assert.equal(sourcePan(-5,0,0),1);assert.ok(sourcePan(5,0,Math.PI)>.99);assert.ok(sourcePan(0,5,Math.PI/2)>.99);assert.equal(sourcePan(0,0,0),0);});
test('nguồn nhạc dùng cùng danh sách quán với world',()=>{assert.equal(restaurantZones.length,12);const venue=restaurantZones[0],result=nearestAudibleSource(venue,restaurantZones);assert.equal(result.source.id,venue.id);assert.equal(result.gain,1);assert.equal(nearestAudibleSource({x:0,z:1000},restaurantZones),null);});
