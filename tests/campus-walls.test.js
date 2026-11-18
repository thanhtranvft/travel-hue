import test from 'node:test';import assert from 'node:assert/strict';
import {campusWallSegments,hitsCampusWall} from '../src/landmarks/CampusWalls.js';
import {schoolGatePlacement} from '../src/landmarks/SchoolGates.js';
import {sites,ringsOf} from '../src/geography/map.js';
import {inside,project} from '../src/geography/geometry.js';
import {buildings} from '../src/data/buildingCatalog.js';
test('closed boundary keeps exactly one gate gap even at a corner',()=>{const ring=[{x:0,z:0},{x:20,z:0},{x:20,z:20},{x:0,z:20},{x:0,z:0}],segments=campusWallSegments(ring,{x:0,z:0},10),length=segments.reduce((s,v)=>s+Math.hypot(v.b.x-v.a.x,v.b.z-v.a.z),0);assert.equal(length,70);assert.equal(hitsCampusWall({x:0,z:0},segments),false);assert.equal(hitsCampusWall({x:20,z:10},segments),true);});
test('both school gates stay open while their boundary segments block crossing',()=>{for(const id of ['quoc-hoc-school','hai-ba-trung']){const site=sites.find(s=>s.id===id),gate=schoolGatePlacement(site),segments=ringsOf(site.feature).flatMap(r=>campusWallSegments(r,gate,10));assert.equal(hitsCampusWall(gate,segments),false);assert.ok(segments.length>3);for(const s of segments)assert.ok(hitsCampusWall({x:(s.a.x+s.b.x)/2,z:(s.a.z+s.b.z)/2},segments));}});
test('user-identified buildings belong to Quoc Hoc campus',()=>{const campus=sites.find(s=>s.id==='quoc-hoc-school');for(const code of ['TN-0103','TN-0104','TN-0032'])assert.ok(ringsOf(campus.feature).some(r=>inside(project(buildings.find(b=>b.code===code).coordinates),r)),code);});
