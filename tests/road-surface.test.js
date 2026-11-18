import test from 'node:test';import assert from 'node:assert/strict';
import {roads} from '../src/geography/map.js';
import {roadSurfaceHeight,SIDEWALK_Y} from '../src/world/roadSurface.js';
import {isFootway} from '../src/world/roadProfile.js';
test('every flat carriageway stays above all flat paths and sidewalks',()=>{
 const paths=roads.filter(r=>isFootway(r)&&!r.tags.bridge&&r.tags.layer!=='2');
 const maxPath=Math.max(SIDEWALK_Y,...paths.map(r=>roadSurfaceHeight(r,0)));
 for(const r of roads.filter(r=>!isFootway(r)))for(let i=0;i<r.points.length;i++)assert.ok(roadSurfaceHeight(r,i)-maxPath>=.15,`OSM ${r.id} node ${i}`);
});
test('all OSM road heights are finite and bridge endpoints match their surface',()=>{
 for(const r of roads){for(let i=0;i<r.points.length;i++)assert.ok(Number.isFinite(roadSurfaceHeight(r,i)));if(r.tags.name!=='Cầu Phú Xuân')assert.ok(Math.abs(roadSurfaceHeight(r,0)-roadSurfaceHeight(r,r.points.length-1))<1e-10);}
});
test('Phu Xuan deck clears boardwalk with connected landward ramps',()=>{const deck=roads.find(r=>r.id===39419121),south=roads.find(r=>r.id===39420686),north=roads.find(r=>r.id===39453301);assert.equal(roadSurfaceHeight(deck,0),4.8);for(const ramp of [south,north]){assert.equal(roadSurfaceHeight(ramp,0),roadSurfaceHeight(deck,0));assert.ok(Math.abs(roadSurfaceHeight(ramp,ramp.points.length-1)-.32)<1e-8);}});
