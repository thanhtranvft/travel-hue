import test from 'node:test';import assert from 'node:assert/strict';
import data from '../src/data/property-enclosures.json' with {type:'json'};
import {roads} from '../src/geography/map.js';
import {project,nearestPoint} from '../src/geography/geometry.js';
test('Le Loi front row uses one shared setback and keeps original boundaries',()=>{const front=data.properties.filter(p=>p.frontage),offsets=new Set(front.map(p=>p.frontage.offset));assert.ok(front.length>20);assert.equal(offsets.size,1);assert.ok(front.find(p=>p.id==='hue-cit'));for(const p of front){assert.ok(p.originalRings?.length);const gate=project(p.frontage.gate),ring=p.rings[0].map(project);assert.ok(nearestPoint(gate,[...ring,ring[0]]).distance<.1,p.id);assert.ok(roads.filter(r=>r.tags.name==='Lê Lợi').some(r=>nearestPoint(gate,r.points).distance<15),p.id);}});
