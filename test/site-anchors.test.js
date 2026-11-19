import test from 'node:test';import assert from 'node:assert/strict';
import {sites,mappedSignals,ringsOf} from '../src/core/shared/geography/map.js';
import {principalCenter,ringArea} from '../src/core/shared/geography/siteAnchors.js';
import {project,inside} from '../src/core/shared/geography/geometry.js';
test('Quốc Học dùng đúng node cổng, ga dùng entrance=main trên OSM',()=>{for(const [id,node,lat,lon]of [['quoc-hoc-school',13516238182,16.4605442,107.5828662],['station',13516177652,16.456522,107.5780484]]){const site=sites.find(s=>s.id===id);assert.equal(site.anchor.kind,'mapped-entrance');assert.equal(site.anchor.sourceId,node);const expected=project({lat,lon});assert.ok(Math.hypot(site.sign.x-expected.x,site.sign.z-expected.z)<1e-6);}});
test('không giả cổng từ đỉnh polygon hoặc cổng bệnh viện ở mặt đường khác',()=>{for(const id of ['hai-ba-trung','ubnd','hospital'])assert.equal(sites.find(s=>s.id===id).anchor.kind,'area-label');});
test('bệnh viện nhiều khu đất chọn vùng chính, không lấy ring đầu',()=>{const site=sites.find(s=>s.id==='hospital'),rings=ringsOf(site.feature),largest=rings.slice().sort((a,b)=>ringArea(b)-ringArea(a))[0];assert.ok(inside(site.center,largest));assert.ok(Math.hypot(site.center.x-principalCenter([rings[0]]).x,site.center.z-principalCenter([rings[0]]).z)>150);});
test('vị trí đèn lấy từ node traffic_signals thật',()=>{const signal=mappedSignals.find(s=>s.osm===10873164038),expected=project({lat:16.4639318,lon:107.5868505});assert.ok(signal);assert.ok(Math.hypot(signal.x-expected.x,signal.z-expected.z)<1e-6);});
