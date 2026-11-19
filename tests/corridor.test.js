import test from 'node:test';
import assert from 'node:assert/strict';
import {sites,corridorCrossings,roads,pointsOf,geoDistricts,intersection,leLoiTruongTienJunction} from '../src/core/shared/geography/map.js';
import {nearestPoint} from '../src/core/shared/geography/geometry.js';
import {siteForBuilding} from '../src/core/shared/architecture/CorridorArchitecture.js';
import {ringsOf} from '../src/core/shared/geography/map.js';
test('Le Loi tour passes Phu Xuan and continues to the Truong Tien area',()=>{const route=geoDistricts.find(d=>d.id==='quoc-hoc').path;assert.ok(route.some(([x,z])=>Math.hypot(x-intersection.x,z-intersection.z)<.1));const end=route.at(-1);assert.ok(Math.hypot(end[0]-leLoiTruongTienJunction.x,end[1]-leLoiTruongTienJunction.z)<.1);assert.ok(Math.hypot(end[0]-intersection.x,end[1]-intersection.z)>500);});
test('four corridor crossings share actual vertices of both named roads',()=>{
  assert.equal(corridorCrossings.length,4);
  for(const c of corridorCrossings)for(const id of [c.roadId,c.mainId])assert.ok(roads.find(r=>r.id===id).points.some(p=>Math.hypot(p.x-c.point.x,p.z-c.point.z)<.1));
});
test('river-side museum and land-side institutions follow directed Le Loi',()=>{
  const lines=roads.filter(r=>r.tags.name==='Lê Lợi').map(r=>r.points.map(p=>p)).map(p=>p[0].x>p.at(-1).x?p.reverse():p);
  for(const id of ['ho-chi-minh-museum','hue-cit','youth-center','quoc-hoc-school','hai-ba-trung','ubnd','hospital']){
    const site=sites.find(s=>s.id===id),hit=lines.map(line=>({line,hit:nearestPoint(site.center,line)})).sort((a,b)=>a.hit.distance-b.hit.distance)[0];
    const a=hit.line[hit.hit.index],b=hit.line[hit.hit.index+1];
    const cross=(b.x-a.x)*(site.center.z-a.z)-(b.z-a.z)*(site.center.x-a.x);
    assert.ok(id==='ho-chi-minh-museum'?cross<0:cross>0,id);
  }
});
test('named building retains exact OSM footprint association',()=>{
  for(const id of ['ho-chi-minh-museum','hue-cit','youth-center','ubnd']){const site=sites.find(s=>s.id===id);assert.equal(siteForBuilding(site.feature,pointsOf(site.feature),sites,ringsOf)?.id,id);}
});
