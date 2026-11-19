import entrances from '../src/assets/maps/source/osm-entrances.json' with {type:'json'};
import {sites,roads,ringsOf} from '../src/core/shared/geography/map.js';
import {unproject,inside,project,nearestPoint} from '../src/core/shared/geography/geometry.js';
const area=ring=>Math.abs(ring.reduce((s,p,i)=>{const q=ring[(i+1)%ring.length];return s+p.x*q.z-q.x*p.z;},0)/2);
for(const site of sites.filter(s=>['school','government','hospital','station'].includes(s.kind))){
 const rings=ringsOf(site.feature),boundaryIds=new Set(site.feature.nodes||[]),candidates=entrances.elements.filter(n=>n.type==='node'&&n.tags&&(n.tags.entrance||n.tags.barrier==='gate')).map(n=>({...n,p:project(n)})).filter(n=>boundaryIds.has(n.id)||rings.some(r=>inside(n.p,r)||nearestPoint(n.p,r).distance<2));
 const shared=roads.filter(r=>['footway','path','service','pedestrian'].includes(r.tags.highway)).flatMap(r=>(r.nodes||[]).map((id,i)=>({node:id,way:r.id,p:r.points[i]}))).filter(n=>boundaryIds.has(n.node));
 console.log(JSON.stringify({id:site.id,rings:rings.map(r=>({area:area(r),points:r.length})),oldCenter:unproject(site.center),oldSign:unproject(site.sign),entrances:candidates.map(({id,lat,lon,tags})=>({id,lat,lon,tags})),shared:shared.map(n=>({node:n.node,way:n.way,...unproject(n.p)}))}));
}
