import test from 'node:test';import assert from 'node:assert/strict';
import {roads,mappedSignals} from '../src/core/shared/geography/map.js';
import {nearestPoint} from '../src/core/shared/geography/geometry.js';
import {placeTrafficSignal} from '../src/core/world/TrafficSignalPlacement.js';
import {roadWidth} from '../src/core/world/roadProfile.js';
import {onOtherCarriageway} from '../src/core/world/streetPlacement.js';
test('Tran Hung Dao signal mounts on right shoulder for its mapped traffic direction',()=>{const original=mappedSignals.find(s=>s.osm===10792854723),placements=placeTrafficSignal(original,roads);assert.ok(placements.length>0);for(const p of placements){const road=roads.find(r=>r.id===p.roadId),hit=nearestPoint(p,road.points),right=(p.x-hit.x)*-Math.cos(p.heading)+(p.z-hit.z)*Math.sin(p.heading);assert.equal(p.roadName,'Trần Hưng Đạo');assert.equal(placements.length,road.tags.oneway==='yes'||road.tags.oneway==='-1'?1:2);assert.ok(right>roadWidth(road)/2);assert.equal(onOtherCarriageway(p,{id:null},roads,1),false);assert.deepEqual(p.sourcePosition,{x:original.x,z:original.z});}});
test('all generated signal poles remain outside carriageways',()=>{for(const source of mappedSignals)for(const point of placeTrafficSignal(source,roads))assert.equal(onOtherCarriageway(point,{id:null},roads,1),false);});
