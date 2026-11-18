import test from 'node:test';import assert from 'node:assert/strict';
import data from '../src/data/property-enclosures.json' with {type:'json'};
import {buildings} from '../src/data/buildingCatalog.js';
import {byId,pointsOf} from '../src/geography/map.js';
import {project,inside,nearestPoint} from '../src/geography/geometry.js';
import {campusWallIndex,nearbyWalls} from '../src/world/CampusWallIndex.js';
test('every building is assigned exactly once and existing school campuses remain shared',()=>{const members=data.properties.flatMap(p=>p.members);assert.equal(new Set(members).size,buildings.length);assert.equal(members.length,buildings.length);const school=data.properties.find(p=>p.id==='quoc-hoc-school');assert.ok(school.managedExternally&&school.members.includes('TN-0103')&&school.members.includes('TN-0104'));const cit=data.properties.find(p=>p.id==='hue-cit');assert.equal(cit.color,'#f2f0e5');assert.equal(cit.parking.spaces,3);});
test('inferred enclosure never cuts through its own building footprint',()=>{for(const p of data.properties.filter(p=>p.source==='inferred-parcel')){const ring=p.rings[0].map(project),feature=byId(Number(p.sourceOSM.split('/')[1]));for(const v of pointsOf(feature))assert.ok(inside(v,ring)||nearestPoint(v,[...ring,ring[0]]).distance<.25,p.id);}});
test('wall spatial index catches a wall across cell borders',()=>{const s={a:{x:31,z:20},b:{x:33,z:20}},grid=campusWallIndex([s]);assert.ok(nearbyWalls(grid,31.8,20).includes(s));assert.ok(nearbyWalls(grid,32.1,20).includes(s));});
