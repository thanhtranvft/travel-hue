import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import config from '../src/data/app-config.json' with {type:'json'};
import station from '../src/modules/areas/quoc-hoc/data/station.json' with {type:'json'};
import enclosures from '../src/data/world/property-enclosures.json' with {type:'json'};
import {project,nearestPoint} from '../src/core/shared/geography/geometry.js';
test('Le Loi starts at Khoa Quoc Te, Hue University; ten online slots stay on Le Loi frontage',async()=>{
 const area=config.areas.items.find(a=>a.id==='quoc-hoc'),data=JSON.parse(await readFile(new URL('../src/modules/areas/quoc-hoc/model/osm.json',import.meta.url),'utf8'));
 assert.deepEqual(data.region.path,area.path);
 const road=data.elements.find(f=>f.id===626373586).geometry.map(project).reverse();
 const kqtProp=enclosures.properties.find(p=>p.id==='property-TN-0100');
 const gate=project(kqtProp.frontage.gate);
 assert.equal(kqtProp.sourceOSM,'way/695775617');
 assert.deepEqual(area.spawn,area.spawnSlots[0]);assert.equal(area.spawnSlots.length,10);
 assert.ok(Math.hypot(area.spawn.x-gate.x,area.spawn.z-gate.z)<15,'spawn is directly in front of Khoa Quoc Te gate');
 for(const slot of area.spawnSlots){
  const hit=nearestPoint(slot,road);
  assert.ok(hit.distance<5&&hit.t>0&&hit.t<1);
  assert.ok(Math.hypot(slot.x-gate.x,slot.z-gate.z)<35);
  assert.ok(Math.cos(slot.heading-hit.heading)>0.99,'heading faces northeast along Le Loi toward Trang Tien');
 }
 for(let i=0;i<10;i++)for(let j=0;j<i;j++)assert.ok(Math.hypot(area.spawnSlots[i].x-area.spawnSlots[j].x,area.spawnSlots[i].z-area.spawnSlots[j].z)>2);
 for(const vertex of data.elements.find(f=>f.id===station.bridgeOsm).geometry.map(project))assert.ok(area.path.some(([x,z])=>Math.hypot(x-vertex.x,z-vertex.z)<.01));
});
