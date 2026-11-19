import {readFile,writeFile} from 'node:fs/promises';
import {buildings} from '../src/core/shared/data/buildingCatalog.js';
import {features,byId,pointsOf,ringsOf,centroid,roads,sites} from '../src/core/shared/geography/map.js';
import {inside,nearestPoint,unproject,project} from '../src/core/shared/geography/geometry.js';
import {bufferedHull,clipPolygon} from '../src/core/shared/geography/parcelGeometry.js';
import {isFootway,roadWidth} from '../src/core/world/roadProfile.js';
import {ringArea} from '../src/core/shared/geography/siteAnchors.js';
const file=new URL('../src/data/world/property-enclosures.json',import.meta.url);let previous={properties:[]};try{previous=JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}const old=new Map(previous.properties.map(p=>[p.id,p]));
const known=[{id:'quoc-hoc-school',osm:695775622,external:true},{id:'hai-ba-trung',osm:695770482,external:true},{id:'youth-center',osm:695775607,external:true},{id:'hospital',osm:21912794,external:false}];
const containers=known.map(c=>({...c,feature:byId(c.osm)}));
for(const f of features.filter(f=>f.type==='way'&&!f.tags?.building&&['school','hospital'].includes(f.tags?.amenity)&&f.geometry?.length>3))if(!containers.some(c=>c.osm===f.id))containers.push({id:`campus-${f.id}`,osm:f.id,feature:f,external:false});
const properties=[],group=new Map();
for(const b of buildings){const feature=byId(Number(b.osmKey.split('/')[1])),center=project(b.coordinates),parent=containers.filter(c=>ringsOf(c.feature).some(r=>inside(center,r))).sort((a,b)=>Number(b.external)-Number(a.external)||ringArea(ringsOf(a.feature)[0])-ringArea(ringsOf(b.feature)[0]))[0];
 if(parent){if(!group.has(parent.id)){const item={id:parent.id,title:parent.feature.tags?.name||parent.id,source:'osm-campus',sourceOSM:`${parent.feature.type}/${parent.osm}`,managedExternally:parent.external,members:[],rings:ringsOf(parent.feature).map(r=>r.map(unproject)),style:'fence',color:'#778b83',height:1.6,entranceWidth:8};group.set(parent.id,item);properties.push(item);}group.get(parent.id).members.push(b.code);continue;}
 const isCIT=feature.id===354775345,padding=isCIT?20:2.4,footprint=pointsOf(feature);let ring=bufferedHull(footprint,padding);
 // Infer a conservative parcel, then stop it before adjacent building centers.
 for(const neighbor of buildings){if(neighbor.code===b.code)continue;const q=project(neighbor.coordinates),dx=q.x-center.x,dz=q.z-center.z,d=Math.hypot(dx,dz);if(d>160||d<.1)continue;const midpoint=dx*(center.x+q.x)/2+dz*(center.z+q.z)/2,own=Math.max(...footprint.map(v=>v.x*dx+v.z*dz))+.35*d;ring=clipPolygon(ring,dx,dz,Math.max(midpoint,own));}
 for(const road of roads.filter(r=>!isFootway(r))){const hit=nearestPoint(center,road.points);if(hit.distance>padding+45)continue;const dx=hit.x-center.x,dz=hit.z-center.z,d=Math.hypot(dx,dz);if(d<.1)continue;const clearance=roadWidth(road)/2+1.4,own=Math.max(...footprint.map(v=>v.x*dx/d+v.z*dz/d))+.35;ring=clipPolygon(ring,dx/d,dz/d,Math.max((dx/d)*hit.x+(dz/d)*hit.z-clearance,own));}
 if(ring.length<3)ring=bufferedHull(pointsOf(feature),.15);
 const item={id:isCIT?'hue-cit':`property-${b.code}`,title:isCIT?'HueCIT · Trung tâm CNTT':b.name||b.osm.name||b.code,source:'inferred-parcel',sourceOSM:b.osmKey,managedExternally:false,members:[b.code],rings:[ring.map(unproject)],style:isCIT?'wall':'fence',color:isCIT?'#f2f0e5':'#778b83',height:isCIT?1.9:1.4,entranceWidth:isCIT?7:4};if(isCIT)item.parking={spaces:3,animatedCar:true};properties.push(item);
}
for(let i=0;i<properties.length;i++){const p=properties[i],saved=old.get(p.id);if(saved)properties[i]={...p,...saved,rings:saved.locked?saved.rings:p.rings,members:p.members};}
await writeFile(file,JSON.stringify({schemaVersion:1,note:'Inferred parcels and parking are simulation; edit rings explicitly for surveyed boundaries.',properties},null,2)+'\n');console.log(JSON.stringify({properties:properties.length,coveredBuildings:properties.reduce((n,p)=>n+p.members.length,0),cit:properties.find(p=>p.id==='hue-cit')}));
