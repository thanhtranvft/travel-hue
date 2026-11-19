import test from 'node:test';import assert from 'node:assert/strict';
import {sites,ringsOf,roads} from '../src/core/shared/geography/map.js';
import {schoolGatePlacement} from '../src/modules/areas/quoc-hoc/view/SchoolGates.js';
import {nearestPoint} from '../src/core/shared/geography/geometry.js';
import {buildingFrontage} from '../src/core/world/BuildingFrontage.js';
import {onOtherCarriageway} from '../src/core/world/streetPlacement.js';
test('Quoc Hoc keeps mapped gate, Hai Ba Trung gate stays on its own campus boundary',()=>{const q=sites.find(s=>s.id==='quoc-hoc-school'),h=sites.find(s=>s.id==='hai-ba-trung'),a=schoolGatePlacement(q),b=schoolGatePlacement(h);assert.equal(a.confidence,'mapped');assert.equal(a.x,q.sign.x);assert.equal(a.z,q.sign.z);assert.equal(b.confidence,'estimated-frontage');assert.ok(ringsOf(h.feature).some(r=>nearestPoint(b,r).distance<.1));assert.ok(Math.hypot(a.x-b.x,a.z-b.z)>50);});
test('building posts stay outside carriageways on the frontage side',()=>{for(const id of ['quoc-hoc-school','hai-ba-trung','hue-cit']){const p=buildingFrontage(sites.find(s=>s.id===id).sign,roads);assert.ok(p,id);assert.equal(onOtherCarriageway(p,{id:null},roads,1),false);}});
