import test from 'node:test';import assert from 'node:assert/strict';
import {playgroundSpots} from '../src/modules/areas/quoc-hoc/view/YouthPlayground.js';
import {features,pointsOf,byId,roads} from '../src/core/shared/geography/map.js';
import {inside,nearestPoint} from '../src/core/shared/geography/geometry.js';
import schools from '../src/modules/areas/quoc-hoc/data/school-gates.json' with {type:'json'};
test('Hai Ba Trung wall is red matching Quoc Hoc independently of gate color',()=>{assert.equal(schools['hai-ba-trung'].wallColor,schools['quoc-hoc-school'].color);});
test('all playground equipment fits inside actual youth campus and outside buildings',()=>{const polygon=pointsOf(byId(695775607)),buildingPolygons=features.filter(f=>f.type==='way'&&f.tags?.building&&f.geometry?.length>3).map(f=>({points:pointsOf(f)})),spots=playgroundSpots({renderRoads:roads,buildingPolygons},polygon);assert.equal(spots.length,10);assert.equal(new Set(spots.map(s=>s.type)).size,5);for(const p of spots){assert.ok(inside(p,polygon));assert.ok(nearestPoint(p,polygon).distance>p.radius);assert.ok(!buildingPolygons.some(b=>inside(p,b.points)||nearestPoint(p,b.points).distance<p.radius));}});
